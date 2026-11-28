import React, { useCallback, useEffect, useRef, useState } from "react";
import { getBlockedUsers, isValidUuid } from "../../services/moderationService";
import type { ModerationContext, ModerationRecord } from "../../services/moderationService";
import {
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
  btnPrimary,
  btnSecondary,
} from "./ModerationUI";
import {
  BLOCK_STATUS_KEYS,
  blockId,
  blockReason,
  blockedClientId,
  blockedDelegateId,
  blockerClientId,
  blockerDelegateId,
  formatDateTime,
  recordContext,
  recordCreatedAt,
  recordStatus,
} from "./moderationFields";

interface Props {
  delegateName: (id: number) => string | undefined;
}

const inputClass = (hasError: boolean) =>
  `w-full px-3 py-1.5 text-xs rounded-lg border ${
    hasError ? "border-rose-400 dark:border-rose-700" : "border-gray-200 dark:border-gray-700"
  } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#AA2D7B] focus:border-[#AA2D7B] font-mono`;

const BlockedUsersTab: React.FC<Props> = ({ delegateName }) => {
  const [context, setContext] = useState<ModerationContext>("forum");

  // Draft filter inputs vs. applied filters (applied on submit to avoid a request per keystroke)
  const [delegateInput, setDelegateInput] = useState("");
  const [clientInput, setClientInput] = useState("");
  const [applied, setApplied] = useState<{ delegateId: number | null; clientId: string | null }>({ delegateId: null, clientId: null });
  const [fieldErrors, setFieldErrors] = useState<{ delegate?: string; client?: string }>({});

  const [rows, setRows] = useState<ModerationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [viewing, setViewing] = useState<ModerationRecord | null>(null);
  const seq = useRef(0);

  const load = useCallback(async () => {
    const mySeq = ++seq.current;
    setLoading(true);
    setError(null);
    try {
      const res = await getBlockedUsers({ context, delegateId: applied.delegateId, clientId: applied.clientId });
      if (mySeq !== seq.current) return;
      setRows(res.results);
    } catch (e) {
      if (mySeq !== seq.current) return;
      setError(e);
      setRows([]);
    } finally {
      if (mySeq === seq.current) setLoading(false);
    }
  }, [context, applied]);

  useEffect(() => {
    load();
  }, [load]);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { delegate?: string; client?: string } = {};
    const d = delegateInput.trim();
    const c = clientInput.trim();
    let delegateId: number | null = null;
    if (d) {
      const n = Number(d);
      if (!/^\d+$/.test(d) || !Number.isInteger(n) || n <= 0) errs.delegate = "Enter a positive whole number.";
      else delegateId = n;
    }
    if (c && !isValidUuid(c)) errs.client = "Enter a valid UUID (e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6).";
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;
    setApplied({ delegateId, clientId: c || null });
    setPage(1);
  };

  const clearFilters = () => {
    setDelegateInput("");
    setClientInput("");
    setFieldErrors({});
    setApplied({ delegateId: null, clientId: null });
    setPage(1);
  };

  const hasFilters = applied.delegateId !== null || !!applied.clientId;
  const visible = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 mb-3">
        <form onSubmit={applyFilters} noValidate className="flex flex-col sm:flex-row sm:items-start gap-3 flex-wrap flex-1">
          <div className="pt-1">
            <FilterPills<ModerationContext>
              label="Context"
              value={context}
              onChange={(v) => {
                setContext(v);
                setPage(1);
              }}
              options={[
                { value: "forum", label: "Forum" },
                { value: "qa", label: "Q&A" },
              ]}
            />
          </div>
          <div className="w-full sm:w-36">
            <input
              type="text"
              inputMode="numeric"
              value={delegateInput}
              onChange={(e) => setDelegateInput(e.target.value)}
              placeholder="Delegate ID"
              aria-label="Filter by delegate ID"
              className={inputClass(!!fieldErrors.delegate)}
            />
            {fieldErrors.delegate && <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">{fieldErrors.delegate}</p>}
          </div>
          <div className="w-full sm:w-72">
            <input
              type="text"
              value={clientInput}
              onChange={(e) => setClientInput(e.target.value)}
              placeholder="Client ID (UUID)"
              aria-label="Filter by client ID"
              className={inputClass(!!fieldErrors.client)}
            />
            {fieldErrors.client && <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">{fieldErrors.client}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" className={`${btnPrimary} !px-3 !py-1.5`} disabled={loading}>
              Apply
            </button>
            {(hasFilters || delegateInput || clientInput) && (
              <button type="button" onClick={clearFilters} className={`${btnSecondary} !px-3 !py-1.5`}>
                Clear
              </button>
            )}
          </div>
        </form>
        <RefreshButton onClick={load} loading={loading} />
      </div>

      {error ? (
        <ErrorBanner error={error} onRetry={load} />
      ) : loading && rows.length === 0 ? (
        <TableSkeleton columns={6} />
      ) : rows.length === 0 ? (
        <EmptyState
          title={`No blocked users in ${context === "qa" ? "Q&A" : "the Forum"}`}
          hint={hasFilters ? "No records match the Delegate ID / Client ID filter." : undefined}
        />
      ) : (
        <div className={`overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 ${loading ? "opacity-60" : ""}`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 font-semibold uppercase tracking-wider text-[11px] bg-gray-50/80 dark:bg-gray-800/60">
                <th className="py-3 px-4 w-16 whitespace-nowrap">ID</th>
                <th className="py-3 px-4 min-w-[150px]">Blocked User</th>
                <th className="py-3 px-4 min-w-[150px]">Blocked By</th>
                <th className="py-3 px-4 min-w-[180px]">Reason</th>
                <th className="py-3 px-4 whitespace-nowrap">Context</th>
                <th className="py-3 px-4 whitespace-nowrap">Status</th>
                <th className="py-3 px-4 whitespace-nowrap">Created</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/70">
              {visible.map((rec, idx) => {
                const id = blockId(rec);
                return (
                  <tr key={id ?? `b-${(page - 1) * pageSize + idx}`} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors align-top">
                    <td className="py-3 px-4 font-mono text-gray-500">{id !== undefined ? `#${id}` : "—"}</td>
                    <td className="py-3 px-4">
                      <PersonCell delegateId={blockedDelegateId(rec)} clientId={blockedClientId(rec)} delegateName={delegateName} />
                    </td>
                    <td className="py-3 px-4">
                      <PersonCell delegateId={blockerDelegateId(rec)} clientId={blockerClientId(rec)} delegateName={delegateName} />
                    </td>
                    <td className="py-3 px-4 max-w-[320px] text-gray-700 dark:text-gray-300 break-words">{blockReason(rec) || <span className="text-gray-400">—</span>}</td>
                    <td className="py-3 px-4">
                      <ContextBadge context={recordContext(rec) || context} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={recordStatus(rec, BLOCK_STATUS_KEYS)} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{formatDateTime(recordCreatedAt(rec))}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setViewing(rec)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:text-[#AA2D7B] hover:border-[#AA2D7B]/40 transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <ModerationPager
            page={page}
            pageSize={pageSize}
            total={rows.length}
            pageItemCount={visible.length}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
            itemName="blocked users"
          />
        </div>
      )}

      {viewing && (
        <RecordDetailsModal
          title={`Blocked user ${blockId(viewing) !== undefined ? `#${blockId(viewing)}` : ""}`}
          record={viewing}
          onClose={() => setViewing(null)}
          summary={[
            ["Blocked user", <PersonCell key="bu" delegateId={blockedDelegateId(viewing)} clientId={blockedClientId(viewing)} delegateName={delegateName} />],
            ["Blocked by", <PersonCell key="bb" delegateId={blockerDelegateId(viewing)} clientId={blockerClientId(viewing)} delegateName={delegateName} />],
            ["Context", <ContextBadge key="c" context={recordContext(viewing) || context} />],
            ["Reason", blockReason(viewing) || "—"],
            ["Status", <StatusBadge key="s" status={recordStatus(viewing, BLOCK_STATUS_KEYS)} />],
            ["Created", formatDateTime(recordCreatedAt(viewing))],
          ]}
        />
      )}
    </>
  );
};

export default BlockedUsersTab;
