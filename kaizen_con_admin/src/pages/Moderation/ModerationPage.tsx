import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { AdminPageContainer } from "../../components/common/AdminPageContainer";
import { getDelegates } from "../../api/ApiPath";
import { formatDelegateName } from "../../components/common/DelegateMultiSelect";
import type { DelegateOption } from "../../components/common/DelegateMultiSelect";
import { getAdminReports } from "../../services/moderationService";
import type { ReviewStatus } from "../../services/moderationService";
import { useHasModerationAdminKey } from "../../services/moderationAdminKey";
import { LockKeyButton } from "./ModerationUI";
import ReportsTab from "./ReportsTab";
import BlockedContentTab from "./BlockedContentTab";

type TabKey = "reports" | "blocked-content";

const TABS: { key: TabKey; label: string; path: string; desc: string }[] = [
  { key: "reports", label: "Reports", path: "/moderation/reports", desc: "Review content reported by delegates and approve or reject each report." },
  { key: "blocked-content", label: "Blocked Content", path: "/moderation/blocked-content", desc: "Content blocks awaiting or past moderation review." },
];

const tabFromPath = (pathname: string): TabKey => {
  if (pathname.startsWith("/moderation/blocked-content")) return "blocked-content";
  return "reports";
};

// ---------------------------------------------------------------------------
// Overview cards — computed only from API data; "—" when the API cannot tell us.
// ---------------------------------------------------------------------------
type Stat = number | null | "loading";

const StatCard: React.FC<{ label: string; value: Stat; accent: string; hint?: string }> = ({ label, value, accent, hint }) => (
  <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900" title={hint}>
    <div className="text-[10.5px] font-semibold uppercase tracking-wider text-gray-500">{label}</div>
    <div className={`text-2xl font-black mt-1 ${accent}`}>
      {value === "loading" ? <span className="inline-block w-10 h-6 rounded bg-gray-200/80 dark:bg-gray-800 animate-pulse align-middle" /> : value === null ? "—" : value}
    </div>
  </div>
);

const useOverview = (hasKey: boolean, refreshKey: number) => {
  const [reports, setReports] = useState<Record<ReviewStatus, Stat>>({ pending: "loading", approved: "loading", rejected: "loading" });
  const seq = useRef(0);

  useEffect(() => {
    const mySeq = ++seq.current;
    const alive = () => mySeq === seq.current;

    // Report counts: only trustworthy when the API returns `count` (limit=1 keeps payload tiny).
    if (!hasKey) {
      setReports({ pending: null, approved: null, rejected: null });
      return;
    }
    setReports({ pending: "loading", approved: "loading", rejected: "loading" });
    (["pending", "approved", "rejected"] as ReviewStatus[]).forEach((s) => {
      getAdminReports({ status: s, offset: 0, limit: 1 })
        .then((r) => alive() && setReports((p) => ({ ...p, [s]: r.count })))
        .catch(() => alive() && setReports((p) => ({ ...p, [s]: null })));
    });
  }, [hasKey, refreshKey]);

  const vals = [reports.pending, reports.approved, reports.rejected];
  const total: Stat = vals.some((v) => v === "loading")
    ? "loading"
    : vals.every((v) => typeof v === "number")
    ? (vals as number[]).reduce((a, b) => a + b, 0)
    : null;

  return { reports, total };
};

export default function ModerationPage() {
  const location = useLocation();
  const activeTab = tabFromPath(location.pathname);
  const hasKey = useHasModerationAdminKey();
  const [refreshKey, setRefreshKey] = useState(0);
  const onChanged = useCallback(() => setRefreshKey((k) => k + 1), []);
  const { reports, total } = useOverview(hasKey, refreshKey);

  // Delegate names for nicer identity cells (falls back to "Delegate #id" if this fails).
  const [delegates, setDelegates] = useState<DelegateOption[]>([]);
  useEffect(() => {
    let alive = true;
    getDelegates()
      .then((res: { results?: unknown }) => {
        if (!alive) return;
        const list = Array.isArray(res?.results) ? (res.results as DelegateOption[]) : [];
        setDelegates(list.filter((d) => d && Number.isInteger(Number(d.id))).map((d) => ({ ...d, id: Number(d.id) })));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  const nameById = useMemo(() => {
    const m = new Map<number, string>();
    delegates.forEach((d) => m.set(d.id, formatDelegateName(d)));
    return m;
  }, [delegates]);
  const delegateName = useCallback((id: number) => nameById.get(id), [nameById]);

  const tab = TABS.find((t) => t.key === activeTab)!;
  const keyHint = hasKey ? undefined : "Unlock with the admin key to load report counts.";

  return (
    <>
      <PageMeta title={`${tab.label} | Moderation | Kaizen Con 2027`} description="Moderate reports, blocked users and blocked content." />

      <AdminPageContainer
        title={activeTab === "reports" ? "Moderation Reports" : "Moderation"}
        subtitle={
          activeTab === "reports"
            ? "Review, approve, and reject user-submitted reports."
            : "Review reported content, blocked users and content blocks across the Forum and Q&A."
        }
        actionButton={<LockKeyButton />}
      >
        {/* Overview */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total Reports" value={total} accent="text-gray-900 dark:text-white" hint={keyHint ?? "Sum of pending, approved and rejected counts."} />
          <StatCard label="Pending Reports" value={reports.pending} accent="text-amber-600 dark:text-amber-400" hint={keyHint} />
          <StatCard label="Approved Reports" value={reports.approved} accent="text-emerald-600 dark:text-emerald-400" hint={keyHint} />
          <StatCard label="Rejected Reports" value={reports.rejected} accent="text-rose-600 dark:text-rose-400" hint={keyHint} />        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800 mb-4 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto no-scrollbar">
          <nav className="flex gap-1 min-w-max" aria-label="Moderation sections">
            {TABS.map((t) => {
              const active = t.key === activeTab;
              return (
                <Link
                  key={t.key}
                  to={t.path}
                  aria-current={active ? "page" : undefined}
                  className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${
                    active
                      ? "border-[#AA2D7B] text-[#55355E] dark:text-[#f5d8e9]"
                      : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  {t.label}
                  {t.key === "reports" && typeof reports.pending === "number" && reports.pending > 0 && (
                    <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-[#AA2D7B] text-white font-bold">{reports.pending}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <p className="text-[11px] text-gray-500 mb-3">{tab.desc}</p>

        {activeTab === "reports" && <ReportsTab delegateName={delegateName} onChanged={onChanged} />}
        {activeTab === "blocked-content" && <BlockedContentTab delegateName={delegateName} onChanged={onChanged} />}
      </AdminPageContainer>
    </>
  );
}
