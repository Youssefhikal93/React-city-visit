import { GeoJSON } from "react-leaflet";

import {
  countryPreferenceBoundaries,
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

const homeCountryStyle = {
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

function boundaryKey(
  cities: City[],
  homeCountryCode: string | null,
  plannedCountryCode: string | null,
): string {
  return cities
    .map((city) => `${city.id}:${city.emoji}`)
    .sort()
    .concat(homeCountryCode ?? "", plannedCountryCode ?? "")
    .join("|");
}

/**
 * Uses its own Leaflet layer so city updates replace the filtered geometry.
 * The layer is deliberately non-interactive: taps, markers, and map Search
 * continue to target the map below it.
 */
export function CountryVisitOverlay({
  cities,
  homeCountryCode,
  plannedCountryCode,
}: {
  cities: City[];
  homeCountryCode: string | null;
  plannedCountryCode: string | null;
}) {
  const excludedCountryCodes = new Set(
    [homeCountryCode, plannedCountryCode].filter(
      (countryCode): countryCode is string => countryCode !== null,
    ),
  );

  return (
    <>
      <GeoJSON
        data={visitedCountryBoundaries(cities, excludedCountryCodes)}
        interactive={false}
        key={`visited-${boundaryKey(cities, homeCountryCode, plannedCountryCode)}`}
        style={visitedCountryStyle}
      />
      <GeoJSON
        data={countryPreferenceBoundaries(
          plannedCountryCode === homeCountryCode ? null : homeCountryCode,
        )}
        interactive={false}
        key={`home-${plannedCountryCode === homeCountryCode ? "none" : (homeCountryCode ?? "none")}`}
        style={homeCountryStyle}
      />
      <GeoJSON
        data={countryPreferenceBoundaries(plannedCountryCode)}
        interactive={false}
        key={`planned-${plannedCountryCode ?? "none"}`}
        style={plannedCountryStyle}
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
          className="h-3 w-3 rounded-sm border border-[#0f604d] bg-[#22c29b]/50"
        />
        Visited Country
      </span>
      <span className="mt-1 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="h-3 w-3 rounded-sm border border-[#d97706] bg-[#fbbf24]/60"
        />
        Home Country
      </span>
      <span className="mt-1 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="h-3 w-3 rounded-sm border border-[#6d28d9] bg-[#a78bfa]/60"
        />
        Planned destination
      </span>
    </aside>
  );
}
