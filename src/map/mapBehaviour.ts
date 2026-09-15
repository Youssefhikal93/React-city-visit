import type { City, Position } from "../types";

export type MapSearchResult =
  | { kind: "savedCity"; city: City };

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

export function searchSavedCities(
  cities: City[],
  query: string
): MapSearchResult[] {
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
