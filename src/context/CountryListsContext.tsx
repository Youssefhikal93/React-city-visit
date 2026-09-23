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

import * as countryListsApi from "../services/countryLists";
import type { CountryList } from "../services/countryLists";
import { useAuth } from "./AuthContext";

interface CountryListsState {
  username: string | null;
  livedInCountryCodes: string[];
  plannedCountryCodes: string[];
  isLoading: boolean;
  loadError: string;
}

type CountryListsAction =
  | { type: "loading"; username: string }
  | {
      type: "loaded";
      username: string;
      lists: countryListsApi.AccountCountryLists;
    }
  | { type: "loadFailed"; username: string; error: string }
  | { type: "reset" };

interface CountryListChangeResult {
  success: boolean;
  error?: string;
}

interface CountryListsContextValue extends Omit<CountryListsState, "username"> {
  addCountry: (
    list: CountryList,
    countryCode: string,
  ) => Promise<CountryListChangeResult>;
  removeCountry: (
    list: CountryList,
    countryCode: string,
  ) => Promise<CountryListChangeResult>;
  retryLoad: () => void;
}

const CountryListsContext = createContext<CountryListsContextValue | undefined>(
  undefined,
);

const initialState: CountryListsState = {
  username: null,
  livedInCountryCodes: [],
  plannedCountryCodes: [],
  isLoading: false,
  loadError: "",
};

function reducer(
  _state: CountryListsState,
  action: CountryListsAction,
): CountryListsState {
  switch (action.type) {
    case "loading":
      return { ...initialState, username: action.username, isLoading: true };
    case "loaded":
      return {
        username: action.username,
        livedInCountryCodes: action.lists.livedInCountryCodes,
        plannedCountryCodes: action.lists.plannedCountryCodes,
        isLoading: false,
        loadError: "",
      };
    case "loadFailed":
      return { ...initialState, username: action.username, loadError: action.error };
    case "reset":
      return initialState;
    default:
      throw new Error("Unknown Country lists action");
  }
}

function readableError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

const listLabel: Record<CountryList, string> = {
  livedIn: "lived-in Countries",
  planned: "planned Countries",
};

function visibleState(
  state: CountryListsState,
  username: string | null,
): CountryListsState {
  if (state.username === username) return state;
  return { ...initialState, isLoading: username !== null };
}

function CountryListsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const username = user?.username ?? null;
  const [state, dispatch] = useReducer(reducer, initialState);
  const [retryVersion, setRetryVersion] = useState(0);
  const { livedInCountryCodes, plannedCountryCodes, isLoading, loadError } =
    visibleState(state, username);

  useEffect(() => {
    if (!username) {
      dispatch({ type: "reset" });
      return;
    }

    let isCurrentSubscription = true;
    dispatch({ type: "loading", username });
    const unsubscribe = countryListsApi.subscribeToCountryLists(
      username,
      (lists) => {
        if (!isCurrentSubscription) return;
        dispatch({ type: "loaded", username, lists });
      },
      (error) => {
        if (!isCurrentSubscription) return;
        console.error("Country lists subscription failed:", error);
        dispatch({
          type: "loadFailed",
          username,
          error: readableError(error, "Couldn't load your Country lists."),
        });
      },
    );
    return () => {
      isCurrentSubscription = false;
      unsubscribe();
    };
  }, [retryVersion, username]);

  const addCountry = useCallback(
    async (
      list: CountryList,
      countryCode: string,
    ): Promise<CountryListChangeResult> => {
      if (!username) return { success: false, error: "Not authenticated" };

      try {
        await countryListsApi.addCountryToList(username, list, countryCode);
        return { success: true };
      } catch (error) {
        console.error(`Failed to add to ${listLabel[list]}:`, error);
        return {
          success: false,
          error: readableError(error, `Couldn't save your ${listLabel[list]}.`),
        };
      }
    },
    [username],
  );

  const removeCountry = useCallback(
    async (
      list: CountryList,
      countryCode: string,
    ): Promise<CountryListChangeResult> => {
      if (!username) return { success: false, error: "Not authenticated" };

      try {
        await countryListsApi.removeCountryFromList(username, list, countryCode);
        return { success: true };
      } catch (error) {
        console.error(`Failed to remove from ${listLabel[list]}:`, error);
        return {
          success: false,
          error: readableError(error, `Couldn't update your ${listLabel[list]}.`),
        };
      }
    },
    [username],
  );

  const retryLoad = useCallback(() => {
    if (username) setRetryVersion((version) => version + 1);
  }, [username]);

  const value = useMemo<CountryListsContextValue>(
    () => ({
      livedInCountryCodes,
      plannedCountryCodes,
      isLoading,
      loadError,
      addCountry,
      removeCountry,
      retryLoad,
    }),
    [
      livedInCountryCodes,
      plannedCountryCodes,
      isLoading,
      loadError,
      addCountry,
      removeCountry,
      retryLoad,
    ],
  );

  return (
    <CountryListsContext.Provider value={value}>
      {children}
    </CountryListsContext.Provider>
  );
}

function useCountryLists(): CountryListsContextValue {
  const context = useContext(CountryListsContext);
  if (context === undefined)
    throw new Error("useCountryLists was used outside CountryListsProvider");
  return context;
}

export { CountryListsProvider, useCountryLists };
