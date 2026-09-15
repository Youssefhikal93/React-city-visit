import type { City, Position } from "../types";

export type MapSearchResult =
  | { kind: "savedCity"; city: City }
  | { kind: "worldPlace"; displayName: string; position: Position };

export type WorldPlaceSearchStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "results"; places: WorldPlaceSearchResult[] }
  | { kind: "noResults" }
  | { kind: "failed" };

export type WorldPlaceSearchResult = Extract<
  MapSearchResult,
  { kind: "worldPlace" }
>;

type SavedCitySearchResult = Extract<MapSearchResult, { kind: "savedCity" }>;

export type WorldPlaceFetch = (
  url: string,
  options: { signal: AbortSignal; headers: HeadersInit }
) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

export interface WorldPlaceSearch {
  searchAfterPause(query: string): void;
  searchNow(query: string): void;
  dispose(): void;
}

const WORLD_SEARCH_DELAY_MS = 1_000;
const WORLD_SEARCH_LIMIT = 5;

export type PendingPinState =
  | { kind: "none" }
  | { kind: "pending"; position: Position };

export type PendingPinEvent =
  | { type: "tap"; position: Position }
  | { type: "searchResultPicked"; position: Position }
  | { type: "confirm" }
  | { type: "dismiss" };

export type MapView =
  | { kind: "center"; position: Position; zoom: number }
  | {
      kind: "bounds";
      southWest: Position;
      northEast: Position;
      padding: [number, number];
    };

export type MapTarget =
  | { kind: "city"; city: City; view: MapView }
  | { kind: "country"; country: string; view: MapView };

export const NO_PENDING_PIN: PendingPinState = { kind: "none" };
export const DEFAULT_WORLD_VIEW: Extract<MapView, { kind: "center" }> = {
  kind: "center",
  position: { lat: 20, lng: 0 },
  zoom: 2,
};
export const SINGLE_CITY_ZOOM = 10;

export function pendingPinReducer(
  _state: PendingPinState,
  event: PendingPinEvent
): PendingPinState {
  switch (event.type) {
    case "tap":
    case "searchResultPicked":
      return { kind: "pending", position: event.position };
    case "confirm":
    case "dismiss":
      return NO_PENDING_PIN;
  }
}

function addCityTarget(position: Position): string {
  return `form?lat=${position.lat}&lng=${position.lng}`;
}

export function pendingPinNavigationTarget(
  state: PendingPinState
): string | null {
  return state.kind === "pending" ? addCityTarget(state.position) : null;
}

export function cityDetailTarget(id: string, position: Position): string {
  return `/app/cities/${id}?lat=${position.lat}&lng=${position.lng}`;
}

export function mapCityTarget(city: City): string {
  const searchParams = new URLSearchParams({
    lat: String(city.position.lat),
    lng: String(city.position.lng),
    cityId: city.id,
  });
  return `/app/map?${searchParams.toString()}`;
}

export function mapCountryTarget(country: string): string {
  const searchParams = new URLSearchParams({ country });
  return `/app/map?${searchParams.toString()}`;
}

export function resolveMapTarget(
  search: string,
  cities: City[]
): MapTarget | null {
  const searchParams = new URLSearchParams(search);
  const cityId = searchParams.get("cityId");

  if (cityId) {
    const city = cities.find((savedCity) => savedCity.id === cityId);
    return city
      ? { kind: "city", city, view: mapViewForPositions([city.position]) }
      : null;
  }

  const country = searchParams.get("country");
  if (!country) return null;

  const positions = cities
    .filter((city) => city.country === country)
    .map((city) => city.position);
  return { kind: "country", country, view: mapViewForPositions(positions) };
}

export function searchSavedCities(
  cities: City[],
  query: string
): SavedCitySearchResult[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) return [];

  return cities
    .filter((city) => {
      return (
        city.cityName.toLowerCase().includes(normalizedQuery) ||
        city.country.toLowerCase().includes(normalizedQuery)
      );
    })
    .map((city) => ({ kind: "savedCity", city }));
}

export function createWorldPlaceSearch(
  fetchWorldPlaces: WorldPlaceFetch,
  onStatusChange: (status: WorldPlaceSearchStatus) => void
): WorldPlaceSearch {
  return new WorldPlaceSearchController(fetchWorldPlaces, onStatusChange);
}

class WorldPlaceSearchController implements WorldPlaceSearch {
  private abortController: AbortController | null = null;
  private lookupTimer: ReturnType<typeof setTimeout> | null = null;
  private lastRequestStartedAt = -WORLD_SEARCH_DELAY_MS;
  private requestVersion = 0;

  constructor(
    private readonly fetchWorldPlaces: WorldPlaceFetch,
    private readonly onStatusChange: (status: WorldPlaceSearchStatus) => void
  ) {}

  searchAfterPause(query: string): void {
    this.schedule(query, WORLD_SEARCH_DELAY_MS);
  }

  searchNow(query: string): void {
    this.schedule(query, 0);
  }

  dispose(): void {
    this.cancelCurrentLookup();
  }

  private schedule(query: string, debounceDelay: number): void {
    this.cancelCurrentLookup();
    const trimmedQuery = query.trim();
    this.onStatusChange({ kind: "idle" });
    if (trimmedQuery.length === 0) return;

    const rateLimitDelay = Math.max(
      0,
      this.lastRequestStartedAt + WORLD_SEARCH_DELAY_MS - Date.now()
    );
    const delay = Math.max(debounceDelay, rateLimitDelay);
    const requestVersion = this.requestVersion;
    this.lookupTimer = setTimeout(() => {
      this.lookupTimer = null;
      void this.lookup(trimmedQuery, requestVersion);
    }, delay);
  }

  private cancelCurrentLookup(): void {
    this.requestVersion += 1;
    if (this.lookupTimer !== null) clearTimeout(this.lookupTimer);
    this.lookupTimer = null;
    this.abortController?.abort();
    this.abortController = null;
  }

  private async lookup(query: string, requestVersion: number): Promise<void> {
    const abortController = new AbortController();
    this.abortController = abortController;
    this.lastRequestStartedAt = Date.now();
    this.onStatusChange({ kind: "loading" });

    try {
      const response = await this.fetchWorldPlaces(nominatimSearchUrl(query), {
        signal: abortController.signal,
        headers: { Accept: "application/json" },
      });
      if (requestVersion !== this.requestVersion) return;
      if (!response.ok) {
        this.onStatusChange({ kind: "failed" });
        return;
      }

      const places = worldPlacesFromPayload(await response.json());
      if (requestVersion !== this.requestVersion) return;
      this.onStatusChange(
        places.length > 0 ? { kind: "results", places } : { kind: "noResults" }
      );
    } catch (error: unknown) {
      if (requestVersion !== this.requestVersion || isAbortError(error)) return;
      this.onStatusChange({ kind: "failed" });
    }
  }
}

function nominatimSearchUrl(query: string): string {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(WORLD_SEARCH_LIMIT));
  return url.toString();
}

function worldPlacesFromPayload(payload: unknown): WorldPlaceSearchResult[] {
  if (!Array.isArray(payload)) return [];

  return payload.flatMap((place) => {
    if (!isNominatimPlace(place)) return [];
    const position = { lat: Number(place.lat), lng: Number(place.lon) };
    if (!Number.isFinite(position.lat) || !Number.isFinite(position.lng)) return [];
    return [{ kind: "worldPlace" as const, displayName: place.display_name, position }];
  });
}

function isNominatimPlace(
  place: unknown
): place is { display_name: string; lat: string; lon: string } {
  if (typeof place !== "object" || place === null) return false;
  const candidate = place as Record<string, unknown>;
  return (
    typeof candidate.display_name === "string" &&
    typeof candidate.lat === "string" &&
    typeof candidate.lon === "string"
  );
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function positionFromQuery(
  lat: string | null,
  lng: string | null
): Position | null {
  if (lat === null || lng === null) return null;

  const position = { lat: Number(lat), lng: Number(lng) };
  return Number.isFinite(position.lat) && Number.isFinite(position.lng)
    ? position
    : null;
}

export function mapViewForPositions(positions: Position[]): MapView {
  if (positions.length === 0) return DEFAULT_WORLD_VIEW;

  if (positions.length === 1) {
    return {
      kind: "center",
      position: positions[0],
      zoom: SINGLE_CITY_ZOOM,
    };
  }

  let south = positions[0].lat;
  let north = positions[0].lat;
  let west = positions[0].lng;
  let east = positions[0].lng;

  for (const position of positions.slice(1)) {
    south = Math.min(south, position.lat);
    north = Math.max(north, position.lat);
    west = Math.min(west, position.lng);
    east = Math.max(east, position.lng);
  }

  return {
    kind: "bounds",
    southWest: { lat: south, lng: west },
    northEast: { lat: north, lng: east },
    padding: [32, 32],
  };
}
