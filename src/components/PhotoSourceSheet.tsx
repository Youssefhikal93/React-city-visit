import { useRef } from "react";
import { createPortal } from "react-dom";

import { useDialogFocusTrap } from "../hooks/useDialogFocusTrap";
interface PhotoSourceSheetProps {
  disabled: boolean;
  onChooseCamera: () => void;
  onChooseGallery: () => void;
  onDismiss: () => void;
}

function PhotoSourceSheet({
  disabled,
  onChooseCamera,
  onChooseGallery,
  onDismiss,
}: PhotoSourceSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useDialogFocusTrap({
    dialogRef: sheetRef,
    initialFocusSelector: "[data-photo-source]",
    onDismiss,
  });

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-source-heading"
      className="fixed inset-0 z-[1200] flex items-end bg-dark-0/70 p-3 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:items-center sm:justify-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
    >
      <div
        ref={sheetRef}
        className="max-h-full w-full overflow-y-auto rounded-2xl border border-dark-2 bg-dark-1 p-5 shadow-2xl sm:max-w-md sm:p-6"
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
    </div>,
    document.body
  );
}

export default PhotoSourceSheet;
