import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCompass,
  FiGrid,
  FiMap,
  FiMapPin,
} from "react-icons/fi";

import { useAuth } from "../context/AuthContext";
import { useCities } from "../context/CitiesContext";
import { useCountryLists } from "../context/CountryListsContext";
import { useIsPhone } from "../hooks/useIsPhone";
import { beenToCountryCodes, countryName } from "../map/countries";
import { cityDetailTarget } from "../map/mapBehaviour";
import { formatVisitDate } from "../services/visitDate";
import type { City } from "../types";

const RECENT_CITY_COUNT = 3;

function byMostRecentVisit(first: City, second: City): number {
  if (first.date !== second.date) {
    if (!first.date) return 1;
    if (!second.date) return -1;
    return second.date.localeCompare(first.date);
  }
  return second.createdAt - first.createdAt;
}

function Dashboard() {
  const isPhone = useIsPhone();
  const { user } = useAuth();
  const { cities } = useCities();
  const { livedInCountryCodes, plannedCountryCodes } = useCountryLists();
  const countryCount = beenToCountryCodes(cities, livedInCountryCodes).size;
  const visitCount = cities.reduce((total, city) => total + (city.visitCount ?? 1), 0);
  const recentCities = [...cities].sort(byMostRecentVisit).slice(0, RECENT_CITY_COUNT);
  const plannedCountries = plannedCountryCodes
    .map((countryCode) => ({ countryCode, name: countryName(countryCode) }))
    .sort((first, second) => first.name.localeCompare(second.name));

  const stats = [
    { label: cities.length === 1 ? "City" : "Cities", value: cities.length },
    { label: countryCount === 1 ? "Country" : "Countries", value: countryCount },
    { label: visitCount === 1 ? "Visit" : "Total visits", value: visitCount },
    { label: "Planned", value: plannedCountryCodes.length },
  ];

  return (
    <section className="journal-list dashboard">
      <header className="journal-heading">
        <span className="eyebrow">YOUR TRAVEL JOURNAL</span>
        <h2>
          <FiGrid aria-hidden="true" /> Hi, {user?.displayName ?? "traveler"}
        </h2>
        <p>Here's your world so far.</p>
      </header>

      <ul aria-label="Travel totals" className="dashboard-stats list-none">
        {stats.map((stat) => (
          <li className="dashboard-stat" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </li>
        ))}
      </ul>

      <section aria-labelledby="next-destinations-heading" className="country-section mt-5">
        <header className="country-section-heading">
          <h3 id="next-destinations-heading">
            <FiCompass aria-hidden="true" /> Next destinations
          </h3>
        </header>
        {plannedCountries.length ? (
          <ul aria-label="Next destinations" className="dashboard-flags">
            {plannedCountries.map((country) => (
              <li key={country.countryCode}>
                <img
                  alt=""
                  className="country-flag"
                  src={"https://flagcdn.com/" + country.countryCode + ".svg"}
                />
                {country.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="country-section-empty">No planned Countries yet.</p>
        )}
        <Link className="dashboard-link" to="/app/countries">
          {plannedCountries.length ? "Manage your Countries" : "Plan a trip"}
          <FiArrowRight aria-hidden="true" />
        </Link>
      </section>

      <section aria-labelledby="recent-cities-heading" className="country-section">
        <header className="country-section-heading">
          <h3 id="recent-cities-heading">
            <FiMapPin aria-hidden="true" /> Recent Cities
          </h3>
        </header>
        {recentCities.length ? (
          <ul aria-label="Recent Cities" className="country-list">
            {recentCities.map((city) => (
              <li className="country-card" key={city.id}>
                <Link
                  className="country-list-entry"
                  to={cityDetailTarget(city.id, city.position)}
                >
                  <img
                    alt={"Flag of " + city.country}
                    className="country-flag"
                    src={"https://flagcdn.com/" + city.emoji.toLowerCase() + ".svg"}
                  />
                  <span className="country-label">
                    <strong>{city.cityName}</strong>
                    <small>
                      {city.country}
                      {city.date &&
                        " · " +
                          formatVisitDate(city.date, city.datePrecision, {
                            month: "short",
                            year: "numeric",
                          })}
                    </small>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="country-section-empty">
            No Cities yet. {isPhone ? "Open the map and tap" : "Click"} where
            you've been to add your first one.
          </p>
        )}
        <Link className="dashboard-link" to="/app/cities">
          All Cities <FiArrowRight aria-hidden="true" />
        </Link>
      </section>

      <div className="dashboard-actions country-section">
        {isPhone && (
          <Link className="dashboard-action dashboard-action-primary" to="/app/map">
            <FiMap aria-hidden="true" /> Add a City
          </Link>
        )}
        <Link
          className={`dashboard-action ${isPhone ? "" : "col-span-2"}`}
          to="/app/countries"
        >
          <FiCompass aria-hidden="true" /> Plan a trip
        </Link>
      </div>
    </section>
  );
}

export default Dashboard;
