import { Navigate } from "react-router-dom";

/** Signing in lands on the Home dashboard on every screen size. */
function AppIndexRedirect() {
  return <Navigate replace to="home" />;
}

export default AppIndexRedirect;
