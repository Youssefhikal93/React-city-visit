// // import { useNavigate } from "react-router-dom";
// // import { useAuth } from "../context/FakeAuthContext";
// // import { useEffect } from "react";

// // function ProtectedRoute({ children }) {
// //   const { isAuthenticated } = useAuth;
// //   const navigate = useNavigate();

// //   useEffect(
// //     function () {
// //       if (!isAuthenticated) navigate("/");
// //     },
// //     [isAuthenticated, navigate]
// //   );
// //   return isAuthenticated ? children : null;
// // }

// // export default ProtectedRoute;

// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/FakeAuthContext";
// import { useEffect } from "react";

// function ProtectedRoute({ children }) {
//   const { isAuthenticated } = useAuth(); // Fixed: Added parentheses to call the hook
//   const navigate = useNavigate();

//   useEffect(
//     function () {
//       if (!isAuthenticated) navigate("/login"); // Changed to navigate to login instead of root
//     },
//     [isAuthenticated, navigate]
//   );

//   return isAuthenticated ? children : null;
// }

// export default ProtectedRoute;

////////////////////////// claude //////////////

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/FakeAuthContext";
import { useEffect } from "react";
import PageNotFound from "../pages/PageNotFound";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth(); // Fixed: Added parentheses to call the hook
  const navigate = useNavigate();

  useEffect(
    function () {
      if (!isAuthenticated) navigate("/login"); // Changed to navigate to login instead of root
    },
    [isAuthenticated, navigate]
  );

  return isAuthenticated ? children : <PageNotFound />;
}

export default ProtectedRoute;
