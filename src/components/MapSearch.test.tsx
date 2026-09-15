import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { aCity } from "../test/fakeCitiesService";
import { MapSearch } from "./MapSearch";

const cities = [
  aCity({
    cityName: "Paris",
    country: "France",
    position: { lat: 48.8566, lng: 2.3522 },
  }),
  aCity({ cityName: "Stockholm", country: "Sweden" }),
];

describe("MapSearch", () => {
  test("shows matching saved Cities and selects one with the keyboard", async () => {
    const user = userEvent.setup();
    const onCityPicked = vi.fn();

    render(<MapSearch cities={cities} onCityPicked={onCityPicked} />);

    const search = screen.getByRole("searchbox", {
      name: "Search saved Cities",
    });
    await user.type(search, "ris");
    await user.tab();
    await user.keyboard("{Enter}");

    expect(onCityPicked).toHaveBeenCalledWith(cities[0]);
    expect(search).toHaveValue("");
  });

  test("clears its query when Escape is pressed", async () => {
    const user = userEvent.setup();
    render(<MapSearch cities={cities} onCityPicked={vi.fn()} />);

    const search = screen.getByRole("searchbox", {
      name: "Search saved Cities",
    });
    await user.type(search, "paris");
    await user.keyboard("{Escape}");
    expect(search).toHaveValue("");
  });

  test("clears its query when a tap lands outside", async () => {
    const user = userEvent.setup();
    render(
      <>
        <MapSearch cities={cities} onCityPicked={vi.fn()} />
        <button type="button">Map</button>
      </>
    );

    const search = screen.getByRole("searchbox", {
      name: "Search saved Cities",
    });

    await user.type(search, "paris");
    await user.click(screen.getByRole("button", { name: "Map" }));
    expect(search).toHaveValue("");
  });
});
