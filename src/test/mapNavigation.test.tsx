import { screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { aCity } from "./fakeCitiesService";
import { renderApp } from "./renderApp";

describe("map navigation", () => {
  test.each(["phone", "wide"] as const)(
    "Show on map navigates with a City target on %s",
    async (viewport) => {
      const paris = aCity({
        id: "paris",
        cityName: "Paris",
        country: "France",
        position: { lat: 48.8566, lng: 2.3522 },
      });
      const { user } = renderApp({
        cities: [paris],
        route: "/app/cities/paris",
        viewport,
      });

      await user.click(
        await screen.findByRole("button", { name: "Show on map" })
      );

      const expectedRoute =
        viewport === "phone"
          ? "/app/map?lat=48.8566&lng=2.3522&cityId=paris"
          : "/app/cities?lat=48.8566&lng=2.3522&cityId=paris";
      expect(screen.getByTestId("current-location")).toHaveTextContent(
        expectedRoute
      );

      if (viewport === "phone") {
        expect(screen.getByTestId("map")).toBeVisible();
      } else {
        expect(screen.getByRole("heading", { name: "Paris" })).toBeVisible();
      }
    }
  );

  test.each(["phone", "wide"] as const)(
    "a Country navigates with a Country target on %s",
    async (viewport) => {
      const paris = aCity({
        id: "paris",
        cityName: "Paris",
        country: "France",
        position: { lat: 48.8566, lng: 2.3522 },
      });
      const lyon = aCity({
        id: "lyon",
        cityName: "Lyon",
        country: "France",
        position: { lat: 45.764, lng: 4.8357 },
      });
      const { user } = renderApp({
        cities: [paris, lyon],
        route: "/app/countries",
        viewport,
      });

      await user.click(
        await screen.findByRole("link", { name: "Show France on map" })
      );

      const expectedRoute =
        viewport === "phone" ? "/app/map?country=France" : "/app/cities?country=France";
      expect(screen.getByTestId("current-location")).toHaveTextContent(
        expectedRoute
      );

      if (viewport === "phone") {
        expect(screen.getByTestId("map")).toBeVisible();
      } else {
        expect(screen.getByRole("heading", { name: "Paris" })).toBeVisible();
      }
    }
  );
});
