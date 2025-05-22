import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./Map.module.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useState } from "react";
import { useCities } from "../context/citiesContext";
import { useGeolocation } from "../hooks/useGeoLocation";
import Button from "./Button";
import Spinner from "./Spinner";
import { useURLPosition } from "../hooks/useURLPosition";
function Map() {
  const [mapPosition, setMapPosition] = useState([58.39, 15.633]);
  const navigate = useNavigate();
  const { cities } = useCities();
  const {
    getPosition: getPositionGeoLocation,
    isLoading: isLoadingGeoLocation,
    position: positionGeoLocation,
  } = useGeolocation();

  const [lat, lng] = useURLPosition();

  useEffect(
    function () {
      if (lat && lng) setMapPosition([lat, lng]);
    },
    [lat, lng]
  );

  useEffect(
    function () {
      console.log(positionGeoLocation);
      if (positionGeoLocation)
        setMapPosition([positionGeoLocation.lat, positionGeoLocation.lng]);
    },
    [positionGeoLocation]
  );

  return (
    <div
      className={styles.mapContainer}
      // onClick={() => navigate(`form`)}
    >
      {!positionGeoLocation && (
        <Button type="position" onClick={getPositionGeoLocation}>
          {isLoadingGeoLocation ? "Loading..." : "Use your Position"}
        </Button>
      )}
      <MapContainer
        className={styles.map}
        center={mapPosition}
        // center={[lat, lng]}
        zoom={10}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        {cities.map((city) => (
          <Marker
            position={[city.position.lat, city.position.lng]}
            key={city.id}
          >
            <Popup>
              <span>{city.emoji}</span> <span>{city.cityName}</span>
            </Popup>
          </Marker>
        ))}
        <ChangeCenter position={mapPosition} />
        <DetectClick />
      </MapContainer>
    </div>
  );
}

function ChangeCenter({ position }) {
  const map = useMap();
  map.setView(position);
  return null;
}

function DetectClick() {
  const navigate = useNavigate();
  const { clearError } = useCities();
  // useMapEvents({
  //   click: (e) => navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`),
  // });
  useMapEvents({
    click: (e) => {
      clearError(); // Clear any existing error
      navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`);
    },
  });
}

export default Map;
