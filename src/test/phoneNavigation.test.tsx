import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { MapSearch } from "../components/MapSearch";
import { pendingPinNavigationTarget } from "../map/mapBehaviour";
import { aCity } from "./fakeCitiesService";
import { installMatchMedia, renderApp } from "./renderApp";

describe("adding a City from the map", () => {
  it("routes to the Add City form at an absolute path", () => {
    // A relative "form" resolved against the phone-only map route and 404'd.
    const target = pendingPinNavigationTarget({
      kind: "pending",
      position: { lat: 39.47, lng: -0.376 },
    });

    expect(target).toBe("/app/form?lat=39.47&lng=-0.376");
  });

  it("reaches the Add City form on a phone", async () => {
    renderApp({ route: "/app/form?lat=39.47&lng=-0.376", viewport: "phone" });

    expect(await screen.findByLabelText(/city name/i)).toBeVisible();
  });
});

describe("the menu", () => {
  it("lets an Account on a phone leave the view they are in", async () => {
    const { user } = renderApp({
      route: "/app/countries",
      viewport: "phone",
      cities: [aCity({ cityName: "Valencia", country: "Spain" })],
    });

    await user.click(await screen.findByRole("button", { name: /open menu/i }));

    const menu = within(screen.getByRole("navigation", { name: "Menu" }));
    expect(menu.getByRole("link", { name: /map/i })).toBeVisible();
    expect(menu.getByRole("link", { name: /cities/i })).toBeVisible();
    expect(menu.getByRole("link", { name: /home/i })).toBeVisible();
    expect(menu.getByRole("button", { name: /sign out/i })).toBeVisible();
  });

  it("lists Home first and hides Products and Pricing", async () => {
    const { user } = renderApp({ route: "/app/map", viewport: "phone" });

    await user.click(await screen.findByRole("button", { name: /open menu/i }));

    const menu = within(screen.getByRole("navigation", { name: "Menu" }));
    const links = menu.getAllByRole("link");
    expect(links[0]).toHaveTextContent("Home");
    expect(links[0]).toHaveAttribute("href", "/app/home");
    expect(menu.queryByRole("link", { name: /products/i })).not.toBeInTheDocument();
    expect(menu.queryByRole("link", { name: /pricing/i })).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const { user } = renderApp({ route: "/app/map", viewport: "phone" });

    await user.click(await screen.findByRole("button", { name: /open menu/i }));
    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("navigation", { name: "Menu" })
    ).not.toBeInTheDocument();
  });

  it("stays out of the way on a wide screen", async () => {
    renderApp({ route: "/app/cities", viewport: "wide" });

    expect(
      screen.queryByRole("button", { name: /open menu/i })
    ).not.toBeInTheDocument();
  });
});

describe("the phone bottom bar", () => {
  it("offers Home, Map, Cities, and Countries tabs only", async () => {
    renderApp({ route: "/app/countries", viewport: "phone" });
    const views = within(screen.getByRole("navigation", { name: "Views" }));

    expect(views.getAllByRole("link").map((tab) => tab.textContent)).toEqual([
      "Home",
      "Map",
      "Cities",
      "Countries",
    ]);
    expect(views.getByRole("link", { name: "Countries" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(views.queryByRole("button")).not.toBeInTheDocument();
  });

  it("opens the Home dashboard from its tab", async () => {
    const { user } = renderApp({ route: "/app/map", viewport: "phone" });
    const views = within(screen.getByRole("navigation", { name: "Views" }));

    await user.click(views.getByRole("link", { name: "Home" }));

    expect(screen.getByTestId("current-location")).toHaveTextContent("/app/home");
    expect(await screen.findByLabelText("Travel totals")).toBeVisible();
  });
});

describe("the map Search on a phone", () => {
  function renderSearch(viewport: "phone" | "wide") {
    installMatchMedia(viewport);
    return {
      user: userEvent.setup(),
      ...render(
        <MapSearch
          cities={[]}
          onCityPicked={vi.fn()}
          onWorldPlacePicked={vi.fn()}
        />
      ),
    };
  }

  it("starts collapsed so it does not cover the map", () => {
    renderSearch("phone");

    expect(
      screen.getByRole("button", { name: /search cities or the world/i })
    ).toBeVisible();
    expect(
      screen.queryByRole("searchbox", { name: /search cities or the world/i })
    ).not.toBeInTheDocument();
  });

  it("opens the box when the Account taps it", async () => {
    const { user } = renderSearch("phone");

    await user.click(
      screen.getByRole("button", { name: /search cities or the world/i })
    );

    expect(
      screen.getByRole("searchbox", { name: /search cities or the world/i })
    ).toBeVisible();
  });

  it("stays open on a wide screen", () => {
    renderSearch("wide");

    expect(
      screen.getByRole("searchbox", { name: /search cities or the world/i })
    ).toBeVisible();
  });
});
