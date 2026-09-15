import { describe, expect, test } from "vitest";

import {
  DEFAULT_WORLD_VIEW,
  NO_PENDING_PIN,
  SINGLE_CITY_ZOOM,
  mapViewForPositions,
  pendingPinNavigationTarget,
  pendingPinReducer,
} from "./mapBehaviour";

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
      "form?lat=59.3293&lng=18.0686"
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
