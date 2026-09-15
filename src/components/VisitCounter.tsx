import { useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { useCities } from "../context/CitiesContext";
import type { City } from "../types";

function VisitCounter({ city }: { city: City }) {
  const { updateCity } = useCities();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const count = city.visitCount ?? 1;
  async function saveCount(next: number) {
    setIsSaving(true);
    setError("");
    try {
      await updateCity(city.id, { visitCount: next });
    } catch {
      setError("Couldn't save visits. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }
  return (
    <div className="visit-counter-wrap">
      <div
        className="visit-counter"
        role="group"
        aria-label={"Visits to " + city.cityName}
      >
        <button
          type="button"
          aria-label={"Fewer visits to " + city.cityName}
          disabled={isSaving || count <= 1}
          onClick={() => saveCount(count - 1)}
        >
          <FiMinus aria-hidden="true" />
        </button>
        <span aria-live="polite">
          <strong>{count}</strong>
          <small>{count === 1 ? "visit" : "visits"}</small>
        </span>
        <button
          type="button"
          aria-label={"More visits to " + city.cityName}
          disabled={isSaving}
          onClick={() => saveCount(count + 1)}
        >
          <FiPlus aria-hidden="true" />
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
export default VisitCounter;
