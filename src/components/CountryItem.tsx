import { Link } from "react-router-dom";

import { mapCountryTarget } from "../map/mapBehaviour";
import type { Country } from "../types";

function CountryItem({ country }: { country: Country }) {
  return (
    <li>
      <Link
        to={mapCountryTarget(country.country)}
        aria-label={`Show ${country.country} on map`}
        className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-dark-2/50 bg-dark-2 px-4 py-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-2"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-light-2/20 bg-light-2/10">
          <img
            src={`https://flagcdn.com/32x24/${country.emoji.toLowerCase()}.png`}
            alt={`Flag of ${country.country}`}
            className="h-6 w-8 rounded object-cover"
            onError={(event) => {
              const image = event.currentTarget;
              image.style.display = "none";
              const fallback = image.nextElementSibling;
              if (fallback instanceof HTMLElement)
                fallback.style.display = "block";
            }}
          />
          <span className="hidden text-2xl leading-none">{country.emoji}</span>
        </div>
        <div className="break-words text-center font-medium leading-tight text-light-2">
          {country.country}
        </div>
      </Link>
    </li>
  );
}

export default CountryItem;
