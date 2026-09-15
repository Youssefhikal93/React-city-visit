import { useLocation } from "react-router-dom";

function CurrentLocation() {
  const { pathname, search } = useLocation();

  return <output data-testid="current-location">{`${pathname}${search}`}</output>;
}

export default CurrentLocation;
