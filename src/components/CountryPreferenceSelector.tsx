import { useEffect, useMemo, useState } from "react";

import { countryCodes } from "../map/countryBoundaries";

interface CountryChangeResult {
  success: boolean;
  error?: string;
}

interface CountryPreferenceSelectorProps {
  countryCode: string | null;
  label: string;
  loadError: string;
  isLoading: boolean;
  clearCountry: () => Promise<CountryChangeResult>;
  retryLoad: () => void;
  saveCountry: (countryCode: string) => Promise<CountryChangeResult>;
}

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

const countries = countryCodes
  .map((countryCode) => ({
    countryCode,
    name: countryNames.of(countryCode.toUpperCase()) ?? countryCode.toUpperCase(),
  }))
  .sort((firstCountry, secondCountry) =>
    firstCountry.name.localeCompare(secondCountry.name),
  );

export default function CountryPreferenceSelector({
  countryCode,
  label,
  loadError,
  isLoading,
  clearCountry,
  retryLoad,
  saveCountry,
}: CountryPreferenceSelectorProps) {
  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCode ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const identifier = label.toLowerCase().replaceAll(" ", "-");

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
    const outcome = await saveCountry(newCountryCode);
    setIsSaving(false);
    if (!outcome.success) {
      setSelectedCountryCode(previousCountryCode);
      setSaveError(outcome.error ?? `Couldn't save your ${label.toLowerCase()}.`);
    }
  }

  async function removeCountry(): Promise<void> {
    const previousCountryCode = countryCode ?? "";
    setSaveError("");
    setIsSaving(true);
    const outcome = await clearCountry();
    setIsSaving(false);
    if (!outcome.success) {
      setSelectedCountryCode(previousCountryCode);
      setSaveError(outcome.error ?? `Couldn't clear your ${label.toLowerCase()}.`);
    }
  }

  return (
    <section className="border-b border-dark-2 px-3 py-3" aria-labelledby={`${identifier}-heading`}>
      <h2 className="text-sm font-semibold text-light-1" id={`${identifier}-heading`}>
        {label}
      </h2>
      <label className="sr-only" htmlFor={identifier}>
        {label}
      </label>
      <select
        className="mt-2 min-h-11 w-full rounded-lg border border-dark-2 bg-dark-0 px-3 text-sm text-light-1 focus:outline-none focus:ring-2 focus:ring-brand-2 disabled:opacity-60"
        disabled={isLoading || isSaving || Boolean(loadError)}
        id={identifier}
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
          onClick={() => void removeCountry()}
          type="button"
        >
          Clear {label.toLowerCase()}
          {selectedCountryName ? ` (${selectedCountryName})` : ""}
        </button>
      )}
      {isSaving && (
        <p aria-live="polite" className="mt-2 text-xs text-light-0">
          Saving {label.toLowerCase()}...
        </p>
      )}
      {loadError && (
        <div className="mt-2 text-xs text-red-400" role="alert">
          <p>{loadError}</p>
          <button
            className="mt-1 min-h-11 rounded-lg px-2 font-semibold text-brand-2 hover:bg-dark-2 focus:outline-none focus:ring-2 focus:ring-brand-2"
            disabled={isLoading}
            onClick={retryLoad}
            type="button"
          >
            Try loading Country preferences again
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
