import Spinner from "./Spinner";
import CityItem from "./CityItem";
import Message from "./Message";
import { useCities } from "../context/CitiesContext";

function CityList() {
  const { cities, isLoading, error } = useCities();

  if (isLoading) return <Spinner />;
  if (error) return <Message message={error} />;
  if (!cities.length)
    return (
      <Message message={"Add your first city by clicking on the map! 📍"} />
    );

  return (
    <>
      <div className="flex items-center justify-between px-2 pt-1 pb-0 mb-2">
        <h2 className="text-sm font-bold text-light-2 flex items-center gap-2">
          <span className="text-brand-1 text-base">📍</span>
          Cities
          <span className="text-xs font-normal text-light-1 bg-dark-2 px-2 py-0.5 rounded-full">
            {cities.length}
          </span>
        </h2>
      </div>
      <div className="w-full h-90 overflow-y-auto flex flex-col gap-3 list-none bg-dark-2 rounded-lg p-2 scrollbar-custom">
        <ul className=" ">
          {cities.map((city) => (
            <CityItem city={city} key={city.id} />
          ))}
        </ul>
      </div>
    </>
  );
}

export default CityList;
