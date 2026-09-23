import { screen, within } from "@testing-library/react";

import { aCity } from "./fakeCitiesService";
import { renderApp } from "./renderApp";

it("shows both Country list badges for a matching City and none for other Cities", async () => {
  renderApp({
    cities: [
      aCity({ id: "stockholm", cityName: "Stockholm", emoji: "SE" }),
      aCity({ id: "paris", cityName: "Paris", emoji: "fr" }),
    ],
    countryLists: {
      livedInCountryCodes: ["se"],
      plannedCountryCodes: ["se"],
    },
  });

  expect(await screen.findByText("Lived in")).toBeVisible();
  expect(screen.getByText("Planned")).toBeVisible();

  const parisCard = screen.getByRole("link", { name: /Paris/ }).closest("li");
  expect(parisCard).not.toBeNull();
  expect(within(parisCard as HTMLElement).queryByText("Lived in")).toBeNull();
  expect(
    within(parisCard as HTMLElement).queryByText("Planned"),
  ).toBeNull();
});
