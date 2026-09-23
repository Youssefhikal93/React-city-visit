import { useEffect, useRef } from "react";

interface PhotoSourceSheetProps {
  disabled: boolean;
  onChooseCamera: () => void;
  onChooseGallery: () => void;
  onDismiss: () => void;
}

const focusableSelector =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function PhotoSourceSheet({
  disabled,
  onChooseCamera,
  onChooseGallery,
  onDismiss,
}: PhotoSourceSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sheet = sheetRef.current;
    const focusableElements = () =>
      Array.from(sheet?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);

    sheet?.querySelector<HTMLElement>("[data-photo-source]")?.focus();

    function trapFocus(event: KeyboardEvent) {
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
  }, [onDismiss]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-source-heading"
      className="fixed inset-0 z-[1000] flex items-end bg-dark-0/70 p-3 sm:items-center sm:justify-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
    >
      <div
        ref={sheetRef}
        className="w-full rounded-2xl border border-dark-2 bg-dark-1 p-5 shadow-2xl sm:max-w-md sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="photo-source-heading" className="text-xl font-bold text-light-2">
              Add a Memory
            </h2>
            <p className="mt-2 text-sm text-light-1">
              Choose where to get your photo.
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close photo source options"
            className="min-h-11 rounded-xl px-4 font-bold text-light-2 hover:bg-dark-2 focus:outline-none focus:ring-2 focus:ring-brand-2"
          >
            Close
          </button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onChooseGallery}
            data-photo-source
            disabled={disabled}
            className="min-h-16 rounded-xl border border-brand-1/60 bg-dark-2 px-4 py-3 font-bold text-light-2 transition-colors hover:bg-brand-2 hover:text-dark-1 focus:outline-none focus:ring-2 focus:ring-brand-2"
          >
            Gallery
          </button>
          <button
            type="button"
            onClick={onChooseCamera}
            disabled={disabled}
            className="min-h-16 rounded-xl bg-gradient-to-r from-brand-2 to-brand-1 px-4 py-3 font-bold text-dark-0 transition-all hover:from-brand-1 hover:to-brand-2 focus:outline-none focus:ring-2 focus:ring-brand-2"
          >
            Camera
          </button>
        </div>
      </div>
    </div>
  );
}

export default PhotoSourceSheet;
