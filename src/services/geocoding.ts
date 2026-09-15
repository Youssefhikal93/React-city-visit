import type { Position } from "../types";

/** What reverse geocoding can tell us about a Position. */
export interface PlaceName {
  cityName: string;
  country: string;
  /** Lowercased ISO country code, which is what the flag images are keyed on. */
  countryCode: string;
}

interface ReverseGeocodeResponse {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
  countryCode?: string;
}

export const NOT_A_COUNTRY =
  "This location doesn't appear to be a country. Please click somewhere else ";

/**
 * Names the place at a Position. Shared by the Add City form and the map's
 * "Add <place>?" confirmation so both agree on what a tap is pointing at.
 */
export async function reverseGeocode(
  position: Position,
  signal?: AbortSignal
): Promise<PlaceName> {
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.lat}&longitude=${position.lng}`,
    signal ? { signal } : undefined
  );

  const data = (await response.json()) as ReverseGeocodeResponse;
  if (!data.countryCode) throw new Error(NOT_A_COUNTRY);

  return {
    cityName: data.city || data.locality || data.principalSubdivision || "",
    country: data.countryName ?? "",
    countryCode: data.countryCode.toLowerCase(),
  };
}
