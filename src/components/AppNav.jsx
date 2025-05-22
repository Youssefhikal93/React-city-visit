import { NavLink } from "react-router-dom";
import styles from "./AppNav.module.css";
import { useCities } from "../context/citiesContext";

function AppNav() {
  const { clearError } = useCities();

  return (
    <nav className={styles.nav}>
      <ul>
        <li>
          <NavLink to="cities" onClick={() => clearError()}>
            Cities
          </NavLink>
        </li>
        <li>
          <NavLink to="countries">Countries</NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default AppNav;
