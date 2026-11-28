import { useState, useEffect, useMemo, type FormEvent } from "react";
import Swal from "sweetalert2";
import PageMeta from "../../components/common/PageMeta";
import { AdminPageContainer } from "../../components/common/AdminPageContainer";
import { TablePagination } from "../../components/common/TablePagination";
import { getDelegates, saveDelegate, deleteDelegate, BASE_URL } from "../../api/ApiPath";
import { useToast } from "../../context/ToastContext";
import { DelegateActionModal } from "./DelegateActionModal";
import type { DelegateActionMode } from "./DelegateActionModal";

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
  is_banned?: boolean;
  ban_status?: string | null;
  created_at?: string;
  updated_at?: string;
}

type DelegateAccess = "banned" | "active";

function readDelegateAccess(d: Delegate): DelegateAccess | null {
  if (typeof d.is_banned === "boolean") return d.is_banned ? "banned" : "active";
  const raw = (d.ban_status || "").trim().toLowerCase();
  if (!raw) return null;
  if (raw === "active" || raw.includes("unban")) return "active";
  if (raw.includes("ban")) return "banned";
  return null;
}

function effectiveDelegateAccess(d: Delegate, overrides: Record<number, DelegateAccess>): DelegateAccess {
  return overrides[d.id] ?? readDelegateAccess(d) ?? "active";
}

function delegateFullName(d: Delegate): string {
  const salutation = d.salutation ? `${d.salutation} ` : "";
  return `${salutation}${d.first_name || ""} ${d.last_name || ""}`.trim() || `Delegate #${d.id}`;
}

interface DelegateForm {
  registration_id: string;
  salutation: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  state: string;
  country: string;
  reg_category: string;
  total_amount: string;
  transaction_id: string;
  mci_no: string;
  registration_date: string;
  payment_date: string;
  payment_mode: string;
  remarks: string;
  from_link: string;
}

const EMPTY_DELEGATE_FORM: DelegateForm = {
  registration_id: "",
  salutation: "Dr.",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
  city: "",
  state: "",
  country: "India",
  reg_category: "DELEGATE",
  total_amount: "",
  transaction_id: "",
  mci_no: "",
  registration_date: "",
  payment_date: "",
  payment_mode: "",
  remarks: "",
  from_link: "",
};

const SALUTATIONS = ["Dr.", "Prof.", "Mr.", "Mrs.", "Ms."];
const PAYMENT_MODES = ["Online", "UPI", "Card", "Net Banking", "Cash", "Cheque", "Complimentary"];

const fieldClass =
  "w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#AA2D7B]";
const labelClass = "block font-semibold text-gray-700 dark:text-gray-300 mb-1";

function isoToLocalInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localInputToIso(value: string): string | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function formFromDelegate(d: Delegate): DelegateForm {
  return {
    registration_id: d.registration_id || "",
    salutation: d.salutation || "",
    first_name: d.first_name || "",
    last_name: d.last_name || "",
    email: d.email || "",
    phone: d.phone || "",
    password: "",
    city: d.city || "",
    state: d.state || "",
    country: d.country || "",
    reg_category: d.reg_category || "",
    total_amount: d.total_amount === null || d.total_amount === undefined ? "" : String(d.total_amount),
    transaction_id: d.transaction_id || "",
    mci_no: d.mci_no || "",
    registration_date: isoToLocalInput(d.registration_date),
    payment_date: isoToLocalInput(d.payment_date),
    payment_mode: d.payment_mode || "",
    remarks: d.remarks || "",
    from_link: d.from_link || "",
  };
}

function AccessBadge({ access }: { access: DelegateAccess }) {
  if (access === "banned") {
    return (
      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
        Banned
      </span>
    );
  }
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
      Active
    </span>
  );
}


export default function DelegatesPage() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [_error, setError] = useState<string | null>(null);
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
  const [accessOverrides, setAccessOverrides] = useState<Record<number, DelegateAccess>>({});
  const [moderation, setModeration] = useState<{ delegate: Delegate; mode: DelegateActionMode } | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingDelegate, setEditingDelegate] = useState<Delegate | null>(null);
  const [form, setForm] = useState<DelegateForm>(EMPTY_DELEGATE_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch from Live API. Silent refreshes keep the current table in place.
  const fetchDelegatesData = async (opts?: { silent?: boolean }): Promise<boolean> => {
    if (!opts?.silent) setLoading(true);
    setError(null);
    try {
      const data = await getDelegates();
      if (data && Array.isArray(data.results)) {
        setDelegates(data.results);
        setIsLiveApi(true);
        return true;
      }
      setDelegates([]);
      setIsLiveApi(false);
      return false;
    } catch (err: any) {
      console.warn("Could not fetch delegates from live API:", err);
      setError(err?.message || "Live API not reachable. Please check connection.");
      if (!opts?.silent) setDelegates([]);
      setIsLiveApi(false);
      return false;
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDelegatesData();
  }, []);

  const setField = (key: keyof DelegateForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openCreateModal = () => {
    setEditingDelegate(null);
    setForm(EMPTY_DELEGATE_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEditModal = (delegate: Delegate) => {
    setEditingDelegate(delegate);
    setForm(formFromDelegate(delegate));
    setFormError(null);
    setSelectedDelegate(null);
    setFormOpen(true);
  };

  const closeFormModal = () => {
    if (isSubmitting) return;
    setFormOpen(false);
    setEditingDelegate(null);
    setForm(EMPTY_DELEGATE_FORM);
    setFormError(null);
  };

  const handleSaveDelegate = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
      setFormError("First name, last name, and email are required.");
      return;
    }
    if (!editingDelegate && !form.password.trim()) {
      setFormError("A password is required when creating a delegate.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      const payload: Record<string, unknown> = {
        registration_id: form.registration_id.trim(),
        salutation: form.salutation.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        reg_category: form.reg_category.trim(),
        total_amount: form.total_amount.trim() === "" ? 0 : Number(form.total_amount),
        transaction_id: form.transaction_id.trim(),
        mci_no: form.mci_no.trim(),
        registration_date: localInputToIso(form.registration_date),
        payment_date: localInputToIso(form.payment_date),
        payment_mode: form.payment_mode.trim(),
        remarks: form.remarks.trim(),
        from_link: form.from_link.trim(),
      };

      if (editingDelegate?.id) {
        payload.id = editingDelegate.id;
      }
      if (form.password.trim()) {
        payload.password = form.password;
      }

      const res = await saveDelegate(payload);
      const name = `${form.salutation ? form.salutation + " " : ""}${form.first_name} ${form.last_name}`.trim();
      toastSuccess(
        editingDelegate
          ? `${name} has been updated.`
          : res?.message && !/^(ok|success|string)$/i.test(res.message)
          ? res.message
          : `${name} has been registered.`
      );
      setFormOpen(false);
      setEditingDelegate(null);
      setForm(EMPTY_DELEGATE_FORM);
      await fetchDelegatesData({ silent: true });
    } catch (err: any) {
      const msg = err?.message || "Could not save this delegate.";
      setFormError(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDelegate = async (delegate: Delegate) => {
    const name = delegateFullName(delegate);
    const result = await Swal.fire({
      title: "Delete delegate?",
      text: `Delete ${name} (${delegate.registration_id || "#" + delegate.id})? This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#AA2D7B",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) return;

    setDeletingId(delegate.id);
    try {
      await deleteDelegate(delegate.id);
      setDelegates((prev) => prev.filter((d) => d.id !== delegate.id));
      setSelectedDelegate((cur) => (cur && cur.id === delegate.id ? null : cur));
      setQrModalDelegate((cur) => (cur && cur.id === delegate.id ? null : cur));
      toastSuccess(`${name} has been deleted.`);
    } catch (err: any) {
      toastError(err?.message || "Could not delete this delegate.");
    } finally {
      setDeletingId(null);
    }
  };

  // Unique Categories
  const availableCategories = useMemo(() => {
    const list = Array.from(
      new Set(delegates.map((d) => d.reg_category).filter(Boolean))
    ) as string[];
    return list.sort();
  }, [delegates]);

 
  // Filtered Delegates
  const filteredDelegates = useMemo(() => {
    const term = search.toLowerCase().trim();
    const tokens = term ? term.split(/\s+/).filter(Boolean) : [];

    return delegates.filter((d) => {
      // 1. Category Filter
      const matchesCategory =
        categoryFilter === "All" ||
        (categoryFilter === "Uncategorized"
          ? !d.reg_category
          : d.reg_category?.toLowerCase() === categoryFilter.toLowerCase());

      // 2. City Filter
      const matchesCity =
        cityFilter === "All" ||
        d.city?.toLowerCase().trim() === cityFilter.toLowerCase().trim();

      if (!matchesCategory || !matchesCity) return false;

      // 3. Search Query matching across all requested fields:
      // Location, Contact Details, Category, Delegate Name, MCI No.
      if (!term) return true;

      // Name fields
      const salutation = (d.salutation || "").toLowerCase();
      const firstName = (d.first_name || "").toLowerCase();
      const lastName = (d.last_name || "").toLowerCase();
      const fullName = `${d.salutation ? d.salutation + " " : ""}${d.first_name || ""} ${d.last_name || ""}`.toLowerCase();
      const nameOnly = `${d.first_name || ""} ${d.last_name || ""}`.toLowerCase();

      // Category
      const category = (d.reg_category || "Unassigned").toLowerCase();

      // Contact Details (Email & Phone)
      const email = (d.email || "").toLowerCase();
      const phone = (d.phone || "").toLowerCase();
      const phoneClean = (d.phone || "").replace(/[^0-9]/g, "");

      // Location (City, State, Country)
      const city = (d.city || "").toLowerCase();
      const state = (d.state || "").toLowerCase();
      const country = (d.country || "").toLowerCase();
      const locationFull = `${d.city || ""} ${d.state || ""} ${d.country || ""}`.toLowerCase();

      // MCI No.
      const mci = (d.mci_no || "").toLowerCase();

      // Additional identifiers
      const regId = (d.registration_id || "").toLowerCase();
      const txnId = (d.transaction_id || "").toLowerCase();
      const remarks = (d.remarks || "").toLowerCase();
      const idStr = String(d.id || "");

      const searchableBlob = `${salutation} ${firstName} ${lastName} ${fullName} ${nameOnly} ${category} ${email} ${phone} ${phoneClean} ${city} ${state} ${country} ${locationFull} ${mci} ${regId} ${txnId} ${remarks} ${idStr}`;

      return (
        searchableBlob.includes(term) ||
        tokens.every((token) => searchableBlob.includes(token))
      );
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
        searchPlaceholder="Search by name, contact, category, location, MCI no..."
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
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#55355E] hover:bg-[#6d4578] rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Delegate
            </button>
            <button
              onClick={() => {
                void fetchDelegatesData();
              }}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#AA2D7B] hover:bg-[#D85A9A] rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh delegates"
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
              {loading ? "Fetching..." : "Refresh "}
            </button>
          </div>
        }
      >
 
       

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
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {paginatedDelegates.map((delegate) => {
                  const salutation = delegate.salutation ? `${delegate.salutation} ` : "";
                  const fullName = `${salutation}${delegate.first_name || ""} ${delegate.last_name || ""}`.trim();
                  const initials = `${(delegate.first_name || "D").charAt(0)}${(delegate.last_name || "C").charAt(0)}`.toUpperCase();
                  const access = effectiveDelegateAccess(delegate, accessOverrides);
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

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <AccessBadge access={access} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-1.5">
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
                          <button
                            type="button"
                            onClick={() => openEditModal(delegate)}
                            className="p-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer inline-flex items-center justify-center"
                            data-tooltip="Edit Delegate"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDelegate(delegate)}
                            disabled={deletingId === delegate.id}
                            className="p-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center justify-center"
                            data-tooltip="Delete Delegate"
                          >
                            {deletingId === delegate.id ? (
                              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                                <path d="M12 2a10 10 0 0 1 10 10" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={moderation !== null}
                            onClick={() =>
                              setModeration({ delegate, mode: access === "banned" ? "unban" : "ban" })
                            }
                            className={
                              access === "banned"
                                ? "px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                : "px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            }
                          >
                            {access === "banned" ? "Unban" : "Ban"}
                          </button>
                        </div>
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {selectedDelegate.salutation ? `${selectedDelegate.salutation} ` : ""}
                      {selectedDelegate.first_name} {selectedDelegate.last_name}
                    </h3>
                    {getCategoryBadge(selectedDelegate.reg_category)}
                    <AccessBadge access={effectiveDelegateAccess(selectedDelegate, accessOverrides)} />
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
                  type="button"
                  onClick={() => handleDeleteDelegate(selectedDelegate)}
                  disabled={deletingId === selectedDelegate.id}
                  className="px-4 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {deletingId === selectedDelegate.id ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(selectedDelegate)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#55355E] hover:bg-[#6d4578] rounded-lg transition-colors cursor-pointer"
                >
                  Edit
                </button>
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

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col my-auto">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 bg-[#faedf5]/30 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {editingDelegate
                    ? `Edit ${form.first_name} ${form.last_name}`.trim()
                    : "Register a delegate"}
                </h3>
                <p className="text-[11px] text-gray-500">
                  {editingDelegate
                    ? `Updates delegate #${editingDelegate.id} with POST /api/delegates`
                    : "Creates a new delegate with POST /api/delegates"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeFormModal}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-base cursor-pointer disabled:opacity-40"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDelegate} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Salutation</label>
                    <select
                      value={form.salutation}
                      onChange={(e) => setField("salutation", e.target.value)}
                      className={fieldClass}
                    >
                      <option value="">—</option>
                      {SALUTATIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                      {form.salutation && !SALUTATIONS.includes(form.salutation) && (
                        <option value={form.salutation}>{form.salutation}</option>
                      )}
                    </select>
                  </div>
                  <div className="sm:col-span-5">
                    <label className={labelClass}>
                      First name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      value={form.first_name}
                      onChange={(e) => setField("first_name", e.target.value)}
                      className={fieldClass}
                      placeholder="Aarav"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <label className={labelClass}>
                      Last name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      value={form.last_name}
                      onChange={(e) => setField("last_name", e.target.value)}
                      className={fieldClass}
                      placeholder="Sharma"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Registration ID</label>
                    <input
                      value={form.registration_id}
                      onChange={(e) => setField("registration_id", e.target.value)}
                      className={fieldClass}
                      placeholder="Leave blank if the server assigns one"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Category</label>
                    <input
                      list="delegate-categories"
                      value={form.reg_category}
                      onChange={(e) => setField("reg_category", e.target.value)}
                      className={fieldClass}
                      placeholder="DELEGATE"
                    />
                    <datalist id="delegate-categories">
                      <option value="DELEGATE" />
                      <option value="FACULTY" />
                      <option value="ORGANIZING COMMITTEE" />
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      className={fieldClass}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      className={fieldClass}
                      placeholder="9814047911"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Password {!editingDelegate && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    required={!editingDelegate}
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    className={fieldClass}
                    placeholder={editingDelegate ? "Leave blank to keep the current password" : "Set a login password"}
                    autoComplete="new-password"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>City</label>
                    <input value={form.city} onChange={(e) => setField("city", e.target.value)} className={fieldClass} />
                  </div>
                  <div>
                    <label className={labelClass}>State</label>
                    <input value={form.state} onChange={(e) => setField("state", e.target.value)} className={fieldClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Country</label>
                    <input value={form.country} onChange={(e) => setField("country", e.target.value)} className={fieldClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>MCI number</label>
                    <input value={form.mci_no} onChange={(e) => setField("mci_no", e.target.value)} className={fieldClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.total_amount}
                      onChange={(e) => setField("total_amount", e.target.value)}
                      className={fieldClass}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Payment mode</label>
                    <select
                      value={form.payment_mode}
                      onChange={(e) => setField("payment_mode", e.target.value)}
                      className={fieldClass}
                    >
                      <option value="">—</option>
                      {PAYMENT_MODES.map((mode) => (
                        <option key={mode} value={mode}>
                          {mode}
                        </option>
                      ))}
                      {form.payment_mode && !PAYMENT_MODES.includes(form.payment_mode) && (
                        <option value={form.payment_mode}>{form.payment_mode}</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Transaction ID</label>
                    <input
                      value={form.transaction_id}
                      onChange={(e) => setField("transaction_id", e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Registration date</label>
                    <input
                      type="datetime-local"
                      value={form.registration_date}
                      onChange={(e) => setField("registration_date", e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Payment date</label>
                    <input
                      type="datetime-local"
                      value={form.payment_date}
                      onChange={(e) => setField("payment_date", e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Remarks</label>
                  <textarea
                    rows={2}
                    value={form.remarks}
                    onChange={(e) => setField("remarks", e.target.value)}
                    className={`${fieldClass} resize-y min-h-[64px]`}
                  />
                </div>
                <div>
                  <label className={labelClass}>From link</label>
                  <input
                    value={form.from_link}
                    onChange={(e) => setField("from_link", e.target.value)}
                    className={fieldClass}
                    placeholder="https://"
                  />
                </div>

                {formError && (
                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs" role="alert">
                    {formError}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 shrink-0">
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#AA2D7B] hover:bg-[#D85A9A] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingDelegate ? "Update delegate" : "Create delegate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {moderation && (
        <DelegateActionModal
          mode={moderation.mode}
          delegateId={moderation.delegate.id}
          delegateName={delegateFullName(moderation.delegate)}
          onClose={() => {
            if (moderation) setModeration(null);
          }}
          onDone={async (res) => {
            const target = moderation.delegate;
            const next: DelegateAccess = moderation.mode === "ban" ? "banned" : "active";
            setAccessOverrides((prev) => ({ ...prev, [target.id]: next }));
            setDelegates((prev) =>
              prev.map((d) => (d.id === target.id ? { ...d, is_banned: next === "banned", ban_status: next } : d))
            );
            setSelectedDelegate((cur) =>
              cur && cur.id === target.id ? { ...cur, is_banned: next === "banned", ban_status: next } : cur
            );
            setModeration(null);
            const fallback =
              next === "banned" ? `${delegateFullName(target)} is now banned.` : `${delegateFullName(target)} is active again.`;
            toastSuccess(res.message && !/^(ok|success)$/i.test(res.message) ? res.message : fallback);
            const refreshed = await fetchDelegatesData({ silent: true });
            if (!refreshed) toastError("Status updated, but the delegate list could not be refreshed.");
          }}
        />
      )}
    </>
  );
}
