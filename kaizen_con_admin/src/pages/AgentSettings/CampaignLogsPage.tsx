import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { AdminPageContainer } from "../../components/common/AdminPageContainer";
import { TablePagination } from "../../components/common/TablePagination";
import { useToast } from "../../context/ToastContext";
import {
  getCampaigns,
  getCampaignLogs,
} from "../../api/ApiPath";

export interface CampaignSummary {
  id: string;
  name: string;
  description?: string;
  status?: string;
  goal?: string;
  created_at?: string;
}

const logStatusText = (log: any): string =>
  String(log?.message_status || log?.status || "").toLowerCase();

const matchesStatusFilter = (log: any, filter: string): boolean => {
  if (filter === "All") return true;
  const status = logStatusText(log);
  const direction = String(log?.direction || "").toLowerCase();

  if (filter === "Sent") return status.includes("sent");
  if (filter === "Blocked") return status.includes("block");
  if (filter === "Failed") return status.includes("fail") || status.includes("err");
  if (filter === "Pending") return status.includes("pend");
  if (filter === "Received") {
    return (
      status.includes("receive") ||
      status.includes("reply") ||
      direction === "inbound" ||
      direction === "received"
    );
  }
  return true;
};

const matchesSearch = (log: any, query: string): boolean => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const contactId = String(log?.contact_id || log?.recipient_id || "").toLowerCase();
  const name = String(log?.name || log?.recipient_name || log?.contact_name || "").toLowerCase();
  const email = String(log?.email || log?.recipient || log?.contact_email || log?.recipient_email || "").toLowerCase();
  const subject = String(log?.subject || log?.message || "").toLowerCase();
  const status = logStatusText(log);
  return (
    name.includes(q) ||
    email.includes(q) ||
    subject.includes(q) ||
    status.includes(q) ||
    contactId.includes(q)
  );
};

const fetchAllCampaignLogs = async (campaignId: string) => {
  const pageSize = 500;
  const first = await getCampaignLogs(campaignId, 0, pageSize);
  const total = Number(first.count ?? first.total_recipients ?? first.logs?.length ?? 0);
  const collected: any[] = [];
  const seen = new Set<string>();

  const addLogs = (batch: any[]) => {
    let added = 0;
    batch.forEach((log) => {
      const key = String(
        log?.id ||
        `${log?.contact_id || ""}|${log?.email || log?.recipient || log?.recipient_email || ""}|${log?.created_at || log?.timestamp || ""}|${log?.subject || ""}|${log?.message_status || log?.status || ""}`
      );
      if (seen.has(key)) return;
      seen.add(key);
      collected.push(log);
      added += 1;
    });
    return added;
  };

  addLogs(Array.isArray(first.logs) ? first.logs : []);
  let offset = collected.length;

  while (collected.length < total && offset < 20000) {
    const next = await getCampaignLogs(campaignId, offset, pageSize);
    const batch = Array.isArray(next.logs) ? next.logs : [];
    if (batch.length === 0) break;
    const added = addLogs(batch);
    if (added === 0) break;
    offset += batch.length;
  }

  return { logs: collected, metrics: first };
};

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateString;
  }
};

export default function CampaignLogsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success } = useToast();

  const [campaign, setCampaign] = useState<CampaignSummary | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [allLogs, setAllLogs] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingAll, setLoadingAll] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Server-provided KPI Execution Metrics
  const [metrics, setMetrics] = useState<{
    total_recipients: number;
    sent_count: number;
    pending_count: number;
    received_count: number;
    first_sent_at?: string | null;
    last_sent_at?: string | null;
  }>({
    total_recipients: 0,
    sent_count: 0,
    pending_count: 0,
    received_count: 0,
    first_sent_at: null,
    last_sent_at: null,
  });

  // Fetch campaign info and logs with server pagination
  const fetchLogsData = useCallback(async (page = currentPage, size = pageSize) => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const offset = Math.max(0, (page - 1) * size);
      const limit = size;

      // Fetch Campaign info and Logs concurrently
      const [campaignRes, logsRes] = await Promise.allSettled([
        getCampaigns(0, 100),
        getCampaignLogs(id, offset, limit),
      ]);

      if (campaignRes.status === "fulfilled" && Array.isArray(campaignRes.value)) {
        const campaignData = campaignRes.value;
        const match = campaignData.find((c: any) => c.id === id || c.id?.toLowerCase() === id.toLowerCase()) || campaignData[0];
        if (match && match.id) {
          setCampaign(match);
        } else {
          setCampaign({ id, name: `Campaign ${id.slice(0, 8)}...` });
        }
      } else {
        setCampaign({ id, name: `Campaign ${id.slice(0, 8)}...` });
      }

      if (logsRes.status === "fulfilled" && logsRes.value) {
        const data: any = logsRes.value;
        const logsList = Array.isArray(data.logs) ? data.logs : [];
        setLogs(logsList);
        setTotalCount(Number(data.count ?? data.total_recipients ?? logsList.length));
        setMetrics({
          total_recipients: Number(data.total_recipients ?? 0),
          sent_count: Number(data.sent_count ?? 0),
          pending_count: Number(data.pending_count ?? 0),
          received_count: Number(data.received_count ?? 0),
          first_sent_at: data.first_sent_at ?? null,
          last_sent_at: data.last_sent_at ?? null,
        });
      } else {
        throw logsRes.status === "rejected" ? logsRes.reason : new Error("Failed to load logs for this campaign.");
      }
    } catch (err: any) {
      console.error("Failed to load campaign logs:", err);
      setError(err?.message || "Failed to load logs for this campaign.");
    } finally {
      setLoading(false);
    }
  }, [id, currentPage, pageSize]);

  const isFiltering = search.trim() !== "" || statusFilter !== "All";

  useEffect(() => {
    setAllLogs(null);
  }, [id]);

  useEffect(() => {
    if (!id || isFiltering) return;
    fetchLogsData(currentPage, pageSize);
  }, [id, currentPage, pageSize, isFiltering, fetchLogsData]);

  useEffect(() => {
    if (!id || !isFiltering || allLogs) return;
    let cancelled = false;

    const loadAll = async () => {
      setLoadingAll(true);
      setError(null);
      try {
        const result = await fetchAllCampaignLogs(id);
        if (cancelled) return;
        setAllLogs(result.logs);
        const data = result.metrics;
        setMetrics({
          total_recipients: Number(data.total_recipients ?? 0),
          sent_count: Number(data.sent_count ?? 0),
          pending_count: Number(data.pending_count ?? 0),
          received_count: Number(data.received_count ?? 0),
          first_sent_at: data.first_sent_at ?? null,
          last_sent_at: data.last_sent_at ?? null,
        });
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Failed to search all campaign logs.");
        }
      } finally {
        if (!cancelled) setLoadingAll(false);
      }
    };

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [id, isFiltering, allLogs, reloadKey]);

  // Copy helpers
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    success(`${label} copied to clipboard`);
  };

  const filteredLogs = useMemo(() => {
    const source = isFiltering ? (allLogs ?? []) : logs;
    return source.filter(
      (log: any) => matchesStatusFilter(log, statusFilter) && matchesSearch(log, search)
    );
  }, [allLogs, isFiltering, logs, search, statusFilter]);

  const pagedLogs = useMemo(() => {
    if (!isFiltering) return filteredLogs;
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [currentPage, filteredLogs, isFiltering, pageSize]);

  const paginationTotal = isFiltering ? filteredLogs.length : totalCount;

  // Reset page when search or statusFilter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Helper: Status badge renderer
  const renderLogStatusBadge = (status?: string, errorMsg?: any) => {
    const s = (status || "unknown").toLowerCase();
    let badgeStyle = "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    let dotStyle = "bg-gray-400";
    let label = status || "UNKNOWN";

    if (s.includes("sent")) {
      badgeStyle = "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      dotStyle = "bg-emerald-500 animate-pulse";
      label = "SENT";
    } else if (s.includes("receive")) {
      badgeStyle = "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      dotStyle = "bg-purple-500";
      label = "RECEIVED";
    } else if (s.includes("block")) {
      badgeStyle = "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      dotStyle = "bg-rose-500";
      label = "BLOCKED";
    } else if (s.includes("fail") || s.includes("err")) {
      badgeStyle = "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      dotStyle = "bg-amber-500";
      label = "FAILED";
    } else if (s.includes("pend")) {
      badgeStyle = "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      dotStyle = "bg-blue-500";
      label = "PENDING";
    }

    return (
      <div className="inline-flex flex-col items-center">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border tracking-wider uppercase ${badgeStyle}`}
          title={errorMsg ? String(errorMsg) : undefined}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
          {label}
        </span>
        {errorMsg && (
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium mt-0.5 max-w-[140px] truncate" title={String(errorMsg)}>
            {String(errorMsg)}
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      <PageMeta
        title={`Campaign Logs - ${campaign?.name || id || "Email Agent"} | Kaizen Con 2027`}
        description="Comprehensive real-time dispatch and execution logs for automated email agent campaign outreach."
      />

      <AdminPageContainer
        title="Campaign Execution Logs"
        subtitle="Complete record of recipient interactions, dispatch timestamps, template parameters, and delivery statuses."
        actionButton={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => navigate("/campaigns")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Back to Campaigns</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAllLogs(null);
                setReloadKey((key) => key + 1);
                if (!isFiltering) fetchLogsData(currentPage, pageSize);
              }}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh logs from API"
            >
              <svg
                className={`w-3.5 h-3.5 text-gray-600 dark:text-gray-400 ${(loading || loadingAll) ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        }
      >
        {/* Campaign Meta Card */}
        <div className="mb-6 p-5 bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {campaign?.name || "Campaign"}
                </h2>
                {campaign?.status && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize bg-[#AA2D7B]/10 text-[#AA2D7B] border border-[#AA2D7B]/20">
                    {campaign.status}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-1 font-mono flex-wrap">
                <span>Campaign ID: {id}</span>
                <button
                  type="button"
                  onClick={() => id && handleCopyText(id, "Campaign ID")}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  title="Copy Campaign UUID"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
                {metrics.first_sent_at && (
                  <span className="text-[11px] text-gray-400">• First Sent: <strong className="text-gray-600 dark:text-gray-300 font-sans">{formatDate(metrics.first_sent_at)}</strong></span>
                )}
                {metrics.last_sent_at && (
                  <span className="text-[11px] text-gray-400">• Last Sent: <strong className="text-gray-600 dark:text-gray-300 font-sans">{formatDate(metrics.last_sent_at)}</strong></span>
                )}
              </div>
            </div>

            {/* KPI Counts: total_recipients, sent_count, pending_count, received_count */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center shrink-0">
              <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">Total Recipients</span>
                <p className="text-base font-extrabold text-gray-800 dark:text-gray-200">{metrics.total_recipients}</p>
              </div>
              <div className="px-4 py-2.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Sent</span>
                <p className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">{metrics.sent_count}</p>
              </div>
              <div className="px-4 py-2.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Pending</span>
                <p className="text-base font-extrabold text-blue-700 dark:text-blue-300">{metrics.pending_count}</p>
              </div>
              <div className="px-4 py-2.5 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/40">
                <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">Received</span>
                <p className="text-base font-extrabold text-purple-700 dark:text-purple-300">{metrics.received_count}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Status Filter, and View Mode */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-gray-800/90 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700/80 shadow-2xs">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search all logs by name, email, contact ID, status, or subject..."
              className="w-full pl-10 pr-9 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#AA2D7B]/20 focus:border-[#AA2D7B] transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {["All", "Sent", "Received"].map((st) => {
              const active = statusFilter === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    active
                      ? "bg-[#AA2D7B] text-white shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-4 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 flex items-center justify-between text-xs sm:text-sm">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => {
                setAllLogs(null);
                setReloadKey((key) => key + 1);
                if (!isFiltering) fetchLogsData(currentPage, pageSize);
              }}
              className="px-3 py-1 rounded-md bg-rose-600 text-white font-medium text-xs hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {(isFiltering ? loadingAll && !allLogs : loading) ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800">
            <svg className="w-8 h-8 text-[#AA2D7B] animate-spin mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-xs text-gray-500">
              {isFiltering ? "Searching all campaign logs..." : "Loading campaign logs from Email Agent API..."}
            </p>
          </div>
        ) : (
          /* Structured Table View */
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-left text-xs sm:text-sm">
              <thead className="bg-gray-50/80 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Recipient Name</th>
                  <th className="px-5 py-3.5">Email Address</th>
                  <th className="px-5 py-3.5">Subject & Info</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5">Sent Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {pagedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-xs text-gray-400">
                      {search && statusFilter !== "All"
                        ? `No ${statusFilter.toLowerCase()} logs match "${search}".`
                        : search
                          ? `No logs match your search "${search}".`
                          : statusFilter !== "All"
                            ? `No ${statusFilter.toLowerCase()} logs found.`
                            : "No logs recorded yet for this campaign."}
                    </td>
                  </tr>
                ) : (
                  pagedLogs.map((log: any, idx: number) => {
                    const contactId = (log.contact_id || log.recipient_id || "").trim();
                    const contactName = log.name || log.recipient_name || log.contact_name || (contactId ? `Contact (${contactId.slice(0, 8)}...)` : "Unknown Recipient");
                    const contactEmail = log.email || log.recipient || log.contact_email || log.recipient_email || "—";
                    const initial = (contactName.trim().charAt(0) || "U").toUpperCase();
                    const logTime = log.created_at || log.timestamp || log.time || log.date;

                    return (
                      <tr key={log.id || idx} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition">
                        {/* Recipient Name & Contact ID */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#AA2D7B] to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {contactName}
                              </p>
                              {contactId && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-[10px] font-mono text-gray-400 truncate max-w-[120px]">
                                    ID: {contactId}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyText(contactId, "Contact ID")}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                                    title="Copy Contact UUID"
                                  >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email Address */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 font-mono text-xs text-gray-700 dark:text-gray-300">
                            <span className="truncate max-w-[200px]" title={contactEmail}>
                              {contactEmail}
                            </span>
                            {contactEmail !== "—" && (
                              <button
                                type="button"
                                onClick={() => handleCopyText(contactEmail, "Email")}
                                className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                                title="Copy email address"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Subject & Meta Info */}
                        <td className="px-5 py-3.5 max-w-xs">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white truncate" title={log.subject || log.message}>
                              {log.subject || log.message || "—"}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {log.template_version && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-mono">
                                  tpl: {log.template_version}
                                </span>
                              )}
                              {log.direction && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono capitalize">
                                  {log.direction}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5 text-center">
                          {renderLogStatusBadge(log.message_status || log.status, log.error_details || log.error)}
                        </td>

                        {/* Sent Time */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                            {formatDate(logTime)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Logs Pagination Bar */}
            <TablePagination
              currentPage={currentPage}
              totalItems={paginationTotal}
              pageSize={pageSize}
              onPageChange={(newPage) => {
                setCurrentPage(newPage);
              }}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              itemName="logs"
            />
          </div>
        )}
      </AdminPageContainer>
    </>
  );
}

