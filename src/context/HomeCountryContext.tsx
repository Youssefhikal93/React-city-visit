import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";

import * as countryPreferencesApi from "../services/homeCountry";
import { useAuth } from "./AuthContext";

interface HomeCountryState {
  username: string | null;
  homeCountryCode: string | null;
  plannedCountryCode: string | null;
  isLoading: boolean;
  loadError: string;
}

type HomeCountryAction =
  | { type: "loading"; username: string }
  | {
      type: "loaded";
      username: string;
      preferences: countryPreferencesApi.AccountCountryPreferences;
    }
  | { type: "loadFailed"; username: string; error: string }
  | { type: "reset" };

interface HomeCountryChangeResult {
  success: boolean;
  error?: string;
}

interface HomeCountryContextValue extends Omit<HomeCountryState, "username"> {
  countryCode: string | null;
  saveHomeCountry: (countryCode: string) => Promise<HomeCountryChangeResult>;
  clearHomeCountry: () => Promise<HomeCountryChangeResult>;
  savePlannedCountry: (countryCode: string) => Promise<HomeCountryChangeResult>;
  clearPlannedCountry: () => Promise<HomeCountryChangeResult>;
  retryHomeCountryLoad: () => void;
}

const HomeCountryContext = createContext<HomeCountryContextValue | undefined>(
  undefined,
);

const initialState: HomeCountryState = {
  username: null,
  homeCountryCode: null,
  plannedCountryCode: null,
  isLoading: false,
  loadError: "",
};

function reducer(
  _state: HomeCountryState,
  action: HomeCountryAction,
): HomeCountryState {
  switch (action.type) {
    case "loading":
      return {
        username: action.username,
        homeCountryCode: null,
        plannedCountryCode: null,
        isLoading: true,
        loadError: "",
      };
    case "loaded":
      return {
        username: action.username,
        homeCountryCode: action.preferences.homeCountryCode,
        plannedCountryCode: action.preferences.plannedCountryCode,
        isLoading: false,
        loadError: "",
      };
    case "loadFailed":
      return {
        username: action.username,
        homeCountryCode: null,
        plannedCountryCode: null,
        isLoading: false,
        loadError: action.error,
      };
    case "reset":
      return initialState;
    default:
      throw new Error("Unknown Country preferences action");
  }
}

function readableError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function countryPreferenceLabel(
  preference: countryPreferencesApi.CountryPreference,
): string {
  return preference === "homeCountry" ? "home Country" : "planned Country";
}

function visibleState(
  state: HomeCountryState,
  username: string | null,
): HomeCountryState {
  if (state.username === username) return state;
  return { ...initialState, isLoading: username !== null };
}

function HomeCountryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const username = user?.username ?? null;
  const [state, dispatch] = useReducer(reducer, initialState);
  const [retryVersion, setRetryVersion] = useState(0);
  const { homeCountryCode, plannedCountryCode, isLoading, loadError } =
    visibleState(state, username);

  useEffect(() => {
    if (!username) {
      dispatch({ type: "reset" });
      return;
    }

    let isCurrentSubscription = true;
    dispatch({ type: "loading", username });
    const unsubscribe = countryPreferencesApi.subscribeToCountryPreferences(
      username,
      (preferences) => {
        if (!isCurrentSubscription) return;
        dispatch({ type: "loaded", username, preferences });
      },
      (error) => {
        if (!isCurrentSubscription) return;
        console.error("Country preferences subscription failed:", error);
        dispatch({
          type: "loadFailed",
          username,
          error: readableError(error, "Couldn't load your Country preferences."),
        });
      },
    );
    return () => {
      isCurrentSubscription = false;
      unsubscribe();
    };
  }, [retryVersion, username]);

  const saveCountryPreference = useCallback(
    async (
      preference: countryPreferencesApi.CountryPreference,
      countryCode: string,
    ): Promise<HomeCountryChangeResult> => {
      if (!username) return { success: false, error: "Not authenticated" };

      try {
        await countryPreferencesApi.saveCountryPreference(
          username,
          preference,
          countryCode,
        );
        return { success: true };
      } catch (error) {
        const preferenceLabel = countryPreferenceLabel(preference);
        console.error(`Failed to save ${preferenceLabel}:`, error);
        return {
          success: false,
          error: readableError(error, `Couldn't save your ${preferenceLabel}.`),
        };
      }
    },
    [username],
  );

  const clearCountryPreference = useCallback(
    async (
      preference: countryPreferencesApi.CountryPreference,
    ): Promise<HomeCountryChangeResult> => {
      if (!username) return { success: false, error: "Not authenticated" };

      try {
        await countryPreferencesApi.clearCountryPreference(username, preference);
        return { success: true };
      } catch (error) {
        const preferenceLabel = countryPreferenceLabel(preference);
        console.error(`Failed to clear ${preferenceLabel}:`, error);
        return {
          success: false,
          error: readableError(error, `Couldn't clear your ${preferenceLabel}.`),
        };
      }
    },
    [username],
  );

  const saveHomeCountry = useCallback(
    (countryCode: string) => saveCountryPreference("homeCountry", countryCode),
    [saveCountryPreference],
  );
  const clearHomeCountry = useCallback(
    () => clearCountryPreference("homeCountry"),
    [clearCountryPreference],
  );
  const savePlannedCountry = useCallback(
    (countryCode: string) => saveCountryPreference("plannedCountry", countryCode),
    [saveCountryPreference],
  );
  const clearPlannedCountry = useCallback(
    () => clearCountryPreference("plannedCountry"),
    [clearCountryPreference],
  );
  const retryHomeCountryLoad = useCallback(() => {
    if (username) setRetryVersion((version) => version + 1);
  }, [username]);

  const value = useMemo<HomeCountryContextValue>(
    () => ({
      countryCode: homeCountryCode,
      homeCountryCode,
      plannedCountryCode,
      isLoading,
      loadError,
      saveHomeCountry,
      clearHomeCountry,
      savePlannedCountry,
      clearPlannedCountry,
      retryHomeCountryLoad,
    }),
    [
      homeCountryCode,
      plannedCountryCode,
      isLoading,
      loadError,
      saveHomeCountry,
      clearHomeCountry,
      savePlannedCountry,
      clearPlannedCountry,
      retryHomeCountryLoad,
    ],
  );

  return (
    <HomeCountryContext.Provider value={value}>
      {children}
    </HomeCountryContext.Provider>
  );
}

function useHomeCountry(): HomeCountryContextValue {
  const context = useContext(HomeCountryContext);
  if (context === undefined)
    throw new Error("useHomeCountry was used outside HomeCountryProvider");
  return context;
}

export { HomeCountryProvider, useHomeCountry };
