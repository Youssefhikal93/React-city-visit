import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown, FiMap } from "react-icons/fi";
import { cityDetailTarget, mapCountryTarget } from "../map/mapBehaviour";
import type { City, Country } from "../types";
import VisitCounter from "./VisitCounter";

function CountryItem({
  country,
  cities,
}: {
  country: Country;
  cities: City[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();
  return (
    <li className="country-card">
      <button
        type="button"
        className="country-toggle"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <img
          src={"https://flagcdn.com/" + country.emoji.toLowerCase() + ".svg"}
          alt={"Flag of " + country.country}
          className="country-flag"
        />
        <span className="country-label">
          <strong>{country.country}</strong>
          <small>
            {cities.length} {cities.length === 1 ? "city" : "cities"} visited
          </small>
        </span>
        <FiChevronDown
          aria-hidden="true"
          className={isExpanded ? "rotate-180" : ""}
        />
      </button>
      {isExpanded && (
        <div id={panelId} className="country-cities">
          <ul>
            {cities.map((city) => (
              <li className="country-city" key={city.id}>
                <Link to={cityDetailTarget(city.id, city.position)}>
                  {city.cityName}
                </Link>
                <VisitCounter city={city} />
              </li>
            ))}
          </ul>
          <Link
            className="country-map-link"
            aria-label={"Show " + country.country + " on map"}
            to={mapCountryTarget(country.country)}
          >
            <FiMap aria-hidden="true" /> Show on map
          </Link>
        </div>
      )}
    </li>
  );
}
export default CountryItem;
