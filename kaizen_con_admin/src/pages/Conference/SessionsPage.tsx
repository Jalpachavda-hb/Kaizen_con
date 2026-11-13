import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { AdminPageContainer } from "../../components/common/AdminPageContainer";
import { TablePagination } from "../../components/common/TablePagination";
import {
  getLiveSessions,
  createLiveSession,
  startLiveSession,
  endLiveSession,
  getSpeakers,
} from "../../api/ApiPath";
import { useToast } from "../../context/ToastContext";
import Swal from "sweetalert2";

export interface LiveSession {
  id: string;
  title: string;
  speaker_name: string;
  venue?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  category?: string | null;
  join_code: string;
  status: "draft" | "live" | "ended" | string;
  created_by?: string | null;
  created_at: string;
}

export interface SpeakerOption {
  id: number;
  first_name: string;
  last_name: string;
  speciality?: string;
  designation?: string;
}

export default function SessionsPage() {
  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();

  // Sessions State
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [speakers, setSpeakers] = useState<SpeakerOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All"); // All | live | draft | ended
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [speakerName, setSpeakerName] = useState("");
  const [category, setCategory] = useState("");
  const [venue, setVenue] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Details Modal State
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Action Loading & Copy Feedback
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Fetch Live Sessions from GET /api/sessions
  const fetchSessionsData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setApiError(null);

    try {
      const data: any = await getLiveSessions();
      if (Array.isArray(data)) {
        setSessions(data as LiveSession[]);
      } else {
        setSessions([]);
      }
    } catch (err: any) {
      console.error("Could not fetch sessions from /api/sessions:", err);
      const message = err?.message || "Failed to load sessions from server.";
      setApiError(message);
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  // Fetch Faculty Speakers for quick selection in modal
  const fetchSpeakersData = useCallback(async () => {
    try {
      const res: any = await getSpeakers();
      if (res && Array.isArray(res.results)) {
        setSpeakers(res.results);
      }
    } catch (err) {
      console.warn("Could not load faculty list for session auto-fill:", err);
    }
  }, []);

  useEffect(() => {
    fetchSessionsData();
    fetchSpeakersData();
  }, [fetchSessionsData, fetchSpeakersData]);

  // Open Create Session Modal
  const handleOpenAddModal = () => {
    setTitle("");
    setSpeakerName("");
    setCategory("");
    setVenue("");
    setStartTime("");
    setEndTime("");
    setFormError(null);
    setIsModalOpen(true);
  };

  // Submit Create Session (POST /api/sessions)
  const handleCreateSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const titleTrimmed = title.trim();
    const speakerTrimmed = speakerName.trim();

    if (!titleTrimmed || titleTrimmed.length < 3) {
      setFormError("Session title is required (minimum 3 characters).");
      return;
    }
    if (!speakerTrimmed || speakerTrimmed.length < 2) {
      setFormError("Speaker name is required (minimum 2 characters).");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        title: titleTrimmed,
        speaker_name: speakerTrimmed,
      };

      if (category.trim()) payload.category = category.trim();
      if (venue.trim()) payload.venue = venue.trim();
      if (startTime.trim()) payload.start_time = startTime.trim();
      if (endTime.trim()) payload.end_time = endTime.trim();

      const created: any = await createLiveSession(payload);

      setIsModalOpen(false);
      await fetchSessionsData(true);

      const joinCode = created?.join_code || "";
      Swal.fire({
        title: "Session Created!",
        html: `Session <strong>"${titleTrimmed}"</strong> has been created in draft status.<br/><br/>` +
              (joinCode ? `Join Code: <span class="px-2.5 py-1 font-mono font-bold text-sm bg-purple-100 text-purple-800 rounded-md">${joinCode}</span>` : ""),
        icon: "success",
        confirmButtonColor: "#AA2D7B",
        confirmButtonText: "Done",
      });
    } catch (err: any) {
      console.error("Failed to create session:", err);
      const msg = err?.message || "Failed to create session.";
      setFormError(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start Session Handler (POST /api/sessions/{session_id}/start)
  const handleStartSession = async (session: LiveSession) => {
    const result = await Swal.fire({
      title: "Start Live Session?",
      html: `Do you want to start session <strong>"${session.title}"</strong>?<br/><br/>` +
            `This will transition the session to <span class="text-emerald-600 font-semibold uppercase">LIVE</span>. Delegates will be able to join using code <strong>${session.join_code}</strong>.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Start Session",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl dark:bg-gray-900 dark:text-white",
        title: "text-gray-900 dark:text-white font-bold text-base",
      },
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoadingId(session.id);
      const updated = await startLiveSession(session.id);

      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, ...updated, status: "live" } : s))
      );
      if (selectedSession?.id === session.id) {
        setSelectedSession((prev) => (prev ? { ...prev, ...updated, status: "live" } : null));
      }

      success(`Session "${session.title}" is now LIVE!`);
    } catch (err: any) {
      console.error("Error starting session:", err);
      Swal.fire({
        title: "Error Starting Session",
        text: err?.message || "Could not start session. Please try again.",
        icon: "error",
        confirmButtonColor: "#AA2D7B",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // End Session Handler (POST /api/sessions/{session_id}/end)
  const handleEndSession = async (session: LiveSession) => {
    const result = await Swal.fire({
      title: "End Session?",
      html: `Are you sure you want to end session <strong>"${session.title}"</strong>?<br/>This will close live delegate participation.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, End Session",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl dark:bg-gray-900 dark:text-white",
        title: "text-gray-900 dark:text-white font-bold text-base",
      },
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoadingId(session.id);
      const updated = await endLiveSession(session.id);

      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, ...updated, status: "ended" } : s))
      );
      if (selectedSession?.id === session.id) {
        setSelectedSession((prev) => (prev ? { ...prev, ...updated, status: "ended" } : null));
      }

      info(`Session "${session.title}" ended.`);
    } catch (err: any) {
      console.error("Error ending session:", err);
      toastError(err?.message || "Could not end session.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Copy Join Code to clipboard
  const handleCopyJoinCode = (code: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!code) return;

    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      info(`Join code "${code}" copied to clipboard!`);
      setTimeout(() => setCopiedId(null), 2500);
    }).catch(() => {
      toastError("Failed to copy code.");
    });
  };

  // Navigate to Q&A Moderation for this session
  const handleOpenQAPage = (sessionId: string) => {
    navigate(`/conference/qa?session_id=${encodeURIComponent(sessionId)}`);
  };

  // View Details Modal
  const handleViewDetails = (session: LiveSession) => {
    setSelectedSession(session);
    setIsDetailsModalOpen(true);
  };

  // Format date-time
  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Unique Categories for filter
  const uniqueCategories = useMemo(() => {
    const set = new Set(sessions.map((s) => s.category).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [sessions]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    const term = search.toLowerCase().trim();
    return sessions.filter((s) => {
      const matchesSearch =
        !term ||
        (s.title && s.title.toLowerCase().includes(term)) ||
        (s.speaker_name && s.speaker_name.toLowerCase().includes(term)) ||
        (s.join_code && s.join_code.toLowerCase().includes(term)) ||
        (s.category && s.category.toLowerCase().includes(term)) ||
        (s.venue && s.venue.toLowerCase().includes(term)) ||
        (s.id && s.id.toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "All" ||
        (s.status || "draft").toLowerCase() === statusFilter.toLowerCase();

      const matchesCategory =
        categoryFilter === "All" || s.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [sessions, search, statusFilter, categoryFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, categoryFilter]);

  // Paginated Sessions
  const paginatedSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSessions.slice(startIndex, startIndex + pageSize);
  }, [filteredSessions, currentPage, pageSize]);

  // Statistics
  const stats = useMemo(() => {
    const total = sessions.length;
    const live = sessions.filter((s) => (s.status || "").toLowerCase() === "live").length;
    const draft = sessions.filter((s) => (s.status || "draft").toLowerCase() === "draft").length;
    const ended = sessions.filter((s) => (s.status || "").toLowerCase() === "ended").length;
    return { total, live, draft, ended };
  }, [sessions]);

  return (
    <>
      <PageMeta
        title="Interactive Sessions | Kaizen Con 2027"
        description="Manage Live Conference Sessions, Join Codes, Stage Status, and Delegate Q&A"
      />

      <AdminPageContainer
        title="Sessions"
        subtitle="Manage live interactive sessions, stage join codes, broadcast status, and delegate Q&A."
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by title, speaker, join code, or category..."
        actionButton={
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#AA2D7B]"
            >
              <option value="All">All Statuses ({sessions.length})</option>
              <option value="live">Live Now ({stats.live})</option>
              <option value="draft">Draft ({stats.draft})</option>
              <option value="ended">Ended ({stats.ended})</option>
            </select>

            {/* Category Filter */}
            {uniqueCategories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#AA2D7B]"
              >
                <option value="All">All Categories</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => fetchSessionsData()}
              disabled={loading}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-[#AA2D7B] transition-colors cursor-pointer"
              data-tooltip="Refresh Sessions"
            >
              <svg
                className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#AA2D7B]" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Create Session Button */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#AA2D7B] hover:bg-[#8D2566] rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Create Session</span>
            </button>
          </div>
        }
      >
        {/* Error Notification */}
        {apiError && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{apiError}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchSessionsData()}
              className="text-[#AA2D7B] font-semibold hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
            <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Total Sessions</div>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              <span>Live Now</span>
              {stats.live > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <div className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.live}</div>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs">
            <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400">Draft / Upcoming</div>
            <div className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.draft}</div>
          </div>

          <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 shadow-xs">
            <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Ended Sessions</div>
            <div className="mt-1 text-2xl font-bold text-gray-700 dark:text-gray-300">{stats.ended}</div>
          </div>
        </div>

        {/* Sessions Table Container */}
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-[#AA2D7B] border-t-transparent"></div>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Loading interactive sessions...</p>
            </div>
          ) : paginatedSessions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">No sessions found</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {search || statusFilter !== "All" || categoryFilter !== "All"
                  ? "Try adjusting your search query or filter options."
                  : "Get started by creating your first interactive session."}
              </p>
              {search || statusFilter !== "All" || categoryFilter !== "All" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                    setCategoryFilter("All");
                  }}
                  className="mt-3 px-3 py-1.5 text-xs text-[#AA2D7B] hover:underline"
                >
                  Clear all filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#AA2D7B] hover:bg-[#8D2566] rounded-lg transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Create First Session
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/75 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-4 py-3">Session Title</th>
                    <th scope="col" className="px-4 py-3">Speaker</th>
                    <th scope="col" className="px-4 py-3">Join Code</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3">Timing / Venue</th>
                    <th scope="col" className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paginatedSessions.map((session) => {
                    const isLive = (session.status || "").toLowerCase() === "live";
                    const isDraft = (session.status || "draft").toLowerCase() === "draft";
                    const isEnded = (session.status || "").toLowerCase() === "ended";

                    return (
                      <tr
                        key={session.id}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
                        onClick={() => handleViewDetails(session)}
                      >
                        {/* Title & Category */}
                        <td className="px-4 py-3.5 max-w-xs">
                          <div className="font-semibold text-gray-900 dark:text-white truncate">
                            {session.title || "Untitled Session"}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            {session.category ? (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                                {session.category}
                              </span>
                            ) : null}
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono truncate" title={session.id}>
                              ID: {session.id.slice(0, 8)}...
                            </span>
                          </div>
                        </td>

                        {/* Speaker Name */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#AA2D7B]/20 to-[#4A154B]/20 text-[#AA2D7B] flex items-center justify-center font-bold text-xs">
                              {session.speaker_name ? session.speaker_name.charAt(0).toUpperCase() : "S"}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800 dark:text-gray-200">
                                {session.speaker_name || "Unassigned"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Join Code */}
                        <td className="px-4 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                            <span className="font-mono font-bold text-xs text-[#AA2D7B] tracking-wider">
                              {session.join_code || "—"}
                            </span>
                            {session.join_code && (
                              <button
                                type="button"
                                onClick={(e) => handleCopyJoinCode(session.join_code, session.id, e)}
                                className="p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                                data-tooltip="Copy Join Code"
                              >
                                {copiedId === session.id ? (
                                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {isLive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              LIVE
                            </span>
                          ) : isDraft ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                              Draft
                            </span>
                          ) : isEnded ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                              Ended
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                              {session.status}
                            </span>
                          )}
                        </td>

                        {/* Timing / Venue */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-gray-600 dark:text-gray-400">
                          {session.venue && (
                            <div className="font-medium text-gray-800 dark:text-gray-200">{session.venue}</div>
                          )}
                          <div className="text-[11px] text-gray-400 dark:text-gray-500">
                            {session.start_time ? `${session.start_time} - ${session.end_time || ""}` : formatDateTime(session.created_at)}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-1.5 justify-center">
                            {/* Start Session (Draft only) */}
                            {isDraft && (
                              <button
                                type="button"
                                onClick={() => handleStartSession(session)}
                                disabled={actionLoadingId === session.id}
                                className="p-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center justify-center"
                                data-tooltip="Start Session"
                              >
                                {actionLoadingId === session.id ? (
                                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                                    <path d="M12 2a10 10 0 0 1 10 10" />
                                  </svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                  </svg>
                                )}
                              </button>
                            )}

                            {/* End Session (Live only) */}
                            {isLive && (
                              <button
                                type="button"
                                onClick={() => handleEndSession(session)}
                                disabled={actionLoadingId === session.id}
                                className="p-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center justify-center"
                                data-tooltip="End Session"
                              >
                                {actionLoadingId === session.id ? (
                                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                                    <path d="M12 2a10 10 0 0 1 10 10" />
                                  </svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="6" y="6" width="12" height="12" rx="1.5" />
                                  </svg>
                                )}
                              </button>
                            )}

                            {/* Moderate Live Q&A */}
                            <button
                              type="button"
                              onClick={() => handleOpenQAPage(session.id)}
                              className="p-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer inline-flex items-center justify-center"
                              data-tooltip="Moderate Live Q&A"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                            </button>

                            {/* View Details */}
                            <button
                              type="button"
                              onClick={() => handleViewDetails(session)}
                              className="p-1.5 text-xs font-semibold text-[#AA2D7B] dark:text-[#D85A9A] bg-[#faedf5]/70 hover:bg-[#faedf5] dark:bg-pink-950/40 dark:hover:bg-pink-900/50 rounded-lg border border-[#AA2D7B]/20 dark:border-[#AA2D7B]/40 transition-colors cursor-pointer inline-flex items-center justify-center"
                              data-tooltip="View Details"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Pagination */}
          {!loading && filteredSessions.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-800">
              <TablePagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={filteredSessions.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </div>
      </AdminPageContainer>

      {/* ========================================================================= */}
      {/* Create Session Modal                                                      */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transform transition-all animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Create New Session</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Creates an interactive session with an auto-generated stage join code.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateSessionSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 text-xs rounded-lg bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                  {formError}
                </div>
              )}

              {/* Title Field */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Session Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modern Innovations in Minimally Invasive Surgery"
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#AA2D7B]"
                />
              </div>

              {/* Speaker Name Field (with auto-suggest from faculty) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Speaker Name <span className="text-rose-500">*</span>
                  </label>
                  {speakers.length > 0 && (
                    <span className="text-[10px] text-gray-400">or pick from faculty</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={speakerName}
                    onChange={(e) => setSpeakerName(e.target.value)}
                    placeholder="e.g. Dr. Nirva Padaliya"
                    required
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#AA2D7B]"
                  />
                  {speakers.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) setSpeakerName(e.target.value);
                      }}
                      value=""
                      className="w-full px-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <option value="">Quick select from registered Faculty...</option>
                      {speakers.map((sp) => (
                        <option key={sp.id} value={`Dr. ${sp.first_name} ${sp.last_name}`}>
                          Dr. {sp.first_name} {sp.last_name} {sp.speciality ? `(${sp.speciality})` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Category & Venue (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category / Track
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Cardiology, Surgery"
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#AA2D7B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Venue / Hall
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Auditorium Hall A"
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#AA2D7B]"
                  />
                </div>
              </div>

              {/* Timing (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#AA2D7B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#AA2D7B]"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#AA2D7B] hover:bg-[#8D2566] rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 animate-spin border-2 border-white border-t-transparent rounded-full"></span>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Session</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Session Details Modal                                                     */}
      {/* ========================================================================= */}
      {isDetailsModalOpen && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transform transition-all animate-fadeIn">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Session Details
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                  {selectedSession.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Join Code Highlight Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950/40 dark:via-pink-950/20 dark:to-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300 tracking-wider">
                    Stage Join Code
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-[#AA2D7B] tracking-widest mt-0.5">
                    {selectedSession.join_code}
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                    Delegates enter this code in the attendee app to join live Q&A.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyJoinCode(selectedSession.join_code, selectedSession.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#AA2D7B] hover:bg-[#8D2566] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" />
                  </svg>
                  <span>{copiedId === selectedSession.id ? "Copied!" : "Copy Code"}</span>
                </button>
              </div>

              {/* Details Key-Value Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <div className="text-gray-400 text-[10px] uppercase font-medium">Status</div>
                  <div className="mt-1 font-semibold text-gray-900 dark:text-white capitalize">
                    {selectedSession.status || "draft"}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <div className="text-gray-400 text-[10px] uppercase font-medium">Speaker</div>
                  <div className="mt-1 font-semibold text-gray-900 dark:text-white truncate">
                    {selectedSession.speaker_name || "Unassigned"}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <div className="text-gray-400 text-[10px] uppercase font-medium">Category / Track</div>
                  <div className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {selectedSession.category || "General"}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <div className="text-gray-400 text-[10px] uppercase font-medium">Venue / Hall</div>
                  <div className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {selectedSession.venue || "Auditorium"}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 col-span-2">
                  <div className="text-gray-400 text-[10px] uppercase font-medium">Created Timestamp</div>
                  <div className="mt-1 font-medium text-gray-700 dark:text-gray-300">
                    {formatDateTime(selectedSession.created_at)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 col-span-2">
                  <div className="text-gray-400 text-[10px] uppercase font-medium">Session UUID</div>
                  <div className="mt-1 font-mono text-[11px] text-gray-600 dark:text-gray-400 break-all select-all">
                    {selectedSession.id}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenQAPage(selectedSession.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Moderate Live Q&A</span>
                </button>

                <div className="flex items-center gap-2">
                  {(selectedSession.status || "draft").toLowerCase() === "draft" && (
                    <button
                      type="button"
                      onClick={() => handleStartSession(selectedSession)}
                      disabled={actionLoadingId === selectedSession.id}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                    >
                      Start Session
                    </button>
                  )}

                  {(selectedSession.status || "").toLowerCase() === "live" && (
                    <button
                      type="button"
                      onClick={() => handleEndSession(selectedSession)}
                      disabled={actionLoadingId === selectedSession.id}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                    >
                      End Session
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
