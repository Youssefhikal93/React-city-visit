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
    <form
      className="rounded-xl border border-brand-2/40 bg-dark-2/40 p-4 sm:p-5"
      onSubmit={saveVisitDate}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-light-1 sm:text-sm">
            Edit visit date
          </h2>
          <p className="mt-1 text-sm text-light-1/80">
            Choose how precisely you remember this visit.
          </p>
        </div>
        <button
          className="min-h-11 rounded-lg px-3 text-sm font-semibold text-light-2 hover:bg-dark-1 focus:outline-none focus:ring-2 focus:ring-brand-2"
          disabled={isSaving}
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
      </div>

      <fieldset className="mt-4 flex flex-col gap-2 text-sm text-light-1 sm:flex-row sm:gap-4">
        <legend className="sr-only">Visit date precision</legend>
        <label className="flex items-center gap-2">
          <input
            checked={datePrecision === "day"}
            disabled={isSaving}
            name="visitDatePrecision"
            onChange={() => changePrecision("day")}
            type="radio"
          />
          Day, month and year
        </label>
        <label className="flex items-center gap-2">
          <input
            checked={datePrecision === "month"}
            disabled={isSaving}
            name="visitDatePrecision"
            onChange={() => changePrecision("month")}
            type="radio"
          />
          Month and year
        </label>
      </fieldset>

      <label
        className="mt-4 block text-sm font-semibold text-light-1"
        htmlFor="visit-date"
      >
        Visit date
      </label>
      <DatePicker
        className="mt-2 min-h-11 w-full rounded-lg border-none bg-light-2 p-2 text-base text-dark-0 focus:outline-none focus:ring-2 focus:ring-brand-2"
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

      <button
        className="mt-4 min-h-11 w-full rounded-xl bg-brand-2 px-5 py-3 text-sm font-bold uppercase text-dark-1 transition-colors hover:bg-brand-1 focus:outline-none focus:ring-2 focus:ring-brand-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        disabled={isSaving}
        type="submit"
      >
        {isSaving ? "Saving..." : "Save visit date"}
      </button>
    </form>
  );
}

export default VisitDateEditor;
