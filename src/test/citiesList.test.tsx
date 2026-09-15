import { screen } from "@testing-library/react";

import { aCity } from "./fakeCitiesService";
import { renderApp } from "./renderApp";

it("shows every City the Account has saved", async () => {
  renderApp({
    cities: [
      aCity({ id: "paris", cityName: "Paris", createdAt: 2 }),
      aCity({ id: "lisbon", cityName: "Lisbon", createdAt: 1 }),
    ],
  });

  expect(await screen.findByRole("heading", { name: "Paris" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Lisbon" })).toBeVisible();
});
