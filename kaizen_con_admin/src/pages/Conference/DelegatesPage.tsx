import { useState, useEffect, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import { AdminPageContainer } from "../../components/common/AdminPageContainer";
import { TablePagination } from "../../components/common/TablePagination";
import { getDelegates, BASE_URL } from "../../api/ApiPath";

export interface Delegate {
  id: number;
  registration_id: string;
  salutation?: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  state?: string | null;
  country: string;
  reg_category?: string | null;
  total_amount?: number | null;
  transaction_id?: string | null;
  mci_no?: string | null;
  registration_date?: string | null;
  payment_date?: string | null;
  payment_mode?: string | null;
  remarks?: string | null;
  from_link?: string | null;
  qr_code_url?: string | null;

  // Compatibility / legacy fields
  institution?: string;
  designation?: string;
  speciality?: string;
  registration_status?: string;
  consent_given?: boolean;
  is_deleted?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}


export default function DelegatesPage() {
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [_isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [cityFilter, setCityFilter] = useState<string>("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Selected Delegate for View Modal & QR Preview
  const [selectedDelegate, setSelectedDelegate] = useState<Delegate | null>(null);
  const [qrModalDelegate, setQrModalDelegate] = useState<Delegate | null>(null);

  // Fetch from Live API
  const fetchDelegatesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDelegates();
      if (data && Array.isArray(data.results)) {
        setDelegates(data.results);
        setIsLiveApi(true);
      } else {
        setDelegates([]);
        setIsLiveApi(false);
      }
    } catch (err: any) {
      console.warn("Could not fetch delegates from live API:", err);
      setError(err?.message || "Live API not reachable. Please check connection.");
      setDelegates([]);
      setIsLiveApi(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDelegatesData();
  }, []);

  // Unique Categories
  const availableCategories = useMemo(() => {
    const list = Array.from(
      new Set(delegates.map((d) => d.reg_category).filter(Boolean))
    ) as string[];
    return list.sort();
  }, [delegates]);

 
  // Filtered Delegates
  const filteredDelegates = useMemo(() => {
    return delegates.filter((d) => {
      const fullName = `${d.salutation ? d.salutation + " " : ""}${d.first_name || ""} ${d.last_name || ""}`.toLowerCase();
      const term = search.toLowerCase().trim();

      const matchesSearch =
        !term ||
        fullName.includes(term) ||
        (d.email && d.email.toLowerCase().includes(term)) ||
        (d.phone && d.phone.includes(term)) ||
        (d.city && d.city.toLowerCase().includes(term)) ||
        (d.state && d.state.toLowerCase().includes(term)) ||
        (d.registration_id && d.registration_id.toLowerCase().includes(term)) ||
        (d.reg_category && d.reg_category.toLowerCase().includes(term)) ||
        (d.mci_no && d.mci_no.toLowerCase().includes(term)) ||
        (d.transaction_id && d.transaction_id.toLowerCase().includes(term)) ||
        (d.remarks && d.remarks.toLowerCase().includes(term));

      const matchesCategory =
        categoryFilter === "All" ||
        (categoryFilter === "Uncategorized"
          ? !d.reg_category
          : d.reg_category?.toLowerCase() === categoryFilter.toLowerCase());

      const matchesCity =
        cityFilter === "All" ||
        d.city?.toLowerCase().trim() === cityFilter.toLowerCase().trim();

      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [delegates, search, categoryFilter, cityFilter]);

  // Reset to first page whenever search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, cityFilter]);

  // Total pages and paginated records
 
  const paginatedDelegates = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredDelegates.slice(startIndex, startIndex + pageSize);
  }, [filteredDelegates, currentPage, pageSize]);

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = delegates.length;
    const facultyCount = delegates.filter(
      (d) => d.reg_category?.toUpperCase() === "FACULTY"
    ).length;
    const delegateCount = delegates.filter(
      (d) => d.reg_category?.toUpperCase() === "DELEGATE"
    ).length;
    const ocCount = delegates.filter(
      (d) => d.reg_category?.toLowerCase().includes("organizing")
    ).length;

    const totalCollected = delegates.reduce((sum, d) => {
      return sum + (typeof d.total_amount === "number" ? d.total_amount : 0);
    }, 0);

    const paidCount = delegates.filter(
      (d) => typeof d.total_amount === "number" && d.total_amount > 0
    ).length;

    const uniqueCities = new Set(
      delegates.map((d) => d.city?.toLowerCase().trim()).filter(Boolean)
    ).size;

    return {
      total,
      facultyCount,
      delegateCount,
      ocCount,
      totalCollected,
      paidCount,
      uniqueCities,
    };
  }, [delegates]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "-";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };


  const getCategoryBadge = (cat?: string | null) => {
    if (!cat) {
      return (
        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
          Unassigned
        </span>
      );
    }

    const c = cat.toUpperCase();
    if (c === "DELEGATE") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          Delegate
        </span>
      );
    }
    if (c === "FACULTY") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          Faculty
        </span>
      );
    }
    if (c.includes("ORGANIZING")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#faedf5] text-[#AA2D7B] border border-[#AA2D7B]/30 dark:bg-[#55355E]/30 dark:text-[#f5d8e9] dark:border-[#AA2D7B]/50">
          <span className="w-1.5 h-1.5 rounded-full bg-[#AA2D7B]" />
          Organizing Committee
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300">
        {cat}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Registration ID",
      "Salutation",
      "First Name",
      "Last Name",
      "Full Name",
      "Email",
      "Phone",
      "City",
      "State",
      "Country",
      "Category",
      "Total Amount (INR)",
      "Payment Mode",
      "Transaction ID",
      "MCI No",
      "Registration Date",
      "Payment Date",
      "Remarks",
      "QR Code URL",
    ];

    const rows = filteredDelegates.map((d) => [
      d.id,
      `"${d.registration_id || ""}"`,
      `"${d.salutation || ""}"`,
      `"${d.first_name || ""}"`,
      `"${d.last_name || ""}"`,
      `"${(d.salutation ? d.salutation + " " : "") + (d.first_name || "") + " " + (d.last_name || "")}".trim()`,
      `"${d.email || ""}"`,
      `"${d.phone || ""}"`,
      `"${d.city || ""}"`,
      `"${d.state || ""}"`,
      `"${d.country || ""}"`,
      `"${d.reg_category || ""}"`,
      d.total_amount ?? "",
      `"${d.payment_mode || ""}"`,
      `"${d.transaction_id || ""}"`,
      `"${d.mci_no || ""}"`,
      `"${d.registration_date || ""}"`,
      `"${d.payment_date || ""}"`,
      `"${d.remarks || ""}"`,
      `"${d.qr_code_url ? `${BASE_URL}${d.qr_code_url}` : ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `kaizencon_delegates_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <PageMeta
        title="Delegates Management | Kaizen Con 2027"
        description="View registered delegates, faculty members, organizing committee, MCI numbers, and transactions."
      />

      <AdminPageContainer
        title="Delegates & Faculty Directory"
        subtitle="Manage conference registrations, faculty members, organizing committee, payment records, and delegate QR badges."
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, phone, reg ID, MCI, transaction, city, remarks..."
        actionButton={
          <div className="flex items-center flex-wrap gap-2">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#AA2D7B]"
            >
              <option value="All">All Categories ({delegates.length})</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="Uncategorized">Unassigned</option>
            </select>
          
        
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Export delegates data to CSV"
            >
              <svg
                className="w-3.5 h-3.5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export CSV
            </button>
           
            <button
              onClick={fetchDelegatesData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#AA2D7B] hover:bg-[#D85A9A] rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh from http://192.168.29.201:8000/api/delegates"
            >
              <svg
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {loading ? "Fetching..." : "Refresh API"}
            </button>
          </div>
        }
      >
        {/* API Status Banner */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 text-xs">
          <div className="flex items-center gap-2">
            
           
            {error && (
              <span className="text-amber-600 dark:text-amber-400 text-[11px] truncate max-w-xs">
                ({error})
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-[11px]">
            <span>
              Displaying <b>{filteredDelegates.length}</b> of <b>{delegates.length}</b> total delegates
            </span>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {/* Total Registrations */}
          <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 shadow-2xs">
            <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Registrations
            </div>
            <div className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">
              {metrics.total}
            </div>
            <div className="text-[11px] text-[#AA2D7B] font-medium mt-0.5">
              Across {metrics.uniqueCities} cities
            </div>
          </div>

          {/* Delegates (Paid Attendees) */}
          <div className="p-3.5 rounded-xl border border-sky-100 dark:border-sky-950/40 bg-sky-50/30 dark:bg-sky-950/20 shadow-2xs">
            <div className="text-[11px] font-medium text-sky-700 dark:text-sky-300 uppercase tracking-wider">
              Delegates
            </div>
            <div className="text-xl font-extrabold text-sky-700 dark:text-sky-200 mt-1">
              {metrics.delegateCount}
            </div>
            <div className="text-[11px] text-sky-600 dark:text-sky-400 mt-0.5">
              Conference participants
            </div>
          </div>

          {/* Faculty Members */}
          <div className="p-3.5 rounded-xl border border-purple-100 dark:border-purple-950/40 bg-purple-50/30 dark:bg-purple-950/20 shadow-2xs">
            <div className="text-[11px] font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
              Faculty Experts
            </div>
            <div className="text-xl font-extrabold text-purple-700 dark:text-purple-200 mt-1">
              {metrics.facultyCount}
            </div>
            <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5">
              Guest lecturers & faculty
            </div>
          </div>

          {/* Organizing Committee */}
          <div className="p-3.5 rounded-xl border border-pink-100 dark:border-pink-950/40 bg-[#faedf5]/30 dark:bg-[#55355E]/20 shadow-2xs">
            <div className="text-[11px] font-medium text-[#AA2D7B] dark:text-pink-300 uppercase tracking-wider">
              Org. Committee
            </div>
            <div className="text-xl font-extrabold text-[#AA2D7B] dark:text-pink-200 mt-1">
              {metrics.ocCount}
            </div>
            <div className="text-[11px] text-[#55355E] dark:text-pink-400 mt-0.5">
              Leadership & OC members
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-3 border-[#AA2D7B] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-500">Loading delegates data from API...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredDelegates.length === 0 && (
          <div className="text-center py-16 text-gray-500 text-sm">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <div className="font-semibold text-gray-800 dark:text-gray-200">
              No delegates matched the search criteria
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Try clearing filters or search term to see all conference delegates.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategoryFilter("All");
                setCityFilter("All");
              }}
              className="mt-3 px-3 py-1.5 text-xs font-semibold text-[#AA2D7B] hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Delegates Table */}
        {!loading && filteredDelegates.length > 0 && (
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 font-bold uppercase tracking-wider text-[11px] bg-gray-50/80 dark:bg-gray-800/60">
                  <th className="py-3 px-4">Reg ID & QR</th>
                  <th className="py-3 px-4">Delegate Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">MCI No.</th>
                  <th className="py-3 px-4">Reg. Date</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {paginatedDelegates.map((delegate) => {
                  const salutation = delegate.salutation ? `${delegate.salutation} ` : "";
                  const fullName = `${salutation}${delegate.first_name || ""} ${delegate.last_name || ""}`.trim();
                  const initials = `${(delegate.first_name || "D").charAt(0)}${(delegate.last_name || "C").charAt(0)}`.toUpperCase();
                  const fullQrUrl = delegate.qr_code_url
                    ? `${BASE_URL}${delegate.qr_code_url}`
                    : null;

                  return (
                    <tr
                      key={delegate.id}
                      className="hover:bg-[#faedf5]/25 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      {/* Registration ID & QR Button */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-mono text-[11px] font-bold text-[#55355E] dark:text-[#f5d8e9] bg-[#faedf5]/80 dark:bg-[#55355E]/40 px-2 py-0.5 rounded border border-[#AA2D7B]/20"
                            title={delegate.registration_id}
                          >
                            {delegate.registration_id}
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(delegate.registration_id, delegate.registration_id)
                            }
                            className="text-gray-400 hover:text-[#AA2D7B] transition-colors p-1"
                            title="Copy Registration ID"
                          >
                            {copiedId === delegate.registration_id ? (
                              <span className="text-[10px] font-bold text-emerald-600">Copied</span>
                            ) : (
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                            )}
                          </button>

                          {/* Quick QR Icon Button */}
                          {fullQrUrl && (
                            <button
                              onClick={() => setQrModalDelegate(delegate)}
                              className="text-gray-400 hover:text-[#55355E] dark:hover:text-[#f5d8e9] p-1 transition-colors"
                              title="View & Print QR Code"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          ID: #{delegate.id}
                        </div>
                      </td>

                      {/* Delegate Name & Salutation */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#55355E] to-[#AA2D7B] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 dark:text-gray-100 truncate text-[13px]">
                              {fullName}
                            </div>
                            {delegate.remarks && (
                              <div
                                className="text-[10px] text-amber-700 dark:text-amber-300 font-medium truncate max-w-[180px]"
                                title={delegate.remarks}
                              >
                                ✎ {delegate.remarks}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getCategoryBadge(delegate.reg_category)}
                      </td>

                      {/* Contact Details (Email + Phone) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-[11px] text-gray-700 dark:text-gray-300 font-medium">
                          <a
                            href={`mailto:${delegate.email}`}
                            className="hover:text-[#AA2D7B] hover:underline"
                          >
                            {delegate.email}
                          </a>
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          <a href={`tel:${delegate.phone}`} className="hover:text-gray-800">
                            {delegate.phone}
                          </a>
                        </div>
                      </td>

                      {/* Location (City & State) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          {delegate.city || "-"}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {delegate.state ? `${delegate.state}, ` : ""}
                          {delegate.country}
                        </div>
                      </td>

                      {/* MCI Registration No */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {delegate.mci_no ? (
                          <span className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            {delegate.mci_no}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Registration Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-600 dark:text-gray-400 text-[11px]">
                        {formatDate(delegate.registration_date)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedDelegate(delegate)}
                          className="p-1.5 text-xs font-semibold text-[#AA2D7B] dark:text-[#D85A9A] bg-[#faedf5]/70 hover:bg-[#faedf5] dark:bg-pink-950/40 dark:hover:bg-pink-900/50 rounded-lg border border-[#AA2D7B]/20 dark:border-[#AA2D7B]/40 transition-colors cursor-pointer inline-flex items-center justify-center"
                          data-tooltip="View Details"
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

            {/* Pagination Controls Bar */}
            <TablePagination
              currentPage={currentPage}
              totalItems={filteredDelegates.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              itemName="delegates"
            />
          </div>
        )}
      </AdminPageContainer>

      {/* Comprehensive Delegate Profile & Badge Modal */}
      {selectedDelegate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-[#faedf5]/30 dark:bg-gray-800/40">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#55355E] to-[#AA2D7B] text-white flex items-center justify-center font-bold text-base uppercase shadow-xs">
                  {(selectedDelegate.first_name || "D").charAt(0)}
                  {(selectedDelegate.last_name || "C").charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {selectedDelegate.salutation ? `${selectedDelegate.salutation} ` : ""}
                      {selectedDelegate.first_name} {selectedDelegate.last_name}
                    </h3>
                    {getCategoryBadge(selectedDelegate.reg_category)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Registration ID:{" "}
                    <span className="font-mono font-bold text-[#AA2D7B]">
                      {selectedDelegate.registration_id}
                    </span>{" "}
                    • Database ID: #{selectedDelegate.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDelegate(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-base"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Top Banner: QR Code & Key Highlights */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 flex flex-col sm:flex-row items-center gap-5">
                {/* QR Code Preview */}
                <div className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs shrink-0">
                  {selectedDelegate.qr_code_url ? (
                    <img
                      src={`${BASE_URL}${selectedDelegate.qr_code_url}`}
                      alt={`QR Code for ${selectedDelegate.registration_id}`}
                      className="w-28 h-28 object-contain"
                      onError={(e) => {
                        // Fallback placeholder if backend QR image isn't live
                        (e.currentTarget as HTMLElement).style.display = "none";
                        const parent = (e.currentTarget as HTMLElement).parentElement;
                        if (parent) {
                          const fallbackDiv = document.createElement("div");
                          fallbackDiv.className =
                            "w-28 h-28 flex flex-col items-center justify-center text-center p-2 text-gray-400 text-[10px]";
                          fallbackDiv.innerHTML = `<span>[QR Code]</span><span class="font-mono font-bold mt-1 text-[#AA2D7B]">${selectedDelegate.registration_id}</span>`;
                          parent.appendChild(fallbackDiv);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-28 h-28 flex items-center justify-center text-gray-400 text-xs">
                      No QR
                    </div>
                  )}
                  <span className="text-[10px] font-mono text-gray-500 font-semibold mt-1">
                    {selectedDelegate.registration_id}
                  </span>
                </div>

                {/* Registration Details */}
                <div className="flex-1 space-y-2 text-xs w-full">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-[11px] block">
                        Category
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white mt-0.5 block">
                        {selectedDelegate.reg_category || "Unassigned"}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-[11px] block">
                        MCI Registration No.
                      </span>
                      <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                        {selectedDelegate.mci_no || "Not Provided"}
                      </span>
                    </div>



                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-[11px] block">
                        Registration Date
                      </span>
                      <span className="text-gray-800 dark:text-gray-200 mt-0.5 block">
                        {formatDate(selectedDelegate.registration_date)}
                      </span>
                    </div>

                   
                  </div>

                  {selectedDelegate.remarks && (
                    <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px]">
                      <b>Remarks:</b> {selectedDelegate.remarks}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-2">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${selectedDelegate.email}`}
                      className="font-medium text-[#AA2D7B] hover:underline break-all mt-0.5 block"
                    >
                      {selectedDelegate.email}
                    </a>
                  </div>

                  <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
                      Phone Number
                    </span>
                    <a
                      href={`tel:${selectedDelegate.phone}`}
                      className="font-medium text-gray-900 dark:text-gray-100 font-mono mt-0.5 block"
                    >
                      {selectedDelegate.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Geographic Location */}
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-2">
                  Location
                </h4>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 block">City</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5 block">
                      {selectedDelegate.city || "-"}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 block">State</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5 block">
                      {selectedDelegate.state || "-"}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 block">Country</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5 block">
                      {selectedDelegate.country || "India"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction & Payment Audit */}
              {selectedDelegate.transaction_id && (
                <div>
                  <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-2">
                    Payment & Transaction Audit
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
                        Transaction ID
                      </span>
                      <span className="font-mono font-semibold text-gray-900 dark:text-gray-100 mt-0.5 block">
                        {selectedDelegate.transaction_id}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
                        Payment Timestamp
                      </span>
                      <span className="text-gray-800 dark:text-gray-200 mt-0.5 block">
                        {formatDate(selectedDelegate.payment_date)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
              <button
                onClick={() =>
                  copyToClipboard(
                    `${selectedDelegate.salutation ? selectedDelegate.salutation + " " : ""}${
                      selectedDelegate.first_name
                    } ${selectedDelegate.last_name} | Reg ID: ${
                      selectedDelegate.registration_id
                    } | Phone: ${selectedDelegate.phone}`,
                    "modal-copy"
                  )
                }
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-[#AA2D7B] flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {copiedId === "modal-copy" ? "Copied Info!" : "Copy Details"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDelegate(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
                
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick QR Code Preview Modal */}
      {qrModalDelegate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">
                Delegate Pass QR
              </span>
              <button
                onClick={() => setQrModalDelegate(null)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <div className="font-bold text-gray-900 dark:text-white text-base">
                {qrModalDelegate.salutation ? `${qrModalDelegate.salutation} ` : ""}
                {qrModalDelegate.first_name} {qrModalDelegate.last_name}
              </div>
              <div className="text-xs text-gray-500 font-mono mt-0.5">
                {qrModalDelegate.registration_id}
              </div>
              <div className="mt-1">{getCategoryBadge(qrModalDelegate.reg_category)}</div>
            </div>

            {/* QR Image */}
            <div className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner">
              {qrModalDelegate.qr_code_url ? (
                <img
                  src={`${BASE_URL}${qrModalDelegate.qr_code_url}`}
                  alt={`QR for ${qrModalDelegate.registration_id}`}
                  className="w-44 h-44 object-contain"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-gray-400 text-xs">
                  No QR URL available
                </div>
              )}
            </div>

            <div className="text-[11px] text-gray-400">
              Present this QR at Kaizen Con 2027 registration desk for badge printing.
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setQrModalDelegate(null)}
                className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#AA2D7B] hover:bg-[#D85A9A] rounded-lg transition-colors cursor-pointer"
              >
                Print Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
