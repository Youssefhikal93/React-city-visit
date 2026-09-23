import { useState, type ReactNode } from "react";
import { FiX } from "react-icons/fi";

import { useCountryLists } from "../context/CountryListsContext";
import { countryName, countryOptions } from "../map/countries";
import type { CountryList } from "../services/countryLists";
import CountrySection from "./CountrySection";

interface CountryListSectionProps {
  list: CountryList;
  title: string;
  icon: ReactNode;
  description: string;
  emptyMessage: string;
}

/** One of the Account's own Country lists: a picker to add, and × to remove. */
export default function CountryListSection({
  list,
  title,
  icon,
  description,
  emptyMessage,
}: CountryListSectionProps) {
  const {
    livedInCountryCodes,
    plannedCountryCodes,
    isLoading,
    loadError,
    addCountry,
    removeCountry,
    retryLoad,
  } = useCountryLists();
  const [pendingCountryCode, setPendingCountryCode] = useState<string | null>(
    null,
  );
  const [saveError, setSaveError] = useState("");
  const countryCodes = list === "livedIn" ? livedInCountryCodes : plannedCountryCodes;
  const listed = new Set(countryCodes);
  const pickerId = `${list}-countries-picker`;
  const listedCountries = countryCodes
    .map((countryCode) => ({ countryCode, name: countryName(countryCode) }))
    .sort((first, second) => first.name.localeCompare(second.name));

  async function change(
    countryCode: string,
    action: typeof addCountry,
  ): Promise<void> {
    setSaveError("");
    setPendingCountryCode(countryCode);
    const outcome = await action(list, countryCode);
    setPendingCountryCode(null);
    if (!outcome.success)
      setSaveError(outcome.error ?? `Couldn't update ${title}.`);
  }

  return (
    <CountrySection
      count={countryCodes.length}
      description={description}
      icon={icon}
      id={`${list}-countries`}
      title={title}
    >
      <label className="sr-only" htmlFor={pickerId}>
        Add a Country to {title}
      </label>
      <select
        className="min-h-11 w-full rounded-xl border border-white/10 bg-[#122126] px-3 text-sm text-light-1 focus:outline-none focus:ring-2 focus:ring-brand-2 disabled:opacity-60"
        disabled={isLoading || Boolean(loadError) || pendingCountryCode !== null}
        id={pickerId}
        onChange={(event) => {
          const countryCode = event.target.value;
          if (countryCode) void change(countryCode, addCountry);
        }}
        value=""
      >
        <option value="">Add a Country…</option>
        {countryOptions
          .filter((country) => !listed.has(country.countryCode))
          .map((country) => (
            <option key={country.countryCode} value={country.countryCode}>
              {country.name}
            </option>
          ))}
      </select>
      {loadError && (
        <div className="mt-2 text-xs text-red-400" role="alert">
          <p>{loadError}</p>
          <button
            className="mt-1 min-h-11 rounded-lg px-2 font-semibold text-brand-2 hover:bg-dark-2 focus:outline-none focus:ring-2 focus:ring-brand-2"
            disabled={isLoading}
            onClick={retryLoad}
            type="button"
          >
            Try loading your Countries again
          </button>
        </div>
      )}
      {saveError && (
        <p className="mt-2 text-xs text-red-400" role="alert">
          {saveError}
        </p>
      )}
      {!isLoading && !loadError && listedCountries.length === 0 ? (
        <p className="country-section-empty">{emptyMessage}</p>
      ) : (
        <ul aria-label={title} className="country-list mt-3">
          {listedCountries.map((country) => (
            <li className="country-card country-list-entry" key={country.countryCode}>
              <img
                alt={"Flag of " + country.name}
                className="country-flag"
                src={"https://flagcdn.com/" + country.countryCode + ".svg"}
              />
              <strong>{country.name}</strong>
              <button
                aria-label={`Remove ${country.name} from ${title}`}
                className="delete-city"
                disabled={pendingCountryCode !== null}
                onClick={() => void change(country.countryCode, removeCountry)}
                type="button"
              >
                <FiX aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </CountrySection>
  );
}
