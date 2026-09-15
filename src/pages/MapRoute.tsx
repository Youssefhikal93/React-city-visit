import { Navigate, useLocation } from "react-router-dom";

import Map from "../components/Map";
import { useIsPhone } from "../hooks/useIsPhone";

/**
 * A wide screen already shows the Map beside the List view, so routing there
 * would mount Leaflet a second time inside the sidebar. Redirecting to the
 * Cities list keeps the query string, which is how a map target survives.
 */
function MapRoute() {
  const isPhone = useIsPhone();
  const { search } = useLocation();

  if (!isPhone) return <Navigate replace to={`/app/cities${search}`} />;

  return <Map />;
}

export default MapRoute;
