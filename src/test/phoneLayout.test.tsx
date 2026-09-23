import { screen } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import { aCity } from "./fakeCitiesService";
import { renderApp } from "./renderApp";

afterEach(() => vi.unstubAllGlobals());

it("opens the Home dashboard from the app index on a phone", async () => {
  renderApp({ route: "/app", viewport: "phone" });

  expect(await screen.findByLabelText("Travel totals")).toBeVisible();
  expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
    "aria-current",
    "page"
  );
});

it("switches phone views from Cities to Map", async () => {
  const { user } = renderApp({
    cities: [aCity({ cityName: "Lisbon" })],
    viewport: "phone",
  });

  expect(screen.getByRole("navigation", { name: "Views" })).toBeVisible();
  expect(screen.getAllByRole("link", { name: "Cities" })).toHaveLength(1);
  expect(screen.getByRole("link", { name: "Countries" })).toBeVisible();

  await user.click(screen.getByRole("link", { name: "Cities" }));

  expect(await screen.findByRole("heading", { name: "Lisbon" })).toBeVisible();
  expect(screen.queryByTestId("map")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Cities" })).toHaveAttribute(
    "aria-current",
    "page"
  );

  await user.click(screen.getByRole("link", { name: "Map" }));

  expect(await screen.findByTestId("map")).toBeVisible();
  expect(screen.getByRole("link", { name: "Map" })).toHaveAttribute(
    "aria-current",
    "page"
  );
});

it("shows the form in list view on a phone", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      json: async () => ({
        city: "Lisbon",
        countryCode: "PT",
        countryName: "Portugal",
      }),
    })
  );

  renderApp({
    route: "/app/form?lat=38.7223&lng=-9.1393",
    viewport: "phone",
  });

  expect(await screen.findByLabelText("City name")).toBeVisible();
  expect(screen.queryByTestId("map")).not.toBeInTheDocument();
});

it("shows a City detail in list view on a phone", async () => {
  renderApp({
    cities: [aCity({ id: "lisbon", cityName: "Lisbon" })],
    route: "/app/cities/lisbon",
    viewport: "phone",
  });

  expect(await screen.findByRole("heading", { name: "Lisbon" })).toBeVisible();
  expect(screen.queryByTestId("map")).not.toBeInTheDocument();
});

it("keeps the sidebar navigation and map visible on a wide screen", async () => {
  renderApp({
    cities: [aCity({ cityName: "Lisbon" })],
    viewport: "wide",
  });

  expect(screen.queryByRole("navigation", { name: "Views" })).not.toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: "Cities" })).toHaveLength(1);
  expect(await screen.findByRole("heading", { name: "Lisbon" })).toBeVisible();
  expect(screen.getByTestId("map")).toBeVisible();
});
