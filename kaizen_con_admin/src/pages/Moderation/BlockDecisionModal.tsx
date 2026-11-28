import React, { useRef, useState } from "react";
import { useToast } from "../../context/ToastContext";
import {
  ADMIN_NOTE_MAX,
  approveBlock,
  rejectBlock,
  ModerationApiError,
} from "../../services/moderationService";
import type { ModerationActionResult } from "../../services/moderationService";
import { ModalShell, btnSecondary, btnSuccess, btnDanger, Spinner } from "./ModerationUI";

export type BlockDecisionMode = "approve" | "reject";

interface Props {
  mode: BlockDecisionMode;
  blockId: number;
  summary: React.ReactNode;
  onClose: () => void;
  onDone: (result: ModerationActionResult, options: { banUser: boolean; removeContent: boolean } | null) => void;
}

const ToggleRow: React.FC<{
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  title: string;
  description: string;
  tone: "rose" | "brand";
}> = ({ id, checked, onChange, title, description, tone }) => (
  <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
    <label htmlFor={id} className="min-w-0 cursor-pointer">
      <span className="block text-xs font-bold text-gray-900 dark:text-gray-100">{title}</span>
      <span className="block text-[11px] text-gray-500 mt-0.5">{description}</span>
    </label>
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 w-9 h-5 rounded-full transition-colors cursor-pointer ${
        checked ? (tone === "rose" ? "bg-rose-600" : "bg-[#AA2D7B]") : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </button>
  </div>
);

export const BlockDecisionModal: React.FC<Props> = ({ mode, blockId, summary, onClose, onDone }) => {
  const { error: toastError } = useToast();
  const [banUser, setBanUser] = useState(false);
  const [removeContent, setRemoveContent] = useState(false);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const isApprove = mode === "approve";
  const canSubmit = !submitting && note.length <= ADMIN_NOTE_MAX;

  const submit = async () => {
    if (submittingRef.current || !canSubmit) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const res = isApprove
        ? await approveBlock(blockId, {
            ban_user: banUser,
            remove_content: removeContent,
            admin_note: note.trim(),
          })
        : await rejectBlock(blockId, { admin_note: note.trim() });
      onDone(res, isApprove ? { banUser, removeContent } : null);
    } catch (e) {
      const err = e as ModerationApiError;
      let msg = err?.message || "Request failed.";
      if (err?.status === 404 && !/not found/i.test(msg)) {
        msg = `Block #${blockId} was not found. ${msg}`;
      }
      setError(msg);
      toastError(msg);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      title={isApprove ? `Approve block #${blockId}?` : `Reject block #${blockId}?`}
      subtitle={
        isApprove
          ? "Approving confirms this block. Ban user and remove content only if you turn those options on."
          : "Rejecting dismisses this block and leaves the content in place."
      }
      onClose={onClose}
      closeDisabled={submitting}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={submitting} className={btnSecondary}>
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={!canSubmit} className={isApprove ? btnSuccess : btnDanger}>
            {submitting ? (
              <>
                <Spinner /> {isApprove ? "Approving..." : "Rejecting..."}
              </>
            ) : isApprove ? (
              "Approve block"
            ) : (
              "Reject block"
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
          <div className="space-y-2">
            <span className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Options
            </span>
            <ToggleRow
              id="block-ban-user"
              checked={banUser}
              onChange={setBanUser}
              title="Ban user"
              description="Ban the user this block is about."
              tone="rose"
            />
            <ToggleRow
              id="block-remove-content"
              checked={removeContent}
              onChange={setRemoveContent}
              title="Remove content"
              description="Remove the blocked content when this block is approved."
              tone="brand"
            />
          </div>
        )}

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="block-admin-note" className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Admin note <span className="normal-case font-normal text-gray-400">(optional)</span>
            </label>
            <span className={`text-[10.5px] ${note.length > ADMIN_NOTE_MAX ? "text-rose-500" : "text-gray-400"}`}>
              {note.length}/{ADMIN_NOTE_MAX}
            </span>
          </div>
          <textarea
            id="block-admin-note"
            rows={3}
            value={note}
            maxLength={ADMIN_NOTE_MAX}
            onChange={(e) => setNote(e.target.value)}
            placeholder={isApprove ? "Optional note about this approval." : "Optional note about this rejection."}
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

export default BlockDecisionModal;
