// import { NavLink } from "react-router-dom";
// import { useCities } from "../context/CitiesContext";

// function AppNav() {
//   const { clearError } = useCities();

//   return (
//     <nav className="mt-12 mb-8">
//       <ul className="flex bg-dark-2 rounded-lg list-none">
//         <li>
//           <NavLink
//             to="cities"
//             onClick={() => clearError()}
//             className={({ isActive }) =>
//               `block uppercase text-sm font-bold px-4 py-2 rounded transition-colors no-underline ${
//                 isActive ? "bg-dark-0" : ""
//               }`
//             }
//           >
//             Cities
//           </NavLink>
//         </li>
//         <li>
//           <NavLink
//             to="countries"
//             className={({ isActive }) =>
//               `block uppercase text-sm font-bold px-4 py-2 rounded transition-colors no-underline ${
//                 isActive ? "bg-dark-0" : ""
//               }`
//             }
//           >
//             Countries
//           </NavLink>
//         </li>
//       </ul>
//     </nav>
//   );
// }

// export default AppNav;
// function AppNav() {
//   const { clearError } = useCities();

//   return (
//     <nav className="mt-8 mb-6 md:mt-12 md:mb-8">
//       <ul className="flex bg-dark-2 rounded-lg list-none">
//         <li>
//           <NavLink
//             to="cities"
//             onClick={() => clearError()}
//             className={({ isActive }) =>
//               `text-white block uppercase text-sm font-semibold px-4 py-2 rounded transition-colors no-underline ${
//                 isActive ? "bg-dark-0" : ""
//               }`
//             }
//           >
//             Cities
//           </NavLink>
//         </li>
//         <li>
//           <NavLink
//             to="countries"
//             className={({ isActive }) =>
//               `text-white block uppercase text-sm font-bold px-4 py-2 rounded transition-colors no-underline ${
//                 isActive ? "bg-dark-0" : ""
//               }`
//             }
//           >
//             Countries
//           </NavLink>
//         </li>
//       </ul>
//     </nav>
//   );
// }
// export default AppNav;

// AppNav.jsx
import { NavLink } from "react-router-dom";
import { useCities } from "../context/CitiesContext";

function AppNav() {
  const { clearError } = useCities();

  return (
    <nav className="mt-8 mb-2 w-50">
      <ul className="flex bg-dark-2 rounded-lg list-none h-8 text-xs overflow-hidden text-center items-center">
        <li className="flex-1">
          <NavLink
            to="cities"
            onClick={() => clearError()}
            className={({ isActive }) =>
              `text-light-2 hover:text-white block uppercase text-sm font-semibold px-4 py-3 text-center transition-all duration-300 no-underline ${
                isActive
                  ? "bg-brand-2 text-white shadow-lg"
                  : "hover:bg-dark-1 hover:scale-105"
              }`
            }
          >
            Cities
          </NavLink>
        </li>
        <li className="flex-1">
          <NavLink
            to="countries"
            className={({ isActive }) =>
              `text-light-2 hover:text-white block uppercase text-sm font-semibold px-4 py-3 text-center transition-all duration-300 no-underline ${
                isActive
                  ? "bg-brand-1 text-white shadow-lg"
                  : "hover:bg-dark-1 hover:scale-105"
              }`
            }
          >
            Countries
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default AppNav;
