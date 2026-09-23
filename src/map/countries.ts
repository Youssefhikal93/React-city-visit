import { countryCodeForCity, countryCodes } from "./countryBoundaries";
import type { City } from "../types";

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

export function countryName(countryCode: string): string {
  return countryNames.of(countryCode.toUpperCase()) ?? countryCode.toUpperCase();
}

/** Every Country that can go on a list, alphabetical by English name. */
export const countryOptions = countryCodes
  .map((countryCode) => ({ countryCode, name: countryName(countryCode) }))
  .sort((first, second) => first.name.localeCompare(second.name));

/**
 * The Countries an Account has been to: those holding one of its Cities plus
 * those it lived in. Planned Countries don't count until a City lands there.
 */
export function beenToCountryCodes(
  cities: City[],
  livedInCountryCodes: string[],
): Set<string> {
  return new Set([
    ...cities.flatMap((city) => {
      const countryCode = countryCodeForCity(city);
      return countryCode ? [countryCode] : [];
    }),
    ...livedInCountryCodes,
  ]);
}
