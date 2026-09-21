import { GeoJSON } from "react-leaflet";

import { visitedCountryBoundaries } from "./countryBoundaries";
import type { City } from "../types";

const visitedCountryStyle = {
  color: "#0f604d",
  fillColor: "#22c29b",
  fillOpacity: 0.42,
  opacity: 0.8,
  weight: 1,
};

function boundaryKey(cities: City[]): string {
  return cities
    .map((city) => `${city.id}:${city.emoji}`)
    .sort()
    .join("|");
}

/**
 * Uses its own Leaflet layer so city updates replace the filtered geometry.
 * The layer is deliberately non-interactive: taps, markers, and map Search
 * continue to target the map below it.
 */
export function CountryVisitOverlay({ cities }: { cities: City[] }) {
  return (
    <GeoJSON
      data={visitedCountryBoundaries(cities)}
      interactive={false}
      key={boundaryKey(cities)}
      style={visitedCountryStyle}
    />
  );
}

export function CountryVisitLegend() {
  return (
    <aside
      aria-label="Map legend"
      className="pointer-events-none absolute bottom-24 right-3 z-[1000] rounded-lg border border-dark-2 bg-dark-1/95 px-3 py-2 text-xs font-semibold text-light-1 shadow-lg backdrop-blur-sm"
    >
      <span className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="h-3 w-3 rounded-sm border border-[#0f604d] bg-[#22c29b]/50"
        />
        Visited Country
      </span>
    </aside>
  );
}
