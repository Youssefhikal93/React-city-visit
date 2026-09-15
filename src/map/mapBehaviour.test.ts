import { afterEach, describe, expect, test, vi } from "vitest";

import {
  DEFAULT_WORLD_VIEW,
  NO_PENDING_PIN,
  SINGLE_CITY_ZOOM,
  mapViewForPositions,
  pendingPinNavigationTarget,
  pendingPinReducer,
  resolveMapTarget,
  createWorldPlaceSearch,
  searchSavedCities,
  type WorldPlaceFetch,
  type WorldPlaceSearchStatus,
} from "./mapBehaviour";
import { aCity } from "../test/fakeCitiesService";

describe("pending pins", () => {
  const firstPosition = { lat: 59.3293, lng: 18.0686 };
  const secondPosition = { lat: 48.8566, lng: 2.3522 };

  test("a tap creates a pending pin and a second tap moves it", () => {
    const firstPin = pendingPinReducer(NO_PENDING_PIN, {
      type: "tap",
      position: firstPosition,
    });
    const movedPin = pendingPinReducer(firstPin, {
      type: "tap",
      position: secondPosition,
    });

    expect(firstPin).toEqual({ kind: "pending", position: firstPosition });
    expect(movedPin).toEqual({ kind: "pending", position: secondPosition });
  });

  test("a Search result creates or moves the pending pin", () => {
    const pinFromSearch = pendingPinReducer(NO_PENDING_PIN, {
      type: "searchResultPicked",
      position: firstPosition,
    });
    const movedPin = pendingPinReducer(pinFromSearch, {
      type: "searchResultPicked",
      position: secondPosition,
    });

    expect(pinFromSearch).toEqual({
      kind: "pending",
      position: firstPosition,
    });
    expect(movedPin).toEqual({ kind: "pending", position: secondPosition });
  });

  test("confirming a pending pin clears it and returns the Add City route", () => {
    const pendingPin = {
      kind: "pending",
      position: firstPosition,
    } as const;

    expect(pendingPinReducer(pendingPin, { type: "confirm" })).toEqual(
      NO_PENDING_PIN
    );
    expect(pendingPinNavigationTarget(pendingPin)).toBe(
      "/app/form?lat=59.3293&lng=18.0686"
    );
  });

  test("confirming without a pending pin has no navigation target", () => {
    expect(pendingPinReducer(NO_PENDING_PIN, { type: "confirm" })).toEqual(
      NO_PENDING_PIN
    );
    expect(pendingPinNavigationTarget(NO_PENDING_PIN)).toBeNull();
  });

  test("dismissing clears a pending pin", () => {
    expect(
      pendingPinReducer(
        { kind: "pending", position: firstPosition },
        { type: "dismiss" }
      )
    ).toEqual(NO_PENDING_PIN);
  });
});

describe("initial map views", () => {
  test("an Account without Cities sees the world view", () => {
    expect(mapViewForPositions([])).toEqual(DEFAULT_WORLD_VIEW);
  });

  test("one City is centered without zooming to street level", () => {
    const position = { lat: 59.3293, lng: 18.0686 };

    expect(mapViewForPositions([position])).toEqual({
      kind: "center",
      position,
      zoom: SINGLE_CITY_ZOOM,
    });
  });

  test("several Cities fit inside padded bounds", () => {
    expect(
      mapViewForPositions([
        { lat: 59.3293, lng: 18.0686 },
        { lat: 48.8566, lng: 2.3522 },
        { lat: 40.7128, lng: -74.006 },
      ])
    ).toEqual({
      kind: "bounds",
      southWest: { lat: 40.7128, lng: -74.006 },
      northEast: { lat: 59.3293, lng: 18.0686 },
      padding: [32, 32],
    });
  });
});

describe("map targets", () => {
  const paris = aCity({
    id: "paris",
    cityName: "Paris",
    country: "France",
    position: { lat: 48.8566, lng: 2.3522 },
  });
  const lyon = aCity({
    id: "lyon",
    cityName: "Lyon",
    country: "France",
    position: { lat: 45.764, lng: 4.8357 },
  });
  const stockholm = aCity({
    id: "stockholm",
    country: "Sweden",
    position: { lat: 59.3293, lng: 18.0686 },
  });

  test("resolves a City target and opens that City's popup", () => {
    expect(resolveMapTarget("?cityId=paris", [paris, lyon])).toEqual({
      kind: "city",
      city: paris,
      view: {
        kind: "center",
        position: paris.position,
        zoom: SINGLE_CITY_ZOOM,
      },
    });
  });

  test("ignores a City target that is no longer in the Account's Cities", () => {
    expect(resolveMapTarget("?cityId=missing", [paris])).toBeNull();
  });

  test("fits the map to several Cities in a Country", () => {
    expect(resolveMapTarget("?country=France", [paris, lyon, stockholm])).toEqual({
      kind: "country",
      country: "France",
      view: {
        kind: "bounds",
        southWest: { lat: lyon.position.lat, lng: paris.position.lng },
        northEast: { lat: paris.position.lat, lng: lyon.position.lng },
        padding: [32, 32],
      },
    });
  });

  test("centers the map for a Country with one City", () => {
    expect(resolveMapTarget("?country=Sweden", [paris, stockholm])).toEqual({
      kind: "country",
      country: "Sweden",
      view: {
        kind: "center",
        position: stockholm.position,
        zoom: SINGLE_CITY_ZOOM,
      },
    });
  });

  test("uses the world view when a Country target matches no Cities", () => {
    expect(resolveMapTarget("?country=Japan", [paris, stockholm])).toEqual({
      kind: "country",
      country: "Japan",
      view: DEFAULT_WORLD_VIEW,
    });
  });
});

describe("saved City search", () => {
  const cities = [
    aCity({ cityName: "Paris", country: "France" }),
    aCity({ cityName: "Stockholm", country: "Sweden" }),
    aCity({ cityName: "Riga", country: "Latvia" }),
  ];

  test("matches a City name", () => {
    expect(searchSavedCities(cities, "Paris")).toEqual([
      { kind: "savedCity", city: cities[0] },
    ]);
  });

  test("matches a Country name", () => {
    expect(searchSavedCities(cities, "Sweden")).toEqual([
      { kind: "savedCity", city: cities[1] },
    ]);
  });

  test("matches City names case-insensitively", () => {
    expect(searchSavedCities(cities, "PARIS")).toEqual([
      { kind: "savedCity", city: cities[0] },
    ]);
  });

  test("matches a substring in the middle of a City name", () => {
    expect(searchSavedCities(cities, "ris")).toEqual([
      { kind: "savedCity", city: cities[0] },
    ]);
  });

  test("preserves the Cities' own order", () => {
    expect(searchSavedCities(cities, "a")).toEqual([
      { kind: "savedCity", city: cities[0] },
      { kind: "savedCity", city: cities[2] },
    ]);
  });

  test("returns nothing for an empty query", () => {
    expect(searchSavedCities(cities, "")).toEqual([]);
  });

  test("returns nothing for a whitespace-only query", () => {
    expect(searchSavedCities(cities, "   ")).toEqual([]);
  });

  test("returns nothing when no saved City matches", () => {
    expect(searchSavedCities(cities, "Tokyo")).toEqual([]);
  });
});

function nominatimResponse(payload: unknown, ok = true) {
  return { ok, json: async () => payload };
}

describe("world place search", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("rapid queries wait for one pause before starting a lookup", async () => {
    vi.useFakeTimers();
    const fetchWorldPlaces = vi.fn<WorldPlaceFetch>().mockResolvedValue(
      nominatimResponse([])
    );
    const search = createWorldPlaceSearch(fetchWorldPlaces, vi.fn());

    search.searchAfterPause("S");
    search.searchAfterPause("St");
    search.searchAfterPause("Sto");
    await vi.advanceTimersByTimeAsync(999);
    expect(fetchWorldPlaces).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(fetchWorldPlaces).toHaveBeenCalledTimes(1);
  });

  test("a second lookup waits until one second after the first one", async () => {
    vi.useFakeTimers();
    const fetchWorldPlaces = vi.fn<WorldPlaceFetch>().mockResolvedValue(
      nominatimResponse([])
    );
    const search = createWorldPlaceSearch(fetchWorldPlaces, vi.fn());

    search.searchNow("Stockholm");
    await vi.advanceTimersByTimeAsync(0);
    search.searchNow("Paris");
    await vi.advanceTimersByTimeAsync(999);
    expect(fetchWorldPlaces).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(fetchWorldPlaces).toHaveBeenCalledTimes(2);
  });

  test("a changed query aborts its lookup and ignores its late response", async () => {
    vi.useFakeTimers();
    let resolveFirstLookup: (response: ReturnType<typeof nominatimResponse>) => void =
      () => undefined;
    const fetchWorldPlaces = vi
      .fn<WorldPlaceFetch>()
      .mockImplementationOnce(
        (_url, options) =>
          new Promise((resolve) => {
            resolveFirstLookup = resolve;
            expect(options.signal.aborted).toBe(false);
          })
      )
      .mockResolvedValueOnce(
        nominatimResponse([
          { display_name: "Paris, France", lat: "48.8566", lon: "2.3522" },
        ])
      );
    const statuses: WorldPlaceSearchStatus[] = [];
    const search = createWorldPlaceSearch(fetchWorldPlaces, (status) => {
      statuses.push(status);
    });

    search.searchNow("Stockholm");
    await vi.advanceTimersByTimeAsync(0);
    const firstRequest = fetchWorldPlaces.mock.calls[0][1];
    search.searchNow("Paris");
    expect(firstRequest.signal.aborted).toBe(true);

    resolveFirstLookup(
      nominatimResponse([
        { display_name: "Stockholm, Sweden", lat: "59.3293", lon: "18.0686" },
      ])
    );
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(1_000);

    expect(statuses.at(-1)).toEqual({
      kind: "results",
      places: [
        {
          kind: "worldPlace",
          displayName: "Paris, France",
          position: { lat: 48.8566, lng: 2.3522 },
        },
      ],
    });
  });

  test("maps Nominatim names and string Positions into world places", async () => {
    vi.useFakeTimers();
    const fetchWorldPlaces = vi.fn<WorldPlaceFetch>().mockResolvedValue(
      nominatimResponse([
        { display_name: "Stockholm, Sweden", lat: "59.3293", lon: "18.0686" },
      ])
    );
    const statuses: WorldPlaceSearchStatus[] = [];
    const search = createWorldPlaceSearch(fetchWorldPlaces, (status) => {
      statuses.push(status);
    });

    search.searchNow("Stockholm");
    await vi.advanceTimersByTimeAsync(0);

    expect(fetchWorldPlaces.mock.calls[0][0]).toContain(
      "https://nominatim.openstreetmap.org/search?"
    );
    expect(fetchWorldPlaces.mock.calls[0][0]).toContain("format=jsonv2");
    expect(fetchWorldPlaces.mock.calls[0][0]).toContain("q=Stockholm");
    expect(fetchWorldPlaces.mock.calls[0][0]).toContain("limit=5");
    expect(statuses.at(-1)).toEqual({
      kind: "results",
      places: [
        {
          kind: "worldPlace",
          displayName: "Stockholm, Sweden",
          position: { lat: 59.3293, lng: 18.0686 },
        },
      ],
    });
  });

  test("an empty Nominatim response reports no results", async () => {
    vi.useFakeTimers();
    const fetchWorldPlaces = vi.fn<WorldPlaceFetch>().mockResolvedValue(
      nominatimResponse([])
    );
    const statuses: WorldPlaceSearchStatus[] = [];
    const search = createWorldPlaceSearch(fetchWorldPlaces, (status) => {
      statuses.push(status);
    });

    search.searchNow("Nothing");
    await vi.advanceTimersByTimeAsync(0);

    expect(statuses.at(-1)).toEqual({ kind: "noResults" });
  });

  test.each([
    ["a non-OK response", () => Promise.resolve(nominatimResponse([], false))],
    ["a rejected request", () => Promise.reject(new Error("Network failed"))],
  ])("%s reports a lookup failure", async (_scenario, fetchResponse) => {
    vi.useFakeTimers();
    const fetchWorldPlaces = vi
      .fn<WorldPlaceFetch>()
      .mockImplementation(() => fetchResponse());
    const statuses: WorldPlaceSearchStatus[] = [];
    const search = createWorldPlaceSearch(fetchWorldPlaces, (status) => {
      statuses.push(status);
    });

    search.searchNow("Stockholm");
    await vi.advanceTimersByTimeAsync(0);

    expect(statuses.at(-1)).toEqual({ kind: "failed" });
  });
});
