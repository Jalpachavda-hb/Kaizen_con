import { useState, useEffect, useCallback, useRef } from "react";
import Swal from "sweetalert2";
import PageMeta from "../../components/common/PageMeta";
import { AdminPageContainer } from "../../components/common/AdminPageContainer";
import { TablePagination } from "../../components/common/TablePagination";
import {
  DelegateMultiSelect,
  DelegateOption,
  formatDelegateName,
} from "../../components/common/DelegateMultiSelect";
import { NotificationBellIcon } from "../../icons/conferenceIcons";
import { useToast } from "../../context/ToastContext";
import { getDelegates, sendNotification, getNotifications } from "../../api/ApiPath";
import {
  NOTIFICATION_TITLE_MAX,
  NOTIFICATION_BODY_MAX,
  RecipientMode,
  CustomDataRow,
  FormErrors,
  buildNotificationPayload,
  validateNotificationForm,
  getDeliveryStatus,
  DELIVERY_STATUS_META,
} from "../../utils/notificationPayload";

export interface NotificationRecord {
  id: number;
  title: string;
  body: string;
  data?: Record<string, string> | null;
  delegate_ids?: number[] | null;
  target_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
}

interface SendResult {
  code: number;
  message: string;
  notification: NotificationRecord | null;
}

const formatDateTime = (iso?: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const isBroadcastRecord = (n: NotificationRecord) => !Array.isArray(n.delegate_ids) || n.delegate_ids.length === 0;

const inputClass = (hasError: boolean) =>
  `w-full px-3 py-2 text-xs rounded-lg border ${
    hasError ? "border-rose-400 dark:border-rose-700" : "border-gray-200 dark:border-gray-700"
  } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#AA2D7B] focus:border-[#AA2D7B] transition-colors`;

const labelClass = "block text-[11px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5";

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">{msg}</p> : null;

export default function NotificationsPage() {
  const { success: toastSuccess, error: toastError } = useToast();

  // ---------- Delegates ----------
  const [delegates, setDelegates] = useState<DelegateOption[]>([]);
  const [delegatesLoading, setDelegatesLoading] = useState(true);
  const [delegatesError, setDelegatesError] = useState<string | null>(null);

  const loadDelegates = useCallback(async () => {
    setDelegatesLoading(true);
    setDelegatesError(null);
    try {
      const res = await getDelegates();
      const list: unknown[] = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
      const parsed = list
        .filter((d): d is DelegateOption => !!d && typeof d === "object" && Number.isInteger(Number((d as DelegateOption).id)))
        .map((d) => ({ ...d, id: Number(d.id) }))
        .sort((a, b) => formatDelegateName(a).localeCompare(formatDelegateName(b)));
      setDelegates(parsed);
    } catch (e: unknown) {
      setDelegatesError((e as Error)?.message || "Failed to load delegates.");
    } finally {
      setDelegatesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDelegates();
  }, [loadDelegates]);

  // ---------- Form ----------
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<RecipientMode>("selected");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [customData, setCustomData] = useState<CustomDataRow[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false); // hard guard against double-submit before re-render
  const [sendError, setSendError] = useState<string | null>(null);
  const [result, setResult] = useState<SendResult | null>(null);

  const formInput = { title, body, mode, delegateIds: selectedIds, customData };

  // Re-validate live after the first submit attempt
  useEffect(() => {
    if (submitted) setErrors(validateNotificationForm(formInput));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body, mode, selectedIds, customData, submitted]);

  const resetForm = () => {
    setTitle("");
    setBody("");
    setMode("selected");
    setSelectedIds([]);
    setCustomData([]);
    setAdvancedOpen(false);
    setErrors({});
    setSubmitted(false);
    setSendError(null);
  };

  const addCustomRow = () => {
    setAdvancedOpen(true);
    setCustomData((rows) => [...rows, { key: "", value: "" }]);
  };
  const updateCustomRow = (idx: number, patch: Partial<CustomDataRow>) =>
    setCustomData((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const removeCustomRow = (idx: number) => setCustomData((rows) => rows.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sendingRef.current) return;

    setSubmitted(true);
    const v = validateNotificationForm(formInput);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    const payload = buildNotificationPayload(formInput);

    if (mode === "broadcast") {
      const confirm = await Swal.fire({
        title: "Broadcast to all devices?",
        text: "This notification will be pushed to every registered delegate device.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#AA2D7B",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, broadcast",
        cancelButtonText: "Cancel",
      });
      if (!confirm.isConfirmed) return;
    }

    sendingRef.current = true;
    setSending(true);
    setSendError(null);
    setResult(null);

    try {
      const res: SendResult = await sendNotification(payload);
      setResult(res);
      resetForm();

      const status = res.notification ? getDeliveryStatus(res.notification) : "pending";
      if (status === "delivered") toastSuccess("Notification delivered.");
      else if (status === "partial") toastError("Notification partially delivered — see delivery summary.");
      else if (status === "failed") toastError("Notification saved, but delivery failed.");
      else toastSuccess("Notification saved — no push was delivered. See delivery summary.");

      loadHistory(0);
      setHistoryPage(1);
    } catch (err: unknown) {
      const msg = (err as Error)?.message || "Failed to send notification.";
      setSendError(msg); // form values are preserved on failure
      toastError(msg);
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  // ---------- History ----------
  const [history, setHistory] = useState<NotificationRecord[]>([]);
  const [historyCount, setHistoryCount] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const [historyDelegate, setHistoryDelegate] = useState<string>("");

  const loadHistory = useCallback(
    async (offsetOverride?: number) => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const offset = offsetOverride ?? (historyPage - 1) * historyPageSize;
        const res = await getNotifications({
          offset,
          limit: historyPageSize,
          delegateId: historyDelegate ? Number(historyDelegate) : null,
        });
        setHistory(res.results as NotificationRecord[]);
        setHistoryCount(res.count);
      } catch (e: unknown) {
        setHistoryError((e as Error)?.message || "Failed to load notification history.");
      } finally {
        setHistoryLoading(false);
      }
    },
    [historyPage, historyPageSize, historyDelegate]
  );

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const [expandedHistory, setExpandedHistory] = useState<number | null>(null);

  // ---------- Render helpers ----------
  const resultNotification = result?.notification ?? null;
  const resultStatus = resultNotification ? getDeliveryStatus(resultNotification) : null;

  const delegateNameById = (id: number) => {
    const d = delegates.find((x) => x.id === id);
    return d ? formatDelegateName(d) : `Delegate #${id}`;
  };

  return (
    <>
      <PageMeta
        title="Push Notifications | Kaizen Con 2027"
        description="Manage and send notifications to KaizenCon delegates."
      />

      <AdminPageContainer
        title="Push Notifications"
        subtitle="Manage and send notifications to KaizenCon delegates."
      >
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          {/* ================= Composer ================= */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="xl:col-span-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 bg-[#faedf5]/60 dark:bg-gray-800/60">
              <div className="w-9 h-9 rounded-xl bg-[#AA2D7B]/10 text-[#AA2D7B] flex items-center justify-center shrink-0">
                <NotificationBellIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Send Notification</h2>
                <p className="text-[11px] text-gray-500">Compose a push notification for the delegate app.</p>
              </div>
            </div>

            <fieldset disabled={sending} className="p-5 space-y-5">
              {/* Title */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="notif-title" className={labelClass}>
                    Notification Title <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[10.5px] ${title.length > NOTIFICATION_TITLE_MAX ? "text-rose-500" : "text-gray-400"}`}>
                    {title.length}/{NOTIFICATION_TITLE_MAX}
                  </span>
                </div>
                <input
                  id="notif-title"
                  type="text"
                  value={title}
                  maxLength={NOTIFICATION_TITLE_MAX}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Session reminder"
                  className={inputClass(!!errors.title)}
                />
                <FieldError msg={errors.title} />
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="notif-body" className={labelClass}>
                    Notification Message <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[10.5px] ${body.length > NOTIFICATION_BODY_MAX ? "text-rose-500" : "text-gray-400"}`}>
                    {body.length}/{NOTIFICATION_BODY_MAX}
                  </span>
                </div>
                <textarea
                  id="notif-body"
                  rows={4}
                  value={body}
                  maxLength={NOTIFICATION_BODY_MAX}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="e.g. The next session starts in 10 minutes."
                  className={`${inputClass(!!errors.body)} resize-y min-h-[90px]`}
                />
                <FieldError msg={errors.body} />
              </div>

              {/* Recipients */}
              <div>
                <span className={labelClass}>
                  Recipients <span className="text-rose-500">*</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3" role="radiogroup">
                  {([
                    {
                      value: "selected" as const,
                      title: "Selected Delegates",
                      desc: "Send to specific delegates' registered devices.",
                    },
                    {
                      value: "broadcast" as const,
                      title: "Broadcast to All",
                      desc: "Send to every registered device.",
                    },
                  ]).map((opt) => {
                    const active = mode === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                          active
                            ? "border-[#AA2D7B] bg-[#faedf5]/60 dark:bg-pink-950/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-[#AA2D7B]/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="recipient-mode"
                          value={opt.value}
                          checked={active}
                          onChange={() => setMode(opt.value)}
                          className="mt-0.5 accent-[#AA2D7B]"
                        />
                        <span>
                          <span className="block text-xs font-bold text-gray-900 dark:text-gray-100">{opt.title}</span>
                          <span className="block text-[11px] text-gray-500 mt-0.5">{opt.desc}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>

                {mode === "selected" ? (
                  <>
                    <DelegateMultiSelect
                      delegates={delegates}
                      selectedIds={selectedIds}
                      onChange={setSelectedIds}
                      disabled={sending}
                      loading={delegatesLoading}
                      error={delegatesError}
                      onRetry={loadDelegates}
                      hasError={!!errors.recipients}
                    />
                    <FieldError msg={errors.recipients} />
                  </>
                ) : (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-[11.5px] flex items-start gap-2">
                    <svg className="w-4 h-4 shrink-0 mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <span>
                      Broadcast mode: this notification will be sent to <strong>every registered device</strong>. Individual
                      delegate selection is disabled. Delivery depends on how many devices are registered.
                    </span>
                  </div>
                )}
              </div>

              {/* Advanced: custom data */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setAdvancedOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-left cursor-pointer"
                  aria-expanded={advancedOpen}
                >
                  <span>
                    <span className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                      Advanced Options – Custom Notification Data
                    </span>
                    <span className="block text-[11px] text-gray-500 mt-0.5">
                      Optional key-value pairs for the app (e.g. type, schedule_id, screen).
                      {customData.filter((r) => r.key.trim()).length > 0 &&
                        ` · ${customData.filter((r) => r.key.trim()).length} field(s)`}
                    </span>
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {advancedOpen && (
                  <div className="px-3.5 pb-3.5 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                    {customData.length === 0 && (
                      <p className="text-[11px] text-gray-400">No custom data. The notification will be sent without a data payload.</p>
                    )}
                    {customData.map((row, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={row.key}
                          onChange={(e) => updateCustomRow(idx, { key: e.target.value })}
                          placeholder="Key (e.g. screen)"
                          aria-label={`Custom data key ${idx + 1}`}
                          className={`${inputClass(false)} flex-1 font-mono`}
                        />
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e) => updateCustomRow(idx, { value: e.target.value })}
                          placeholder="Value (e.g. schedule)"
                          aria-label={`Custom data value ${idx + 1}`}
                          className={`${inputClass(false)} flex-1 font-mono`}
                        />
                        <button
                          type="button"
                          onClick={() => removeCustomRow(idx)}
                          className="p-2 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 cursor-pointer shrink-0"
                          aria-label={`Remove custom data field ${idx + 1}`}
                          data-tooltip="Remove field"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <FieldError msg={errors.customData} />
                    <button
                      type="button"
                      onClick={addCustomRow}
                      className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#AA2D7B] hover:text-[#D85A9A] cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add field
                    </button>
                  </div>
                )}
              </div>

              {sendError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs">
                  <strong className="font-semibold">Notification was not sent.</strong> {sendError}
                  <span className="block text-[11px] mt-0.5 opacity-80">Your entries have been kept — fix the issue and try again.</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#AA2D7B] hover:bg-[#D85A9A] rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <NotificationBellIcon className="w-3.5 h-3.5" />
                      {mode === "broadcast" ? "Broadcast Notification" : "Send Notification"}
                    </>
                  )}
                </button>
              </div>
            </fieldset>
          </form>

          {/* ================= Delivery Response ================= */}
          <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden self-start">
            <div className="px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/60">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Delivery Response</h2>
              <p className="text-[11px] text-gray-500">Result returned by the notifications API for the last send.</p>
            </div>

            {!result ? (
              <div className="p-8 text-center text-xs text-gray-400">
                <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto mb-2.5">
                  <NotificationBellIcon className="w-5 h-5" />
                </div>
                Send a notification to see its saved and delivery status here.
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {/* Saved vs Delivered — two distinct indicators */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/20">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Saved</div>
                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mt-0.5 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Yes{result.code ? ` (HTTP ${result.code})` : ""}
                    </div>
                  </div>
                  <div
                    className={`p-2.5 rounded-lg border ${
                      resultStatus ? DELIVERY_STATUS_META[resultStatus].panelClass : "bg-gray-50 border-gray-200 text-gray-600"
                    }`}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Delivery</div>
                    <div className="text-xs font-bold mt-0.5">
                      {resultStatus ? DELIVERY_STATUS_META[resultStatus].label : "Unknown"}
                    </div>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-lg border text-[11.5px] ${
                    resultStatus ? DELIVERY_STATUS_META[resultStatus].panelClass : "bg-gray-50 border-gray-200 text-gray-700"
                  }`}
                >
                  {resultStatus
                    ? DELIVERY_STATUS_META[resultStatus].description
                    : "The API did not return notification details, so delivery cannot be confirmed."}
                  {result.message && (
                    <span className="block mt-1.5 opacity-90">
                      <strong className="font-semibold">Server message:</strong> {result.message}
                    </span>
                  )}
                </div>

                {resultNotification && (
                  <>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: "Target Devices", value: resultNotification.target_count, cls: "text-gray-900 dark:text-white" },
                        { label: "Sent", value: resultNotification.sent_count, cls: "text-emerald-600 dark:text-emerald-400" },
                        { label: "Failed", value: resultNotification.failed_count, cls: "text-rose-600 dark:text-rose-400" },
                      ].map((s) => (
                        <div key={s.label} className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800">
                          <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{s.label}</div>
                          <div className={`text-lg font-black mt-0.5 ${s.cls}`}>{Number(s.value) || 0}</div>
                        </div>
                      ))}
                    </div>

                    <dl className="text-xs divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg">
                      {[
                        ["Notification ID", `#${resultNotification.id}`],
                        ["Title", resultNotification.title],
                        [
                          "Recipients",
                          isBroadcastRecord(resultNotification)
                            ? "Broadcast (all registered devices)"
                            : `${resultNotification.delegate_ids!.length} selected delegate(s)`,
                        ],
                        ["Created", formatDateTime(resultNotification.created_at)],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-3 px-3 py-2">
                          <dt className="text-gray-500 shrink-0">{k}</dt>
                          <dd className="font-semibold text-gray-800 dark:text-gray-200 text-right break-words min-w-0">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= History ================= */}
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-3">
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Notification History</h2>
              <p className="text-[11px] text-gray-500">
                {historyCount} notification{historyCount === 1 ? "" : "s"} on record, newest first.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={historyDelegate}
                onChange={(e) => {
                  setHistoryDelegate(e.target.value);
                  setHistoryPage(1);
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 max-w-[220px] focus:outline-none focus:ring-1 focus:ring-[#AA2D7B]"
                aria-label="Filter history by delegate"
              >
                <option value="">All notifications</option>
                {delegates.map((d) => (
                  <option key={d.id} value={d.id}>
                    {formatDelegateName(d)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => loadHistory()}
                disabled={historyLoading}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-[#AA2D7B] transition-colors cursor-pointer"
                title="Refresh history"
              >
                <svg className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin text-[#AA2D7B]" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {historyError ? (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
              <span>{historyError}</span>
              <button
                onClick={() => loadHistory()}
                className="px-2 py-1 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 rounded font-semibold text-[11px] transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : historyLoading && history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-xs">
              <svg className="w-7 h-7 text-[#AA2D7B] animate-spin mb-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Loading notification history...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 text-xs text-gray-500">
              {historyDelegate ? "No notifications have targeted this delegate." : "No notifications have been sent yet."}
            </div>
          ) : (
            <div className={`overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 ${historyLoading ? "opacity-60" : ""}`}>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 font-semibold uppercase tracking-wider text-[11px] bg-gray-50/80 dark:bg-gray-800/60">
                    <th className="py-3 px-4 w-16 whitespace-nowrap">ID</th>
                    <th className="py-3 px-4 min-w-[240px]">Notification</th>
                    <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Recipients</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Target</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Sent</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Failed</th>
                    <th className="py-3 px-4 whitespace-nowrap">Status</th>
                    <th className="py-3 px-4 whitespace-nowrap">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/70">
                  {history.map((n) => {
                    const status = getDeliveryStatus(n);
                    const meta = DELIVERY_STATUS_META[status];
                    const broadcast = isBroadcastRecord(n);
                    const dataEntries = n.data && typeof n.data === "object" ? Object.entries(n.data) : [];
                    const expanded = expandedHistory === n.id;
                    return (
                      <tr key={n.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors align-top">
                        <td className="py-3 px-4 font-mono text-gray-500">#{n.id}</td>
                        <td className="py-3 px-4 max-w-[360px]">
                          <div className="font-bold text-gray-900 dark:text-gray-100 break-words">{n.title || "—"}</div>
                          <div className={`text-[11.5px] text-gray-500 mt-0.5 break-words ${expanded ? "whitespace-pre-line" : "line-clamp-1"}`}>
                            {n.body || "—"}
                          </div>
                          {expanded && dataEntries.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {dataEntries.map(([k, v]) => (
                                <span key={k} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                  {k}: {String(v)}
                                </span>
                              ))}
                            </div>
                          )}
                          {((n.body || "").length > 60 || dataEntries.length > 0) && (
                            <button
                              type="button"
                              onClick={() => setExpandedHistory(expanded ? null : n.id)}
                              className="mt-1 text-[11px] font-semibold text-[#AA2D7B] hover:underline cursor-pointer"
                            >
                              {expanded ? "Show less" : "Show details"}
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {broadcast ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                              Broadcast
                            </span>
                          ) : (
                            <span
                              className="text-gray-700 dark:text-gray-300"
                              title={n.delegate_ids!.slice(0, 20).map(delegateNameById).join(", ")}
                            >
                              {n.delegate_ids!.length === 1
                                ? delegateNameById(n.delegate_ids![0])
                                : `${n.delegate_ids!.length} delegates`}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-gray-800 dark:text-gray-200">{Number(n.target_count) || 0}</td>
                        <td className="py-3 px-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">{Number(n.sent_count) || 0}</td>
                        <td className="py-3 px-4 text-center font-semibold text-rose-600 dark:text-rose-400">{Number(n.failed_count) || 0}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.badgeClass}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{formatDateTime(n.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <TablePagination
                currentPage={historyPage}
                totalItems={historyCount}
                pageSize={historyPageSize}
                onPageChange={setHistoryPage}
                onPageSizeChange={(s) => {
                  setHistoryPageSize(s);
                  setHistoryPage(1);
                }}
                itemName="notifications"
              />
            </div>
          )}
        </div>
      </AdminPageContainer>
    </>
  );
}
