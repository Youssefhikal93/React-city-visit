// import {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useReducer,
// } from "react";

// const URL = "http://localhost:8000/cities";
// const CitiesContext = createContext();
// const intialState = {
//   cities: [],
//   isLoading: false,
//   currentCity: {},
//   error: "",
// };
// function reducer(state, action) {
//   switch (action.type) {
//     case "loading":
//       return { ...state, isLoading: true };

//     case "citites/loaded":
//       return { ...state, cities: action.payload, isLoading: false };

//     case "city/loaded":
//       return { ...state, currentCity: action.payload, isLoading: false };

//     case "city/created":
//       return {
//         ...state,
//         isLoading: false,
//         cities: [...state.cities, action.payload],
//         currentCity: action.payload,
//       };

//     case "city/deleted":
//       return {
//         ...state,
//         isLoading: false,
//         cities: state.cities.filter((city) => city.id !== action.payload),
//       };

//     case "error":
//       return { ...state, isLoading: false, error: action.payload };
//   }
// }

// function CitiesProvider({ children }) {
//   // const [cities, setCities] = useState([]);
//   // const [isLoading, setIsLoading] = useState(false);
//   // const [currentCity, setCurrentCity] = useState({});
//   const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
//     reducer,
//     intialState
//   );

//   useEffect(function () {
//     async function fetchCities() {
//       dispatch({ type: "loading" });
//       try {
//         const res = await fetch(URL);

//         const data = await res.json();
//         dispatch({ type: "citites/loaded", payload: data });
//       } catch (err) {
//         dispatch({ type: "error", payload: err.message });
//       }
//     }
//     fetchCities();
//   }, []);

//   const getCity = useCallback(
//     async function getCity(id) {
//       if (+id === currentCity.id) return;
//       dispatch({ type: "loading" });

//       try {
//         const res = await fetch(`${URL}/${id}`);
//         const data = await res.json();
//         dispatch({ type: "city/loaded", payload: data });
//       } catch (err) {
//         dispatch({ type: "error", payload: err.message });
//       }
//     },
//     [currentCity.id]
//   );
//   // async function createCity(city) {
//   //   dispatch({ type: "loading" });

//   //   try {
//   //     const resFetch = await fetch(`${URL}`);
//   //     const dataFetch = await resFetch.json();
//   //     if (
//   //       !dataFetch.filter((cityArr) => cityArr.cityName === city.cityName)
//   //         .length
//   //     )
//   //       return dispatch({ type: "error", payload: "duplicated city" });

//   //     const res = await fetch(`${URL}`, {
//   //       method: "POST",
//   //       body: JSON.stringify(city),
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //       },
//   //     });
//   //     const data = await res.json();
//   //     console.log("API Response:", data);
//   //     // setCities((cities) => [...cities, data]);
//   //     dispatch({ type: "city/created", payload: data });
//   //   } catch (err) {
//   //     dispatch({ type: "error", payload: err.message });
//   //   }
//   // }
//   async function createCity(newCity) {
//     dispatch({ type: "loading" });

//     try {
//       // Check if city already exists (using existing state instead of re-fetching)
//       const isDuplicate = cities.some(
//         (city) => city.cityName.toLowerCase() === newCity.cityName.toLowerCase()
//       );

//       if (isDuplicate) {
//         throw new Error("This city already exists in your list! 🌍");
//       }

//       // Only proceed if city is new
//       const res = await fetch(`${URL}`, {
//         method: "POST",
//         body: JSON.stringify(newCity),
//         headers: { "Content-Type": "application/json" },
//       });

//       const data = await res.json();
//       dispatch({ type: "city/created", payload: data });
//       return { success: true }; // Indicate success to Form
//     } catch (err) {
//       dispatch({ type: "error", payload: err.message });
//       return { success: false, error: err.message }; // Pass error to Form
//     }
//   }
//   async function deleteCity(id) {
//     dispatch({ type: "loading" });

//     try {
//       const res = await fetch(`${URL}/${id}`, {
//         method: "DELETE",
//       });
//       const data = await res.json();
//       console.log("API delete:", data);
//       // setCities((cities) => cities.filter((city) => city.id !== id));
//       dispatch({ type: "city/deleted", payload: id });
//     } catch (err) {
//       dispatch({ type: "error", payload: err.message });
//     }
//   }
//   return (
//     <CitiesContext.Provider
//       value={{
//         cities: cities,
//         isLoading: isLoading,
//         currentCity,
//         getCity,
//         createCity,
//         deleteCity,
//         error,
//       }}
//     >
//       {children}
//     </CitiesContext.Provider>
//   );
// }

// function useCities() {
//   const context = useContext(CitiesContext);
//   if (context === undefined)
//     throw new Error("Context was used outside the CitiesProvider");
//   return context;
// }

// export { CitiesProvider, useCities };

/// deep seek /////////////////////////////////////////////////////////////////
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { useAuth } from "../context/FakeAuthContext";

// const URL = "https://cities-json-server-api.onrender.com";
const URL = "http://localhost:8000";
const CitiesContext = createContext();

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };
    case "cities/loaded":
      return { ...state, cities: action.payload, isLoading: false };
    case "city/loaded":
      return { ...state, currentCity: action.payload, isLoading: false };
    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };
    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
      };
    case "error":
      return { ...state, isLoading: false, error: action.payload };
    case "reset":
      return initialState;
    case "clearError":
      return { ...state, error: "" };
    default:
      throw new Error("Unknown action type");
  }
}

function CitiesProvider({ children }) {
  const { user: currentUser } = useAuth();
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState
  );
  function clearError() {
    dispatch({ type: "clearError" });
  }
  useEffect(() => {
    if (!currentUser?.id) {
      dispatch({ type: "reset" });
      return;
    }

    async function fetchCities() {
      dispatch({ type: "loading" });
      try {
        const res = await fetch(`${URL}/cities?userId=${currentUser.id}`);
        const data = await res.json();
        dispatch({ type: "cities/loaded", payload: data });
      } catch (err) {
        dispatch({ type: "error", payload: err.message });
      }
    }
    fetchCities();
  }, [currentUser?.id]);

  const getCity = useCallback(async function getCity(id) {
    if (+id === currentCity.id) return;
    dispatch({ type: "loading" });

    try {
      const res = await fetch(`${URL}/cities/${id}`);
      const data = await res.json();
      dispatch({ type: "city/loaded", payload: data });
    } catch (err) {
      dispatch({ type: "error", payload: err.message });
    }
  }, []);

  async function createCity(newCity) {
    if (!currentUser?.id) return { success: false, error: "Not authenticated" };

    dispatch({ type: "loading" });
    try {
      const isDuplicate = cities.some(
        (city) =>
          city.cityName.toLowerCase() === newCity.cityName.toLowerCase() &&
          city.userId === currentUser.id
      );

      if (isDuplicate) {
        throw new Error(
          "This city already exists in your list! 🌍, click on the map to choose another city"
        );
      }

      const cityWithUser = {
        ...newCity,
        userId: currentUser.id,
      };

      const res = await fetch(`${URL}/cities`, {
        method: "POST",
        body: JSON.stringify(cityWithUser),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      dispatch({ type: "city/created", payload: data });
      return { success: true };
    } catch (err) {
      dispatch({ type: "error", payload: err.message });
      return { success: false, error: err.message };
    }
  }

  async function deleteCity(id) {
    dispatch({ type: "loading" });
    try {
      await fetch(`${URL}/cities/${id}`, {
        method: "DELETE",
      });
      dispatch({ type: "city/deleted", payload: id });
    } catch (err) {
      dispatch({ type: "error", payload: err.message });
    }
  }

  async function updateCity(id, updates) {
    dispatch({ type: "loading" });
    try {
      const res = await fetch(`${URL}/cities/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      dispatch({ type: "city/loaded", payload: data });
      return data;
    } catch (err) {
      dispatch({ type: "error", payload: err.message });
      throw err;
    }
  }
  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        error,
        getCity,
        createCity,
        deleteCity,
        clearError,
        updateCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("CitiesContext was used outside CitiesProvider");
  return context;
}

export { CitiesProvider, useCities };
