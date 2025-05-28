// import { useNavigate, useSearchParams } from "react-router-dom";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
//   useMap,
//   useMapEvents,
// } from "react-leaflet";
// import { useEffect, useState } from "react";
// import { useCities } from "../context/CitiesContext";
// import { useGeolocation } from "../hooks/useGeoLocation";
// import Button from "./Button";
// import Spinner from "./Spinner";
// import { useURLPosition } from "../hooks/useURLPosition";
// function Map() {
//   const [mapPosition, setMapPosition] = useState([58.39, 15.633]);
//   const navigate = useNavigate();
//   const { cities } = useCities();
//   const {
//     getPosition: getPositionGeoLocation,
//     isLoading: isLoadingGeoLocation,
//     position: positionGeoLocation,
//   } = useGeolocation();

//   const [lat, lng] = useURLPosition();

//   useEffect(
//     function () {
//       if (lat && lng) setMapPosition([lat, lng]);
//     },
//     [lat, lng]
//   );

//   useEffect(
//     function () {
//       console.log(positionGeoLocation);
//       if (positionGeoLocation)
//         setMapPosition([positionGeoLocation.lat, positionGeoLocation.lng]);
//     },
//     [positionGeoLocation]
//   );

//   return (
//     <div className="flex-1 h-full bg-dark-2 relative md:h-[50vh] sm:h-[40vh]">
//       {!positionGeoLocation && (
//         <Button type="position" onClick={getPositionGeoLocation}>
//           {isLoadingGeoLocation ? "Loading..." : "Use your Position"}
//         </Button>
//       )}
//       <MapContainer
//         className="h-full min-h-[300px]"
//         center={mapPosition}
//         zoom={10}
//         scrollWheelZoom={true}
//       >
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
//         />
//         {cities.map((city) => (
//           <Marker
//             position={[city.position.lat, city.position.lng]}
//             key={city.id}
//           >
//             <Popup>
//               <span>{city.emoji}</span> <span>{city.cityName}</span>
//             </Popup>
//           </Marker>
//         ))}
//         <ChangeCenter position={mapPosition} />
//         <DetectClick />
//       </MapContainer>
//     </div>
//   );
// }

// function ChangeCenter({ position }) {
//   const map = useMap();
//   map.setView(position);
//   return null;
// }

// function DetectClick() {
//   const navigate = useNavigate();
//   const { clearError } = useCities();
//   useMapEvents({
//     click: (e) => {
//       clearError();
//       navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`);
//     },
//   });
// }

// export default Map;
// import { useNavigate } from "react-router-dom";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
//   useMap,
//   useMapEvents,
// } from "react-leaflet";
// import { useEffect, useState } from "react";
// import { useCities } from "../context/CitiesContext";
// import { useGeolocation } from "../hooks/useGeoLocation";
// import Button from "./Button";
// import Spinner from "./Spinner";
// import { useURLPosition } from "../hooks/useURLPosition";

// function Map() {
//   const [mapPosition, setMapPosition] = useState([40, 0]);
//   const navigate = useNavigate();
//   const { cities } = useCities();
//   const {
//     getPosition: getPositionGeoLocation,
//     isLoading: isLoadingGeoLocation,
//     position: positionGeoLocation,
//   } = useGeolocation();

//   const [lat, lng] = useURLPosition();

//   useEffect(() => {
//     if (lat && lng) setMapPosition([lat, lng]);
//   }, [lat, lng]);

//   useEffect(() => {
//     if (positionGeoLocation) {
//       setMapPosition([positionGeoLocation.lat, positionGeoLocation.lng]);
//     }
//   }, [positionGeoLocation]);

//   return (
//     <div className="flex-2 h-full bg-dark-2 relative md:h-[50vh] sm:h-[45vh]">
//       {!positionGeoLocation && (
//         <Button type="position" onClick={getPositionGeoLocation}>
//           {isLoadingGeoLocation ? (
//             <span className="flex items-center gap-2">
//               <Spinner small /> Loading...
//             </span>
//           ) : (
//             "Use your Position"
//           )}
//         </Button>
//       )}
//       <MapContainer
//         className="h-full w-full z-0"
//         center={mapPosition}
//         zoom={6}
//         scrollWheelZoom={true}
//         minZoom={2}
//         maxBounds={[
//           [-90, -180],
//           [90, 180],
//         ]}
//       >
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />
//         {cities.map((city) => (
//           <Marker
//             position={[city.position.lat, city.position.lng]}
//             key={city.id}
//           >
//             <Popup className="text-dark-0">
//               <div className="flex items-center gap-2">
//                 <img
//                   src={`https://flagcdn.com/24x18/${city.emoji.toLowerCase()}.png`}
//                   alt={`Flag of ${city.emoji.toUpperCase()}`}
//                   className="w-6 h-4"
//                 />
//                 <span className="font-semibold">{city.cityName}</span>
//               </div>
//             </Popup>
//           </Marker>
//         ))}
//         <ChangeCenter position={mapPosition} />
//         <DetectClick />
//       </MapContainer>
//     </div>
//   );
// }

// function ChangeCenter({ position }) {
//   const map = useMap();
//   map.setView(position);
//   return null;
// }

// function DetectClick() {
//   const navigate = useNavigate();
//   const { clearError } = useCities();
//   useMapEvents({
//     click: (e) => {
//       clearError();
//       navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`);
//     },
//   });
// }

// export default Map;
// Map.jsx
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useState } from "react";
import { useCities } from "../context/CitiesContext";
import { useGeolocation } from "../hooks/useGeoLocation";
import Button from "./Button";
import Spinner from "./Spinner";
import { useURLPosition } from "../hooks/useURLPosition";

function Map() {
  const [mapPosition, setMapPosition] = useState([40, 0]);
  const navigate = useNavigate();
  const { cities } = useCities();
  const {
    getPosition: getPositionGeoLocation,
    isLoading: isLoadingGeoLocation,
    position: positionGeoLocation,
  } = useGeolocation();

  const [lat, lng] = useURLPosition();

  useEffect(() => {
    if (lat && lng) setMapPosition([lat, lng]);
  }, [lat, lng]);

  useEffect(() => {
    if (positionGeoLocation) {
      setMapPosition([positionGeoLocation.lat, positionGeoLocation.lng]);
    }
  }, [positionGeoLocation]);

  return (
    <div className="flex-1 h-full w-full bg-dark-2 relative overflow-hidden rounded-lg shadow-2xl md:rounded-none md:shadow-lg md:h-screen  sm:rounded-lg sm:shadow-xl">
      {/* Position Button */}
      {!positionGeoLocation && (
        <div className=" absolute bottom-1 w-full left-1/2 transform -translate-x-1/2 z-[1000]">
          <Button type="position" onClick={getPositionGeoLocation}>
            {isLoadingGeoLocation ? (
              <span className="flex items-center gap-2">
                <Spinner small />
                <span className="hidden sm:inline">Loading...</span>
                <span className="sm:hidden">...</span>
              </span>
            ) : (
              <span>
                <span className="hidden sm:inline">Use your Position</span>
                <span className="sm:hidden">📍 Use your Position</span>
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Map Container */}
      <MapContainer
        className="h-full w-full"
        center={mapPosition}
        zoom={6}
        scrollWheelZoom={true}
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
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          errorTileUrl="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iIzJkMzQzOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjYWFhIiBmb250LXNpemU9IjE0Ij5NYXAgVGlsZSBVbmF2YWlsYWJsZTwvdGV4dD48L3N2Zz4="
        />

        {/* City Markers */}
        {cities.map((city) => (
          <Marker
            position={[city.position.lat, city.position.lng]}
            key={city.id}
          >
            <Popup
              className="custom-popup"
              maxWidth={200}
              closeButton={true}
              autoPan={true}
            >
              <div className="flex items-center gap-2 p-1">
                <span className="text-lg" role="img" aria-label="flag">
                  {city.emoji}
                </span>
                <span className="font-semibold text-dark-0 text-sm">
                  {city.cityName}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        <ChangeCenter position={mapPosition} />
        <DetectClick />
      </MapContainer>

      {/* Loading overlay for better UX */}
      {isLoadingGeoLocation && (
        <div className="absolute inset-0 bg-dark-1/50 backdrop-blur-sm flex items-center justify-center z-[999] rounded-lg md:rounded-none sm:rounded-lg">
          <div className="bg-dark-0 p-4 rounded-lg shadow-xl flex items-center gap-3">
            <Spinner small />
            <span className="text-light-2 font-medium">
              Getting your location...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function ChangeCenter({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position && position.length === 2) {
      map.setView(position, map.getZoom(), {
        animate: true,
        duration: 1,
      });
    }
  }, [position, map]);

  return null;
}

function DetectClick() {
  const navigate = useNavigate();
  const { clearError } = useCities();

  useMapEvents({
    click: (e) => {
      clearError();
      navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`);
    },
  });

  return null;
}

export default Map;
