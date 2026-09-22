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

import { useAuth } from "./AuthContext";
import * as homeCountryApi from "../services/homeCountry";

interface HomeCountryState {
  username: string | null;
  countryCode: string | null;
  isLoading: boolean;
  loadError: string;
}

type HomeCountryAction =
  | { type: "loading"; username: string }
  | { type: "loaded"; username: string; countryCode: string | null }
  | { type: "loadFailed"; username: string; error: string }
  | { type: "reset" };

interface HomeCountryChangeResult {
  success: boolean;
  error?: string;
}

interface HomeCountryContextValue
  extends Omit<HomeCountryState, "username"> {
  saveHomeCountry: (countryCode: string) => Promise<HomeCountryChangeResult>;
  clearHomeCountry: () => Promise<HomeCountryChangeResult>;
  retryHomeCountryLoad: () => void;
}

const HomeCountryContext = createContext<HomeCountryContextValue | undefined>(
  undefined,
);

const initialState: HomeCountryState = {
  username: null,
  countryCode: null,
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
        countryCode: null,
        isLoading: true,
        loadError: "",
      };
    case "loaded":
      return {
        username: action.username,
        countryCode: action.countryCode,
        isLoading: false,
        loadError: "",
      };
    case "loadFailed":
      return {
        username: action.username,
        countryCode: null,
        isLoading: false,
        loadError: action.error,
      };
    case "reset":
      return initialState;
    default:
      throw new Error("Unknown home Country action");
  }
}

function readableError(error: unknown, fallback: string): string {
  return error instanceof Error
    ? error.message
    : fallback;
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
  const { countryCode, isLoading, loadError } = visibleState(state, username);

  useEffect(() => {
    if (!username) {
      dispatch({ type: "reset" });
      return;
    }

    let isCurrentSubscription = true;
    dispatch({ type: "loading", username });
    const unsubscribe = homeCountryApi.subscribeToHomeCountry(
      username,
      (loadedCountryCode) => {
        if (!isCurrentSubscription) return;
        dispatch({ type: "loaded", username, countryCode: loadedCountryCode });
      },
      (error) => {
        if (!isCurrentSubscription) return;
        console.error("Home Country subscription failed:", error);
        dispatch({
          type: "loadFailed",
          username,
          error: readableError(error, "Couldn't load your home Country."),
        });
      },
    );
    return () => {
      isCurrentSubscription = false;
      unsubscribe();
    };
  }, [retryVersion, username]);

  const saveHomeCountry = useCallback(
    async (newCountryCode: string): Promise<HomeCountryChangeResult> => {
      if (!username) return { success: false, error: "Not authenticated" };

      try {
        await homeCountryApi.saveHomeCountry(username, newCountryCode);
        return { success: true };
      } catch (error) {
        console.error("Failed to save home Country:", error);
        return {
          success: false,
          error: readableError(error, "Couldn't save your home Country."),
        };
      }
    },
    [username],
  );

  const clearHomeCountry = useCallback(
    async (): Promise<HomeCountryChangeResult> => {
      if (!username) return { success: false, error: "Not authenticated" };

      try {
        await homeCountryApi.clearHomeCountry(username);
        return { success: true };
      } catch (error) {
        console.error("Failed to clear home Country:", error);
        return {
          success: false,
          error: readableError(error, "Couldn't clear your home Country."),
        };
      }
    },
    [username],
  );

  const retryHomeCountryLoad = useCallback(() => {
    if (username) setRetryVersion((version) => version + 1);
  }, [username]);

  const value = useMemo<HomeCountryContextValue>(
    () => ({
      countryCode,
      isLoading,
      loadError,
      saveHomeCountry,
      clearHomeCountry,
      retryHomeCountryLoad,
    }),
    [
      countryCode,
      isLoading,
      loadError,
      saveHomeCountry,
      clearHomeCountry,
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
