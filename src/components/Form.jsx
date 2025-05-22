// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";

import styles from "./Form.module.css";
import Button from "./Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useURLPosition } from "../hooks/useURLPosition";
import Message from "../components/Message";
import Spinner from "./Spinner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCities } from "../context/CitiesContext";

// export function convertToEmoji(countryCode) {
//   const codePoints = countryCode
//     .toUpperCase()
//     .split("")
//     .map((char) => 127397 + char.charCodeAt());
//   return String.fromCodePoint(...codePoints);
// }
export function convertToEmoji(countryCode) {
  return (
    <img
      src={`https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`}
      alt={`Flag of ${countryCode}`}
      style={{ width: "24px", height: "18px", marginLeft: "0.5rem" }}
    />
  );
}

function Form() {
  const navigate = useNavigate();
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [lat, lng] = useURLPosition();
  const [isLoadingGeoCoding, setIsLoadingGeoCoding] = useState(false);
  const [emoji, setEmoji] = useState("");
  const [error, setError] = useState("");
  const { createCity, isLoading } = useCities();
  useEffect(
    function () {
      if (!lat && !lng) return;
      async function fetchCityData() {
        try {
          setIsLoadingGeoCoding(true);
          setError("");
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}`
          );
          const data = await res.json();
          console.log(data);
          if (!data.countryCode)
            throw new Error("This is not a country, click somewhere else 📍");
          setCityName(data.cityName || data.locality || "");
          setCountry(data.countryName);
          // setEmoji(convertToEmoji(data.countryCode));
          // setEmoji(data.countryCode);
          setEmoji(data.countryCode.toLowerCase());
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoadingGeoCoding(false);
        }
      }
      fetchCityData();
    },
    [lat, lng]
  );

  async function handelSubmit(e) {
    e.preventDefault();
    if (!cityName || !date) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
    };
    // console.log(newCity);
    // await createCity(newCity);
    // navigate("/app");
    const { success, error } = await createCity(newCity);

    if (success) {
      navigate("/app/cities"); // Redirect on success
    } else {
      setError(error); // Show error if duplicate
    }
  }

  if (error) return <Message message={error} />;
  if (isLoadingGeoCoding) return <Spinner />;
  if (!lat && !lng)
    return <Message message="Start by clicking on the map 🗺️" />;
  return (
    <form
      className={`${styles.form}  ${isLoading ? styles.loading : ""}`}
      onSubmit={handelSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        {/* <span className={styles.flag}>{emoji}</span> */}
        {/* <span className={styles.flag}>{emoji}</span> */}
        {/* <div className={styles.flag}>{convertToEmoji(emoji)}</div> */}
        {/* <div className={styles.flag}>{emoji}</div> */}
        <div className={styles.flag}>
          <img
            src={`https://flagcdn.com/24x18/${emoji}.png`}
            alt={`Flag of ${emoji.toUpperCase()}`}
            style={{ width: "24px", height: "18px", marginLeft: "0.5rem" }}
          />
        </div>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        {/* <input
          id="date"
          onChange={(e) => setDate(e.target.value)}
          value={date}
        /> */}
        <DatePicker
          id="date"
          onChange={(date) => setDate(date)}
          selected={date}
          dateFormat="dd/MM/yyyy"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <Button
          type="back"
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}
        >
          &larr; Back
        </Button>
      </div>
    </form>
  );
}

export default Form;
