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

// ---- Reports ----------------------------------------------------------------
// Shape observed from GET /api/admin/reports (2026-11-28):
//   id, context, content_type, content_id,
//   reporter_kind ("client" | "delegate"), reporter_ref,
//   reported_kind ("client" | "delegate"), reported_ref,
//   reason, details, status, admin_note, reviewed_by, reviewed_at, created_at,
//   content_snapshot: { text, author_name, author_id, status } | { missing: true },
//   age_hours, overdue, due_soon
export const REPORT_STATUS_KEYS = ["status"];
export const reportId = (rec: ModerationRecord) => recordId(rec, ["report_id"]);
export const reportReason = (rec: ModerationRecord) => pickString(rec, ["reason"]);
export const reportDetails = (rec: ModerationRecord) => pickString(rec, ["details"]);
export const reportContentType = (rec: ModerationRecord) => pickString(rec, ["content_type"]);
export const reportContentId = (rec: ModerationRecord) => pickString(rec, ["content_id"]);
export const reportAdminNote = (rec: ModerationRecord) => pickString(rec, ["admin_note"]);
export const reportReviewedBy = (rec: ModerationRecord) => pickString(rec, ["reviewed_by"]);
export const reportReviewedAt = (rec: ModerationRecord) => pickString(rec, ["reviewed_at"]);
export const reportOverdue = (rec: ModerationRecord) => rec.overdue === true;
export const reportDueSoon = (rec: ModerationRecord) => rec.due_soon === true;
export const reportAgeHours = (rec: ModerationRecord) => pickNumber(rec, ["age_hours"]);

/** content_snapshot as an object, or undefined when absent / not an object. */
const snapshot = (rec: ModerationRecord): ModerationRecord | undefined => {
  const s = rec.content_snapshot;
  return s && typeof s === "object" && !Array.isArray(s) ? (s as ModerationRecord) : undefined;
};
/** True when the API reports the content no longer exists (`content_snapshot.missing`). */
export const reportContentMissing = (rec: ModerationRecord) => snapshot(rec)?.missing === true;
export const reportContentText = (rec: ModerationRecord) => {
  const s = snapshot(rec);
  return s ? pickString(s, ["text"]) : undefined;
};
export const reportContentAuthor = (rec: ModerationRecord) => {
  const s = snapshot(rec);
  return s ? pickString(s, ["author_name"]) : undefined;
};
/** Moderation status of the content itself (e.g. Q&A question status), not the report. */
export const reportContentStatus = (rec: ModerationRecord) => {
  const s = snapshot(rec);
  return s ? pickString(s, ["status"]) : undefined;
};

/** Resolve a `<prefix>_kind` / `<prefix>_ref` pair to a delegate id or client UUID. */
const identity = (rec: ModerationRecord, prefix: "reporter" | "reported") => {
  const kind = pickString(rec, [`${prefix}_kind`])?.toLowerCase();
  const ref = pickString(rec, [`${prefix}_ref`]);
  if (!ref) return { delegateId: undefined, clientId: undefined };
  if (kind === "delegate") {
    const n = Number(ref);
    return Number.isFinite(n) ? { delegateId: n, clientId: undefined } : { delegateId: undefined, clientId: ref };
  }
  return { delegateId: undefined, clientId: ref };
};
export const reporterDelegateId = (rec: ModerationRecord) => identity(rec, "reporter").delegateId;
export const reporterClientId = (rec: ModerationRecord) => identity(rec, "reporter").clientId;
export const reportedDelegateId = (rec: ModerationRecord) => identity(rec, "reported").delegateId;
export const reportedClientId = (rec: ModerationRecord) => identity(rec, "reported").clientId;
/**
 * Name of the reported user. Only taken from the content snapshot when its author_id
 * matches reported_ref, so the name is never attributed to the wrong person.
 */
export const reportedName = (rec: ModerationRecord) => {
  const s = snapshot(rec);
  if (!s) return undefined;
  const authorId = pickString(s, ["author_id"]);
  const ref = pickString(rec, ["reported_ref"]);
  return authorId && ref && authorId === ref ? pickString(s, ["author_name"]) : undefined;
};

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
