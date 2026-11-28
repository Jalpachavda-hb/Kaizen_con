import React, { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { getAdminBlocks } from "../../services/moderationService";
import type { ModerationRecord, ReviewStatus } from "../../services/moderationService";
import { BlockDecisionModal } from "./BlockDecisionModal";
import type { BlockDecisionMode } from "./BlockDecisionModal";
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
import {
  BLOCK_STATUS_KEYS,
  CONTENT_TYPE_LABEL,
  blockContentId,
  blockContentType,
  blockId,
  blockReason,
  blockedClientId,
  blockedDelegateId,
  blockerClientId,
  blockerDelegateId,
  formatDateTime,
  humanize,
  recordContext,
  recordCreatedAt,
  recordStatus,
} from "./moderationFields";

interface Props {
  delegateName: (id: number) => string | undefined;
  /** Called after a successful approve / reject so overview counts can refresh. */
  onChanged?: () => void;
}

const BlocksTable: React.FC<Props> = ({ delegateName, onChanged }) => {
  const { success: toastSuccess } = useToast();
  const [status, setStatus] = useState<ReviewStatus>("pending");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [rows, setRows] = useState<ModerationRecord[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [viewing, setViewing] = useState<ModerationRecord | null>(null);
  const [deciding, setDeciding] = useState<{ rec: ModerationRecord; mode: BlockDecisionMode } | null>(null);
  const seq = useRef(0);

  const load = useCallback(async () => {
    const mySeq = ++seq.current;
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminBlocks({ moderationStatus: status, offset: (page - 1) * pageSize, limit: pageSize });
      if (mySeq !== seq.current) return;
      setRows(res.results);
      setTotal(res.count);
    } catch (e) {
      if (mySeq !== seq.current) return;
      setError(e);
      setRows([]);
    } finally {
      if (mySeq === seq.current) setLoading(false);
    }
  }, [status, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const contentLabel = (rec: ModerationRecord) => {
    const t = blockContentType(rec);
    const id = blockContentId(rec);
    if (!t && !id) return undefined;
    return `${t ? CONTENT_TYPE_LABEL[t] || humanize(t) : "Content"}${id ? ` #${id}` : ""}`;
  };

  const actionBtn =
    "px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

  const renderActions = (rec: ModerationRecord, compact = false) => {
    const id = blockId(rec);
    const isPending = recordStatus(rec, BLOCK_STATUS_KEYS, status) === "pending";
    const canAct = isPending && id !== undefined;
    return (
      <div className={`flex items-center gap-1.5 ${compact ? "" : "justify-end"}`}>
        {!compact && (
          <button
            type="button"
            onClick={() => setViewing(rec)}
            className={`${actionBtn} border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:text-[#AA2D7B] hover:border-[#AA2D7B]/40`}
          >
            View
          </button>
        )}
        {canAct && (
          <>
            <button
              type="button"
              disabled={deciding !== null}
              onClick={() => setDeciding({ rec, mode: "approve" })}
              className={`${actionBtn} border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100`}
            >
              Approve
            </button>
            <button
              type="button"
              disabled={deciding !== null}
              onClick={() => setDeciding({ rec, mode: "reject" })}
              className={`${actionBtn} border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100`}
            >
              Reject
            </button>
          </>
        )}
        {isPending && id === undefined && (
          <span className="text-[10.5px] text-gray-400" title="The record has no id field, so it cannot be actioned.">
            No ID
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <FilterPills<ReviewStatus>
          label="Moderation status"
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          options={[
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
          ]}
        />
        <RefreshButton onClick={load} loading={loading} />
      </div>

      {error ? (
        <ErrorBanner error={error} onRetry={load} />
      ) : loading && rows.length === 0 ? (
        <TableSkeleton columns={8} />
      ) : rows.length === 0 ? (
        <EmptyState title={`No ${status} blocks`} hint="Try a different moderation status." />
      ) : (
        <div className={`overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 ${loading ? "opacity-60" : ""}`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 font-semibold uppercase tracking-wider text-[11px] bg-gray-50/80 dark:bg-gray-800/60">
                <th className="py-3 px-4 w-16 whitespace-nowrap">Block ID</th>
                <th className="py-3 px-4 min-w-[200px]">Content / Reason</th>
                <th className="py-3 px-4 min-w-[150px]">Blocked User</th>
                <th className="py-3 px-4 min-w-[150px]">Blocked By</th>
                <th className="py-3 px-4 whitespace-nowrap">Context</th>
                <th className="py-3 px-4 whitespace-nowrap">Status</th>
                <th className="py-3 px-4 whitespace-nowrap">Created</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/70">
              {rows.map((rec, idx) => {
                const id = blockId(rec);
                const content = contentLabel(rec);
                const reason = blockReason(rec);
                return (
                  <tr key={id ?? `bc-${idx}`} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors align-top">
                    <td className="py-3 px-4 font-mono text-gray-500">{id !== undefined ? `#${id}` : "—"}</td>
                    <td className="py-3 px-4 max-w-[340px] text-gray-800 dark:text-gray-200 break-words">
                      {content && <div className="font-semibold">{content}</div>}
                      {reason && <div className={content ? "text-[11.5px] text-gray-500 mt-0.5" : ""}>{reason}</div>}
                      {!content && !reason && <span className="text-gray-400">—</span>}
                    </td>
                    <td className="py-3 px-4">
                      <PersonCell delegateId={blockedDelegateId(rec)} clientId={blockedClientId(rec)} delegateName={delegateName} />
                    </td>
                    <td className="py-3 px-4">
                      <PersonCell delegateId={blockerDelegateId(rec)} clientId={blockerClientId(rec)} delegateName={delegateName} />
                    </td>
                    <td className="py-3 px-4">
                      <ContextBadge context={recordContext(rec)} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={recordStatus(rec, BLOCK_STATUS_KEYS, status)} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{formatDateTime(recordCreatedAt(rec))}</td>
                    <td className="py-3 px-4 text-right">{renderActions(rec)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <ModerationPager
            page={page}
            pageSize={pageSize}
            total={total}
            pageItemCount={rows.length}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
            itemName="blocks"
          />
        </div>
      )}

      {viewing && (
        <RecordDetailsModal
          title={`Block ${blockId(viewing) !== undefined ? `#${blockId(viewing)}` : "details"}`}
          record={viewing}
          onClose={() => setViewing(null)}
          summary={[
            ["Moderation status", <StatusBadge key="s" status={recordStatus(viewing, BLOCK_STATUS_KEYS, status)} />],
            ["Context", <ContextBadge key="c" context={recordContext(viewing)} />],
            ["Content", contentLabel(viewing) || "—"],
            ["Reason", blockReason(viewing) || "—"],
            ["Blocked user", <PersonCell key="bu" delegateId={blockedDelegateId(viewing)} clientId={blockedClientId(viewing)} delegateName={delegateName} />],
            ["Blocked by", <PersonCell key="bb" delegateId={blockerDelegateId(viewing)} clientId={blockerClientId(viewing)} delegateName={delegateName} />],
            ["Created", formatDateTime(recordCreatedAt(viewing))],
          ]}
          footer={
            recordStatus(viewing, BLOCK_STATUS_KEYS, status) === "pending" && blockId(viewing) !== undefined ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeciding({ rec: viewing, mode: "reject" });
                    setViewing(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeciding({ rec: viewing, mode: "approve" });
                    setViewing(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                >
                  Approve
                </button>
              </div>
            ) : undefined
          }
        />
      )}

      {deciding && blockId(deciding.rec) !== undefined && (
        <BlockDecisionModal
          mode={deciding.mode}
          blockId={blockId(deciding.rec)!}
          summary={
            <div className="space-y-1">
              <div className="font-semibold">{contentLabel(deciding.rec) || `Block #${blockId(deciding.rec)}`}</div>
              {blockReason(deciding.rec) && <div className="text-[11.5px] text-gray-500">{blockReason(deciding.rec)}</div>}
              <div className="text-[11px] text-gray-500 flex items-center gap-2">
                <ContextBadge context={recordContext(deciding.rec)} />
                {formatDateTime(recordCreatedAt(deciding.rec))}
              </div>
            </div>
          }
          onClose={() => setDeciding(null)}
          onDone={(res, options) => {
            const id = blockId(deciding.rec)!;
            const mode = deciding.mode;
            setDeciding(null);
            const fallback =
              mode === "approve"
                ? `Block #${id} approved${options?.banUser ? ", user banned" : ""}${options?.removeContent ? ", content removed" : ""}.`
                : `Block #${id} rejected.`;
            toastSuccess(res.message && !/^(ok|success)$/i.test(res.message) ? res.message : fallback);
            load();
            onChanged?.();
          }}
        />
      )}
    </>
  );
};

const BlockedContentTab: React.FC<Props> = (props) => (
  <AdminKeyGate>
    <BlocksTable {...props} />
  </AdminKeyGate>
);

export default BlockedContentTab;
