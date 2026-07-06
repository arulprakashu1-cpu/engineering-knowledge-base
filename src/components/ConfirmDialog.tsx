import { useEffect, useRef } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

/**
 * Accessible confirmation dialog for destructive actions.
 * - role="dialog" + aria-modal, labelled by its title/description.
 * - Escape closes; focus moves to the confirm button on open and is
 *   restored to the previously-focused element on close.
 */
export function ConfirmDialog({
  open, title, message, confirmLabel = "Delete", cancelLabel = "Cancel",
  danger = true, busy = false, onConfirm, onCancel,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      restoreRef.current?.focus?.();
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay no-print"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <div className={"modal-icon" + (danger ? " danger" : "")}>
          <AlertTriangle size={20} />
        </div>
        <h2 id="confirm-title" className="modal-title">{title}</h2>
        <div id="confirm-message" className="modal-message">{message}</div>
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={danger ? "btn-danger" : "btn-primary"}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? <Loader2 size={15} className="spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
