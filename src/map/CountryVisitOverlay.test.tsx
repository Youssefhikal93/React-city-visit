import { render, screen } from "@testing-library/react";
import { MapContainer } from "react-leaflet";
import { describe, expect, test } from "vitest";

import {
  CountryVisitLegend,
  CountryVisitOverlay,
} from "./CountryVisitOverlay";
import { aCity } from "../test/fakeCitiesService";
import type { City } from "../types";

function CountryMap({ cities }: { cities: City[] }) {
  return (
    <MapContainer
      attributionControl={false}
      center={[48.8566, 2.3522]}
      style={{ height: 400, width: 640 }}
      zoom={4}
      zoomControl={false}
    >
      <CountryVisitOverlay cities={cities} />
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

  test("shows a visible legend for the Country fill", () => {
    render(<CountryVisitLegend />);

    expect(screen.getByLabelText("Map legend")).toHaveTextContent(
      "Visited Country",
    );
  });
});
