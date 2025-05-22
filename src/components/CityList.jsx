// import styles from "./CityList.module.css";
// import Spinner from "./Spinner";
// import CityItem from "./CityItem";
// import Message from "./Message";
// import { useCities } from "../context/citiesContext";

// function CityList() {
//   //   const { cities, isLoading } = useContext(CitiesContext);
//   const { cities, isLoading } = useCities();

//   if (isLoading) return <Spinner />;
//   if (!cities.length)
//     return <Message message={"Add your first city on the map 📍"} />;
//   return (
//     <ul className={styles.cityList}>
//       {cities.map((city) => (
//         <CityItem city={city} key={city.id} />
//       ))}
//     </ul>
//   );
// }

// export default CityList;

//// deep seek ////////////////////////////////////////////////

import styles from "./CityList.module.css";
import Spinner from "./Spinner";
import CityItem from "./CityItem";
import Message from "./Message";
import { useCities } from "../context/CitiesContext";
import { useEffect } from "react";

function CityList() {
  const { cities, isLoading, error, clearError } = useCities();

  if (isLoading) return <Spinner />;
  if (error) return <Message message={error} />;
  if (!cities.length)
    return (
      <Message message={"Add your first city by clicking on the map! 📍"} />
    );

  return (
    <ul className={styles.cityList}>
      {cities.map((city) => (
        <CityItem city={city} key={city.id} />
      ))}
    </ul>
  );
}

export default CityList;
