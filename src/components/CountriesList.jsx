import Spinner from "./Spinner";
import CountryItem from "./CountryItem";
import styles from "./CountriesList.module.css";
import Message from "./Message";
import { useCities } from "../context/citiesContext";
function CountriesList() {
  const { isLoading, cities } = useCities();

  if (isLoading) return <Spinner />;
  if (cities.length === 0)
    return (
      <Message
        message={
          "No coutries found. Please add new city by clicking on the map 🗺️."
        }
      />
    );

  const countries = cities.reduce((arr, city) => {
    if (!arr.map((el) => el.country).includes(city.country))
      return [...arr, { country: city.country, emoji: city.emoji }];
    else return arr;
  }, []);

  return (
    <ul className={styles.countryList}>
      {countries.map((country) => (
        <CountryItem country={country} key={country.emoji} />
      ))}
    </ul>
  );
}

export default CountriesList;
