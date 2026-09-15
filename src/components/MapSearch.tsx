import { useEffect, useRef, useState } from "react";

import {
  createWorldPlaceSearch,
  searchSavedCities,
  type WorldPlaceFetch,
  type WorldPlaceSearch,
  type WorldPlaceSearchResult,
  type WorldPlaceSearchStatus,
} from "../map/mapBehaviour";
import { useIsPhone } from "../hooks/useIsPhone";
import type { City } from "../types";

interface MapSearchProps {
  cities: City[];
  onCityPicked: (city: City) => void;
  onWorldPlacePicked: (place: WorldPlaceSearchResult) => void;
  fetchWorldPlaces?: WorldPlaceFetch;
}

const browserFetch: WorldPlaceFetch = (url, options) => fetch(url, options);

export function MapSearch({
  cities,
  onCityPicked,
  onWorldPlacePicked,
  fetchWorldPlaces = browserFetch,
}: MapSearchProps) {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [worldSearchStatus, setWorldSearchStatus] =
    useState<WorldPlaceSearchStatus>({ kind: "idle" });
  const searchRef = useRef<HTMLDivElement>(null);
  const worldPlaceSearch = useRef<WorldPlaceSearch | null>(null);
  const isPhone = useIsPhone();
  const results = searchSavedCities(cities, query);

  function clearSearch(): void {
    setQuery("");
    setIsExpanded(false);
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent): void {
      if (!searchRef.current?.contains(event.target as Node)) clearSearch();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    const search = createWorldPlaceSearch(fetchWorldPlaces, setWorldSearchStatus);
    worldPlaceSearch.current = search;
    return () => {
      search.dispose();
      if (worldPlaceSearch.current === search) {
        worldPlaceSearch.current = null;
      }
    };
  }, [fetchWorldPlaces]);

  useEffect(() => {
    worldPlaceSearch.current?.searchAfterPause(query);
  }, [query]);

  function pickWorldPlace(place: WorldPlaceSearchResult): void {
    onWorldPlacePicked(place);
    clearSearch();
  }

  const hasWorldSearchContent = worldSearchStatus.kind !== "idle";
  const hasResults = results.length > 0 || hasWorldSearchContent;

  // A permanently open box eats the top of a phone screen, which is most of
  // what there is. Collapse it to a button there and let a wide screen keep it.
  if (isPhone && !isExpanded) {
    return (
      <div
        className="absolute right-4 top-3 z-[1000]"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button
          aria-label="Search Cities or the world"
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-dark-2 bg-dark-1/95 text-light-1 shadow-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-2"
          onClick={() => setIsExpanded(true)}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div
      className="absolute left-16 right-4 top-3 z-[1000] md:left-4 md:right-28 md:top-4"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      ref={searchRef}
    >
      <label className="sr-only" htmlFor="map-search">
        Search Cities or the world
      </label>
      <input
        autoFocus={isPhone}
        className="min-h-11 w-full rounded-lg border border-dark-2 bg-light-1 px-4 py-2 text-dark-0 shadow-lg outline-none placeholder:text-dark-2 focus:ring-2 focus:ring-brand-2"
        id="map-search"
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") clearSearch();
          if (event.key === "Enter") {
            event.preventDefault();
            worldPlaceSearch.current?.searchNow(query);
          }
        }}
        placeholder="Search Cities or the world"
        type="search"
        value={query}
      />

      {hasResults && (
        <div className="mt-2 overflow-hidden rounded-lg bg-dark-1 shadow-lg">
          {results.length > 0 && (
            <section aria-labelledby="saved-cities-results">
              <h2 className="px-4 pt-3 text-xs font-bold uppercase tracking-wide text-light-2" id="saved-cities-results">
                Saved Cities
              </h2>
              <ul>
                {results.map((result) => {
                  if (result.kind !== "savedCity") return null;
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
            </section>
          )}
          {hasWorldSearchContent && (
            <section aria-labelledby="world-results">
              <h2 className="border-t border-dark-2 px-4 pt-3 text-xs font-bold uppercase tracking-wide text-light-2" id="world-results">
                World results
              </h2>
              <WorldSearchContent
                onPlacePicked={pickWorldPlace}
                status={worldSearchStatus}
              />
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function WorldSearchContent({
  onPlacePicked,
  status,
}: {
  onPlacePicked: (place: WorldPlaceSearchResult) => void;
  status: WorldPlaceSearchStatus;
}) {
  if (status.kind === "loading") {
    return <p className="px-4 py-3 text-light-1">Searching the world...</p>;
  }
  if (status.kind === "noResults") {
    return <p className="px-4 py-3 text-light-1">No places found.</p>;
  }
  if (status.kind === "failed") {
    return (
      <p className="px-4 py-3 text-light-1">
        World search is unavailable. Please try again.
      </p>
    );
  }
  if (status.kind !== "results") return null;

  return (
    <>
      <WorldPlaceResults onPlacePicked={onPlacePicked} places={status.places} />
      <OpenStreetMapAttribution />
    </>
  );
}

function WorldPlaceResults({
  onPlacePicked,
  places,
}: {
  onPlacePicked: (place: WorldPlaceSearchResult) => void;
  places: WorldPlaceSearchResult[];
}) {
  return (
    <ul>
      {places.map((place) => (
        <li key={`${place.position.lat}-${place.position.lng}-${place.displayName}`}>
          <button
            className="flex min-h-11 w-full items-center px-4 py-2 text-left text-light-1 hover:bg-dark-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-2"
            onClick={() => onPlacePicked(place)}
            type="button"
          >
            {place.displayName}
          </button>
        </li>
      ))}
    </ul>
  );
}

function OpenStreetMapAttribution() {
  return (
    <p className="border-t border-dark-2 px-4 py-2 text-xs text-light-2">
      Search by{" "}
      <a
        className="underline focus:outline-none focus:ring-2 focus:ring-brand-2"
        href="https://www.openstreetmap.org/copyright"
        rel="noreferrer"
        target="_blank"
      >
        OpenStreetMap / Nominatim
      </a>
    </p>
  );
}
