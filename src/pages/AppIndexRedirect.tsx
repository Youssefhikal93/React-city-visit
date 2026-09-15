import { Navigate } from "react-router-dom";

import { useIsPhone } from "../hooks/useIsPhone";

function AppIndexRedirect() {
  const isPhone = useIsPhone();

  return <Navigate replace to={isPhone ? "map" : "cities"} />;
}

export default AppIndexRedirect;
