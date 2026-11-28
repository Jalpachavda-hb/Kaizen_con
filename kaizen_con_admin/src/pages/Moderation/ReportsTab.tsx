import React, { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { getAdminReports, MODERATION_LIMIT_MAX } from "../../services/moderationService";
import type { ModerationContext, ModerationRecord, ReviewStatus } from "../../services/moderationService";
import {
  AdminKeyGate,
  ContextBadge,
  EmptyState,
  ErrorBanner,
  FilterPills,
  ModerationPager,
  PersonCell,
  RecordDetailsModal,
  RefreshButton,
  StatusBadge,
  TableSkeleton,
} from "./ModerationUI";
import { ReportDecisionModal } from "./ReportDecisionModal";
import type { DecisionMode } from "./ReportDecisionModal";
import {
  CONTENT_TYPE_LABEL,
  REASON_LABEL,
  REPORT_STATUS_KEYS,
  formatDateTime,
  humanize,
  recordContext,
  recordCreatedAt,
  recordStatus,
  reportAdminNote,
  reportContentId,
  reportContentText,
  reportContentType,
  reportDetails,
  reportId,
  reportReason,
  reportedClientId,
  reportedDelegateId,
  reporterClientId,
  reporterDelegateId,
} from "./moderationFields";

type StatusFilter = "all" | ReviewStatus;
type ContextFilter = "all" | ModerationContext;

interface Row {
  rec: ModerationRecord;
  fetchedAs: ReviewStatus;
}

const ALL_STATUSES: ReviewStatus[] = ["pending", "approved", "rejected"];

const sortNewestFirst = (a: Row, b: Row) => {
  const ta = Date.parse(recordCreatedAt(a.rec) || "") || 0;
  const tb = Date.parse(recordCreatedAt(b.rec) || "") || 0;
  if (tb !== ta) return tb - ta;
  return (reportId(b.rec) ?? 0) - (reportId(a.rec) ?? 0);
};

interface Props {
  delegateName: (id: number) => string | undefined;
  /** Called after a successful approve / reject so the overview can refresh. */
  onChanged: () => void;
}

const ReportsTable: React.FC<Props> = ({ delegateName, onChanged }) => {
  const { success: toastSuccess } = useToast();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [contextFilter, setContextFilter] = useState<ContextFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [truncatedAll, setTruncatedAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const requestSeq = useRef(0);

  /** Report IDs processed in this session — their actions stay disabled even before the refresh lands. */
  const [processed, setProcessed] = useState<Record<number, ReviewStatus>>({});

  const [viewing, setViewing] = useState<Row | null>(null);
  const [deciding, setDeciding] = useState<{ row: Row; mode: DecisionMode } | null>(null);

  const load = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);
    const context = contextFilter === "all" ? null : contextFilter;
    try {
      if (statusFilter === "all") {
        // No "all" value exists in the API, so fetch each status (max page) and merge.
        const results = await Promise.all(
          ALL_STATUSES.map((s) => getAdminReports({ status: s, context, offset: 0, limit: MODERATION_LIMIT_MAX }))
        );
        if (seq !== requestSeq.current) return;
        const merged: Row[] = results.flatMap((r, i) => r.results.map((rec) => ({ rec, fetchedAs: ALL_STATUSES[i] })));
        merged.sort(sortNewestFirst);
        setRows(merged);
        setTotal(merged.length);
        setTruncatedAll(
          results.some((r) => (r.count !== null ? r.count > r.results.length : r.results.length >= MODERATION_LIMIT_MAX))
        );
      } else {
        const res = await getAdminReports({
          status: statusFilter,
          context,
          offset: (page - 1) * pageSize,
          limit: pageSize,
        });
        if (seq !== requestSeq.current) return;
        setRows(res.results.map((rec) => ({ rec, fetchedAs: statusFilter })));
        setTotal(res.count);
        setTruncatedAll(false);
      }
    } catch (e) {
      if (seq !== requestSeq.current) return;
      setError(e);
      setRows([]);
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
    // "all" mode paginates client-side, so page changes there must not refetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, contextFilter, statusFilter === "all" ? 0 : page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const visibleRows = statusFilter === "all" ? rows.slice((page - 1) * pageSize, page * pageSize) : rows;

  const effectiveStatus = (row: Row): string | undefined => {
    const id = reportId(row.rec);
    if (id !== undefined && processed[id]) return processed[id];
    return recordStatus(row.rec, REPORT_STATUS_KEYS, row.fetchedAs);
  };

  const describe = (row: Row) => {
    const reason = reportReason(row.rec);
    const ctype = reportContentType(row.rec);
    const cid = reportContentId(row.rec);
    return (
      <>
        <div>
          <span className="font-semibold">{reason ? REASON_LABEL[reason] || humanize(reason) : "Report"}</span>
          {ctype && (
            <span className="text-gray-500">
              {" "}on {CONTENT_TYPE_LABEL[ctype] || humanize(ctype)}
              {cid ? ` #${cid}` : ""}
            </span>
          )}
        </div>
        {reportDetails(row.rec) && <div className="text-[11.5px] text-gray-500 mt-0.5 whitespace-pre-line">{reportDetails(row.rec)}</div>}
      </>
    );
  };

  const renderActions = (row: Row, compact = false) => {
    const id = reportId(row.rec);
    const isPending = effectiveStatus(row) === "pending";
    const canAct = isPending && id !== undefined;
    const base = "px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";
    return (
      <div className={`flex items-center gap-1.5 ${compact ? "" : "justify-end"}`}>
        {!compact && (
          <button
            type="button"
            onClick={() => setViewing(row)}
            className={`${base} border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:text-[#AA2D7B] hover:border-[#AA2D7B]/40`}
          >
            View
          </button>
        )}
        {canAct && (
          <>
            <button
              type="button"
              onClick={() => setDeciding({ row, mode: "approve" })}
              className={`${base} border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100`}
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => setDeciding({ row, mode: "reject" })}
              className={`${base} border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100`}
            >
              Reject
            </button>
          </>
        )}
        {isPending && id === undefined && (
          <span className="text-[10.5px] text-gray-400" title="The record has no id field, so it cannot be actioned.">No ID</span>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
          <FilterPills<StatusFilter>
            label="Status"
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            options={[
              { value: "all", label: "All" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ]}
          />
          <FilterPills<ContextFilter>
            label="Context"
            value={contextFilter}
            onChange={(v) => {
              setContextFilter(v);
              setPage(1);
            }}
            options={[
              { value: "all", label: "All" },
              { value: "forum", label: "Forum" },
              { value: "qa", label: "Q&A" },
            ]}
          />
        </div>
        <RefreshButton onClick={load} loading={loading} />
      </div>

      {truncatedAll && (
        <p className="mb-3 text-[11px] text-gray-500">
          "All" shows up to the {MODERATION_LIMIT_MAX} most recent reports per status (the API's maximum page). Filter by a single status to page through everything.
        </p>
      )}

      {error ? (
        <ErrorBanner error={error} onRetry={load} />
      ) : loading && rows.length === 0 ? (
        <TableSkeleton columns={8} />
      ) : visibleRows.length === 0 ? (
        <EmptyState
          title={statusFilter === "pending" ? "No pending reports" : "No reports found"}
          hint={contextFilter !== "all" || statusFilter !== "all" ? "Try a different status or context filter." : undefined}
        />
      ) : (
        <div className={`overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 ${loading ? "opacity-60" : ""}`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 font-semibold uppercase tracking-wider text-[11px] bg-gray-50/80 dark:bg-gray-800/60">
                <th className="py-3 px-4 w-16 whitespace-nowrap">ID</th>
                <th className="py-3 px-4 min-w-[140px]">Reporter</th>
                <th className="py-3 px-4 min-w-[140px]">Reported User</th>
                <th className="py-3 px-4 min-w-[240px]">Content / Reason</th>
                <th className="py-3 px-4 whitespace-nowrap">Context</th>
                <th className="py-3 px-4 whitespace-nowrap">Reported</th>
                <th className="py-3 px-4 whitespace-nowrap">Status</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/70">
              {visibleRows.map((row, idx) => {
                const id = reportId(row.rec);
                const text = reportContentText(row.rec);
                return (
                  <tr key={id ?? `r-${idx}`} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors align-top">
                    <td className="py-3 px-4 font-mono text-gray-500">{id !== undefined ? `#${id}` : "—"}</td>
                    <td className="py-3 px-4">
                      <PersonCell delegateId={reporterDelegateId(row.rec)} clientId={reporterClientId(row.rec)} delegateName={delegateName} />
                    </td>
                    <td className="py-3 px-4">
                      <PersonCell delegateId={reportedDelegateId(row.rec)} clientId={reportedClientId(row.rec)} delegateName={delegateName} />
                    </td>
                    <td className="py-3 px-4 max-w-[360px] text-gray-800 dark:text-gray-200">
                      {describe(row)}
                      {text && <div className="text-[11.5px] text-gray-500 mt-1 line-clamp-2 italic">“{text}”</div>}
                    </td>
                    <td className="py-3 px-4">
                      <ContextBadge context={recordContext(row.rec)} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{formatDateTime(recordCreatedAt(row.rec))}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={effectiveStatus(row)} />
                    </td>
                    <td className="py-3 px-4">{renderActions(row)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <ModerationPager
            page={page}
            pageSize={pageSize}
            total={total}
            pageItemCount={visibleRows.length}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
            itemName="reports"
          />
        </div>
      )}

      {viewing && (
        <RecordDetailsModal
          title={`Report ${reportId(viewing.rec) !== undefined ? `#${reportId(viewing.rec)}` : "details"}`}
          record={viewing.rec}
          onClose={() => setViewing(null)}
          summary={[
            ["Status", <StatusBadge key="s" status={effectiveStatus(viewing)} />],
            ["Context", <ContextBadge key="c" context={recordContext(viewing.rec)} />],
            ["Reason", reportReason(viewing.rec) ? REASON_LABEL[reportReason(viewing.rec)!] || reportReason(viewing.rec) : "—"],
            ["Details", reportDetails(viewing.rec) || "—"],
            [
              "Content",
              reportContentType(viewing.rec)
                ? `${CONTENT_TYPE_LABEL[reportContentType(viewing.rec)!] || reportContentType(viewing.rec)}${reportContentId(viewing.rec) ? ` #${reportContentId(viewing.rec)}` : ""}`
                : "—",
            ],
            ["Reporter", <PersonCell key="rp" delegateId={reporterDelegateId(viewing.rec)} clientId={reporterClientId(viewing.rec)} delegateName={delegateName} />],
            ["Reported user", <PersonCell key="ru" delegateId={reportedDelegateId(viewing.rec)} clientId={reportedClientId(viewing.rec)} delegateName={delegateName} />],
            ["Reported", formatDateTime(recordCreatedAt(viewing.rec))],
            ["Admin note", reportAdminNote(viewing.rec) || "—"],
          ]}
          footer={
            effectiveStatus(viewing) === "pending" && reportId(viewing.rec) !== undefined ? (
              <div className="flex items-center gap-2">
                {[
                  { mode: "reject" as const, label: "Reject", cls: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300" },
                  { mode: "approve" as const, label: "Approve", cls: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300" },
                ].map((b) => (
                  <button
                    key={b.mode}
                    type="button"
                    onClick={() => {
                      setDeciding({ row: viewing, mode: b.mode });
                      setViewing(null);
                    }}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${b.cls}`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            ) : undefined
          }
        />
      )}

      {deciding && reportId(deciding.row.rec) !== undefined && (
        <ReportDecisionModal
          mode={deciding.mode}
          reportId={reportId(deciding.row.rec)!}
          summary={
            <div className="space-y-1">
              {describe(deciding.row)}
              <div className="text-[11px] text-gray-500 flex items-center gap-2">
                <ContextBadge context={recordContext(deciding.row.rec)} />
                {formatDateTime(recordCreatedAt(deciding.row.rec))}
              </div>
            </div>
          }
          onClose={() => setDeciding(null)}
          onDone={(res, banUser) => {
            const id = reportId(deciding.row.rec)!;
            const newStatus: ReviewStatus = deciding.mode === "approve" ? "approved" : "rejected";
            setProcessed((p) => ({ ...p, [id]: newStatus }));
            setDeciding(null);
            toastSuccess(
              res.message && !/^(ok|success)$/i.test(res.message)
                ? res.message
                : deciding.mode === "approve"
                ? `Report #${id} approved${banUser ? " and user banned" : ""}.`
                : `Report #${id} rejected.`
            );
            load();
            onChanged();
          }}
        />
      )}
    </>
  );
};

const ReportsTab: React.FC<Props> = (props) => (
  <AdminKeyGate>
    <ReportsTable {...props} />
  </AdminKeyGate>
);

export default ReportsTab;
