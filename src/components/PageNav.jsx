import { Link, NavLink } from "react-router-dom";
import styles from "./PageNav.module.css";
import Logo from "../components/Logo";
function PageNav() {
  return (
    <nav className={styles.nav}>
      <Logo />
      <ul>
        <li>
          <NavLink to={"/"}>Home</NavLink>
        </li>
        <li>
          <NavLink to={"/product"}>Our products</NavLink>
        </li>
        <li>
          <NavLink to={"/pricing"}>Prices</NavLink>
        </li>
        <li>
          <NavLink
            to={"/login"}
            className={`${styles.ctaLink} ${styles.loginBtn}`}
          >
            Login
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default PageNav;
