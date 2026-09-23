import { Link } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import { useCities } from "../context/CitiesContext";
import { useHomeCountry } from "../context/HomeCountryContext";
import { cityDetailTarget } from "../map/mapBehaviour";
import { formatVisitDate } from "../services/visitDate";
import type { City } from "../types";
import VisitCounter from "./VisitCounter";

function CityItem({ city }: { city: City }) {
  const { currentCity, deleteCity } = useCities();
  const { homeCountryCode, plannedCountryCode } = useHomeCountry();
  const countryCode = city.emoji.toLowerCase();
  const isHomeCountry = countryCode === homeCountryCode;
  const isNextDestination = countryCode === plannedCountryCode;
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
          {(isHomeCountry || isNextDestination) && (
            <div className="mt-2 flex flex-wrap gap-1" aria-label="Country status">
              {isHomeCountry && (
                <span className="rounded-full border border-[#d97706] bg-[#fbbf24]/20 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-[#fbbf24]">
                  Home Country
                </span>
              )}
              {isNextDestination && (
                <span className="rounded-full border border-[#6d28d9] bg-[#a78bfa]/20 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-[#c4b5fd]">
                  Next destination
                </span>
              )}
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
