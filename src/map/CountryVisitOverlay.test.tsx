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
  livedIn = [],
  planned = [],
}: {
  cities: City[];
  livedIn?: string[];
  planned?: string[];
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
        livedInCountryCodes={livedIn}
        plannedCountryCodes={planned}
      />
    </MapContainer>
  );
}

const VISITED = "#22c29b";
const LIVED_IN = "#fbbf24";
const PLANNED = "#a78bfa";

function paths(container: HTMLElement, fill?: string) {
  return container.querySelectorAll(
    fill
      ? `.leaflet-overlay-pane path[fill="${fill}"]`
      : ".leaflet-overlay-pane path",
  );
}

function expectOnlyFill(container: HTMLElement, fill: string) {
  expect(paths(container)).not.toHaveLength(0);
  paths(container).forEach((path) => expect(path).toHaveAttribute("fill", fill));
}

describe("CountryVisitOverlay", () => {
  test("removes non-interactive SVG country paths after deleting the last City", () => {
    const paris = aCity({ id: "paris", emoji: "fr" });
    const { container, rerender } = render(<CountryMap cities={[paris]} />);

    expect(paths(container)).not.toHaveLength(0);
    paths(container).forEach((path) =>
      expect(path).not.toHaveClass("leaflet-interactive"),
    );

    rerender(<CountryMap cities={[]} />);

    expect(paths(container)).toHaveLength(0);
  });

  test("uses lived in, then planned, then visited color precedence", () => {
    const paris = aCity({ id: "paris", emoji: "fr" });
    const { container, rerender } = render(
      <CountryMap cities={[paris]} livedIn={["fr"]} planned={["fr"]} />,
    );
    expectOnlyFill(container, LIVED_IN);

    rerender(<CountryMap cities={[paris]} planned={["fr"]} />);
    expectOnlyFill(container, PLANNED);

    rerender(<CountryMap cities={[paris]} />);
    expectOnlyFill(container, VISITED);
  });

  test("colors every Country on each list, with or without a City", () => {
    const { container } = render(
      <CountryMap cities={[]} livedIn={["fr", "se"]} planned={["is", "jp"]} />,
    );
    const livedInCount = paths(container, LIVED_IN).length;

    expect(livedInCount).toBeGreaterThanOrEqual(2);
    expect(paths(container, PLANNED).length).toBeGreaterThanOrEqual(2);
    expect(paths(container, VISITED)).toHaveLength(0);
  });

  test("shows a visible legend for the Country fill", () => {
    render(<CountryVisitLegend />);

    const legend = screen.getByLabelText("Map legend");
    expect(legend).toHaveTextContent("Lived in");
    expect(legend).toHaveTextContent("Visited");
    expect(legend).toHaveTextContent("Planned");
  });
});
