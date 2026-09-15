import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import { useAuth } from "./AuthContext";
import { findSavedCity } from "../services/cityIdentity";
import * as citiesApi from "../services/cities";
import type { City, CityUpdate, NewCity } from "../types";

interface CitiesState {
  cities: City[];
  isLoading: boolean;
  currentCity: City | null;
  error: string;
}

type CitiesAction =
  | { type: "loading" }
  | { type: "cities/loaded"; payload: City[] }
  | { type: "city/loaded"; payload: City }
  | { type: "city/created"; payload: City }
  | { type: "city/deleted"; payload: string }
  | { type: "error"; payload: string }
  | { type: "reset" }
  | { type: "clearError" };

interface CreateCityResult {
  success: boolean;
  error?: string;
}

interface CitiesContextValue extends CitiesState {
  getCity: (id: string) => Promise<void>;
  createCity: (newCity: NewCity) => Promise<CreateCityResult>;
  deleteCity: (id: string) => Promise<void>;
  updateCity: (id: string, updates: CityUpdate) => Promise<City | null>;
  addMemory: (cityId: string, dataUri: string) => Promise<void>;
  deleteMemory: (cityId: string, memoryId: string) => Promise<void>;
  clearError: () => void;
}

const CitiesContext = createContext<CitiesContextValue | undefined>(undefined);

const initialState: CitiesState = {
  cities: [],
  isLoading: false,
  currentCity: null,
  error: "",
};

function reducer(state: CitiesState, action: CitiesAction): CitiesState {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };
    case "cities/loaded": {
      const currentCity = state.currentCity
        ? (action.payload.find((city) => city.id === state.currentCity?.id) ??
          null)
        : null;
      return {
        ...state,
        cities: action.payload,
        currentCity,
        isLoading: false,
        error: "",
      };
    }
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
          state.currentCity?.id === action.payload ? null : state.currentCity,
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

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

function CitiesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const username = user?.username ?? null;

  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState,
  );

  const clearError = useCallback(() => dispatch({ type: "clearError" }), []);

  // One live listener per signed-in account: edits from another tab or device
  // show up here without a refetch, and logging out tears it down.
  useEffect(() => {
    if (!username) {
      dispatch({ type: "reset" });
      return;
    }

    dispatch({ type: "loading" });

    const unsubscribe = citiesApi.subscribeToCities(
      username,
      (list) => dispatch({ type: "cities/loaded", payload: list }),
      (err) => {
        console.error("Cities subscription failed:", err);
        dispatch({
          type: "error",
          payload: "Couldn't load your cities from Firebase.",
        });
      },
    );

    return unsubscribe;
  }, [username]);

  const getCity = useCallback(
    async (id: string): Promise<void> => {
      if (!username || !id) return;

      dispatch({ type: "loading" });
      try {
        const city = await citiesApi.fetchCity(username, id);
        dispatch({ type: "city/loaded", payload: city });
      } catch (err) {
        console.error("Failed to load city:", err);
        dispatch({
          type: "error",
          payload: errorMessage(err, "Couldn't load that city."),
        });
      }
    },
    [username],
  );

  const createCity = useCallback(
    async (newCity: NewCity): Promise<CreateCityResult> => {
      if (!username) return { success: false, error: "Not authenticated" };

      dispatch({ type: "loading" });
      try {
        if (findSavedCity(cities, newCity)) {
          throw new Error(
            "This city is already in your list. Open it to update your visits.",
          );
        }
        const created = await citiesApi.createCity(username, newCity);
        dispatch({ type: "city/created", payload: created });
        return { success: true };
      } catch (err) {
        console.error("Failed to create city:", err);
        const message = errorMessage(err, "Couldn't save that city.");
        dispatch({ type: "error", payload: message });
        return { success: false, error: message };
      }
    },
    [username, cities],
  );

  const deleteCity = useCallback(
    async (id: string): Promise<void> => {
      if (!username) return;

      dispatch({ type: "loading" });
      try {
        await citiesApi.deleteCity(username, id);
        dispatch({ type: "city/deleted", payload: id });
      } catch (err) {
        console.error("Failed to delete city:", err);
        dispatch({
          type: "error",
          payload: errorMessage(err, "Couldn't delete that city."),
        });
      }
    },
    [username],
  );

  const updateCity = useCallback(
    async (id: string, updates: CityUpdate): Promise<City | null> => {
      if (!username) return null;

      try {
        const updated = await citiesApi.updateCity(username, id, updates);
        dispatch({ type: "city/loaded", payload: updated });
        return updated;
      } catch (err) {
        console.error("Failed to update city:", err);
        if (updates.visitCount === undefined)
          dispatch({
            type: "error",
            payload: errorMessage(err, "Couldn't update that city."),
          });
        throw err;
      }
    },
    [username],
  );

  const addMemory = useCallback(
    async (cityId: string, dataUri: string): Promise<void> => {
      if (!username) throw new Error("Not authenticated");

      try {
        await citiesApi.addMemory(username, cityId, dataUri);
      } catch (err) {
        console.error("Failed to add Memory:", err);
        const message = errorMessage(err, "Couldn't save that Memory.");
        dispatch({ type: "error", payload: message });
        throw err;
      }
    },
    [username],
  );

  const deleteMemory = useCallback(
    async (cityId: string, memoryId: string): Promise<void> => {
      if (!username) throw new Error("Not authenticated");

      try {
        await citiesApi.deleteMemory(username, cityId, memoryId);
      } catch (err) {
        console.error("Failed to delete Memory:", err);
        const message = errorMessage(err, "Couldn't delete that Memory.");
        dispatch({ type: "error", payload: message });
        throw err;
      }
    },
    [username],
  );

  const value = useMemo<CitiesContextValue>(
    () => ({
      cities,
      isLoading,
      currentCity,
      error,
      getCity,
      createCity,
      deleteCity,
      updateCity,
      addMemory,
      deleteMemory,
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
      addMemory,
      deleteMemory,
      clearError,
    ],
  );

  return (
    <CitiesContext.Provider value={value}>{children}</CitiesContext.Provider>
  );
}

function useCities(): CitiesContextValue {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("CitiesContext was used outside CitiesProvider");
  return context;
}

export { CitiesProvider, useCities };
