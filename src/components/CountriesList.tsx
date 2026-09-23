import { FiCompass, FiGlobe, FiHome, FiMapPin } from "react-icons/fi";
import Spinner from "./Spinner";
import CountryItem from "./CountryItem";
import CountryListSection from "./CountryListSection";
import CountrySection from "./CountrySection";
import Message from "./Message";
import { useCities } from "../context/CitiesContext";
import { useCountryLists } from "../context/CountryListsContext";
import { beenToCountryCodes } from "../map/countries";

function VisitedCountries() {
  const { isLoading, cities, error } = useCities();
  const countries = [...new Set(cities.map((city) => city.country))].sort();

  return (
    <CountrySection
      count={countries.length}
      description="Countries with Cities you saved."
      icon={<FiMapPin aria-hidden="true" />}
      id="visited-countries"
      title="Visited"
    >
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <Message message={error} />
      ) : countries.length === 0 ? (
        <p className="country-section-empty">
          No visited Countries yet. Tap the map to add your first City.
        </p>
      ) : (
        <ul aria-label="Visited" className="country-list">
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
      )}
    </CountrySection>
  );
}

function CountriesList() {
  const { cities } = useCities();
  const { livedInCountryCodes } = useCountryLists();
  const beenTo = beenToCountryCodes(cities, livedInCountryCodes);

  return (
    <section className="journal-list countries-screen">
      <header className="journal-heading">
        <span className="eyebrow">YOUR TRAVEL JOURNAL</span>
        <h2>
          <FiGlobe aria-hidden="true" /> Countries <span>{beenTo.size}</span>
        </h2>
        <p>Where you lived, where you're going next, and where you've been.</p>
      </header>
      <CountryListSection
        description="Countries you called home. They count even without a City."
        emptyMessage="No lived-in Countries yet."
        icon={<FiHome aria-hidden="true" />}
        list="livedIn"
        title="Lived in"
      />
      <CountryListSection
        description="Countries you want to visit. One leaves this list when you add a City there."
        emptyMessage="No planned Countries yet."
        icon={<FiCompass aria-hidden="true" />}
        list="planned"
        title="Planned"
      />
      <VisitedCountries />
    </section>
  );
}
export default CountriesList;
