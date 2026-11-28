/**
 * Defensive field mapping for moderation records.
 *
 * The OpenAPI spec types every `results` item as `{}` (undocumented), so nothing here is
 * assumed to exist. Each accessor tries the field names used by the documented request
 * schemas (ReportCreate / BlockCreate) first, then a few obvious server-side variants,
 * and returns undefined when none are present. The UI renders "—" for undefined and the
 * details modal always shows every raw field the API actually returned.
 */
import type { ModerationRecord, ReviewStatus } from "../../services/moderationService";

export const pick = (rec: ModerationRecord, keys: string[]): unknown => {
  for (const k of keys) {
    const v = rec[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
};

export const pickString = (rec: ModerationRecord, keys: string[]): string | undefined => {
  const v = pick(rec, keys);
  if (v === undefined) return undefined;
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  return undefined;
};

export const pickNumber = (rec: ModerationRecord, keys: string[]): number | undefined => {
  const v = pick(rec, keys);
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : undefined;
};

// ---- Shared ---------------------------------------------------------------
export const recordId = (rec: ModerationRecord, extra: string[] = []) => pickNumber(rec, ["id", ...extra]);
export const recordContext = (rec: ModerationRecord) => pickString(rec, ["context"]);
export const recordCreatedAt = (rec: ModerationRecord) => pickString(rec, ["created_at", "createdAt", "reported_at", "blocked_at"]);

const STATUS_VALUES: ReviewStatus[] = ["pending", "approved", "rejected"];
/**
 * Status comes from the record when it carries one; otherwise from the status filter the
 * record was fetched under (the API filters server-side, so that value is authoritative).
 */
export const recordStatus = (rec: ModerationRecord, keys: string[], fetchedAs?: ReviewStatus): ReviewStatus | string | undefined => {
  const raw = pickString(rec, keys);
  if (raw) {
    const lower = raw.toLowerCase();
    return STATUS_VALUES.includes(lower as ReviewStatus) ? (lower as ReviewStatus) : raw;
  }
  return fetchedAs;
};

// ---- Reports (fields from ReportCreate) -----------------------------------
export const REPORT_STATUS_KEYS = ["status", "review_status", "moderation_status"];
export const reportId = (rec: ModerationRecord) => recordId(rec, ["report_id"]);
export const reportReason = (rec: ModerationRecord) => pickString(rec, ["reason"]);
export const reportDetails = (rec: ModerationRecord) => pickString(rec, ["details", "description"]);
export const reportContentType = (rec: ModerationRecord) => pickString(rec, ["content_type"]);
export const reportContentId = (rec: ModerationRecord) => pickString(rec, ["content_id"]);
export const reportContentText = (rec: ModerationRecord) =>
  pickString(rec, ["content", "content_text", "content_preview", "content_body", "text"]);
/** ReportCreate's delegate_id / client_id identify the reporter. */
export const reporterDelegateId = (rec: ModerationRecord) => pickNumber(rec, ["reporter_delegate_id", "delegate_id"]);
export const reporterClientId = (rec: ModerationRecord) => pickString(rec, ["reporter_client_id", "client_id"]);
export const reportedDelegateId = (rec: ModerationRecord) =>
  pickNumber(rec, ["reported_delegate_id", "target_delegate_id", "author_delegate_id", "content_author_delegate_id"]);
export const reportedClientId = (rec: ModerationRecord) =>
  pickString(rec, ["reported_client_id", "target_client_id", "author_client_id", "content_author_client_id"]);
export const reportAdminNote = (rec: ModerationRecord) => pickString(rec, ["admin_note"]);

// ---- Blocks (fields from BlockCreate) -------------------------------------
export const BLOCK_STATUS_KEYS = ["moderation_status", "status", "review_status"];
export const blockId = (rec: ModerationRecord) => recordId(rec, ["block_id"]);
export const blockReason = (rec: ModerationRecord) => pickString(rec, ["reason"]);
/** BlockCreate: delegate_id / client_id = the user who blocked; blocked_* = the user who was blocked. */
export const blockerDelegateId = (rec: ModerationRecord) => pickNumber(rec, ["blocker_delegate_id", "delegate_id"]);
export const blockerClientId = (rec: ModerationRecord) => pickString(rec, ["blocker_client_id", "client_id"]);
export const blockedDelegateId = (rec: ModerationRecord) => pickNumber(rec, ["blocked_delegate_id"]);
export const blockedClientId = (rec: ModerationRecord) => pickString(rec, ["blocked_client_id"]);
export const blockContentType = (rec: ModerationRecord) => pickString(rec, ["content_type"]);
export const blockContentId = (rec: ModerationRecord) => pickString(rec, ["content_id"]);

// ---- Labels ---------------------------------------------------------------
export const CONTEXT_LABEL: Record<string, string> = { forum: "Forum", qa: "Q&A" };
export const CONTENT_TYPE_LABEL: Record<string, string> = {
  idea: "Idea",
  idea_reply: "Idea reply",
  idea_discussion: "Idea discussion",
  qa_question: "Q&A question",
};
export const REASON_LABEL: Record<string, string> = {
  spam: "Spam",
  abusive: "Abusive",
  inappropriate: "Inappropriate",
  other: "Other",
};

export const humanize = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const formatDateTime = (iso?: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const shortUuid = (id: string) => (id.length > 13 ? `${id.slice(0, 8)}…` : id);

/** Value → readable string for the raw "all fields" view. */
export const formatRawValue = (v: unknown): string => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "string") return v === "" ? '""' : v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
};
