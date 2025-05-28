// export default CountriesList;
import Spinner from "./Spinner";
import CountryItem from "./CountryItem";
import Message from "./Message";
import { useCities } from "../context/CitiesContext";

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

  const countries = cities.reduce((arr, city) => {
    if (!arr.map((el) => el.country).includes(city.country))
      return [...arr, { country: city.country, emoji: city.emoji }];
    else return arr;
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-2 font-manrope">
      {/* Header - unchanged */}
      <div className="flex items-center justify-between px-2 pt-1 pb-0">
        <h2 className="text-sm font-bold text-light-2 flex items-center gap-2">
          <span className="text-brand-1 text-base">🌍</span>
          Countries
          <span className="text-xs font-normal text-light-1 bg-dark-2 px-2 py-0.5 rounded-full">
            {countries.length}
          </span>
        </h2>
      </div>

      {/* Countries Grid - fixed height */}
      <div className="flex-1 overflow-y-auto bg-dark-2 rounded-lg p-2 scrollbar-custom">
        <ul className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 p-0 list-none">
          {countries.map((country) => (
            <CountryItem country={country} key={country.emoji} />
          ))}
        </ul>
      </div>

      {/* Footer - unchanged */}
      {countries.length > 0 && (
        <div className="mt-2 px-2 py-2 bg-dark-2/50 rounded-lg backdrop-blur-sm">
          <p className="text-xs text-light-1/70 text-center">
            Exploring {countries.length}
            {" and more to come ✈️"}
            {countries.length === 1 ? "country" : "countries"}
            <span className="text-brand-2"> ✨</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default CountriesList;
