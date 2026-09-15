import type { City, NewCity } from "../types";

type NamedCity = Pick<NewCity, "cityName" | "country" | "position">;

function normalizedName(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

export function findSavedCity(
  cities: City[],
  candidate: NamedCity,
): City | undefined {
  return cities.find((city) => {
    const sameName =
      normalizedName(city.cityName) === normalizedName(candidate.cityName) &&
      normalizedName(city.country) === normalizedName(candidate.country);
    const samePosition =
      Math.abs(city.position.lat - Number(candidate.position.lat)) < 0.0001 &&
      Math.abs(city.position.lng - Number(candidate.position.lng)) < 0.0001;
    return sameName || samePosition;
  });
}
