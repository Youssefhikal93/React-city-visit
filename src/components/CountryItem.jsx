// export default CountryItem;
function CountryItem({ country }) {
  return (
    <li className="flex flex-col items-center gap-2 text-base font-semibold bg-dark-2 rounded-xl px-4 py-4 border border-dark-2/50">
      {/* Flag container */}
      <div className="flex items-center justify-center w-12 h-12 bg-light-2/10 rounded-lg border border-light-2/20">
        <img
          src={`https://flagcdn.com/32x24/${country.emoji.toLowerCase()}.png`}
          alt={`Flag of ${country.country}`}
          className="w-8 h-6 object-cover rounded"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "block";
          }}
        />
        <span className="text-2xl leading-none hidden">{country.emoji}</span>
      </div>
      {/* Country name */}
      <div className="text-light-2 text-center font-medium leading-tight">
        {country.country}
      </div>
    </li>
  );
}

export default CountryItem;
