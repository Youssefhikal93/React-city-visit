import { screen } from "@testing-library/react";

import { aCity } from "./fakeCitiesService";
import { renderApp } from "./renderApp";

it("shows the Map on its own when an Account on a phone opens the map route", async () => {
  renderApp({ route: "/app/map", viewport: "phone" });

  expect(await screen.findByTestId("map")).toBeVisible();
});

it("mounts the Map once when a wide screen opens the map route", async () => {
  renderApp({
    route: "/app/map",
    viewport: "wide",
    cities: [aCity({ cityName: "Paris" })],
  });

  expect(await screen.findByRole("heading", { name: "Paris" })).toBeVisible();
  expect(screen.getAllByTestId("map")).toHaveLength(1);
});
