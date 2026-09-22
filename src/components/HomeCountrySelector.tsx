import { useEffect, useMemo, useState } from "react";

import { useHomeCountry } from "../context/HomeCountryContext";
import { countryCodes } from "../map/countryBoundaries";

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

function countryName(countryCode: string): string {
  return countryNames.of(countryCode.toUpperCase()) ?? countryCode.toUpperCase();
}

const countries = countryCodes
  .map((countryCode) => ({ countryCode, name: countryName(countryCode) }))
  .sort((firstCountry, secondCountry) =>
    firstCountry.name.localeCompare(secondCountry.name),
  );

function HomeCountrySelector() {
  const {
    countryCode,
    isLoading,
    loadError,
    saveHomeCountry,
    clearHomeCountry,
    retryHomeCountryLoad,
  } = useHomeCountry();
  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCode ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setSelectedCountryCode(countryCode ?? "");
  }, [countryCode]);

  const selectedCountryName = useMemo(
    () => countries.find((country) => country.countryCode === countryCode)?.name,
    [countryCode],
  );

  async function saveSelectedCountry(newCountryCode: string): Promise<void> {
    const previousCountryCode = countryCode ?? "";
    setSelectedCountryCode(newCountryCode);
    setSaveError("");
    setIsSaving(true);
    const outcome = await saveHomeCountry(newCountryCode);
    setIsSaving(false);
    if (!outcome.success) {
      setSelectedCountryCode(previousCountryCode);
      setSaveError(outcome.error ?? "Couldn't save your home Country.");
    }
  }

  async function removeHomeCountry(): Promise<void> {
    const previousCountryCode = countryCode ?? "";
    setSaveError("");
    setIsSaving(true);
    const outcome = await clearHomeCountry();
    setIsSaving(false);
    if (!outcome.success) {
      setSelectedCountryCode(previousCountryCode);
      setSaveError(outcome.error ?? "Couldn't clear your home Country.");
    }
  }

  return (
    <section className="border-b border-dark-2 px-3 py-3" aria-labelledby="home-country-heading">
      <h2 className="text-sm font-semibold text-light-1" id="home-country-heading">
        Home Country
      </h2>
      <label className="sr-only" htmlFor="home-country">
        Home Country
      </label>
      <select
        className="mt-2 min-h-11 w-full rounded-lg border border-dark-2 bg-dark-0 px-3 text-sm text-light-1 focus:outline-none focus:ring-2 focus:ring-brand-2 disabled:opacity-60"
        disabled={isLoading || isSaving || Boolean(loadError)}
        id="home-country"
        onChange={(event) => void saveSelectedCountry(event.target.value)}
        value={selectedCountryCode}
      >
        <option disabled value="">
          Choose a Country
        </option>
        {countries.map((country) => (
          <option key={country.countryCode} value={country.countryCode}>
            {country.name}
          </option>
        ))}
      </select>
      {countryCode && (
        <button
          className="mt-2 min-h-11 rounded-lg px-3 text-sm font-semibold text-brand-2 hover:bg-dark-2 focus:outline-none focus:ring-2 focus:ring-brand-2 disabled:opacity-60"
          disabled={isSaving}
          onClick={() => void removeHomeCountry()}
          type="button"
        >
          Clear home Country{selectedCountryName ? ` (${selectedCountryName})` : ""}
        </button>
      )}
      {isSaving && (
        <p aria-live="polite" className="mt-2 text-xs text-light-0">
          Saving home Country…
        </p>
      )}
      {loadError && (
        <div className="mt-2 text-xs text-red-400" role="alert">
          <p>{loadError}</p>
          <button
            className="mt-1 min-h-11 rounded-lg px-2 font-semibold text-brand-2 hover:bg-dark-2 focus:outline-none focus:ring-2 focus:ring-brand-2"
            disabled={isLoading}
            onClick={retryHomeCountryLoad}
            type="button"
          >
            Try loading home Country again
          </button>
        </div>
      )}
      {saveError && (
        <p className="mt-2 text-xs text-red-400" role="alert">
          {saveError}
        </p>
      )}
    </section>
  );
}

export default HomeCountrySelector;
