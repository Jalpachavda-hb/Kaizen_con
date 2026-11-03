import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { AdminPageContainer } from "../../components/common/AdminPageContainer";
import { TablePagination } from "../../components/common/TablePagination";
import { useToast } from "../../context/ToastContext";
import {
  getCampaigns,
  getCampaignLogs,
  getEmailAgentContacts,
  getContactById,
} from "../../api/ApiPath";

export interface ContactOption {
  id: string;
  email: string;
  name: string | null;
  type?: string | null;
  status: string;
  unsubscribed: boolean;
}

export interface CampaignSummary {
  id: string;
  name: string;
  description?: string;
  status?: string;
  goal?: string;
  created_at?: string;
}

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [viewFormat, setViewFormat] = useState<"table" | "json">("table");

  // Contacts Mapping for Contact ID -> Name/Email resolution
  const [contactsMap, setContactsMap] = useState<Record<string, ContactOption>>({});
  const [availableContacts, setAvailableContacts] = useState<ContactOption[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Fetch campaign info and logs
  const fetchLogsData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Campaign info
      try {
        const campaignData = await getCampaigns(0, 100);
        if (Array.isArray(campaignData)) {
          const match = campaignData.find((c: any) => c.id === id || c.id?.toLowerCase() === id.toLowerCase());
          if (match) {
            setCampaign(match);
          } else {
            setCampaign({ id, name: `Campaign ${id.slice(0, 8)}...` });
          }
        }
      } catch (campErr) {
        console.warn("Could not fetch campaign details:", campErr);
        setCampaign({ id, name: `Campaign ${id.slice(0, 8)}...` });
      }

      // 2. Fetch logs for this campaign
      const res = await getCampaignLogs(id);
      const logsList = Array.isArray(res) ? res : [];
      setLogs(logsList);

      // 3. Resolve contact details for logs
      try {
        const contactsData = await getEmailAgentContacts(0, 100);
        if (Array.isArray(contactsData)) {
          setAvailableContacts(contactsData);
          const map: Record<string, ContactOption> = {};
          contactsData.forEach((ct: any) => {
            if (ct && ct.id) {
              map[ct.id] = ct;
              map[ct.id.toLowerCase().trim()] = ct;
            }
          });
          setContactsMap(map);

          // Resolve remaining missing contacts individually
          const contactIdsToFetch = logsList
            .map((log: any) => (log.contact_id || log.recipient_id || "").trim())
            .filter((cid: string) => cid && !map[cid] && !map[cid.toLowerCase()]);

          const uniqueMissing = Array.from(new Set(contactIdsToFetch));
          for (const cid of uniqueMissing) {
            try {
              const contactDetail = await getContactById(cid);
              if (contactDetail && contactDetail.id) {
                setContactsMap((prev) => ({
                  ...prev,
                  [contactDetail.id]: contactDetail,
                  [contactDetail.id.toLowerCase().trim()]: contactDetail,
                }));
              }
            } catch {
              // Ignore single contact fetch failures
            }
          }
        }
      } catch (contactErr) {
        console.warn("Could not batch load contacts:", contactErr);
      }
    } catch (err: any) {
      console.error("Failed to load campaign logs:", err);
      setError(err?.message || "Failed to load logs for this campaign.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLogsData();
  }, [fetchLogsData]);

  // Copy helpers
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    success(`${label} copied to clipboard`);
  };

  const handleCopyLogsJson = () => {
    if (logs.length === 0) return;
    navigator.clipboard.writeText(JSON.stringify(logs, null, 2));
    success("All logs copied to clipboard as JSON");
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (filteredLogs.length === 0) return;
    const headers = ["Recipient Name", "Email Address", "Contact ID", "Status", "Subject", "Template Version", "Direction", "Sent Time", "Error Details"];
    const rows = filteredLogs.map((log) => {
      const contactId = (log.contact_id || log.recipient_id || "").trim();
      const contact = contactId ? contactsMap[contactId] || contactsMap[contactId.toLowerCase()] : null;
      const contactName = contact?.name || log.name || "Unknown";
      const contactEmail = contact?.email || log.email || log.recipient || "—";
      const status = log.message_status || log.status || "—";
      const subject = log.subject || log.message || "—";
      const tpl = log.template_version || "—";
      const dir = log.direction || "outbound";
      const time = log.created_at || log.timestamp || log.time || "";
      const err = log.error_details || log.error || "";

      return [
        `"${contactName.replace(/"/g, '""')}"`,
        `"${contactEmail.replace(/"/g, '""')}"`,
        `"${contactId}"`,
        `"${status}"`,
        `"${subject.replace(/"/g, '""')}"`,
        `"${tpl}"`,
        `"${dir}"`,
        `"${time}"`,
        `"${String(err).replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `campaign_${id || "logs"}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("Exported logs CSV successfully");
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log: any) => {
      const contactId = (log.contact_id || log.recipient_id || "").trim();
      const contact = contactId
        ? contactsMap[contactId] ||
          contactsMap[contactId.toLowerCase()] ||
          availableContacts.find((c) => c.id === contactId || c.id?.toLowerCase() === contactId.toLowerCase())
        : null;

      const name = (contact?.name || log.name || "").toLowerCase();
      const email = (contact?.email || log.email || log.recipient || log.contact_email || "").toLowerCase();
      const subject = (log.subject || log.message || "").toLowerCase();
      const status = (log.message_status || log.status || "").toLowerCase();
      const cid = contactId.toLowerCase();
      const str = typeof log === "string" ? log.toLowerCase() : JSON.stringify(log).toLowerCase();

      // Status Filter
      if (statusFilter !== "All") {
        if (statusFilter === "Sent" && !status.includes("sent")) return false;
        if (statusFilter === "Blocked" && !status.includes("block")) return false;
        if (statusFilter === "Failed" && (!status.includes("fail") && !status.includes("err"))) return false;
        if (statusFilter === "Pending" && !status.includes("pend")) return false;
      }

      // Search Query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matches =
          name.includes(q) ||
          email.includes(q) ||
          subject.includes(q) ||
          status.includes(q) ||
          cid.includes(q) ||
          str.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [logs, search, statusFilter, contactsMap, availableContacts]);

  // Reset page when search or statusFilter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Paginated Logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLogs.slice(startIndex, startIndex + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // KPI Metrics
  const stats = useMemo(() => {
    const total = logs.length;
    let sent = 0;
    let blocked = 0;
    let failed = 0;
    let pending = 0;

    logs.forEach((log) => {
      const st = (log.message_status || log.status || "").toLowerCase();
      if (st.includes("sent")) sent++;
      else if (st.includes("block")) blocked++;
      else if (st.includes("fail") || st.includes("err")) failed++;
      else if (st.includes("pend")) pending++;
    });

    return { total, sent, blocked, failed, pending };
  }, [logs]);

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
              onClick={fetchLogsData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh logs from API"
            >
              <svg
                className={`w-3.5 h-3.5 text-gray-600 dark:text-gray-400 ${loading ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredLogs.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer disabled:opacity-50"
              title="Export filtered logs as CSV"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLogsJson}
              disabled={logs.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer disabled:opacity-50"
              title="Copy all logs JSON"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy JSON</span>
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
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-1 font-mono">
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
              </div>
            </div>

            {/* KPI Counts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center shrink-0">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] uppercase font-bold text-gray-400">Total Logs</span>
                <p className="text-base font-extrabold text-gray-800 dark:text-gray-200">{stats.total}</p>
              </div>
              <div className="px-4 py-2 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Sent</span>
                <p className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">{stats.sent}</p>
              </div>
              <div className="px-4 py-2 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900/40">
                <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">Blocked</span>
                <p className="text-base font-extrabold text-rose-700 dark:text-rose-300">{stats.blocked}</p>
              </div>
              <div className="px-4 py-2 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/40">
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Failed</span>
                <p className="text-base font-extrabold text-amber-700 dark:text-amber-300">{stats.failed}</p>
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
              placeholder="Filter logs by recipient name, email, contact ID, status, or subject..."
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
            {["All", "Sent", "Blocked", "Failed", "Pending"].map((st) => {
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

          {/* View Mode: Table vs JSON */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700/60 p-0.5 rounded-lg border border-gray-200 dark:border-gray-600 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setViewFormat("table")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                viewFormat === "table"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Table View
            </button>
            <button
              type="button"
              onClick={() => setViewFormat("json")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                viewFormat === "json"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              JSON View
            </button>
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-4 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 flex items-center justify-between text-xs sm:text-sm">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchLogsData}
              className="px-3 py-1 rounded-md bg-rose-600 text-white font-medium text-xs hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800">
            <svg className="w-8 h-8 text-[#AA2D7B] animate-spin mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-xs text-gray-500">Loading campaign logs from Email Agent API...</p>
          </div>
        ) : viewFormat === "json" ? (
          /* JSON Raw View */
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-950 text-emerald-400 p-4 font-mono text-xs overflow-x-auto max-h-[70vh]">
            <pre>{JSON.stringify(filteredLogs, null, 2)}</pre>
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
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-xs text-gray-400">
                      {search ? `No logs match your search "${search}".` : "No logs recorded yet for this campaign."}
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log: any, idx: number) => {
                    const contactId = (log.contact_id || log.recipient_id || "").trim();
                    const contact = contactId
                      ? contactsMap[contactId] ||
                        contactsMap[contactId.toLowerCase()] ||
                        availableContacts.find((c) => c.id === contactId || c.id?.toLowerCase() === contactId.toLowerCase())
                      : null;

                    const contactName = contact?.name || log.name || (contactId ? `Contact (${contactId.slice(0, 8)}...)` : "Unknown Recipient");
                    const contactEmail = contact?.email || log.email || log.recipient || log.contact_email || "—";
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
              totalItems={filteredLogs.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
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

