import { GeoJSON } from "react-leaflet";

import {
  countryListBoundaries,
  visitedCountryBoundaries,
} from "./countryBoundaries";
import type { City } from "../types";

const visitedCountryStyle = {
  color: "#0f604d",
  fillColor: "#22c29b",
  fillOpacity: 0.42,
  opacity: 0.8,
  weight: 1,
};

const livedInCountryStyle = {
  color: "#d97706",
  fillColor: "#fbbf24",
  fillOpacity: 0.58,
  opacity: 0.9,
  weight: 1.5,
};

const plannedCountryStyle = {
  color: "#6d28d9",
  fillColor: "#a78bfa",
  fillOpacity: 0.62,
  opacity: 0.95,
  weight: 1.5,
};

function codesKey(countryCodes: Iterable<string>): string {
  return [...countryCodes].sort().join(",") || "none";
}

/**
 * Uses its own Leaflet layers so list and city updates replace the filtered
 * geometry. Each Country is drawn once, with lived in taking precedence over
 * planned, and planned over visited. The layers are deliberately
 * non-interactive: taps, markers, and map Search continue to target the map
 * below them.
 */
export function CountryVisitOverlay({
  cities,
  livedInCountryCodes,
  plannedCountryCodes,
}: {
  cities: City[];
  livedInCountryCodes: string[];
  plannedCountryCodes: string[];
}) {
  const livedIn = new Set(livedInCountryCodes);
  const plannedOrLivedIn = new Set([...livedInCountryCodes, ...plannedCountryCodes]);
  const visitedKey = cities
    .map((city) => `${city.id}:${city.emoji}`)
    .sort()
    .join("|");

  return (
    <>
      <GeoJSON
        data={visitedCountryBoundaries(cities, plannedOrLivedIn)}
        interactive={false}
        key={`visited-${visitedKey}-${codesKey(plannedOrLivedIn)}`}
        style={visitedCountryStyle}
      />
      <GeoJSON
        data={countryListBoundaries(plannedCountryCodes, livedIn)}
        interactive={false}
        key={`planned-${codesKey(plannedCountryCodes)}-${codesKey(livedIn)}`}
        style={plannedCountryStyle}
      />
      <GeoJSON
        data={countryListBoundaries(livedInCountryCodes)}
        interactive={false}
        key={`lived-in-${codesKey(livedIn)}`}
        style={livedInCountryStyle}
      />
    </>
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
          className="h-3 w-3 rounded-sm border border-[#d97706] bg-[#fbbf24]/60"
        />
        Lived in
      </span>
      <span className="mt-1 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="h-3 w-3 rounded-sm border border-[#0f604d] bg-[#22c29b]/50"
        />
        Visited
      </span>
      <span className="mt-1 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="h-3 w-3 rounded-sm border border-[#6d28d9] bg-[#a78bfa]/60"
        />
        Planned
      </span>
    </aside>
  );
}
