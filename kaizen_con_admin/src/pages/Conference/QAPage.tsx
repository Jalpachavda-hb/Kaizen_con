import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import { AdminPageContainer } from "../../components/common/AdminPageContainer";
import { useToast } from "../../context/ToastContext";
import {
  QA_WS_URL,
  QA_DEFAULT_SESSION_ID,
  approveQuestionApi,
  rejectQuestionApi,
} from "../../api/ApiPath";

export interface LiveQuestionItem {
  id: string;
  session_id?: string;
  text: string;
  author_name?: string | null;
  status: "pending" | "approved" | "rejected" | "selected" | "answered" | string;
  category?: string | null;
  ai_summary?: string | null;
  vote_count: number;
  created_at: string;
}

export interface LiveSessionInfo {
  id: string;
  title: string;
  speaker_name?: string;
  join_code?: string;
  status?: string;
  created_at?: string;
}

export default function QAPage() {
  const { success, error: toastError, info } = useToast();

  // Live WebSocket & State
  const [questions, setQuestions] = useState<LiveQuestionItem[]>([]);
  const [sessionInfo, setSessionInfo] = useState<LiveSessionInfo | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Actions Loading State
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Fullscreen Presenter Mode
  const [isPresenterMode, setIsPresenterMode] = useState(false);

  // WebSocket Ref
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setConnectionStatus("connecting");
    setErrorMessage(null);

    try {
      const ws = new WebSocket(QA_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus("connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // 1. Initial connection payload
          if (data.type === "connected") {
            if (data.session) {
              setSessionInfo(data.session);
            }
            if (Array.isArray(data.questions)) {
              setQuestions(data.questions);
            }
          }

          // 2. Question created / submitted live
          else if (data.type === "question.created" || data.type === "question.new") {
            const newQ: LiveQuestionItem = data.question;
            if (newQ && newQ.id) {
              setQuestions((prev) => {
                if (prev.some((q) => q.id === newQ.id)) return prev;
                return [newQ, ...prev];
              });
              info(`New live question from ${newQ.author_name || "Delegate"}`);
            }
          }

          // 3. Question approved live
          else if (data.type === "question.approved") {
            const approvedQ: LiveQuestionItem = data.question;
            if (approvedQ && approvedQ.id) {
              setQuestions((prev) =>
                prev.map((q) => (q.id === approvedQ.id ? { ...q, status: "approved" } : q))
              );
            }
          }

          // 4. Question rejected live
          else if (data.type === "question.rejected") {
            const rejectedQ: LiveQuestionItem = data.question;
            if (rejectedQ && rejectedQ.id) {
              setQuestions((prev) =>
                prev.map((q) => (q.id === rejectedQ.id ? { ...q, status: "rejected" } : q))
              );
            }
          }

          // 5. Question vote count updated live
          else if (data.type === "question.voted") {
            const votedQ: LiveQuestionItem = data.question;
            if (votedQ && votedQ.id) {
              setQuestions((prev) =>
                prev.map((q) => (q.id === votedQ.id ? { ...q, vote_count: votedQ.vote_count } : q))
              );
            }
          }

          // 6. Generic array payload
          else if (Array.isArray(data)) {
            setQuestions(data);
          }
        } catch (parseErr) {
          console.error("Error parsing WebSocket message:", parseErr);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setConnectionStatus("disconnected");
        setErrorMessage("Failed to connect to Live Q&A WebSocket server.");
      };

      ws.onclose = () => {
        setConnectionStatus("disconnected");
      };
    } catch (err: any) {
      console.error("Failed to initialize WebSocket:", err);
      setConnectionStatus("disconnected");
      setErrorMessage(err?.message || "Failed to establish WebSocket connection.");
    }
  }, [info]);

  // Connect on Mount & Disconnect on Unmount
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  // Handle Approve Question
  const handleApprove = async (questionId: string) => {
    try {
      setActionLoadingId(questionId);
      const targetSession = sessionInfo?.id || QA_DEFAULT_SESSION_ID;
      await approveQuestionApi(targetSession, questionId);

      // Optimistic update
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, status: "approved" } : q))
      );
      success("Question approved for stage presentation!");
    } catch (err: any) {
      console.error("Error approving question:", err);
      toastError(err?.message || "Failed to approve question.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Reject Question
  const handleReject = async (questionId: string) => {
    try {
      setActionLoadingId(questionId);
      const targetSession = sessionInfo?.id || QA_DEFAULT_SESSION_ID;
      await rejectQuestionApi(targetSession, questionId);

      // Optimistic update
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, status: "rejected" } : q))
      );
      info("Question rejected from stage stream.");
    } catch (err: any) {
      console.error("Error rejecting question:", err);
      toastError(err?.message || "Failed to reject question.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Categories list derived from current questions
  const categories = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (q.category) set.add(q.category);
    });
    return Array.from(set);
  }, [questions]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (statusFilter !== "all" && q.status !== statusFilter) return false;
      if (categoryFilter !== "all" && q.category !== categoryFilter) return false;

      if (search.trim()) {
        const query = search.toLowerCase();
        const inText = (q.text || "").toLowerCase().includes(query);
        const inAuthor = (q.author_name || "").toLowerCase().includes(query);
        const inCategory = (q.category || "").toLowerCase().includes(query);
        const inSummary = (q.ai_summary || "").toLowerCase().includes(query);
        if (!inText && !inAuthor && !inCategory && !inSummary) return false;
      }
      return true;
    });
  }, [questions, statusFilter, categoryFilter, search]);

  // Statistics
  const stats = useMemo(() => {
    const total = questions.length;
    const pending = questions.filter((q) => q.status === "pending").length;
    const approved = questions.filter((q) => q.status === "approved").length;
    const rejected = questions.filter((q) => q.status === "rejected").length;
    const totalVotes = questions.reduce((sum, q) => sum + (q.vote_count || 0), 0);
    return { total, pending, approved, rejected, totalVotes };
  }, [questions]);

  // Format Date helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Just now";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return dateStr;
    }
  };

  // Distinct vote badge colors based on vote count
  const getVoteBadgeClasses = (count: number) => {
    if (count >= 5) {
      return "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-800 shadow-2xs font-extrabold";
    }
    if (count >= 2) {
      return "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold";
    }
    if (count === 1) {
      return "bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 font-bold";
    }
    return "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 font-medium";
  };

  return (
    <>
      <PageMeta
        title="Live Q&A Management | KaizenCon Admin"
        description="Real-time WebSocket audience questions, live moderation table, and stage presentation feed."
      />

      <AdminPageContainer
        title="Live Conference Q&A Moderation"
        subtitle="Real-time WebSocket connection to KaizenCon Session Stream. Review, approve, and project live audience inquiries."
        actionButton={
          <div className="flex items-center gap-2">
            {/* WebSocket Status Indicator */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                connectionStatus === "connected"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  : connectionStatus === "connecting"
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                  : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-emerald-500 animate-pulse"
                    : connectionStatus === "connecting"
                    ? "bg-amber-500 animate-ping"
                    : "bg-red-500"
                }`}
              />
              <span>
                {connectionStatus === "connected"
                  ? "WebSocket Live"
                  : connectionStatus === "connecting"
                  ? "Connecting WS..."
                  : "Disconnected"}
              </span>
            </div>

            {/* Reconnect button if disconnected */}
            {connectionStatus === "disconnected" && (
              <button
                onClick={connectWebSocket}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 transition-colors"
              >
                Reconnect
              </button>
            )}

            {/* Stage Presenter Mode button */}
            <button
              onClick={() => setIsPresenterMode(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#AA2D7B] text-white hover:bg-[#8e2566] shadow-xs transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Podium Screen Mode
            </button>
          </div>
        }
      >
        {/* Session Info Ribbon */}
      
        {/* Error notification if any */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={connectWebSocket}
              className="font-bold underline ml-2 cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Live Questions</span>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            <span className="text-[11px] text-gray-400">Synced via WebSocket</span>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-2xs">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Pending Moderation</span>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.pending}</p>
            <span className="text-[11px] text-gray-400">Requires review</span>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 shadow-2xs">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Approved for Stage</span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.approved}</p>
            <span className="text-[11px] text-gray-400">Live on podium display</span>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-pink-200 dark:border-pink-900/50 shadow-2xs">
            <span className="text-xs font-medium text-pink-600 dark:text-pink-400">Total Audience Upvotes</span>
            <p className="text-2xl font-bold text-pink-600 dark:text-pink-400 mt-1">{stats.totalVotes}</p>
            <span className="text-[11px] text-gray-400">Delegate engagement</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 mb-5 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search live questions, delegate name, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 outline-none focus:border-[#AA2D7B]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-300 outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            {/* Status Tabs */}
            <div className="inline-flex p-0.5 bg-gray-200 dark:bg-gray-800 rounded-lg text-xs font-medium">
              {[
                { id: "all", label: "All" },
                { id: "pending", label: "Pending" },
                { id: "approved", label: "Approved" },
                { id: "rejected", label: "Rejected" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    statusFilter === st.id
                      ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-2xs font-semibold"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LIVE QUESTIONS DATA TABLE */}
        <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xs">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-left text-xs">
            <thead className="bg-gray-50/80 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3 min-w-[320px]">
                  Audience Question &amp; Summary
                </th>
                <th scope="col" className="px-4 py-3 w-20 text-center">
                  Votes
                </th>
                <th scope="col" className="px-4 py-3 min-w-[140px]">
                  Submitter
                </th>
                <th scope="col" className="px-4 py-3">
                  Category
                </th>
                <th scope="col" className="px-4 py-3">
                  Status
                </th>
                <th scope="col" className="px-4 py-3">
                  Time
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
              {filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {connectionStatus === "connecting" ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#AA2D7B] border-t-transparent rounded-full animate-spin" />
                        <span>Connecting to live Q&amp;A session stream...</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-700 dark:text-gray-300">No questions available in this session.</p>
                        <p className="text-xs text-gray-400">Incoming audience questions will appear here in real time as delegates submit them.</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((q) => {
                  const isLoading = actionLoadingId === q.id;

                  return (
                    <tr
                      key={q.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      {/* 1. Question Text & AI Summary Column */}
                      <td className="px-4 py-3 align-top">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                          {q.text}
                        </p>
                        {q.ai_summary && q.ai_summary !== q.text && (
                          <p className="mt-1 text-[11px] text-indigo-700 dark:text-indigo-300">
                            <span className="font-bold">AI Summary:</span> {q.ai_summary}
                          </p>
                        )}
                        <span className="text-[10px] text-gray-400 font-mono mt-1 block">ID: {q.id}</span>
                      </td>

                      {/* 2. Votes Column (2nd Column with distinct color badge) */}
                      <td className="px-4 py-3 align-top text-center whitespace-nowrap">
                        <div
                          className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-md text-xs border ${getVoteBadgeClasses(
                            q.vote_count || 0
                          )}`}
                          title={`${q.vote_count || 0} votes`}
                        >
                          <span className={q.vote_count ? "text-current" : "text-gray-400"}>▲</span>
                          <span>{q.vote_count || 0}</span>
                        </div>
                      </td>

                      {/* 3. Submitter Column */}
                      <td className="px-4 py-3 align-top text-gray-700 dark:text-gray-300 font-medium">
                        {q.author_name ? (
                          <span>{q.author_name}</span>
                        ) : (
                          <span className="italic text-gray-400">Anonymous</span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 align-top">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                          {q.category || "General"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            q.status === "approved"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200"
                              : q.status === "rejected"
                              ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              q.status === "approved"
                                ? "bg-emerald-500"
                                : q.status === "rejected"
                                ? "bg-red-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {q.status}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="px-4 py-3 align-top text-gray-400 whitespace-nowrap">
                        {formatDate(q.created_at)}
                      </td>

                      {/* Moderator Action Buttons */}
                      <td className="px-4 py-3 align-top text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-center">
                          {q.status !== "approved" && (
                            <button
                              type="button"
                              onClick={() => handleApprove(q.id)}
                              disabled={isLoading}
                              className="p-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center justify-center"
                              data-tooltip="Approve Question"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                            </button>
                          )}

                          {q.status !== "rejected" && (
                            <button
                              type="button"
                              onClick={() => handleReject(q.id)}
                              disabled={isLoading}
                              className="p-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center justify-center"
                              data-tooltip="Reject Question"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </AdminPageContainer>

      {/* FULLSCREEN PODIUM PRESENTER MODE */}
      {isPresenterMode && (
        <div
          className="fixed inset-0 z-50 p-6 md:p-8 flex flex-col overflow-y-auto transition-colors duration-200"
          style={{
            backgroundColor: "#FAF7F9",
            color: "#55355E",
          }}
        >
          {/* Top Bar Header */}
          <div
            className="flex items-center justify-between pb-5 px-6 py-4 rounded-2xl shadow-xs transition-colors"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #EADDE7",
            }}
          >
            <div className="flex items-center gap-3.5">
              <span
                className="w-3.5 h-3.5 rounded-full animate-pulse"
                style={{
                  backgroundColor: "#AA2D7B",
                  boxShadow: "0 0 12px rgba(170, 45, 123, 0.5)",
                }}
              />
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
                  <span style={{ color: "#55355E" }}>
                    KAIZENCON 2027 ·{" "}
                  </span>
                  <span
                    style={{
                      background: "linear-gradient(90deg, #7C3369 0%, #AA2D7B 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    LIVE STAGE Q&amp;A FEED
                  </span>
                </h1>
                <p
                  className="text-xs md:text-sm font-medium mt-0.5"
                  style={{ color: "#7B6282" }}
                >
                  {sessionInfo?.title || "Auditorium Live Discussion"} • {sessionInfo?.speaker_name || "Faculty Stage"}
                </p>
              </div>
            </div>

            {/* Actions: Exit Fullscreen */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPresenterMode(false)}
                className="px-4 py-2 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                style={{ backgroundColor: "#AA2D7B" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#8E2566")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#AA2D7B")}
              >
                ✕ Exit Fullscreen
              </button>
            </div>
          </div>

          {/* Active Questions Stream on Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-7 flex-1">
            {/* Approved Questions (Left Column) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <span
                  className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2"
                  style={{ color: "#AA2D7B" }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: "#AA2D7B" }}
                  />
                  Approved Audience Questions (Live)
                </span>
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "#FCE7F3",
                    color: "#AA2D7B",
                    border: "1px solid #FBCFE8",
                  }}
                >
                  {questions.filter((q) => q.status === "approved").length} Live
                </span>
              </div>

              {questions
                .filter((q) => q.status === "approved")
                .map((q) => (
                  <div
                    key={q.id}
                    className="p-6 rounded-2xl border transition-all"
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#EADDE7",
                      boxShadow: "0 4px 20px -2px rgba(85, 53, 94, 0.08)",
                    }}
                  >
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span
                        className="px-3 py-1 rounded-full font-bold text-xs"
                        style={{
                          backgroundColor: "#F3E8FF",
                          color: "#7C3369",
                          border: "1px solid #E9D5FF",
                        }}
                      >
                        {q.category || "General"}
                      </span>
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: (q.vote_count || 0) >= 5
                            ? "#FCE7F3"
                            : (q.vote_count || 0) >= 2
                            ? "#FEF3C7"
                            : (q.vote_count || 0) === 1
                            ? "#EFF6FF"
                            : "#F3F4F6",
                          color: (q.vote_count || 0) >= 5
                            ? "#AA2D7B"
                            : (q.vote_count || 0) >= 2
                            ? "#D97706"
                            : (q.vote_count || 0) === 1
                            ? "#2563EB"
                            : "#6B7280",
                          border: (q.vote_count || 0) >= 5
                            ? "1px solid #FBCFE8"
                            : (q.vote_count || 0) >= 2
                            ? "1px solid #FDE68A"
                            : (q.vote_count || 0) === 1
                            ? "1px solid #BFDBFE"
                            : "1px solid #E5E7EB",
                        }}
                      >
                        <span>▲</span>
                        <span>{q.vote_count || 0} votes</span>
                      </div>
                    </div>

                    <p
                      className="text-lg md:text-xl font-bold leading-relaxed mb-4"
                      style={{ color: "#3A1F42" }}
                    >
                      &ldquo;{q.text}&rdquo;
                    </p>

                    <div
                      className="flex items-center justify-between text-xs font-semibold pt-3 border-t"
                      style={{
                        borderColor: "#F5EEF4",
                        color: "#7B6282",
                      }}
                    >
                      <span
                        className="font-bold flex items-center gap-1.5"
                        style={{ color: "#55355E" }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#AA2D7B" }} />
                        {q.author_name || "Anonymous Delegate"}
                      </span>
                      <span style={{ color: "#9A81A1" }}>
                        {formatDate(q.created_at)}
                      </span>
                    </div>
                  </div>
                ))}

              {questions.filter((q) => q.status === "approved").length === 0 && (
                <div
                  className="p-10 rounded-2xl border text-center text-sm"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#EADDE7",
                    borderStyle: "dashed",
                    color: "#7B6282",
                  }}
                >
                  <p className="font-semibold mb-1" style={{ color: "#55355E" }}>
                    No questions approved for stage display yet.
                  </p>
                  <p className="text-xs" style={{ color: "#9A81A1" }}>
                    Click &ldquo;Push to Stage&rdquo; on incoming questions in the queue to project them live.
                  </p>
                </div>
              )}
            </div>

            {/* Pending Questions in Moderator Queue (Right Column) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <span
                  className="text-xs font-extrabold uppercase tracking-wider"
                  style={{ color: "#B45309" }}
                >
                  Incoming Moderator Queue
                </span>
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "#FEF3C7",
                    color: "#92400E",
                    border: "1px solid #FDE68A",
                  }}
                >
                  {questions.filter((q) => q.status === "pending").length} Pending
                </span>
              </div>

              {questions
                .filter((q) => q.status === "pending")
                .map((q) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl border transition-all"
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#FED7AA",
                      boxShadow: "0 4px 16px -2px rgba(180, 83, 9, 0.08)",
                    }}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span
                        className="px-2.5 py-0.5 rounded-md font-semibold text-[11px]"
                        style={{
                          backgroundColor: "#FFFBEB",
                          color: "#B45309",
                          border: "1px solid #FDE68A",
                        }}
                      >
                        Pending Moderation
                      </span>
                      <span
                        className="font-bold text-xs"
                        style={{ color: "#D97706" }}
                      >
                        ▲ {q.vote_count || 0} votes
                      </span>
                    </div>

                    <p
                      className="text-sm md:text-base font-semibold leading-normal mb-3"
                      style={{ color: "#2B1B2F" }}
                    >
                      &ldquo;{q.text}&rdquo;
                    </p>

                    <div
                      className="flex items-center justify-between text-xs pt-2.5 border-t"
                      style={{
                        borderColor: "#FEF3C7",
                        color: "#7B6282",
                      }}
                    >
                      <span className="font-medium" style={{ color: "#55355E" }}>
                        {q.author_name || "Anonymous"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleApprove(q.id)}
                        className="px-3.5 py-1.5 rounded-lg text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        style={{ backgroundColor: "#16A34A" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#15803D")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#16A34A")}
                      >
                        Push to Stage
                      </button>
                    </div>
                  </div>
                ))}

              {questions.filter((q) => q.status === "pending").length === 0 && (
                <div
                  className="p-10 rounded-2xl border text-center text-sm"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#EADDE7",
                    borderStyle: "dashed",
                    color: "#7B6282",
                  }}
                >
                  <p className="font-semibold" style={{ color: "#16A34A" }}>
                    Queue is clear. No pending questions.
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#7B6282" }}>
                    All audience inquiries have been moderated.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
