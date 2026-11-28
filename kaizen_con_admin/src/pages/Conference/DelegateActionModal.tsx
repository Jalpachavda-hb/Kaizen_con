import React, { useRef, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { ModalShell, btnSecondary, btnSuccess, btnDanger, Spinner } from "../Moderation/ModerationUI";
import {
  BAN_REASON_MAX,
  banDelegate,
  unbanDelegate,
  ModerationApiError,
} from "../../services/moderationService";
import type { ModerationActionResult } from "../../services/moderationService";
import {
  setModerationAdminKey,
  clearModerationAdminKey,
  useHasModerationAdminKey,
} from "../../services/moderationAdminKey";

export type DelegateActionMode = "ban" | "unban";

interface Props {
  mode: DelegateActionMode;
  delegateId: number;
  delegateName: string;
  onClose: () => void;
  onDone: (result: ModerationActionResult) => void;
}

export const DelegateActionModal: React.FC<Props> = ({ mode, delegateId, delegateName, onClose, onDone }) => {
  const { error: toastError } = useToast();
  const hasKey = useHasModerationAdminKey();
  const [reason, setReason] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const isBan = mode === "ban";
  const reasonOk = !isBan || (reason.trim().length > 0 && reason.length <= BAN_REASON_MAX);
  const keyOk = hasKey || adminKey.trim().length > 0;
  const canSubmit = !submitting && reasonOk && keyOk;

  const submit = async () => {
    if (submittingRef.current || !canSubmit) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      if (!hasKey) setModerationAdminKey(adminKey);
      const res = isBan
        ? await banDelegate(delegateId, { reason: reason.trim() })
        : await unbanDelegate(delegateId);
      onDone(res);
    } catch (e) {
      const err = e as ModerationApiError;
      let msg = err?.message || "Request failed.";
      if (err?.status === 404 && !/not found/i.test(msg)) {
        msg = `Delegate #${delegateId} was not found. ${msg}`;
      }
      if (err?.status === 403 || err?.kind === "missing_key") clearModerationAdminKey();
      setError(msg);
      toastError(msg);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      title={isBan ? `Ban ${delegateName}?` : `Unban ${delegateName}?`}
      subtitle={
        isBan
          ? `This calls the ban endpoint for delegate #${delegateId}. The account is marked Banned only after the server confirms it.`
          : `This calls the unban endpoint for delegate #${delegateId}. The account is marked Active only after the server confirms it.`
      }
      onClose={onClose}
      closeDisabled={submitting}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={submitting} className={btnSecondary}>
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={!canSubmit} className={isBan ? btnDanger : btnSuccess}>
            {submitting ? (
              <>
                <Spinner /> {isBan ? "Banning..." : "Unbanning..."}
              </>
            ) : isBan ? (
              "Ban delegate"
            ) : (
              "Unban delegate"
            )}
          </button>
        </>
      }
    >
      <fieldset disabled={submitting} className="space-y-4">
        <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700/60 bg-gray-50/60 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300">
          <div className="font-semibold text-gray-900 dark:text-gray-100">{delegateName}</div>
          <div className="text-[11px] text-gray-500 font-mono mt-0.5">Delegate ID #{delegateId}</div>
        </div>

        {isBan && (
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="delegate-ban-reason" className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Reason <span className="text-rose-500">*</span>
              </label>
              <span className={`text-[10.5px] ${reason.length > BAN_REASON_MAX ? "text-rose-500" : "text-gray-400"}`}>
                {reason.length}/{BAN_REASON_MAX}
              </span>
            </div>
            <textarea
              id="delegate-ban-reason"
              rows={3}
              value={reason}
              maxLength={BAN_REASON_MAX}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Terms of Use violation"
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#AA2D7B] focus:border-[#AA2D7B] resize-y min-h-[72px]"
            />
            {!reason.trim() && (
              <p className="text-[11px] text-gray-500 mt-1">A reason is required before this delegate can be banned.</p>
            )}
          </div>
        )}

        {!hasKey && (
          <div>
            <label htmlFor="delegate-admin-key" className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Moderation admin key <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="delegate-admin-key"
                type={showKey ? "text" : "password"}
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder="Required for this admin action"
                className="w-full pl-3 pr-14 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#AA2D7B] focus:border-[#AA2D7B] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-[11px] font-semibold text-gray-500 hover:text-[#AA2D7B] cursor-pointer"
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Sent only as the X-Admin-Key header. It stays in memory for this tab and is not saved in the browser.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs" role="alert">
            <strong className="font-semibold">Not processed.</strong> {error}
          </div>
        )}
      </fieldset>
    </ModalShell>
  );
};

export default DelegateActionModal;
