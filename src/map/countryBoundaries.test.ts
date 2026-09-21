import { describe, expect, test } from "vitest";

import {
  countryCodeForCity,
  visitedCountryBoundaries,
} from "./countryBoundaries";
import countryBoundaryData from "./data/countries.json";
import { aCity } from "../test/fakeCitiesService";

function countryCodes(cities: Parameters<typeof visitedCountryBoundaries>[0]) {
  return visitedCountryBoundaries(cities).features.map(
    (country) => country.properties.countryCode,
  );
}

describe("visited Country boundaries", () => {
  test("matches saved Cities by their country code, not their display name", () => {
    const cities = [
      aCity({ country: "French Republic", emoji: "FR" }),
      aCity({ country: "Norway", emoji: "no" }),
    ];

    expect(countryCodes(cities)).toEqual(expect.arrayContaining(["fr", "no"]));
    expect(countryCodes(cities)).toHaveLength(2);
  });

  test("drops a Country when its last saved City is deleted", () => {
    const paris = aCity({ id: "paris", country: "France", emoji: "fr" });
    const lyon = aCity({ id: "lyon", country: "France", emoji: "fr" });
    const oslo = aCity({ id: "oslo", country: "Norway", emoji: "no" });

    expect(countryCodes([paris, lyon, oslo])).toEqual(
      expect.arrayContaining(["fr", "no"]),
    );
    expect(countryCodes([lyon, oslo])).toEqual(
      expect.arrayContaining(["fr", "no"]),
    );
    expect(countryCodes([oslo])).toEqual(["no"]);
  });

  test("leaves legacy rows with no usable country identifier untouched", () => {
    expect(countryCodeForCity(aCity({ emoji: "" }))).toBeNull();
    expect(countryCodeForCity(aCity({ emoji: "France" }))).toBeNull();
    expect(countryCodes([aCity({ emoji: "" })])).toEqual([]);
  });

  test("contains a complete country geometry dataset rather than placeholder shapes", () => {
    const countries = visitedCountryBoundaries(
      ["fr", "no", "us", "jp", "za", "au"].map((emoji) => aCity({ emoji })),
    );

    expect(countryBoundaryData.features.length).toBeGreaterThanOrEqual(240);
    expect(
      [...new Set(countries.features.map((country) => country.properties.countryCode))],
    ).toHaveLength(6);
    expect(countries.features).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          geometry: expect.objectContaining({ type: "MultiPolygon" }),
          properties: { countryCode: "fr" },
        }),
      ]),
    );
  });
});
