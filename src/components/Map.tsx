import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import {
  divIcon,
  type LatLngBoundsExpression,
  type Map as LeafletMap,
  type Marker as LeafletMarker,
} from "leaflet";
import { FiNavigation } from "react-icons/fi";
import { findSavedCity } from "../services/cityIdentity";

import { useCities } from "../context/CitiesContext";
import { reverseGeocode, type PlaceName } from "../services/geocoding";
import { useGeolocation } from "../hooks/useGeoLocation";
import { useURLPosition } from "../hooks/useURLPosition";
import {
  DEFAULT_WORLD_VIEW,
  LOCATED_POSITION_ZOOM,
  NO_PENDING_PIN,
  cityDetailTarget,
  mapViewForPositions,
  pendingPinReducer,
  pendingPinNavigationTarget,
  positionFromQuery,
  resolveMapTarget,
  type MapTarget,
  type MapView,
  type WorldPlaceSearchResult,
} from "../map/mapBehaviour";
import type { City, Position } from "../types";
import {
  CountryVisitLegend,
  CountryVisitOverlay,
} from "../map/CountryVisitOverlay";
import { MapSearch } from "./MapSearch";
import Spinner from "./Spinner";

const cityIcon = divIcon({
  className: "city-marker",
  html: '<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg"><path d="M14 34S2 21 2 14a12 12 0 1 1 24 0c0 7-12 20-12 20Z" fill="#168568" stroke="white" stroke-width="2.5"/><circle cx="14" cy="14" r="4" fill="white"/></svg>',
  iconSize: [28, 36],
  iconAnchor: [14, 35],
  popupAnchor: [0, -30],
});

function Map() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { cities, clearError, isLoading } = useCities();
  const {
    getPosition: getPositionGeoLocation,
    isLoading: isLoadingGeoLocation,
    position: positionGeoLocation,
  } = useGeolocation();
  const [lat, lng] = useURLPosition();
  const [pendingPin, dispatchPendingPin] = useReducer(
    pendingPinReducer,
    NO_PENDING_PIN,
  );
  const [searchTarget, setSearchTarget] = useState<City | null>(null);
  const [worldSearchTarget, setWorldSearchTarget] = useState<Position | null>(
    null,
  );
  const cityMarkers = useRef(new globalThis.Map<string, LeafletMarker>());
  const urlPosition = positionFromQuery(lat, lng);
  const mapTarget = useMemo(
    () => resolveMapTarget(search, cities),
    [cities, search],
  );
  const initialCenter =
    mapTarget?.view.kind === "center"
      ? mapTarget.view.position
      : (urlPosition ?? DEFAULT_WORLD_VIEW.position);
  const requestedPosition = positionGeoLocation ?? urlPosition;

  function handleMapTap(position: Position): void {
    clearError();
    dispatchPendingPin({ type: "tap", position });
  }

  function handleConfirmPendingPin(): void {
    if (pendingPin.kind === "none") return;

    const target = pendingPinNavigationTarget(pendingPin);
    dispatchPendingPin({ type: "confirm" });
    if (target) navigate(target);
  }

  function handleDismissPendingPin(): void {
    dispatchPendingPin({ type: "dismiss" });
  }

  function selectSavedCity(city: City): void {
    setSearchTarget(city);
  }

  function selectWorldPlace(place: WorldPlaceSearchResult): void {
    clearError();
    setWorldSearchTarget(place.position);
    dispatchPendingPin({
      type: "searchResultPicked",
      position: place.position,
    });
  }

  // Locating is nearly always a prelude to adding where you are standing, so
  // drop the pending pin too: the popup names the place and confirming opens
  // the form already filled in with this Position.
  useEffect(() => {
    if (!positionGeoLocation) return;
    dispatchPendingPin({
      type: "searchResultPicked",
      position: positionGeoLocation,
    });
  }, [positionGeoLocation]);

  return (
    <div className="relative h-full w-full flex-1 overflow-hidden rounded-lg bg-dark-2 shadow-2xl sm:rounded-lg sm:shadow-xl md:h-full md:rounded-none md:shadow-lg">
      <MapContainer
        className="h-full w-full"
        center={[initialCenter.lat, initialCenter.lng]}
        zoom={DEFAULT_WORLD_VIEW.zoom}
        zoomControl={false}
        scrollWheelZoom
        minZoom={2}
        maxZoom={18}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        style={{
          background: "linear-gradient(135deg, #2d3439 0%, #42484d 100%)",
        }}
      >
        <ZoomControl position="bottomleft" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          errorTileUrl="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iIzJkMzQzOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjYWFhIiBmb250LXNpemU9IjE0Ij5NYXAgVGlsZSBVbmF2YWlsYWJsZTwvdGV4dD48L3N2Zz4="
        />

        <CountryVisitOverlay cities={cities} />

        {cities.map((city) => (
          <Marker
            title={city.cityName}
            alt={city.cityName}
            icon={cityIcon}
            key={city.id}
            position={[city.position.lat, city.position.lng]}
            ref={(marker) => {
              if (marker) cityMarkers.current.set(city.id, marker);
              else cityMarkers.current.delete(city.id);
            }}
          >
            <Popup className="text-dark-0" maxWidth={240}>
              <div className="flex min-w-40 items-center gap-2 p-2">
                <img
                  alt={`Flag of ${city.country}`}
                  className="h-5 w-7 rounded object-cover"
                  src={`https://flagcdn.com/32x24/${city.emoji.toLowerCase()}.png`}
                />
                <Link
                  className="inline-flex min-h-11 items-center rounded px-2 py-2 font-semibold text-dark-0 hover:bg-light-1 focus:outline-none focus:ring-2 focus:ring-brand-2"
                  to={cityDetailTarget(city.id, city.position)}
                >
                  {city.cityName}
                </Link>
              </div>
              <p className="saved-city-note">
                Already in your list - {city.visitCount ?? 1} visits
              </p>
            </Popup>
          </Marker>
        ))}

        {pendingPin.kind === "pending" && (
          <PendingPin
            onConfirm={handleConfirmPendingPin}
            onDismiss={handleDismissPendingPin}
            position={pendingPin.position}
          />
        )}

        <ApplyInitialView
          isLoading={isLoading}
          positions={cities.map((city) => city.position)}
          shouldSkip={urlPosition !== null || mapTarget !== null}
        />
        {requestedPosition && (
          <ChangeCenter
            position={requestedPosition}
            zoom={positionGeoLocation ? LOCATED_POSITION_ZOOM : undefined}
          />
        )}
        <ApplyMapTarget target={mapTarget} markers={cityMarkers.current} />
        {searchTarget && (
          <FlyToSearchResult
            city={searchTarget}
            marker={cityMarkers.current.get(searchTarget.id) ?? null}
          />
        )}
        {worldSearchTarget && (
          <FlyToWorldSearchResult position={worldSearchTarget} />
        )}
        <DetectClick onTap={handleMapTap} />
      </MapContainer>

      <MapSearch
        cities={cities}
        onCityPicked={selectSavedCity}
        onWorldPlacePicked={selectWorldPlace}
      />

      <CountryVisitLegend />

      <button
        aria-label="Use your Position"
        className="absolute bottom-8 right-3 z-[1000] flex min-h-11 items-center gap-2 rounded-lg bg-brand-2 px-4 py-2 text-sm font-bold text-dark-1 shadow-lg focus:outline-none focus:ring-2 focus:ring-light-2"
        disabled={isLoadingGeoLocation}
        onClick={getPositionGeoLocation}
        type="button"
      >
        {isLoadingGeoLocation ? <Spinner small /> : null}
        <FiNavigation aria-hidden="true" />
        <span>
          {isLoadingGeoLocation ? "Locating..." : "Use your Position"}
        </span>
      </button>
    </div>
  );
}

function ApplyMapTarget({
  target,
  markers,
}: {
  target: MapTarget | null;
  markers: globalThis.Map<string, LeafletMarker>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;

    applyMapView(map, target.view);
    if (target.kind === "city") markers.get(target.city.id)?.openPopup();
  }, [map, markers, target]);

  return null;
}

function FlyToWorldSearchResult({ position }: { position: Position }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([position.lat, position.lng], map.getZoom(), {
      animate: true,
      duration: 1,
    });
  }, [map, position]);

  return null;
}

function FlyToSearchResult({
  city,
  marker,
}: {
  city: City;
  marker: LeafletMarker | null;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([city.position.lat, city.position.lng], map.getZoom(), {
      animate: true,
      duration: 1,
    });
    marker?.openPopup();
  }, [city, map, marker]);

  return null;
}

function ApplyInitialView({
  isLoading,
  positions,
  shouldSkip,
}: {
  isLoading: boolean;
  positions: Position[];
  shouldSkip: boolean;
}) {
  const map = useMap();
  const hasWaitedForCities = useRef(false);
  const hasAppliedInitialView = useRef(false);

  useEffect(() => {
    if (!hasWaitedForCities.current) {
      hasWaitedForCities.current = true;
      return;
    }

    if (hasAppliedInitialView.current) return;

    if (shouldSkip) {
      hasAppliedInitialView.current = true;
      return;
    }

    if (isLoading) return;

    applyMapView(map, mapViewForPositions(positions));
    hasAppliedInitialView.current = true;
  }, [isLoading, map, positions, shouldSkip]);

  return null;
}

function applyMapView(map: LeafletMap, view: MapView): void {
  if (view.kind === "center") {
    map.setView([view.position.lat, view.position.lng], view.zoom);
    return;
  }

  const bounds: LatLngBoundsExpression = [
    [view.southWest.lat, view.southWest.lng],
    [view.northEast.lat, view.northEast.lng],
  ];
  map.fitBounds(bounds, { padding: view.padding });
}

/**
 * Keeping the current zoom left an Account looking at their street from the
 * world view, which reads as "nothing happened".
 */
function ChangeCenter({
  position,
  zoom,
}: {
  position: Position;
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([position.lat, position.lng], zoom ?? map.getZoom(), {
      animate: true,
      duration: 1,
    });
  }, [map, position.lat, position.lng, zoom]);

  return null;
}

function DetectClick({ onTap }: { onTap: (position: Position) => void }) {
  useMapEvents({
    click: (event) => onTap({ lat: event.latlng.lat, lng: event.latlng.lng }),
  });

  return null;
}

/**
 * Names the Position under the pending pin, so the popup can offer "Add
 * Valencia" rather than the anonymous "Add city here?".
 */
function usePlaceName(position: Position): PlaceName | null {
  const [placeName, setPlaceName] = useState<PlaceName | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setPlaceName(null);

    reverseGeocode({ lat: position.lat, lng: position.lng }, controller.signal)
      .then(setPlaceName)
      .catch(() => setPlaceName(null));

    return () => controller.abort();
  }, [position.lat, position.lng]);

  return placeName;
}

function PendingPin({
  onConfirm,
  onDismiss,
  position,
}: {
  onConfirm: () => void;
  onDismiss: () => void;
  position: Position;
}) {
  const marker = useRef<LeafletMarker | null>(null);
  const placeName = usePlaceName(position);
  const { cities } = useCities();
  const savedCity = findSavedCity(cities, {
    cityName: placeName?.cityName ?? "",
    country: placeName?.country ?? "",
    position,
  });

  useEffect(() => {
    marker.current?.openPopup();
  }, [position.lat, position.lng]);

  const place = placeName?.cityName || placeName?.country;

  return (
    <Marker
      icon={cityIcon}
      position={[position.lat, position.lng]}
      ref={marker}
    >
      <Popup
        maxWidth={240}
        closeOnEscapeKey
        eventHandlers={{ remove: onDismiss }}
      >
        <div className="flex w-48 max-w-full flex-col gap-3 p-2 text-dark-0">
          <span className="flex items-center gap-2 text-base font-semibold">
            {placeName && (
              <img
                alt={`Flag of ${placeName.country}`}
                className="h-4 w-6 rounded object-cover"
                src={`https://flagcdn.com/24x18/${placeName.countryCode}.png`}
              />
            )}
            {savedCity
              ? `${savedCity.cityName} is already in your list`
              : place
                ? `Add ${place}?`
                : "Add city here?"}
          </span>
          {savedCity ? (
            <Link
              className="popup-action"
              to={cityDetailTarget(savedCity.id, savedCity.position)}
            >
              View city & visits
            </Link>
          ) : (
            <button
              className="min-h-11 rounded bg-brand-2 px-3 py-2 font-bold text-dark-1 focus:outline-none focus:ring-2 focus:ring-dark-0"
              onClick={onConfirm}
              type="button"
            >
              {place ? `Add ${place}` : "Add City"}
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

export default Map;
