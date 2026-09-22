import { Link } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import { useCities } from "../context/CitiesContext";
import { cityDetailTarget } from "../map/mapBehaviour";
import { formatVisitDate } from "../services/visitDate";
import type { City } from "../types";
import VisitCounter from "./VisitCounter";

function CityItem({ city }: { city: City }) {
  const { currentCity, deleteCity } = useCities();
  return (
    <li
      className={
        "city-card " + (city.id === currentCity?.id ? "city-card-active" : "")
      }
    >
      <Link
        className="city-card-link"
        to={cityDetailTarget(city.id, city.position)}
      >
        <img
          src={"https://flagcdn.com/" + city.emoji.toLowerCase() + ".svg"}
          alt={"Flag of " + city.country}
          className="country-flag"
        />
        <div>
          <h3>{city.cityName}</h3>
          <p>{city.country}</p>
          {city.date && (
            <time
              dateTime={
                city.datePrecision === "month" ? city.date.slice(0, 7) : city.date
              }
            >
              {formatVisitDate(city.date, city.datePrecision, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </time>
          )}
        </div>
      </Link>
      <div className="city-card-actions">
        <VisitCounter city={city} />
        <button
          type="button"
          className="delete-city"
          aria-label="Delete city"
          onClick={() => deleteCity(city.id)}
        >
          <FiTrash2 aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
export default CityItem;
