import { render, screen } from "@testing-library/react";
import { MapContainer } from "react-leaflet";
import { describe, expect, test } from "vitest";

import {
  CountryVisitLegend,
  CountryVisitOverlay,
} from "./CountryVisitOverlay";
import { aCity } from "../test/fakeCitiesService";
import type { City } from "../types";

function CountryMap({
  cities,
  homeCountryCode = null,
  plannedCountryCode = null,
}: {
  cities: City[];
  homeCountryCode?: string | null;
  plannedCountryCode?: string | null;
}) {
  return (
    <MapContainer
      attributionControl={false}
      center={[48.8566, 2.3522]}
      style={{ height: 400, width: 640 }}
      zoom={4}
      zoomControl={false}
    >
      <CountryVisitOverlay
        cities={cities}
        homeCountryCode={homeCountryCode}
        plannedCountryCode={plannedCountryCode}
      />
    </MapContainer>
  );
}

describe("CountryVisitOverlay", () => {
  test("removes non-interactive SVG country paths after deleting the last City", () => {
    const paris = aCity({ id: "paris", emoji: "fr" });
    const { container, rerender } = render(<CountryMap cities={[paris]} />);
    const countryPaths = () =>
      container.querySelectorAll(".leaflet-overlay-pane path");

    expect(countryPaths()).not.toHaveLength(0);
    countryPaths().forEach((path) =>
      expect(path).not.toHaveClass("leaflet-interactive"),
    );

    rerender(<CountryMap cities={[]} />);

    expect(countryPaths()).toHaveLength(0);
  });

  test("restores visited coloring after clearing a home Country that is also visited", () => {
    const paris = aCity({ id: "paris", emoji: "fr" });
    const { container, rerender } = render(
      <CountryMap cities={[paris]} homeCountryCode="fr" />,
    );
    const countryPaths = () =>
      container.querySelectorAll(".leaflet-overlay-pane path");

    expect(countryPaths()).not.toHaveLength(0);
    countryPaths().forEach((path) =>
      expect(path).toHaveAttribute("fill", "#fbbf24"),
    );

    rerender(<CountryMap cities={[paris]} />);

    countryPaths().forEach((path) =>
      expect(path).toHaveAttribute("fill", "#22c29b"),
    );
  });

  test("uses planned, then home, then visited color precedence", () => {
    const paris = aCity({ id: "paris", emoji: "fr" });
    const { container, rerender } = render(
      <CountryMap
        cities={[paris]}
        homeCountryCode="fr"
        plannedCountryCode="fr"
      />,
    );
    const countryPaths = () =>
      container.querySelectorAll(".leaflet-overlay-pane path");

    expect(countryPaths()).not.toHaveLength(0);
    countryPaths().forEach((path) =>
      expect(path).toHaveAttribute("fill", "#a78bfa"),
    );

    rerender(<CountryMap cities={[paris]} homeCountryCode="fr" />);
    expect(countryPaths()).not.toHaveLength(0);
    countryPaths().forEach((path) =>
      expect(path).toHaveAttribute("fill", "#fbbf24"),
    );

    rerender(<CountryMap cities={[paris]} />);
    expect(countryPaths()).not.toHaveLength(0);
    countryPaths().forEach((path) =>
      expect(path).toHaveAttribute("fill", "#22c29b"),
    );
  });

  test("renders distinct home and planned Countries with their own colors", () => {
    const { container } = render(
      <CountryMap homeCountryCode="fr" cities={[]} plannedCountryCode="is" />,
    );

    const homePaths = container.querySelectorAll(
      '.leaflet-overlay-pane path[fill="#fbbf24"]',
    );
    const plannedPaths = container.querySelectorAll(
      '.leaflet-overlay-pane path[fill="#a78bfa"]',
    );

    expect(homePaths).not.toHaveLength(0);
    expect(plannedPaths).not.toHaveLength(0);
  });

  test("shows a planned destination without a saved City", () => {
    const { container } = render(
      <CountryMap cities={[]} plannedCountryCode="is" />,
    );

    const countryPaths = container.querySelectorAll(
      ".leaflet-overlay-pane path",
    );
    expect(countryPaths).not.toHaveLength(0);
    countryPaths.forEach((path) =>
      expect(path).toHaveAttribute("fill", "#a78bfa"),
    );
  });

  test("shows a visible legend for the Country fill", () => {
    render(<CountryVisitLegend />);

    expect(screen.getByLabelText("Map legend")).toHaveTextContent(
      "Visited Country",
    );
    expect(screen.getByLabelText("Map legend")).toHaveTextContent(
      "Home Country",
    );
    expect(screen.getByLabelText("Map legend")).toHaveTextContent(
      "Planned destination",
    );
  });
});
