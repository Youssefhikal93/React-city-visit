import { useRef } from "react";
import { createPortal } from "react-dom";

import { useDialogFocusTrap } from "../hooks/useDialogFocusTrap";
import HomeCountrySelector from "./HomeCountrySelector";
import PlannedCountrySelector from "./PlannedCountrySelector";

interface CountryPreferenceSheetProps {
  preference: "home" | "planned";
  onDismiss: () => void;
}

function CountryPreferenceSheet({
  preference,
  onDismiss,
}: CountryPreferenceSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const label = preference === "home" ? "Home Country" : "Planned destination";

  useDialogFocusTrap({
    dialogRef: sheetRef,
    initialFocusSelector: "[data-country-preference]:not([disabled])",
    onDismiss,
  });

  return createPortal(
    <div
      aria-label={label}
      aria-modal="true"
      className="fixed inset-0 z-[1200] flex items-end bg-dark-0/70 p-3 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-[calc(4.75rem+env(safe-area-inset-bottom))]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
      role="dialog"
    >
      <div
        className="max-h-full w-full overflow-y-auto rounded-2xl border border-dark-2 bg-dark-1 shadow-2xl"
        ref={sheetRef}
      >
        <div className="flex justify-end px-3 pt-3">
          <button
            aria-label={`Close ${label}`}
            className="min-h-11 rounded-lg px-3 text-sm font-semibold text-light-1 hover:bg-dark-2 focus:outline-none focus:ring-2 focus:ring-brand-2"
            onClick={onDismiss}
            type="button"
          >
            Close
          </button>
        </div>
        {preference === "home" ? (
          <HomeCountrySelector />
        ) : (
          <PlannedCountrySelector />
        )}
      </div>
    </div>,
    document.body,
  );
}

export default CountryPreferenceSheet;
