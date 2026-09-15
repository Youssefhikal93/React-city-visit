import AppMenu from "./AppMenu";
import { NavLink } from "react-router-dom";
import Logo from "../components/Logo";

function PageNav() {
  return (
    <nav className="public-page-nav flex items-center justify-between px-6 py-4 md:px-8 lg:px-12">
      <div className="md:hidden">
        <AppMenu />
      </div>
      <div className="max-md:ml-10">
        <Logo />
      </div>
      <ul className="flex items-center gap-8 md:gap-6 lg:gap-8 list-none">
        <li className="hidden md:block">
          <NavLink
            to={"/"}
            className={({ isActive }) =>
              `no-underline text-light-2 hover:text-brand-1 uppercase text-sm md:text-base font-semibold transition-all duration-300 ${
                isActive ? "text-brand-2" : ""
              }`
            }
          >
            Home
          </NavLink>
        </li>
        <li className="hidden md:block">
          <NavLink
            to={"/product"}
            className={({ isActive }) =>
              `no-underline text-light-2 hover:text-brand-1 uppercase text-sm md:text-base font-semibold transition-all duration-300 ${
                isActive ? "text-brand-2" : ""
              }`
            }
          >
            Products
          </NavLink>
        </li>
        <li className="hidden md:block">
          <NavLink
            to={"/pricing"}
            className={({ isActive }) =>
              `no-underline text-light-2 hover:text-brand-1 uppercase text-sm md:text-base font-semibold transition-all duration-300 ${
                isActive ? "text-brand-2" : ""
              }`
            }
          >
            Pricing
          </NavLink>
        </li>
        <li>
          <NavLink
            to={"/login"}
            className={({ isActive }) =>
              `bg-brand-2 hover:bg-brand-1 text-dark-0 px-4 py-2 md:px-6 md:py-3 rounded-md font-semibold uppercase text-sm md:text-base no-underline transition-all duration-300 transform hover:scale-105 ${
                isActive ? "bg-brand-1" : ""
              }`
            }
          >
            Login
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default PageNav;
