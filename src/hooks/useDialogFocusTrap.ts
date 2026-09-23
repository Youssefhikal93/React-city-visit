import { useEffect, type RefObject } from "react";

interface DialogFocusTrapOptions<Element extends HTMLElement> {
  dialogRef: RefObject<Element | null>;
  initialFocusSelector: string;
  onDismiss: () => void;
}

const focusableSelector =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useDialogFocusTrap<Element extends HTMLElement>({
  dialogRef,
  initialFocusSelector,
  onDismiss,
}: DialogFocusTrapOptions<Element>): void {
  useEffect(() => {
    const dialog = dialogRef.current;
    const focusableElements = () =>
      Array.from(dialog?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
    const initialFocusTarget = dialog?.querySelector<HTMLElement>(
      initialFocusSelector,
    );

    initialFocusTarget?.focus();
    if (document.activeElement !== initialFocusTarget)
      focusableElements()[0]?.focus();

    function trapFocus(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
        return;
      }

      if (event.key !== "Tab") return;

      const elements = focusableElements();
      const firstElement = elements[0];
      const lastElement = elements.at(-1);
      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener("keydown", trapFocus);
    return () => window.removeEventListener("keydown", trapFocus);
  }, [dialogRef, initialFocusSelector, onDismiss]);
}
