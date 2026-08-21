import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import SpinnerFullPage from "../components/SpinnerFullPage";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isRestoring } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Reloading /app directly means the anonymous session is still being
    // restored; redirecting before that finishes would kick the user out.
    if (!isRestoring && !isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, isRestoring, navigate]);

  if (isRestoring) return <SpinnerFullPage />;

  return isAuthenticated ? children : <SpinnerFullPage />;
}

export default ProtectedRoute;
