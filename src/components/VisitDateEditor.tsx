import { useState, type FormEvent } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useCities } from "../context/CitiesContext";
import {
  isValidVisitDate,
  serializeVisitDate,
  visitDateForPicker,
} from "../services/visitDate";
import type { City, VisitDatePrecision } from "../types";

interface VisitDateEditorProps {
  city: City;
  onCancel: () => void;
  onSaved: () => void;
}

function VisitDateEditor({ city, onCancel, onSaved }: VisitDateEditorProps) {
  const { updateCity } = useCities();
  const [selectedDate, setSelectedDate] = useState(() =>
    visitDateForPicker(city.date, city.datePrecision),
  );
  const [datePrecision, setDatePrecision] = useState<VisitDatePrecision>(
    city.datePrecision,
  );
  const [hasInvalidDateInput, setHasInvalidDateInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function chooseDate(nextDate: Date | null) {
    setSelectedDate(nextDate);
    setHasInvalidDateInput(false);
  }

  function changePrecision(nextPrecision: VisitDatePrecision) {
    setDatePrecision(nextPrecision);
    setHasInvalidDateInput(false);
  }

  async function saveVisitDate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hasInvalidDateInput || !isValidVisitDate(selectedDate)) {
      setError("Choose a valid visit date.");
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      const savedCity = await updateCity(city.id, {
        date: serializeVisitDate(selectedDate, datePrecision),
        datePrecision,
      });
      if (!savedCity) {
        setError("Couldn't save the visit date. Please try again.");
        return;
      }
      onSaved();
    } catch {
      setError("Couldn't save the visit date. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="visit-date-editor" onSubmit={saveVisitDate}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="eyebrow">EDIT VISIT DATE</h2>
          <p className="mt-1 text-sm text-[#a0b5b1]">
            Choose how precisely you remember this visit.
          </p>
        </div>
        <button
          className="visit-date-cancel"
          disabled={isSaving}
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
      </div>

      <fieldset className="visit-date-precision">
        <legend className="sr-only">Visit date precision</legend>
        {(
          [
            ["day", "Day, month and year"],
            ["month", "Month and year"],
          ] as const
        ).map(([precision, label]) => (
          <label key={precision}>
            <input
              checked={datePrecision === precision}
              className="sr-only"
              disabled={isSaving}
              name="visitDatePrecision"
              onChange={() => changePrecision(precision)}
              type="radio"
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>

      <label className="visit-date-label" htmlFor="visit-date">
        Visit date
      </label>
      <DatePicker
        calendarClassName="journal-datepicker"
        className="visit-date-input"
        dateFormat={datePrecision === "month" ? "MM/yyyy" : "dd/MM/yyyy"}
        disabled={isSaving}
        id="visit-date"
        onChange={chooseDate}
        onChangeRaw={() => setHasInvalidDateInput(true)}
        placeholderText={datePrecision === "month" ? "MM/YYYY" : "DD/MM/YYYY"}
        selected={selectedDate}
        showMonthYearPicker={datePrecision === "month"}
        wrapperClassName="w-full"
      />

      {error && (
        <p className="mt-3 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      <button className="visit-date-save" disabled={isSaving} type="submit">
        {isSaving ? "Saving..." : "Save visit date"}
      </button>
    </form>
  );
}

export default VisitDateEditor;
