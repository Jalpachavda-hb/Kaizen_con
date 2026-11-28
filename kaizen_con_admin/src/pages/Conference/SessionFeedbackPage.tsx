import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { AdminPageContainer } from "../../components/common/AdminPageContainer";
import { TablePagination } from "../../components/common/TablePagination";
import { StarRating } from "../../components/common/StarRating";
import { FeedbackIcon } from "../../components/common/FeedbackIcon";
import { getSessionFeedback, getSessionById } from "../../api/ApiPath";

export interface FeedbackEntry {
  id: number | string;
  rating: number;
  comment?: string | null;
  submitted_at?: string | null;
  delegate_name?: string | null;
  user_name?: string | null;
  name?: string | null;
  email?: string | null;
  [key: string]: unknown;
}

export interface SessionFeedbackSummary {
  session_id: number;
  total_feedback?: number | null;
  average_rating?: number | null;
  comments?: {
    five_star?: FeedbackEntry[] | null;
    three_or_four_star?: FeedbackEntry[] | null;
    one_star?: FeedbackEntry[] | null;
    [key: string]: FeedbackEntry[] | null | undefined;
  } | null;
}

type LoadState = "loading" | "ready" | "error" | "not-found" | "invalid";

const COMMENT_TRUNCATE_AT = 120;

const asArray = (v: unknown): FeedbackEntry[] => (Array.isArray(v) ? (v as FeedbackEntry[]) : []);

const hasText = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;

const getSubmitter = (f: FeedbackEntry): string | null => {
  const candidate = f.delegate_name || f.user_name || f.name || f.email;
  return hasText(candidate) ? candidate.trim() : null;
};

const formatDateTime = (iso?: string | null): string => {
  if (!hasText(iso)) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function SessionFeedbackPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const isValidId = !!sessionId && /^\d+$/.test(sessionId) && Number(sessionId) > 0;

  const [state, setState] = useState<LoadState>(isValidId ? "loading" : "invalid");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [summary, setSummary] = useState<SessionFeedbackSummary | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string | null>(null);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<FeedbackEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchFeedback = useCallback(async () => {
    if (!isValidId) {
      setState("invalid");
      return;
    }
    setState("loading");
    setErrorMessage("");
    setSummary(null);
    setExpandedIds(new Set());
    setCurrentPage(1);

    // Session title is supplementary — never block the feedback view on it.
    getSessionById(sessionId)
      .then((s: { title?: unknown } | null) => setSessionTitle(hasText(s?.title) ? s.title : null))
      .catch(() => setSessionTitle(null));

    try {
      const data = await getSessionFeedback(sessionId);
      setSummary(data || null);
      setState("ready");
    } catch (e: unknown) {
      const err = e as { status?: number; message?: string } | null;
      if (err?.status === 404) {
        setState("not-found");
      } else if (err?.status === 422) {
        setState("invalid");
      } else {
        setErrorMessage(err?.message || "Unable to load feedback. Please try again.");
        setState("error");
      }
    }
  }, [sessionId, isValidId]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  // Close modal on Escape
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  // Flatten the grouped arrays into one dataset, newest first
  const { records, fiveStarCount, oneStarCount } = useMemo(() => {
    const c = summary?.comments || {};
    const five = asArray(c.five_star);
    const mid = asArray(c.three_or_four_star);
    const one = asArray(c.one_star);

    const seen = new Set<string>();
    const all: FeedbackEntry[] = [];
    // Include any extra rating groups the backend may add later
    const groups = [five, mid, one, ...Object.entries(c)
      .filter(([k]) => !["five_star", "three_or_four_star", "one_star"].includes(k))
      .map(([, v]) => asArray(v))];
    groups.flat().forEach((f, idx) => {
      if (!f || typeof f !== "object") return;
      const key = f.id !== undefined && f.id !== null ? String(f.id) : `idx-${idx}`;
      if (seen.has(key)) return;
      seen.add(key);
      all.push({ ...f, rating: Number(f.rating) || 0, session_id: summary?.session_id });
    });

    all.sort((a, b) => {
      const ta = hasText(a.submitted_at) ? new Date(a.submitted_at).getTime() : 0;
      const tb = hasText(b.submitted_at) ? new Date(b.submitted_at).getTime() : 0;
      return (tb || 0) - (ta || 0);
    });

    return { records: all, fiveStarCount: five.length, oneStarCount: one.length };
  }, [summary]);

  const totalFeedback = Number(summary?.total_feedback) || 0;
  const avgRaw = summary?.average_rating;
  const averageRating = typeof avgRaw === "number" && Number.isFinite(avgRaw) ? avgRaw : null;
  const unlistedCount = Math.max(0, totalFeedback - records.length);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return records.slice(start, start + pageSize);
  }, [records, currentPage, pageSize]);

  const toggleExpand = (key: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const backButton = (
    <button
      type="button"
      onClick={() => navigate("/schedules")}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-[#AA2D7B] transition-colors cursor-pointer"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      <span>Back to Schedules</span>
    </button>
  );

  const refreshButton = (
    <button
      type="button"
      onClick={fetchFeedback}
      disabled={state === "loading" || !isValidId}
      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-[#AA2D7B] transition-colors disabled:opacity-50 cursor-pointer"
      title="Refresh feedback from server"
    >
      <svg
        className={`w-3.5 h-3.5 ${state === "loading" ? "animate-spin text-[#AA2D7B]" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span className="hidden sm:inline">Refresh</span>
    </button>
  );

  const renderStateCard = (opts: {
    tone: "rose" | "amber";
    title: string;
    message: string;
    showRetry?: boolean;
  }) => (
    <div className="text-center py-14 bg-white dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
          opts.tone === "rose"
            ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600"
            : "bg-amber-100 dark:bg-amber-950/60 text-amber-600"
        }`}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{opts.title}</h3>
      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">{opts.message}</p>
      <div className="mt-4 flex items-center justify-center gap-2">
        {opts.showRetry && (
          <button
            type="button"
            onClick={fetchFeedback}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#AA2D7B] hover:bg-[#D85A9A] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Retry
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate("/schedules")}
          className="px-4 py-1.5 text-xs font-semibold text-[#AA2D7B] border border-[#AA2D7B]/30 hover:bg-[#faedf5] rounded-lg transition-colors cursor-pointer"
        >
          Back to Schedules
        </button>
      </div>
    </div>
  );

  const statCards = [
    {
      label: "Total Feedback",
      value: String(totalFeedback),
      labelClass: "text-gray-500",
      valueClass: "text-gray-900 dark:text-white",
    },
    {
      label: "Average Rating",
      value: averageRating !== null ? `${averageRating.toFixed(1)} / 5` : "0.0 / 5",
      labelClass: "text-[#AA2D7B]",
      valueClass: "text-[#AA2D7B]",
    },
    {
      label: "Five-Star Feedback",
      value: String(fiveStarCount),
      labelClass: "text-purple-600 dark:text-purple-400",
      valueClass: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Low Ratings (1★)",
      value: String(oneStarCount),
      labelClass: "text-rose-600 dark:text-rose-400",
      valueClass: "text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <>
      <PageMeta
        title={`Session Feedback - ${sessionTitle || `#${sessionId || ""}`} | Kaizen Con 2027`}
        description="Review delegate feedback and ratings for this conference session."
      />

      <AdminPageContainer
        title="Session Feedback"
        subtitle="Review delegate feedback and ratings for this conference session."
        actionButton={
          <div className="flex items-center gap-2">
            {refreshButton}
            {backButton}
          </div>
        }
      >
        {/* Session identity strip */}
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            Session ID: #{sessionId || "—"}
          </span>
          {sessionTitle && (
            <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">{sessionTitle}</span>
          )}
        </div>

        {state === "invalid" &&
          renderStateCard({
            tone: "amber",
            title: "Invalid session ID",
            message: `"${sessionId || ""}" is not a valid session ID. Please open feedback from the Schedules page.`,
          })}

        {state === "not-found" &&
          renderStateCard({
            tone: "amber",
            title: "Session not found",
            message: `No session exists with ID #${sessionId}. It may have been deleted.`,
          })}

        {state === "error" &&
          renderStateCard({
            tone: "rose",
            title: "Couldn't load feedback",
            message: errorMessage,
            showRetry: true,
          })}

        {state === "loading" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/60 shadow-2xs animate-pulse"
                >
                  <div className="h-2.5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded mt-2.5" />
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-center py-14 text-gray-400 text-xs">
              <svg className="w-8 h-8 text-[#AA2D7B] animate-spin mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Loading session feedback...</span>
            </div>
          </>
        )}

        {state === "ready" && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/60 shadow-2xs"
                >
                  <div className={`text-[11px] font-medium uppercase tracking-wider ${card.labelClass}`}>
                    {card.label}
                  </div>
                  <div className={`text-xl font-black mt-1 ${card.valueClass}`}>{card.value}</div>
                </div>
              ))}
            </div>

            {unlistedCount > 0 && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg text-blue-800 dark:text-blue-300 text-xs flex items-start gap-2">
                <svg className="w-4 h-4 shrink-0 mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" d="M12 16v-4m0-4h.01" />
                </svg>
                <span>
                  {unlistedCount} of {totalFeedback} submission{totalFeedback === 1 ? "" : "s"} {unlistedCount === 1 ? "is" : "are"} counted
                  in the totals but not itemised by the feedback API (typically ratings submitted without a written
                  comment). Star-group counts reflect itemised entries only.
                </span>
              </div>
            )}

            {records.length === 0 ? (
              <div className="text-center py-14 bg-white dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <FeedbackIcon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {totalFeedback > 0 ? "No written feedback to display" : "No feedback yet"}
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  {totalFeedback > 0
                    ? "Ratings have been submitted for this session, but none include itemised feedback."
                    : "No feedback has been submitted for this session yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 font-semibold uppercase tracking-wider text-[11px] bg-gray-50/80 dark:bg-gray-800/60">
                      <th className="py-3 px-4 w-12 whitespace-nowrap">#</th>
                      <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">Delegate / User</th>
                      <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">Rating</th>
                      <th className="py-3 px-4 min-w-[260px]">Feedback / Comment</th>
                      <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">Submitted At</th>
                      <th className="py-3 px-4 w-20 text-center whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/70">
                    {paginated.map((f, i) => {
                      const key = String(f.id ?? `row-${i}`);
                      const submitter = getSubmitter(f);
                      const comment = hasText(f.comment) ? f.comment.trim() : null;
                      const isLong = !!comment && comment.length > COMMENT_TRUNCATE_AT;
                      const expanded = expandedIds.has(key);

                      return (
                        <tr key={key} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
                          <td className="py-3.5 px-4 align-top text-gray-500 font-mono">
                            {(currentPage - 1) * pageSize + i + 1}
                          </td>
                          <td className="py-3.5 px-4 align-top">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-[10px] uppercase shrink-0 bg-gradient-to-tr from-[#55355E] to-[#AA2D7B]">
                                {submitter ? submitter.charAt(0) : "D"}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-gray-800 dark:text-gray-200">
                                  {submitter || "Anonymous Delegate"}
                                </div>
                                <div className="font-mono text-[10px] text-gray-400">Feedback #{f.id ?? "—"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 align-top whitespace-nowrap">
                            <StarRating rating={f.rating} />
                          </td>
                          <td className="py-3.5 px-4 align-top max-w-[420px]">
                            {comment ? (
                              <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                <div className={expanded ? "whitespace-pre-line break-words" : "line-clamp-2 break-words"}>
                                  {comment}
                                </div>
                                {isLong && (
                                  <button
                                    type="button"
                                    onClick={() => toggleExpand(key)}
                                    className="mt-1 text-[11px] font-semibold text-[#AA2D7B] hover:text-[#D85A9A] hover:underline cursor-pointer"
                                  >
                                    {expanded ? "Show less" : "Read more"}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="italic text-gray-400">No written feedback</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 align-top whitespace-nowrap text-gray-600 dark:text-gray-400">
                            {formatDateTime(f.submitted_at)}
                          </td>
                          <td className="py-3.5 px-4 align-top text-center">
                            <button
                              type="button"
                              onClick={() => setSelected(f)}
                              className="p-1.5 text-xs font-semibold text-[#AA2D7B] dark:text-[#D85A9A] bg-[#faedf5]/70 hover:bg-[#faedf5] dark:bg-pink-950/40 dark:hover:bg-pink-900/50 rounded-lg border border-[#AA2D7B]/20 dark:border-[#AA2D7B]/40 transition-colors cursor-pointer inline-flex items-center justify-center"
                              data-tooltip="View Details"
                              aria-label="View feedback details"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <TablePagination
                  currentPage={currentPage}
                  totalItems={records.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(n) => {
                    setPageSize(n);
                    setCurrentPage(1);
                  }}
                  itemName="feedback entries"
                />
              </div>
            )}
          </>
        )}
      </AdminPageContainer>

      {/* Feedback Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-detail-title"
        >
          <div
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-[#faedf5]/70 dark:bg-gray-800/90">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#AA2D7B]/10 text-[#AA2D7B] flex items-center justify-center shrink-0">
                  <FeedbackIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="feedback-detail-title" className="text-base font-bold text-gray-900 dark:text-white">
                    Feedback #{selected.id ?? "—"}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Session #{sessionId}
                    {sessionTitle ? ` · ${sessionTitle}` : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Delegate / User</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                    {getSubmitter(selected) || "Anonymous Delegate"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Submitted At</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                    {formatDateTime(selected.submitted_at)}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Rating</div>
                <StarRating rating={selected.rating} size="md" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Feedback / Comment</div>
                {hasText(selected.comment) ? (
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line break-words p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60">
                    {selected.comment.trim()}
                  </p>
                ) : (
                  <p className="italic text-gray-400">No written feedback</p>
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#AA2D7B] hover:bg-[#D85A9A] rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
