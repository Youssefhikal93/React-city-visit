import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { aCity } from "../test/fakeCitiesService";
import { MapSearch } from "./MapSearch";
import type { WorldPlaceFetch } from "../map/mapBehaviour";

const cities = [
  aCity({
    cityName: "Paris",
    country: "France",
    position: { lat: 48.8566, lng: 2.3522 },
  }),
  aCity({ cityName: "Stockholm", country: "Sweden" }),
];

describe("MapSearch", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("shows matching saved Cities and selects one with the keyboard", async () => {
    const user = userEvent.setup();
    const onCityPicked = vi.fn();

    render(
      <MapSearch
        cities={cities}
        onCityPicked={onCityPicked}
        onWorldPlacePicked={vi.fn()}
      />
    );

    const search = screen.getByRole("searchbox", {
      name: "Search Cities or the world",
    });
    await user.type(search, "ris");
    expect(
      screen.getByRole("heading", { name: "Saved Cities" })
    ).toBeVisible();
    await user.tab();
    await user.keyboard("{Enter}");

    expect(onCityPicked).toHaveBeenCalledWith(cities[0]);
    expect(search).toHaveValue("");
  });

  test("clears its query when Escape is pressed", async () => {
    const user = userEvent.setup();
    render(
      <MapSearch
        cities={cities}
        onCityPicked={vi.fn()}
        onWorldPlacePicked={vi.fn()}
      />
    );

    const search = screen.getByRole("searchbox", {
      name: "Search Cities or the world",
    });
    await user.type(search, "paris");
    await user.keyboard("{Escape}");
    expect(search).toHaveValue("");
  });

  test("clears its query when a tap lands outside", async () => {
    const user = userEvent.setup();
    render(
      <>
        <MapSearch
          cities={cities}
          onCityPicked={vi.fn()}
          onWorldPlacePicked={vi.fn()}
        />
        <button type="button">Map</button>
      </>
    );

    const search = screen.getByRole("searchbox", {
      name: "Search Cities or the world",
    });

    await user.type(search, "paris");
    await user.click(screen.getByRole("button", { name: "Map" }));
    expect(search).toHaveValue("");
  });

  test("Enter starts a world lookup without waiting for the typing pause", async () => {
    const user = userEvent.setup();
    const fetchWorldPlaces = vi.fn<WorldPlaceFetch>().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(
      <MapSearch
        cities={cities}
        fetchWorldPlaces={fetchWorldPlaces}
        onCityPicked={vi.fn()}
        onWorldPlacePicked={vi.fn()}
      />
    );

    const search = screen.getByRole("searchbox", {
      name: "Search Cities or the world",
    });
    await user.type(search, "Tokyo");
    await user.keyboard("{Enter}");
    await screen.findByText("No places found.");

    expect(fetchWorldPlaces).toHaveBeenCalledTimes(1);
  });

  test("shows a labelled world result with OpenStreetMap attribution", async () => {
    const user = userEvent.setup();
    const onWorldPlacePicked = vi.fn();
    const place = {
      kind: "worldPlace" as const,
      displayName: "Lisbon, Portugal",
      position: { lat: 38.7223, lng: -9.1393 },
    };
    const fetchWorldPlaces = vi.fn<WorldPlaceFetch>().mockResolvedValue({
      ok: true,
      json: async () => [
        { display_name: place.displayName, lat: "38.7223", lon: "-9.1393" },
      ],
    });

    render(
      <MapSearch
        cities={cities}
        fetchWorldPlaces={fetchWorldPlaces}
        onCityPicked={vi.fn()}
        onWorldPlacePicked={onWorldPlacePicked}
      />
    );

    const search = screen.getByRole("searchbox", {
      name: "Search Cities or the world",
    });
    await user.type(search, "Lisbon");
    await user.keyboard("{Enter}");
    const worldPlace = await screen.findByRole("button", {
      name: place.displayName,
    });

    expect(screen.getByRole("heading", { name: "World results" })).toBeVisible();
    expect(
      screen.getByRole("link", { name: "OpenStreetMap / Nominatim" })
    ).toHaveAttribute("href", "https://www.openstreetmap.org/copyright");
    await user.click(worldPlace);
    expect(onWorldPlacePicked).toHaveBeenCalledWith(place);
  });

  test("shows a recoverable message when a world lookup fails", async () => {
    const user = userEvent.setup();
    const fetchWorldPlaces = vi
      .fn<WorldPlaceFetch>()
      .mockRejectedValue(new Error("Network failed"));

    render(
      <MapSearch
        cities={cities}
        fetchWorldPlaces={fetchWorldPlaces}
        onCityPicked={vi.fn()}
        onWorldPlacePicked={vi.fn()}
      />
    );

    const search = screen.getByRole("searchbox", {
      name: "Search Cities or the world",
    });
    await user.type(search, "Lisbon");
    await user.keyboard("{Enter}");

    expect(
      await screen.findByText("World search is unavailable. Please try again.")
    ).toBeVisible();
  });
});
