import { describe, expect, it } from "vitest";
import { findSavedCity } from "./cityIdentity";
import { aCity } from "../test/fakeCitiesService";

describe("duplicate Cities", () => {
  const paris = aCity({
    cityName: "Paris",
    country: "France",
    position: { lat: 48.85, lng: 2.35 },
  });
  it.each([
    [
      "case and whitespace",
      {
        cityName: "  PARIS ",
        country: " france ",
        position: { lat: 48.86, lng: 2.36 },
      },
    ],
    [
      "same Position with a different label",
      {
        cityName: "Paris Centre",
        country: "France",
        position: { lat: 48.85, lng: 2.35 },
      },
    ],
  ])("finds a saved City despite %s", (_scenario, candidate) => {
    expect(findSavedCity([paris], candidate)?.id).toBe(paris.id);
  });
  it("allows a City with the same name in another Country", () => {
    expect(
      findSavedCity([paris], {
        cityName: "Paris",
        country: "United States",
        position: { lat: 33.66, lng: -95.55 },
      }),
    ).toBeUndefined();
  });
});
