import React, { useEffect, useState } from "react";
import { TablePagination } from "../../components/common/TablePagination";
import type { ModerationRecord } from "../../services/moderationService";
import { ModerationApiError } from "../../services/moderationService";
import {
  setModerationAdminKey,
  clearModerationAdminKey,
  useHasModerationAdminKey,
} from "../../services/moderationAdminKey";
import { CONTEXT_LABEL, formatRawValue, humanize, shortUuid } from "./moderationFields";

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------
const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  rejected: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
};

export const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  if (!status) return <span className="text-gray-400">—</span>;
  const cls =
    STATUS_BADGE[status] ||
    "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${cls}`}>
      {humanize(status)}
    </span>
  );
};

export const ContextBadge: React.FC<{ context?: string }> = ({ context }) => {
  if (!context) return <span className="text-gray-400">—</span>;
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 whitespace-nowrap">
      {CONTEXT_LABEL[context] || context}
    </span>
  );
};

/** Delegate / client identity cell. Uses the delegate list for names when available. */
export const PersonCell: React.FC<{
  delegateId?: number;
  clientId?: string;
  delegateName?: (id: number) => string | undefined;
}> = ({ delegateId, clientId, delegateName }) => {
  if (delegateId === undefined && !clientId) return <span className="text-gray-400">—</span>;
  const name = delegateId !== undefined ? delegateName?.(delegateId) : undefined;
  return (
    <div className="min-w-0">
      {delegateId !== undefined && (
        <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
          {name || `Delegate #${delegateId}`}
        </div>
      )}
      {delegateId !== undefined && name && <div className="text-[10.5px] text-gray-500 font-mono">ID {delegateId}</div>}
      {clientId && (
        <div className="text-[10.5px] text-gray-500 font-mono" title={clientId}>
          Client {shortUuid(clientId)}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------
export function FilterPills<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap" role="radiogroup" aria-label={label}>
      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mr-0.5">{label}</span>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
              active
                ? "bg-[#AA2D7B] border-[#AA2D7B] text-white shadow-xs"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-[#AA2D7B]/50 hover:text-[#AA2D7B]"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export const RefreshButton: React.FC<{ onClick: () => void; loading: boolean }> = ({ onClick, loading }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-[#AA2D7B] transition-colors cursor-pointer disabled:cursor-not-allowed"
    title="Refresh"
  >
    <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#AA2D7B]" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
    <span className="hidden sm:inline">Refresh</span>
  </button>
);

// ---------------------------------------------------------------------------
// Pagination: TablePagination when the API gives a total `count`, otherwise
// a Prev/Next pager driven by whether the last page came back full.
// ---------------------------------------------------------------------------
const MODERATION_PAGE_SIZES = [10, 20, 50, 100];

export const ModerationPager: React.FC<{
  page: number;
  pageSize: number;
  total: number | null;
  pageItemCount: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  itemName: string;
}> = ({ page, pageSize, total, pageItemCount, onPageChange, onPageSizeChange, itemName }) => {
  if (total !== null) {
    return (
      <TablePagination
        currentPage={page}
        totalItems={total}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        itemName={itemName}
        pageSizeOptions={MODERATION_PAGE_SIZES}
      />
    );
  }
  const start = pageItemCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = (page - 1) * pageSize + pageItemCount;
  const hasNext = pageItemCount === pageSize;
  const btn =
    "px-2.5 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:cursor-not-allowed";
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-gray-50/80 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-800 text-xs">
      <div className="flex flex-wrap items-center gap-3 text-gray-600 dark:text-gray-400">
        <span>
          Showing <span className="font-bold text-gray-900 dark:text-white">{start}</span> to{" "}
          <span className="font-bold text-gray-900 dark:text-white">{end}</span> {itemName}
        </span>
        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-[11px] text-gray-500">Show:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#AA2D7B] cursor-pointer"
          >
            {MODERATION_PAGE_SIZES.map((opt) => (
              <option key={opt} value={opt}>
                {opt} per page
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" className={btn} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          ‹ Prev
        </button>
        <span className="min-w-[28px] h-7 px-2 rounded bg-[#AA2D7B] text-white font-bold flex items-center justify-center">{page}</span>
        <button type="button" className={btn} disabled={!hasNext} onClick={() => onPageChange(page + 1)}>
          Next ›
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------
export const TableSkeleton: React.FC<{ columns: number; rows?: number }> = ({ columns, rows = 6 }) => (
  <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900" aria-busy="true" aria-label="Loading">
    <div className="h-10 bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800" />
    <div className="divide-y divide-gray-100 dark:divide-gray-800/70">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5 animate-pulse">
          {Array.from({ length: columns }).map((__, c) => (
            <div
              key={c}
              className="h-3 rounded bg-gray-200/80 dark:bg-gray-800"
              style={{ flex: c === 0 ? "0 0 48px" : c === 2 ? "2 1 0" : "1 1 0" }}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const EmptyState: React.FC<{ title: string; hint?: string }> = ({ title, hint }) => (
  <div className="text-center py-12 px-4 bg-white dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800">
    <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto mb-2.5">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
      </svg>
    </div>
    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{title}</p>
    {hint && <p className="text-[11px] text-gray-500 mt-1">{hint}</p>}
  </div>
);

export const ErrorBanner: React.FC<{ error: unknown; onRetry?: () => void }> = ({ error, onRetry }) => {
  const err = error as ModerationApiError;
  const message = (err && err.message) || "Something went wrong.";
  let hint: string | null = null;
  if (err?.kind === "auth") {
    hint =
      err.status === 401
        ? "The moderation API needs a valid Bearer token. Sign out and back in; if this persists, the admin login is not issuing a token these endpoints accept."
        : "Check that the admin key is correct, then re-enter it.";
  } else if (err?.kind === "validation") {
    hint = "One of the filters was rejected by the API — adjust it and try again.";
  } else if (err?.kind === "server") {
    hint = "The moderation service returned a server error.";
  }
  return (
    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-800 dark:text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2" role="alert">
      <div className="min-w-0">
        <strong className="font-semibold">
          {err?.status ? `Error ${err.status}: ` : ""}
        </strong>
        <span className="break-words">{message}</span>
        {hint && <span className="block text-[11px] mt-0.5 opacity-80">{hint}</span>}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {err?.kind === "auth" && err.status === 403 && (
          <button
            onClick={clearModerationAdminKey}
            className="px-2 py-1 bg-white/70 dark:bg-amber-900 hover:bg-white rounded font-semibold text-[11px] transition-colors cursor-pointer border border-amber-200 dark:border-amber-800"
          >
            Re-enter key
          </button>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-2 py-1 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 rounded font-semibold text-[11px] transition-colors cursor-pointer"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Modal shell
// ---------------------------------------------------------------------------
export const ModalShell: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose: () => void;
  closeDisabled?: boolean;
  maxWidth?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ title, subtitle, onClose, closeDisabled, maxWidth = "max-w-lg", children, footer }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !closeDisabled) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, closeDisabled]);

  return (
    <div
      className="fixed inset-0 z-99999 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !closeDisabled) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl w-full ${maxWidth} max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden my-auto`}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 bg-[#faedf5]/30 dark:bg-gray-800/40 shrink-0">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
            {subtitle && <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            disabled={closeDisabled}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 text-xs">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 px-5 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const btnSecondary =
  "px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#AA2D7B] hover:bg-[#D85A9A] rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";
export const btnDanger =
  "inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";
export const btnSuccess =
  "inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";

export const Spinner: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
    <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// ---------------------------------------------------------------------------
// Details modal: mapped summary + every raw field returned by the API
// ---------------------------------------------------------------------------
export const RecordDetailsModal: React.FC<{
  title: string;
  summary: [string, React.ReactNode][];
  record: ModerationRecord;
  onClose: () => void;
  footer?: React.ReactNode;
}> = ({ title, summary, record, onClose, footer }) => {
  const entries = Object.entries(record);
  return (
    <ModalShell title={title} subtitle="Summary fields plus the full record returned by the API." onClose={onClose} maxWidth="max-w-2xl" footer={footer}>
      <dl className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg mb-4">
        {summary.map(([k, v]) => (
          <div key={k} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-3 px-3 py-2">
            <dt className="text-gray-500 shrink-0">{k}</dt>
            <dd className="font-semibold text-gray-800 dark:text-gray-200 sm:text-right break-words min-w-0 whitespace-pre-line">{v}</dd>
          </div>
        ))}
      </dl>

      <h4 className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
        All fields returned ({entries.length})
      </h4>
      {entries.length === 0 ? (
        <p className="text-gray-400">The API returned an empty record.</p>
      ) : (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700/60 bg-gray-50/60 dark:bg-gray-800/40 divide-y divide-gray-100 dark:divide-gray-800">
          {entries.map(([k, v]) => (
            <div key={k} className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-3 px-3 py-1.5">
              <span className="font-mono text-[11px] text-gray-500 break-all">{k}</span>
              <span className="font-mono text-[11px] text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">{formatRawValue(v)}</span>
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  );
};

// ---------------------------------------------------------------------------
// Admin key gate (key held in memory only — see services/moderationAdminKey.ts)
// ---------------------------------------------------------------------------
export const AdminKeyGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hasKey = useHasModerationAdminKey();
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);

  if (hasKey) return <>{children}</>;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) {
          setModerationAdminKey(value);
          setValue("");
        }
      }}
      className="max-w-md mx-auto my-6 p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-[#AA2D7B]/10 text-[#AA2D7B] flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Moderation admin key required</h2>
          <p className="text-[11px] text-gray-500">Reports and content blocks are protected by the X-Admin-Key header.</p>
        </div>
      </div>
      <label htmlFor="moderation-admin-key" className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
        Admin key
      </label>
      <div className="relative">
        <input
          id="moderation-admin-key"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          placeholder="Paste the moderation admin key"
          className="w-full pl-3 pr-14 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#AA2D7B] focus:border-[#AA2D7B] font-mono"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 px-3 text-[11px] font-semibold text-gray-500 hover:text-[#AA2D7B] cursor-pointer"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      <p className="text-[11px] text-gray-500 mt-2">
        Kept in memory for this tab only — never saved to the browser. It is cleared on reload, sign-out, or when you lock moderation.
      </p>
      <div className="flex justify-end mt-4">
        <button type="submit" disabled={!value.trim()} className={btnPrimary}>
          Unlock moderation
        </button>
      </div>
    </form>
  );
};

export const LockKeyButton: React.FC = () => {
  const hasKey = useHasModerationAdminKey();
  if (!hasKey) return null;
  return (
    <button
      type="button"
      onClick={clearModerationAdminKey}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-[#AA2D7B] hover:border-[#AA2D7B]/40 transition-colors cursor-pointer"
      title="Forget the admin key held in memory"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
      </svg>
      Lock
    </button>
  );
};
