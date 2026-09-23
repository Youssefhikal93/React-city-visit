import { findSavedCity } from "../services/cityIdentity";
import { cityDetailTarget } from "../map/mapBehaviour";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useURLPosition } from "../hooks/useURLPosition";
import Message from "../components/Message";
import Spinner from "./Spinner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCities } from "../context/CitiesContext";
import { reverseGeocode } from "../services/geocoding";
import type { VisitDatePrecision } from "../types";

export function convertToEmoji(countryCode: string) {
  return (
    <img
      src={`https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`}
      alt={`Flag of ${countryCode}`}
      className="w-6 h-4 ml-2"
    />
  );
}

function Form() {
  const navigate = useNavigate();
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState(new Date());
  const [datePrecision, setDatePrecision] = useState<VisitDatePrecision>("day");
  const [notes, setNotes] = useState("");
  const [lat, lng] = useURLPosition();
  const [isLoadingGeoCoding, setIsLoadingGeoCoding] = useState(false);
  const [emoji, setEmoji] = useState("");
  const [error, setError] = useState("");
  const { createCity, isLoading, cities } = useCities();

  useEffect(() => {
    if (!lat && !lng) return;

    async function fetchCityData() {
      try {
        setIsLoadingGeoCoding(true);
        setError("");
        const place = await reverseGeocode({
          lat: Number(lat),
          lng: Number(lng),
        });

        setCityName(place.cityName);
        setCountry(place.country);
        setEmoji(place.countryCode);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not look up that location.",
        );
      } finally {
        setIsLoadingGeoCoding(false);
      }
    }

    fetchCityData();
  }, [lat, lng]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!cityName || !date || !lat || !lng) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      datePrecision,
      notes,
      position: { lat, lng },
    };

    const { success, error } = await createCity(newCity);
    if (success) {
      navigate("/app/cities");
    } else {
      setError(error ?? "Could not save that city.");
    }
  }

  const savedCity = findSavedCity(cities, {
    cityName,
    country,
    position: { lat: lat ?? "NaN", lng: lng ?? "NaN" },
  });
  if (savedCity && !isLoadingGeoCoding)
    return (
      <div className="duplicate-notice">
        <h2>Already in your list</h2>
        <p>
          {savedCity.cityName} is saved. You can update its visit count or add
          more memories.
        </p>
        <Link to={cityDetailTarget(savedCity.id, savedCity.position)}>
          View {savedCity.cityName}
        </Link>
        <Link to="/app/map">Back to map</Link>
      </div>
    );
  if (error) return <Message message={error} />;
  if (isLoadingGeoCoding) return <Spinner />;
  if (!lat && !lng) return <Message message="Start by clicking on the map " />;

  return (
    <form
      className={`min-w-0 bg-dark-2 rounded-xl shadow-lg p-4 sm:p-6 md:p-8 w-full max-w-lg mx-auto flex flex-col gap-5 my-3 sm:my-8 font-manrope ${
        isLoading ? "opacity-30 pointer-events-none" : ""
      }`}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-1 relative">
        <label
          htmlFor="cityName"
          className="text-sm font-semibold text-light-1 mb-1"
        >
          City name
        </label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
          className="min-h-11 w-full rounded-lg border-none bg-light-2 p-2 pr-12 text-base text-dark-0 focus:outline-none focus:ring-2 focus:ring-brand-2"
          required
        />
        {emoji && (
          <div className="absolute right-3 top-10 flex items-center">
            <img
              src={`https://flagcdn.com/24x18/${emoji}.png`}
              alt={`Flag of ${emoji.toUpperCase()}`}
              className="w-6 h-4"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 relative">
        <label
          htmlFor="country"
          className="text-sm font-semibold text-light-1 mb-1"
        >
          Country
        </label>
        <input
          id="country"
          value={country}
          readOnly
          className="min-h-11 w-full rounded-lg border-none bg-light-2 p-2 pr-12 text-base text-dark-0"
        />
        {emoji && (
          <div className="absolute right-3 top-10 flex items-center">
            {convertToEmoji(emoji)}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="date"
          className="text-sm font-semibold text-light-1 mb-1"
        >
          When did you go to {cityName || "this city"}?
        </label>
        <fieldset className="flex gap-4 text-sm text-light-1">
          <legend className="sr-only">Visit date precision</legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="datePrecision"
              checked={datePrecision === "day"}
              onChange={() => setDatePrecision("day")}
            />
            Day, month and year
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="datePrecision"
              checked={datePrecision === "month"}
              onChange={() => setDatePrecision("month")}
            />
            Month and year
          </label>
        </fieldset>
        <DatePicker
          id="date"
          onChange={(next) => next && setDate(next)}
          selected={date}
          showMonthYearPicker={datePrecision === "month"}
          dateFormat={datePrecision === "month" ? "MM/yyyy" : "dd/MM/yyyy"}
          className="min-h-11 w-full rounded-lg border-none bg-light-2 p-2 text-base text-dark-0 focus:outline-none focus:ring-2 focus:ring-brand-2"
          wrapperClassName="w-full"
          withPortal
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="notes"
          className="text-sm font-semibold text-light-1 mb-1"
        >
          Notes about your trip to {cityName || "this city"}
        </label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
          rows={3}
          className="min-h-24 w-full resize-none rounded-lg border-none bg-light-2 p-2 text-base text-dark-0 focus:outline-none focus:ring-2 focus:ring-brand-2"
        />
      </div>

      <div className="flex justify-between gap-3 mt-2">
        <button
          type="submit"
          className="min-h-11 flex-1 bg-brand-2 text-dark-1 font-bold uppercase rounded-lg px-4 py-2 transition-colors duration-200 hover:bg-brand-1 hover:text-dark-1 focus:outline-none focus:ring-2 focus:ring-brand-2"
          disabled={isLoading}
        >
          {isLoading ? "Adding..." : "Add"}
        </button>
        <button
          type="button"
          className="min-h-11 flex-1 bg-dark-1 text-light-2 font-bold uppercase rounded-lg px-4 py-2 transition-colors duration-200 hover:bg-dark-0 hover:text-brand-2 focus:outline-none focus:ring-2 focus:ring-brand-2"
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}
        >
          &larr; Back
        </button>
      </div>
    </form>
  );
}

export default Form;
