import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import { useAuth } from "./AuthContext";
import * as citiesApi from "../services/cities";

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
      return { ...state, cities: action.payload, isLoading: false, error: "" };
    case "city/loaded":
      return { ...state, currentCity: action.payload, isLoading: false };
    case "city/created":
      // The live subscription already appended it to `cities`.
      return { ...state, isLoading: false, currentCity: action.payload };
    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        currentCity:
          state.currentCity.id === action.payload ? {} : state.currentCity,
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
  const { user } = useAuth();
  const pin = user?.pin ?? null;

  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  const clearError = useCallback(() => dispatch({ type: "clearError" }), []);

  // One live listener per signed-in PIN: edits from another tab or device show
  // up here without a refetch, and logging out tears it down.
  useEffect(() => {
    if (!pin) {
      dispatch({ type: "reset" });
      return;
    }

    dispatch({ type: "loading" });

    const unsubscribe = citiesApi.subscribeToCities(
      pin,
      (list) => dispatch({ type: "cities/loaded", payload: list }),
      (err) => {
        console.error("Cities subscription failed:", err);
        dispatch({
          type: "error",
          payload: "Couldn't load your cities from Firebase.",
        });
      }
    );

    return unsubscribe;
  }, [pin]);

  const getCity = useCallback(
    async (id) => {
      if (!pin || !id) return;

      dispatch({ type: "loading" });
      try {
        const city = await citiesApi.fetchCity(pin, id);
        dispatch({ type: "city/loaded", payload: city });
      } catch (err) {
        console.error("Failed to load city:", err);
        dispatch({ type: "error", payload: err.message });
      }
    },
    [pin]
  );

  const createCity = useCallback(
    async (newCity) => {
      if (!pin) return { success: false, error: "Not authenticated" };

      dispatch({ type: "loading" });
      try {
        const isDuplicate = cities.some(
          (city) =>
            city.cityName.toLowerCase() === newCity.cityName.toLowerCase()
        );

        if (isDuplicate) {
          throw new Error(
            "This city already exists in your list! 🌍, click on the map to choose another city"
          );
        }

        const created = await citiesApi.createCity(pin, newCity);
        dispatch({ type: "city/created", payload: created });
        return { success: true };
      } catch (err) {
        console.error("Failed to create city:", err);
        dispatch({ type: "error", payload: err.message });
        return { success: false, error: err.message };
      }
    },
    [pin, cities]
  );

  const deleteCity = useCallback(
    async (id) => {
      if (!pin) return;

      dispatch({ type: "loading" });
      try {
        await citiesApi.deleteCity(pin, id);
        dispatch({ type: "city/deleted", payload: id });
      } catch (err) {
        console.error("Failed to delete city:", err);
        dispatch({ type: "error", payload: err.message });
      }
    },
    [pin]
  );

  const updateCity = useCallback(
    async (id, updates) => {
      if (!pin) return null;

      dispatch({ type: "loading" });
      try {
        const updated = await citiesApi.updateCity(pin, id, updates);
        dispatch({ type: "city/loaded", payload: updated });
        return updated;
      } catch (err) {
        console.error("Failed to update city:", err);
        dispatch({ type: "error", payload: err.message });
        throw err;
      }
    },
    [pin]
  );

  const value = useMemo(
    () => ({
      cities,
      isLoading,
      currentCity,
      error,
      getCity,
      createCity,
      deleteCity,
      updateCity,
      clearError,
    }),
    [
      cities,
      isLoading,
      currentCity,
      error,
      getCity,
      createCity,
      deleteCity,
      updateCity,
      clearError,
    ]
  );

  return (
    <CitiesContext.Provider value={value}>{children}</CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("CitiesContext was used outside CitiesProvider");
  return context;
}

export { CitiesProvider, useCities };
