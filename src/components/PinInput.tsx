import { useEffect, useRef, type ChangeEvent, type KeyboardEvent } from "react";

import { PIN_LENGTH } from "../services/profiles";

interface PinInputProps {
  /** Digits entered so far, e.g. "12" mid-entry. */
  value: string;
  onChange: (value: string) => void;
  /** Fired once the last digit lands, for auto-submit. */
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  mask?: boolean;
  label?: string;
}

/**
 * Controlled group of single-digit boxes that together spell out the PIN.
 *
 * `value` is always a compact string, so the boxes fill strictly left to right
 * and can never hold a gap in the middle.
 */
function PinInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  mask = true,
  label = "PIN",
}: PinInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  const digits = Array.from(
    { length: PIN_LENGTH },
    (_, index) => value[index] ?? ""
  );

  function commit(next: string, focusAt: number) {
    const clamped = next.slice(0, PIN_LENGTH);
    onChange(clamped);
    inputsRef.current[Math.max(0, Math.min(focusAt, PIN_LENGTH - 1))]?.focus();
    if (clamped.length === PIN_LENGTH) onComplete?.(clamped);
  }

  function handleChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const typed = event.target.value.replace(/\D/g, "");
    if (!typed) return;

    // Overwrite from this box onward, which also makes pasting "1234" work.
    commit(value.slice(0, index) + typed, index + typed.length);
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();

      if (digits[index]) {
        // Delete this digit and pull the rest left.
        commit(value.slice(0, index) + value.slice(index + 1), index);
      } else if (index > 0) {
        commit(value.slice(0, index - 1) + value.slice(index), index - 1);
      }
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      commit(value.slice(0, index) + value.slice(index + 1), index);
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < PIN_LENGTH - 1) {
      event.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  }

  return (
    <div
      className="flex justify-center gap-3 md:gap-4"
      role="group"
      aria-label={label}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          type={mask ? "password" : "text"}
          inputMode="numeric"
          autoComplete="off"
          pattern="[0-9]*"
          maxLength={PIN_LENGTH}
          value={digit}
          disabled={disabled}
          aria-label={`${label} digit ${index + 1} of ${PIN_LENGTH}`}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={(e) => e.currentTarget.select()}
          className="w-14 h-16 md:w-16 md:h-20 text-center text-2xl md:text-3xl font-bold
                     rounded-xl bg-light-2 text-dark-0 caret-brand-2
                     border-2 border-transparent shadow-inner
                     focus:outline-none focus:border-brand-2 focus:bg-white
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
        />
      ))}
    </div>
  );
}

export default PinInput;
