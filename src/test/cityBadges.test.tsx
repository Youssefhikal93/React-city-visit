import { screen, within } from "@testing-library/react";

import { aCity } from "./fakeCitiesService";
import { renderApp } from "./renderApp";

it("shows the Planned badge on a matching City, never a Lived in badge", async () => {
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

  const stockholmCard = (await screen.findByRole("link", { name: /Stockholm/ }))
    .closest("li") as HTMLElement;
  expect(within(stockholmCard).getByText("Planned")).toBeVisible();
  expect(within(stockholmCard).queryByText("Lived in")).toBeNull();

  const parisCard = screen.getByRole("link", { name: /Paris/ }).closest("li");
  expect(parisCard).not.toBeNull();
  expect(within(parisCard as HTMLElement).queryByText("Planned")).toBeNull();
});

it("marks a lived-in Country with a Lived in badge in Visited", async () => {
  renderApp({
    route: "/app/countries",
    cities: [
      aCity({ id: "stockholm", country: "Sweden", emoji: "se" }),
      aCity({ id: "paris", country: "France", emoji: "fr" }),
    ],
    countryLists: { livedInCountryCodes: ["se"] },
  });

  const visited = within(await screen.findByRole("list", { name: "Visited" }));
  const sweden = visited.getByRole("button", { name: /Sweden/ });
  expect(within(sweden).getByText("Lived in")).toBeVisible();
  expect(
    within(visited.getByRole("button", { name: /France/ })).queryByText("Lived in"),
  ).toBeNull();
});
