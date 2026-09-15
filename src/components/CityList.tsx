import { FiMapPin } from "react-icons/fi";
import Spinner from "./Spinner";
import CityItem from "./CityItem";
import Message from "./Message";
import { useCities } from "../context/CitiesContext";

function CityList() {
  const { cities, isLoading, error } = useCities();
  if (isLoading) return <Spinner />;
  if (error) return <Message message={error} />;
  if (!cities.length)
    return <Message message="Add your first city by tapping the map." />;
  return (
    <section className="journal-list">
      <header className="journal-heading">
        <span className="eyebrow">PLACES THAT STAY WITH YOU</span>
        <h2>
          <FiMapPin aria-hidden="true" /> Cities <span>{cities.length}</span>
        </h2>
        <p>Your places, your stories, your way back.</p>
      </header>
      <ul className="city-list">
        {cities.map((city) => (
          <CityItem city={city} key={city.id} />
        ))}
      </ul>
    </section>
  );
}
export default CityList;
