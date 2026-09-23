import { screen, within } from "@testing-library/react";

import { aCity } from "./fakeCitiesService";
import { renderApp } from "./renderApp";

it("shows both Country badges for a matching City and none for other Cities", async () => {
  renderApp({
    cities: [
      aCity({ id: "stockholm", cityName: "Stockholm", emoji: "SE" }),
      aCity({ id: "paris", cityName: "Paris", emoji: "fr" }),
    ],
    countryPreferences: {
      homeCountryCode: "se",
      plannedCountryCode: "se",
    },
  });

  expect(await screen.findByText("Home Country")).toBeVisible();
  expect(screen.getByText("Next destination")).toBeVisible();

  const parisCard = screen.getByRole("link", { name: /Paris/ }).closest("li");
  expect(parisCard).not.toBeNull();
  expect(within(parisCard as HTMLElement).queryByText("Home Country")).toBeNull();
  expect(
    within(parisCard as HTMLElement).queryByText("Next destination"),
  ).toBeNull();
});
