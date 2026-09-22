import type { Feature, FeatureCollection, Geometry } from "geojson";

import countryBoundaryData from "./data/countries.json";
import type { City } from "../types";

interface CountryBoundaryProperties {
  countryCode: string;
}

export type CountryBoundary = Feature<Geometry, CountryBoundaryProperties>;
export type CountryBoundaryCollection = FeatureCollection<
  Geometry,
  CountryBoundaryProperties
>;

const allCountryBoundaries = countryBoundaryData as CountryBoundaryCollection;

export const countryCodes = [
  ...new Set(
    allCountryBoundaries.features.map(
      (country) => country.properties.countryCode,
    ),
  ),
]
  .filter((countryCode) => /^[a-z]{2}$/.test(countryCode))
  .sort();

/**
 * City.emoji has always stored the lowercased two-letter country code used by
 * the flag service. Reading that existing identifier makes this feature
 * compatible with saved Cities without rewriting their data.
 */
export function countryCodeForCity(city: Pick<City, "emoji">): string | null {
  const countryCode = city.emoji.trim().toLowerCase();
  return /^[a-z]{2}$/.test(countryCode) ? countryCode : null;
}

export function visitedCountryBoundaries(
  cities: City[],
  excludedCountryCode: string | null = null,
): CountryBoundaryCollection {
  const visitedCountryCodes = new Set(
    cities.flatMap((city) => {
      const countryCode = countryCodeForCity(city);
      return countryCode ? [countryCode] : [];
    }),
  );

  return {
    type: "FeatureCollection",
    features: allCountryBoundaries.features.filter((country) =>
      country.properties.countryCode !== excludedCountryCode &&
      visitedCountryCodes.has(country.properties.countryCode),
    ),
  };
}

export function homeCountryBoundaries(
  countryCode: string | null,
): CountryBoundaryCollection {
  return {
    type: "FeatureCollection",
    features: countryCode
      ? allCountryBoundaries.features.filter(
          (country) => country.properties.countryCode === countryCode,
        )
      : [],
  };
}
