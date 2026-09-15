import Spinner from "./Spinner";
import CountryItem from "./CountryItem";
import Message from "./Message";
import { useCities } from "../context/CitiesContext";
import type { Country } from "../types";

function CountriesList() {
  const { isLoading, cities } = useCities();

  if (isLoading) return <Spinner />;

  if (cities.length === 0)
    return (
      <Message
        message={
          "No countries found. Please add new city by clicking on the map 🗺️."
        }
      />
    );

  const countries = cities.reduce<Country[]>((arr, city) => {
    if (!arr.map((el) => el.country).includes(city.country))
      return [...arr, { country: city.country, emoji: city.emoji }];
    else return arr;
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between px-2 pt-1 pb-0 mb-2">
        <h2 className="text-sm font-bold text-light-2 flex items-center gap-2">
          <span className="text-brand-1 text-base">🌍</span>
          Countries
          <span className="text-xs font-normal text-light-1 bg-dark-2 px-2 py-0.5 rounded-full">
            {countries.length}
          </span>
        </h2>
      </div>

      <div className="w-full min-h-0 flex-1 overflow-y-auto bg-dark-2 rounded-lg p-2 scrollbar">
        <ul className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 p-0 list-none">
          {countries.map((country) => (
            <CountryItem country={country} key={country.emoji} />
          ))}
        </ul>
      </div>

      {countries.length > 0 && (
        <div className="mt-2 shrink-0 px-2 py-2 bg-dark-2/50 rounded-lg backdrop-blur-sm">
          <p className="text-xs text-light-1/70 text-center">
            Exploring {countries.length}{" "}
            {countries.length === 1 ? "country" : "countries"}
            {" and more to come ✈️"}
            <span className="text-brand-2"> ✨</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default CountriesList;
