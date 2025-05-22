import styles from "./CountryItem.module.css";

function CountryItem({ country }) {
  return (
    <li className={styles.countryItem}>
      {/* <span>{country.emoji}</span> */}
      <div className={styles.flag}>
        <img
          src={`https://flagcdn.com/24x18/${country.emoji}.png`}
          alt={`Flag of ${country.emoji.toUpperCase()}`}
          style={{ width: "24px", height: "18px", marginLeft: "0.5rem" }}
        />
      </div>
      <span>{country.country}</span>
    </li>
  );
}

export default CountryItem;
