import { screen } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import { aCity } from "./fakeCitiesService";
import { renderApp } from "./renderApp";

afterEach(() => vi.unstubAllGlobals());

it("shows every Country implied by the Account's Cities on a phone", async () => {
  renderApp({
    cities: [
      aCity({ cityName: "Lisbon", country: "Portugal", emoji: "pt" }),
      aCity({ cityName: "Porto", country: "Portugal", emoji: "pt" }),
      aCity({ cityName: "Oslo", country: "Norway", emoji: "no" }),
    ],
    route: "/app/countries",
    viewport: "phone",
  });

  expect(await screen.findByText("Portugal")).toBeVisible();
  expect(screen.getByText("Norway")).toBeVisible();
});

it("shows City details and the Memories section on a phone", async () => {
  renderApp({
    cities: [
      aCity({
        id: "lisbon",
        cityName: "Lisbon",
        date: "2024-01-01T00:00:00.000Z",
        notes: "The tiled streets were beautiful.",
      }),
    ],
    route: "/app/cities/lisbon",
    viewport: "phone",
  });

  expect(await screen.findByRole("heading", { name: "Lisbon" })).toBeVisible();
  expect(screen.getByText(/January 1, 2024/)).toBeVisible();
  expect(screen.getByText("The tiled streets were beautiful.")).toBeVisible();
  expect(screen.getByRole("heading", { name: "Memories" })).toBeVisible();
});

it("shows the Add City fields and submit control on a phone", async () => {
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
  expect(screen.getByLabelText("Country")).toHaveValue("Portugal");
  expect(screen.getByLabelText(/When did you go to Lisbon/)).toBeVisible();
  expect(screen.getByLabelText(/Notes about your trip to Lisbon/)).toBeVisible();
  expect(screen.getByRole("button", { name: "Add" })).toBeVisible();
});

it("returns from a City detail to the Cities list on a phone", async () => {
  const { user } = renderApp({
    cities: [aCity({ id: "lisbon", cityName: "Lisbon" })],
    viewport: "phone",
  });

  await user.click(await screen.findByRole("link", { name: /Lisbon/ }));
  await user.click(await screen.findByRole("button", { name: /Back/ }));

  expect(await screen.findByRole("heading", { name: /Cities/ })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Lisbon" })).toBeVisible();
});
