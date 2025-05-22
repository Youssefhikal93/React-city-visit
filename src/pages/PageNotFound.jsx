import { Link } from "react-router-dom";
import styles from "./PageNotFound.module.css";

export default function PageNotFound() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Page not found <span className={styles.emoji}>😢</span>
      </h1>
      <Link to="/" className={styles.link}>
        Go back home
      </Link>
    </div>
  );
}
