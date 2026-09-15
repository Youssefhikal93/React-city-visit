import { FiGlobe } from "react-icons/fi";
import Spinner from "./Spinner";
import CountryItem from "./CountryItem";
import Message from "./Message";
import { useCities } from "../context/CitiesContext";

function CountriesList() {
  const { isLoading, cities, error } = useCities();
  if (isLoading) return <Spinner />;
  if (error) return <Message message={error} />;
  if (!cities.length)
    return (
      <Message message="Your journey starts with a city. Tap the map to add your first one." />
    );
  const countries = [...new Set(cities.map((city) => city.country))].sort();
  return (
    <section className="journal-list">
      <header className="journal-heading">
        <span className="eyebrow">YOUR TRAVEL JOURNAL</span>
        <h2>
          <FiGlobe aria-hidden="true" /> Countries{" "}
          <span>{countries.length}</span>
        </h2>
        <p>A little more of the world, one city at a time.</p>
      </header>
      <ul className="country-list">
        {countries.map((country) => {
          const visitedCities = cities.filter(
            (city) => city.country === country,
          );
          return (
            <CountryItem
              key={country}
              country={{ country, emoji: visitedCities[0].emoji }}
              cities={visitedCities}
            />
          );
        })}
      </ul>
    </section>
  );
}
export default CountriesList;
