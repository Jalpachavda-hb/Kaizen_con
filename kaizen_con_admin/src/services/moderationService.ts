/**
 * MODERATION SERVICE
 * Wraps the Kaizen Con moderation endpoints (tag "Moderation" in /openapi.json).
 *
 *   GET  /api/admin/reports                       Bearer + X-Admin-Key
 *   POST /api/admin/reports/{report_id}/approve   Bearer + X-Admin-Key
 *   POST /api/admin/reports/{report_id}/reject    Bearer + X-Admin-Key
 *   GET  /api/admin/blocks                        Bearer + X-Admin-Key
 *   POST /api/admin/blocks/{block_id}/approve    Bearer + X-Admin-Key
 *   POST /api/admin/blocks/{block_id}/reject     Bearer + X-Admin-Key
 *   POST /api/admin/delegates/{delegate_id}/ban  Bearer + X-Admin-Key
 *   POST /api/admin/delegates/{delegate_id}/unban Bearer + X-Admin-Key
 *
 * Every endpoint returns a ModerationEnvelope: { code, message, results: any[], isUser, count? }.
 * The item shape inside `results` is NOT documented, so items are returned untouched and the
 * UI maps fields defensively (see pages/Moderation/moderationFields.ts).
 */
import { API_ENDPOINTS } from "../api/ApiPath";
import { STORAGE_TOKEN_KEY } from "./sessionManager";
import { getModerationAdminKey } from "./moderationAdminKey";

export type ModerationContext = "forum" | "qa";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type ModerationRecord = Record<string, unknown>;

export interface ModerationListResult {
  results: ModerationRecord[];
  /** `count` from the envelope when the API sends a number, otherwise null. */
  count: number | null;
  message: string;
}

export interface ModerationActionResult {
  code: number;
  message: string;
  results: ModerationRecord[];
}

export class ModerationApiError extends Error {
  status: number;
  data: unknown;
  /** "auth" = 401/403, "validation" = 422, "server" = 5xx, "network" = no response, "missing_key" = not sent */
  kind: "auth" | "validation" | "server" | "network" | "missing_key" | "other";

  constructor(message: string, status: number, data: unknown, kind: ModerationApiError["kind"]) {
    super(message);
    this.name = "ModerationApiError";
    this.status = status;
    this.data = data;
    this.kind = kind;
  }
}

export const ADMIN_NOTE_MAX = 2000; // AdminReportDecision / AdminReportReject maxLength
export const BAN_REASON_MAX = 1000;
export const MODERATION_LIMIT_MAX = 100;
/** Reports are always listed for this context (Q&A). */
export const REPORTS_CONTEXT: ModerationContext = "qa";

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

/**
 * The admin session token written by the login flow. authService falls back to a
 * synthetic `kaizen_auth_<timestamp>` value when /api/admin_login returns no token;
 * that is not a JWT, so it is never sent as a Bearer credential.
 */
const getBearerToken = (): string | null => {
  try {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (!token || token.startsWith("kaizen_auth_")) return null;
    return token;
  } catch {
    return null;
  }
};

const extractErrorMessage = (data: unknown, status: number): string => {
  const d = data as { detail?: unknown; message?: unknown } | null;
  if (d) {
    if (typeof d.detail === "string") return d.detail;
    if (Array.isArray(d.detail) && d.detail.length > 0) {
      return d.detail
        .map((item: { loc?: unknown[]; msg?: string }) => {
          const loc = Array.isArray(item?.loc) ? item.loc.filter((p) => p !== "body" && p !== "query").join(".") : "";
          return `${loc ? loc + ": " : ""}${item?.msg || "Invalid value"}`;
        })
        .join("; ");
    }
    if (typeof d.message === "string" && d.message) return d.message;
  }
  if (status === 400) return "Bad request (400). Check the values and try again.";
  if (status === 401) return "Not authenticated — your session token was missing or rejected.";
  if (status === 403) return "Access denied — the admin key or session does not have permission.";
  if (status === 404) return "Not found (404). The record may have been removed or the ID is invalid.";
  if (status === 422) return "Validation failed (422). Check the submitted fields.";
  if (status >= 500) return `Server error (${status}). Please try again shortly.`;
  return `Request failed with status ${status}`;
};

/** Never surface the in-memory admin key if a response body happens to echo it. */
const scrubSecrets = (message: string): string => {
  const key = getModerationAdminKey();
  if (key && key.length >= 8 && message.includes(key)) return message.split(key).join("••••");
  return message;
};

const kindForStatus = (status: number): ModerationApiError["kind"] => {
  if (status === 401 || status === 403) return "auth";
  if (status === 422) return "validation";
  if (status >= 500) return "server";
  return "other";
};

const buildHeaders = (requireAdminKey: boolean, hasBody: boolean): Record<string, string> => {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (hasBody) headers["Content-Type"] = "application/json";

  const token = getBearerToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  if (requireAdminKey) {
    const key = getModerationAdminKey();
    if (!key) {
      throw new ModerationApiError(
        "Enter the moderation admin key to load this data.",
        0,
        null,
        "missing_key"
      );
    }
    headers["X-Admin-Key"] = key;
  }
  return headers;
};

const request = async (
  url: string,
  { method = "GET", body, requireAdminKey }: { method?: "GET" | "POST"; body?: unknown; requireAdminKey: boolean }
): Promise<{ code?: number; message?: string; results?: unknown; count?: unknown }> => {
  const headers = buildHeaders(requireAdminKey, body !== undefined);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ModerationApiError(
      "Network error — could not reach the moderation API.",
      0,
      err,
      "network"
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ModerationApiError(
      scrubSecrets(extractErrorMessage(data, response.status)),
      response.status,
      data,
      kindForStatus(response.status)
    );
  }

  // Some FastAPI handlers return HTTP 200 with an error `code` in the envelope.
  if (data && typeof data.code === "number" && data.code >= 400) {
    throw new ModerationApiError(
      scrubSecrets(extractErrorMessage(data, data.code)),
      data.code,
      data,
      kindForStatus(data.code)
    );
  }

  return data ?? {};
};

/** Normalise envelope `results`: always an array of objects (scalars are wrapped as { value }). */
const normaliseResults = (raw: unknown): ModerationRecord[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) =>
    item && typeof item === "object" && !Array.isArray(item) ? (item as ModerationRecord) : { value: item }
  );
};

const toListResult = (data: { results?: unknown; count?: unknown; message?: string }): ModerationListResult => ({
  results: normaliseResults(data.results),
  count: typeof data.count === "number" ? data.count : null,
  message: typeof data.message === "string" ? data.message : "",
});

/**
 * Share one in-flight promise per identical GET (same URL + same credentials) so that
 * overview cards and tables mounting together, or StrictMode double effects, don't
 * fire duplicate requests.
 */
const inflight = new Map<string, Promise<ModerationListResult>>();
const dedupedGet = (url: string, requireAdminKey: boolean): Promise<ModerationListResult> => {
  const cacheKey = `${requireAdminKey ? getModerationAdminKey() ?? "" : ""}|${getBearerToken() ?? ""}|${url}`;
  const existing = inflight.get(cacheKey);
  if (existing) return existing;
  const p = request(url, { requireAdminKey })
    .then(toListResult)
    .finally(() => inflight.delete(cacheKey));
  inflight.set(cacheKey, p);
  return p;
};

const clampLimit = (limit?: number) =>
  Math.min(MODERATION_LIMIT_MAX, Math.max(1, Math.floor(Number(limit) || 50)));
const clampOffset = (offset?: number) => Math.max(0, Math.floor(Number(offset) || 0));

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isValidUuid = (v: string) => UUID_RE.test(v.trim());

const assertPositiveId = (value: number | string, label: string): number => {
  const id = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isInteger(id) || id <= 0) {
    throw new ModerationApiError(`Invalid ${label} ID "${value}".`, 0, null, "validation");
  }
  return id;
};

const assertReportId = (reportId: number | string): number => assertPositiveId(reportId, "report");

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Admin List Reports — GET /api/admin/reports
 * The API has no "all statuses" value (omitting `status` means "pending"), so callers
 * wanting every status must request each one.
 */
export const getAdminReports = (params: {
  status: ReviewStatus;
  offset?: number;
  limit?: number;
}): Promise<ModerationListResult> => {
  // The admin panel moderates Q&A reports only; Forum reports are never requested.
  const q = new URLSearchParams({
    status: params.status,
    context: REPORTS_CONTEXT,
    offset: String(clampOffset(params.offset)),
    limit: String(clampLimit(params.limit)),
  });
  return dedupedGet(`${API_ENDPOINTS.MODERATION_ADMIN_REPORTS}?${q.toString()}`, true);
};

/** Admin Approve Report — POST /api/admin/reports/{report_id}/approve */
export const approveReport = async (
  reportId: number | string,
  payload: { ban_user: boolean; admin_note?: string }
): Promise<ModerationActionResult> => {
  const id = assertReportId(reportId);
  const body = {
    ban_user: Boolean(payload.ban_user),
    admin_note: (payload.admin_note ?? "").slice(0, ADMIN_NOTE_MAX),
  };
  const data = await request(`${API_ENDPOINTS.MODERATION_ADMIN_REPORTS}/${id}/approve`, {
    method: "POST",
    body,
    requireAdminKey: true,
  });
  return { code: data.code ?? 200, message: data.message || "Report approved.", results: normaliseResults(data.results) };
};

/** Admin Reject Report — POST /api/admin/reports/{report_id}/reject */
export const rejectReport = async (
  reportId: number | string,
  payload: { admin_note?: string }
): Promise<ModerationActionResult> => {
  const id = assertReportId(reportId);
  const body = { admin_note: (payload.admin_note ?? "").slice(0, ADMIN_NOTE_MAX) };
  const data = await request(`${API_ENDPOINTS.MODERATION_ADMIN_REPORTS}/${id}/reject`, {
    method: "POST",
    body,
    requireAdminKey: true,
  });
  return { code: data.code ?? 200, message: data.message || "Report rejected.", results: normaliseResults(data.results) };
};

/** Admin List Blocks — GET /api/admin/blocks */
export const getAdminBlocks = (params: {
  moderationStatus: ReviewStatus;
  offset?: number;
  limit?: number;
}): Promise<ModerationListResult> => {
  const q = new URLSearchParams({
    moderation_status: params.moderationStatus,
    offset: String(clampOffset(params.offset)),
    limit: String(clampLimit(params.limit)),
  });
  return dedupedGet(`${API_ENDPOINTS.MODERATION_ADMIN_BLOCKS}?${q.toString()}`, true);
};

/** Admin Approve Block — POST /api/admin/blocks/{block_id}/approve */
export const approveBlock = async (
  blockId: number | string,
  payload: { ban_user: boolean; remove_content: boolean; admin_note?: string }
): Promise<ModerationActionResult> => {
  const id = assertPositiveId(blockId, "block");
  const body = {
    ban_user: Boolean(payload.ban_user),
    remove_content: Boolean(payload.remove_content),
    admin_note: (payload.admin_note ?? "").trim().slice(0, ADMIN_NOTE_MAX),
  };
  const data = await request(`${API_ENDPOINTS.MODERATION_ADMIN_BLOCKS}/${id}/approve`, {
    method: "POST",
    body,
    requireAdminKey: true,
  });
  return { code: data.code ?? 200, message: data.message || "Block approved.", results: normaliseResults(data.results) };
};

/** Admin Reject Block — POST /api/admin/blocks/{block_id}/reject */
export const rejectBlock = async (
  blockId: number | string,
  payload: { admin_note?: string }
): Promise<ModerationActionResult> => {
  const id = assertPositiveId(blockId, "block");
  const body = { admin_note: (payload.admin_note ?? "").trim().slice(0, ADMIN_NOTE_MAX) };
  const data = await request(`${API_ENDPOINTS.MODERATION_ADMIN_BLOCKS}/${id}/reject`, {
    method: "POST",
    body,
    requireAdminKey: true,
  });
  return { code: data.code ?? 200, message: data.message || "Block rejected.", results: normaliseResults(data.results) };
};

/** Admin Ban Delegate — POST /api/admin/delegates/{delegate_id}/ban */
export const banDelegate = async (
  delegateId: number | string,
  payload: { reason: string }
): Promise<ModerationActionResult> => {
  const id = assertPositiveId(delegateId, "delegate");
  const reason = (payload.reason ?? "").trim();
  if (!reason) {
    throw new ModerationApiError("A reason is required to ban a delegate.", 0, null, "validation");
  }
  const body = { reason: reason.slice(0, BAN_REASON_MAX) };
  const data = await request(`${API_ENDPOINTS.MODERATION_ADMIN_DELEGATES}/${id}/ban`, {
    method: "POST",
    body,
    requireAdminKey: true,
  });
  return { code: data.code ?? 200, message: data.message || "Delegate banned.", results: normaliseResults(data.results) };
};

/**
 * Admin Unban Delegate — POST /api/admin/delegates/{delegate_id}/unban
 * The documented contract has no request body, so none is sent.
 */
export const unbanDelegate = async (delegateId: number | string): Promise<ModerationActionResult> => {
  const id = assertPositiveId(delegateId, "delegate");
  const data = await request(`${API_ENDPOINTS.MODERATION_ADMIN_DELEGATES}/${id}/unban`, {
    method: "POST",
    requireAdminKey: true,
  });
  return { code: data.code ?? 200, message: data.message || "Delegate unbanned.", results: normaliseResults(data.results) };
};

export default {
  getAdminReports,
  approveReport,
  rejectReport,
  getAdminBlocks,
  approveBlock,
  rejectBlock,
  banDelegate,
  unbanDelegate,
};
