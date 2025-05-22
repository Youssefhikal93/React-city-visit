import { useCities } from "../context/citiesContext";
import styles from "./CityItem.module.css";
import { Link } from "react-router-dom";
const formatDate = (date) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(new Date(date));

function CityItem({ city }) {
  const { currentCity, deleteCity } = useCities();
  const { cityName, emoji, date, id, position } = city;

  function handelDelete(e) {
    e.preventDefault();
    deleteCity(id);
  }

  return (
    <li>
      <Link
        to={`${id}?lat=${position.lat}&lng=${position.lng}`}
        className={`${styles.cityItem} ${
          id === currentCity.id ? styles["cityItem--active"] : ""
        }`}
      >
        {/* <span className={styles.emoji}>{emoji}</span> */}
        {/* <div className={styles.flag}>{emoji}</div> */}
        <img
          src={`https://flagcdn.com/24x18/${emoji.toLowerCase()}.png`}
          alt={`Flag of ${emoji.toUpperCase()}`}
          className={styles.emoji}
          style={{ width: "24px", height: "18px", marginRight: "0.5rem" }}
        />
        <h3 className={styles.name}>{cityName}</h3>
        <time className={styles.date}>{formatDate(date)}</time>
        <button onClick={handelDelete} className={styles.deleteBtn}>
          &times;
        </button>
      </Link>
    </li>
  );
}

export default CityItem;
