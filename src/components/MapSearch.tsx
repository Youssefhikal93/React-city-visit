import { useEffect, useRef, useState } from "react";

import { searchSavedCities } from "../map/mapBehaviour";
import type { City } from "../types";

interface MapSearchProps {
  cities: City[];
  onCityPicked: (city: City) => void;
}

export function MapSearch({ cities, onCityPicked }: MapSearchProps) {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const results = searchSavedCities(cities, query);

  function clearSearch(): void {
    setQuery("");
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent): void {
      if (!searchRef.current?.contains(event.target as Node)) clearSearch();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div
      className="absolute left-4 right-4 top-4 z-[1000] md:right-28"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      ref={searchRef}
    >
      <label className="sr-only" htmlFor="map-search">
        Search saved Cities
      </label>
      <input
        className="min-h-11 w-full rounded-lg border border-dark-2 bg-light-1 px-4 py-2 text-dark-0 shadow-lg outline-none placeholder:text-dark-2 focus:ring-2 focus:ring-brand-2"
        id="map-search"
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") clearSearch();
        }}
        placeholder="Search saved Cities"
        type="search"
        value={query}
      />

      {results.length > 0 && (
        <ul className="mt-2 overflow-hidden rounded-lg bg-dark-1 shadow-lg">
          {results.map((result) => {
            const { city } = result;
            return (
              <li key={city.id}>
                <button
                  className="flex min-h-11 w-full items-center gap-3 px-4 py-2 text-left text-light-1 hover:bg-dark-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-2"
                  onClick={() => {
                    onCityPicked(city);
                    clearSearch();
                  }}
                  type="button"
                >
                  <img
                    alt={`Flag of ${city.country}`}
                    className="h-5 w-7 rounded object-cover"
                    src={`https://flagcdn.com/32x24/${city.emoji.toLowerCase()}.png`}
                  />
                  <span className="font-semibold">{city.cityName}</span>
                  <span className="text-light-0">{city.country}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
