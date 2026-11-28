import React, { useRef, useState } from "react";
import {
  ADMIN_NOTE_MAX,
  approveReport,
  rejectReport,
  ModerationApiError,
} from "../../services/moderationService";
import type { ModerationActionResult } from "../../services/moderationService";
import { ModalShell, btnSecondary, btnPrimary, btnDanger, Spinner } from "./ModerationUI";

export type DecisionMode = "approve" | "reject";

interface Props {
  mode: DecisionMode;
  reportId: number;
  /** One-line description of the report shown in the confirmation. */
  summary: React.ReactNode;
  onClose: () => void;
  onDone: (result: ModerationActionResult, banUser: boolean | null) => void;
}

export const ReportDecisionModal: React.FC<Props> = ({ mode, reportId, summary, onClose, onDone }) => {
  // No preselection for the ban choice: the API defaults ban_user to true, so the admin
  // must make that call explicitly rather than ban someone by accident.
  const [banUser, setBanUser] = useState<boolean | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const isApprove = mode === "approve";
  const canSubmit = !submitting && (!isApprove || banUser !== null) && note.length <= ADMIN_NOTE_MAX;

  const submit = async () => {
    if (submittingRef.current || !canSubmit) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const res = isApprove
        ? await approveReport(reportId, { ban_user: banUser === true, admin_note: note.trim() })
        : await rejectReport(reportId, { admin_note: note.trim() });
      onDone(res, isApprove ? banUser : null);
    } catch (e) {
      const err = e as ModerationApiError;
      let msg = err?.message || "Request failed.";
      if (err?.status === 404) msg = `Report #${reportId} was not found — it may have been removed. ${msg}`;
      if (err?.status === 409) msg = `Report #${reportId} has already been processed. ${msg}`;
      setError(msg);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      title={isApprove ? `Approve report #${reportId}?` : `Reject report #${reportId}?`}
      subtitle={
        isApprove
          ? "Approving upholds the report against the reported content."
          : "Rejecting dismisses the report and leaves the content in place."
      }
      onClose={onClose}
      closeDisabled={submitting}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={submitting} className={btnSecondary}>
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={!canSubmit} className={isApprove ? btnPrimary : btnDanger}>
            {submitting ? (
              <>
                <Spinner /> {isApprove ? "Approving..." : "Rejecting..."}
              </>
            ) : isApprove ? (
              banUser ? "Approve & ban user" : "Approve report"
            ) : (
              "Reject report"
            )}
          </button>
        </>
      }
    >
      <fieldset disabled={submitting} className="space-y-4">
        <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700/60 bg-gray-50/60 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300">
          {summary}
        </div>

        {isApprove && (
          <div>
            <span className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Action on the reported user <span className="text-rose-500">*</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="radiogroup">
              {[
                { value: false, title: "Approve only", desc: "Uphold the report without banning the user." },
                { value: true, title: "Approve & ban user", desc: "Also ban the reported user (ban_user: true)." },
              ].map((opt) => {
                const active = banUser === opt.value;
                return (
                  <label
                    key={String(opt.value)}
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      active
                        ? opt.value
                          ? "border-rose-400 bg-rose-50/70 dark:bg-rose-950/20"
                          : "border-[#AA2D7B] bg-[#faedf5]/60 dark:bg-pink-950/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-[#AA2D7B]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="ban-user"
                      checked={active}
                      onChange={() => setBanUser(opt.value)}
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
          </div>
        )}

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="admin-note" className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Admin note <span className="normal-case font-normal text-gray-400">(optional)</span>
            </label>
            <span className={`text-[10.5px] ${note.length > ADMIN_NOTE_MAX ? "text-rose-500" : "text-gray-400"}`}>
              {note.length}/{ADMIN_NOTE_MAX}
            </span>
          </div>
          <textarea
            id="admin-note"
            rows={3}
            value={note}
            maxLength={ADMIN_NOTE_MAX}
            onChange={(e) => setNote(e.target.value)}
            placeholder={isApprove ? "e.g. Confirmed abusive language." : "e.g. Content does not violate guidelines."}
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#AA2D7B] focus:border-[#AA2D7B] resize-y min-h-[72px]"
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs" role="alert">
            <strong className="font-semibold">Not processed.</strong> {error}
          </div>
        )}
      </fieldset>
    </ModalShell>
  );
};

export default ReportDecisionModal;
