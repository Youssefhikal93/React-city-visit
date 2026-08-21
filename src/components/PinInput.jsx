import { useEffect, useRef } from "react";

import { PIN_LENGTH } from "../services/profiles";

/**
 * Controlled group of single-digit boxes that together spell out the PIN.
 *
 * `value` is always a compact string of the digits entered so far ("12" while
 * mid-entry), so the boxes fill strictly left to right and can never hold a
 * gap in the middle.
 */
function PinInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  mask = true,
  label = "PIN",
}) {
  const inputsRef = useRef([]);

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  const digits = Array.from(
    { length: PIN_LENGTH },
    (_, index) => value[index] ?? ""
  );

  function commit(next, focusAt) {
    const clamped = next.slice(0, PIN_LENGTH);
    onChange(clamped);
    inputsRef.current[Math.max(0, Math.min(focusAt, PIN_LENGTH - 1))]?.focus();
    if (clamped.length === PIN_LENGTH) onComplete?.(clamped);
  }

  function handleChange(index, raw) {
    const typed = raw.replace(/\D/g, "");
    if (!typed) return;

    // Overwrite from this box onward, which also makes pasting "1234" work.
    const next = value.slice(0, index) + typed;
    commit(next, index + typed.length);
  }

  function handleKeyDown(index, event) {
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
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={(e) => e.target.select()}
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
