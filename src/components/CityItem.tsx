import { Link } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import { useCities } from "../context/CitiesContext";
import { useCountryLists } from "../context/CountryListsContext";
import { cityDetailTarget } from "../map/mapBehaviour";
import { formatVisitDate } from "../services/visitDate";
import type { City } from "../types";
import VisitCounter from "./VisitCounter";

function CityItem({ city }: { city: City }) {
  const { currentCity, deleteCity } = useCities();
  const { plannedCountryCodes } = useCountryLists();
  const isPlanned = plannedCountryCodes.includes(city.emoji.toLowerCase());
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
          {isPlanned && (
            <div className="mt-2 flex flex-wrap gap-1" aria-label="Country status">
              <span className="rounded-full border border-[#6d28d9] bg-[#a78bfa]/20 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-[#c4b5fd]">
                Planned
              </span>
            </div>
          )}
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
