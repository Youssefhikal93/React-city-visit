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

/**
 * City.emoji has always stored the lowercased two-letter country code used by
 * the flag service. Reading that existing identifier makes this feature
 * compatible with saved Cities without rewriting their data.
 */
export function countryCodeForCity(city: Pick<City, "emoji">): string | null {
  const countryCode = city.emoji.trim().toLowerCase();
  return /^[a-z]{2}$/.test(countryCode) ? countryCode : null;
}

export function visitedCountryBoundaries(cities: City[]): CountryBoundaryCollection {
  const visitedCountryCodes = new Set(
    cities.flatMap((city) => {
      const countryCode = countryCodeForCity(city);
      return countryCode ? [countryCode] : [];
    }),
  );

  return {
    type: "FeatureCollection",
    features: allCountryBoundaries.features.filter((country) =>
      visitedCountryCodes.has(country.properties.countryCode),
    ),
  };
}
