import React, { useEffect, useMemo, useRef, useState } from "react";

export interface DelegateOption {
  id: number;
  registration_id?: string | null;
  salutation?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  city?: string | null;
}

export const formatDelegateName = (d: DelegateOption): string => {
  const name = `${d.first_name || ""} ${d.last_name || ""}`.trim();
  if (!name) return d.email || d.registration_id || `Delegate #${d.id}`;
  const sal = (d.salutation || "").trim();
  return sal && !name.toLowerCase().startsWith(sal.toLowerCase()) ? `${sal} ${name}` : name;
};

interface DelegateMultiSelectProps {
  delegates: DelegateOption[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  hasError?: boolean;
}

const MAX_VISIBLE_RESULTS = 100;

export const DelegateMultiSelect: React.FC<DelegateMultiSelectProps> = ({
  delegates,
  selectedIds,
  onChange,
  disabled = false,
  loading = false,
  error = null,
  onRetry,
  hasError = false,
}) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const byId = useMemo(() => {
    const m = new Map<number, DelegateOption>();
    delegates.forEach((d) => m.set(d.id, d));
    return m;
  }, [delegates]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? delegates
      : delegates.filter((d) =>
          [formatDelegateName(d), d.email, d.registration_id, d.city, String(d.id)]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
        );
    return list;
  }, [delegates, query]);

  const toggle = (id: number) => {
    if (selectedSet.has(id)) onChange(selectedIds.filter((x) => x !== id));
    else onChange([...selectedIds, id]);
  };

  const selectAllFiltered = () => {
    const next = new Set(selectedIds);
    filtered.forEach((d) => next.add(d.id));
    onChange(Array.from(next));
  };

  const borderClass = hasError
    ? "border-rose-400 dark:border-rose-700"
    : "border-gray-200 dark:border-gray-700";

  return (
    <div ref={wrapperRef} className={`relative ${disabled ? "opacity-50 pointer-events-none" : ""}`} aria-disabled={disabled}>
      {/* Search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={loading ? "Loading delegates..." : "Search delegates by name, email, registration ID or city..."}
          className={`w-full pl-8 pr-3 py-2 text-xs rounded-lg border ${borderClass} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#AA2D7B] focus:border-[#AA2D7B] transition-colors`}
        />
      </div>

      {/* Dropdown */}
      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="px-3 py-4 text-xs text-gray-400 text-center">Loading delegates...</div>
          ) : error ? (
            <div className="px-3 py-3 text-xs text-rose-600 flex items-center justify-between gap-2">
              <span>{error}</span>
              {onRetry && (
                <button type="button" onClick={onRetry} className="font-semibold text-[#AA2D7B] hover:underline cursor-pointer">
                  Retry
                </button>
              )}
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-3 py-4 text-xs text-gray-400 text-center">No delegates match "{query}".</div>
          ) : (
            <>
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 dark:border-gray-800 text-[11px] text-gray-500 bg-gray-50/80 dark:bg-gray-800/60">
                <span>
                  {filtered.length} delegate{filtered.length === 1 ? "" : "s"}
                  {filtered.length > MAX_VISIBLE_RESULTS ? ` · showing first ${MAX_VISIBLE_RESULTS}, refine search` : ""}
                </span>
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  className="font-semibold text-[#AA2D7B] hover:underline cursor-pointer"
                >
                  Select all {query.trim() ? "matching" : ""}
                </button>
              </div>
              <ul className="max-h-64 overflow-y-auto py-1" role="listbox" aria-multiselectable="true">
                {filtered.slice(0, MAX_VISIBLE_RESULTS).map((d) => {
                  const checked = selectedSet.has(d.id);
                  return (
                    <li key={d.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={checked}
                        onClick={() => toggle(d.id)}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2.5 text-xs transition-colors cursor-pointer ${
                          checked ? "bg-[#faedf5]/70 dark:bg-pink-950/30" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            checked ? "bg-[#AA2D7B] border-[#AA2D7B] text-white" : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {checked && (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {formatDelegateName(d)}
                          </span>
                          <span className="block text-[10.5px] text-gray-400 truncate">
                            {[d.registration_id, d.email, d.city].filter(Boolean).join(" · ") || `ID ${d.id}`}
                          </span>
                        </span>
                        <span className="font-mono text-[10px] text-gray-400 shrink-0">#{d.id}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Selected chips */}
      {selectedIds.length > 0 && (
        <div className="mt-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
              {selectedIds.length} delegate{selectedIds.length === 1 ? "" : "s"} selected
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {selectedIds.map((id) => {
              const d = byId.get(id);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-[11px] font-medium bg-[#faedf5] text-[#55355E] dark:bg-[#55355E]/40 dark:text-[#f5d8e9] border border-[#AA2D7B]/20"
                >
                  {d ? formatDelegateName(d) : `Delegate #${id}`}
                  <button
                    type="button"
                    onClick={() => toggle(id)}
                    className="w-4 h-4 rounded-full hover:bg-[#AA2D7B]/15 flex items-center justify-center cursor-pointer"
                    aria-label={`Remove ${d ? formatDelegateName(d) : `delegate ${id}`}`}
                  >
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DelegateMultiSelect;
