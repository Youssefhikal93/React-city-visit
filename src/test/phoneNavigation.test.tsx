import { render, screen, waitFor, within } from "@testing-library/react";
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
    expect(
      menu.queryByRole("combobox", { name: "Home Country" }),
    ).not.toBeInTheDocument();
    expect(
      menu.queryByRole("combobox", { name: "Planned destination" }),
    ).not.toBeInTheDocument();
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

describe("Country preferences in the phone navigation", () => {
  it("opens Home Country, saves a choice, and keeps the current route", async () => {
    const { user } = renderApp({ route: "/app/countries", viewport: "phone" });
    const views = screen.getByRole("navigation", { name: "Views" });
    const homeButton = within(views).getByRole("button", {
      name: "Home Country",
    });

    await user.click(homeButton);
    const homeDialog = screen.getByRole("dialog", { name: "Home Country" });
    const homeSelector = within(homeDialog).getByRole("combobox", {
      name: "Home Country",
    });
    expect(screen.getByTestId("current-location")).toHaveTextContent(
      "/app/countries",
    );

    await user.selectOptions(homeSelector, "se");
    expect(homeSelector).toHaveValue("se");
  });

  it("opens Planned destination and returns focus to its trigger after dismissal", async () => {
    const { user } = renderApp({ route: "/app/countries", viewport: "phone" });
    const views = screen.getByRole("navigation", { name: "Views" });
    const destinationButton = within(views).getByRole("button", {
      name: "Planned destination",
    });

    await user.click(destinationButton);
    expect(
      within(
        screen.getByRole("dialog", { name: "Planned destination" }),
      ).getByRole("combobox", { name: "Planned destination" }),
    ).toBeVisible();
    await user.keyboard("{Escape}");

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Planned destination" }),
      ).not.toBeInTheDocument(),
    );
    expect(destinationButton).toHaveFocus();
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
