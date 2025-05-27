import { Link } from "react-router-dom";
import { useCities } from "../context/CitiesContext";

const formatDate = (date) =>
  new window.Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(new Date(date));

function CityItem({ city }) {
  const { currentCity, deleteCity } = useCities();
  const { cityName, emoji, date, id, position } = city;

  const isActive = currentCity && id === currentCity.id;

  function handleDelete(e) {
    e.preventDefault();
    deleteCity(id);
  }

  return (
    <li className="p-1">
      <Link
        to={`${id}?lat=${position.lat}&lng=${position.lng}`}
        className={`flex items-center gap-2 bg-dark-2 rounded-xl px-3 py-2 border transition-all duration-200 no-underline shadow-md hover:shadow-lg hover:bg-dark-1 focus:border-brand-2/80 outline-none ${
          isActive
            ? "border-2 border-brand-2 bg-dark-1/70 shadow-lg"
            : "border border-dark-2/60"
        }`}
        tabIndex={0}
      >
        {/* Flag */}
        <img
          src={`https://flagcdn.com/32x24/${emoji.toLowerCase()}.png`}
          alt={`Flag of ${cityName}`}
          className="w-7 h-5 object-cover rounded mr-3 border border-dark-2/40"
        />
        {/* City info */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-base leading-tight truncate ${
              isActive
                ? "text-brand-2"
                : "text-light-2 group-hover:text-brand-2"
            }`}
          >
            {cityName}
          </h3>
          <time className="text-xs text-light-1 block truncate">
            {formatDate(date)}
          </time>
        </div>
        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="w-8 h-8 p-1flex items-center justify-center rounded-full border border-dark-2/60 bg-dark-1 text-light-2 text-xl font-bold cursor-pointer shadow-sm hover:bg-red-500/80 hover:text-white focus:bg-red-500/90 transition-all duration-200 ml-2 outline-none"
          title="Delete city"
          aria-label="Delete city"
        >
          &times;
        </button>
      </Link>
    </li>
  );
}

export default CityItem;
