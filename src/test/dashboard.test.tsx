import { screen, within } from "@testing-library/react";

import { aCity } from "./fakeCitiesService";
import { renderApp } from "./renderApp";

it.each(["phone", "wide"] as const)(
  "lands on the Home dashboard after sign-in on a %s",
  async (viewport) => {
    renderApp({ route: "/app", viewport });

    expect(await screen.findByLabelText("Travel totals")).toBeVisible();
    expect(screen.getByTestId("current-location")).toHaveTextContent("/app/home");
  },
);

it("sums Cities, Countries been to, visits, and planned Countries", async () => {
  renderApp({
    route: "/app/home",
    cities: [
      aCity({ id: "paris", cityName: "Paris", country: "France", emoji: "fr", visitCount: 3 }),
      aCity({ id: "lyon", cityName: "Lyon", country: "France", emoji: "fr" }),
    ],
    countryLists: { livedInCountryCodes: ["se"], plannedCountryCodes: ["is", "jp"] },
  });

  const totals = within(await screen.findByLabelText("Travel totals"));
  expect(totals.getByText("Cities").previousSibling).toHaveTextContent("2");
  expect(totals.getByText("Countries").previousSibling).toHaveTextContent("2");
  expect(totals.getByText("Total visits").previousSibling).toHaveTextContent("4");
  expect(totals.getByText("Planned").previousSibling).toHaveTextContent("2");

  const destinations = within(screen.getByRole("list", { name: "Next destinations" }));
  expect(destinations.getByText("Iceland")).toBeVisible();
  expect(destinations.getByText("Japan")).toBeVisible();
});

it("shows the three most recently visited Cities", async () => {
  renderApp({
    route: "/app/home",
    cities: ["2020", "2023", "2021", "2024"].map((year) =>
      aCity({ id: year, cityName: `City ${year}`, date: `${year}-05-01T00:00:00.000Z` }),
    ),
  });

  const recent = within(await screen.findByRole("list", { name: "Recent Cities" }));
  expect(recent.getAllByRole("link").map((link) => link.textContent)).toEqual([
    expect.stringContaining("City 2024"),
    expect.stringContaining("City 2023"),
    expect.stringContaining("City 2021"),
  ]);
});
