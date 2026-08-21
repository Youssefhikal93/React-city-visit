import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { onAuthStateChanged, signInAnonymously, signOut } from "firebase/auth";

import { auth, isFirebaseConfigured } from "../services/firebase";
import {
  PIN_LENGTH,
  createProfile,
  isValidPin,
  profileExists,
  touchProfile,
} from "../services/profiles";

const AuthContext = createContext();

// The Firebase anonymous session lives in IndexedDB and survives a reload, but
// the PIN that selects *which* travel log to open does not, so we keep it here.
const PIN_STORAGE_KEY = "worldvisit:pin";

function readStoredPin() {
  try {
    const pin = window.localStorage.getItem(PIN_STORAGE_KEY);
    return isValidPin(pin) ? pin : null;
  } catch {
    return null;
  }
}

function writeStoredPin(pin) {
  try {
    if (pin) window.localStorage.setItem(PIN_STORAGE_KEY, pin);
    else window.localStorage.removeItem(PIN_STORAGE_KEY);
  } catch {
    // Private-browsing modes can block storage; the session still works, it
    // just won't survive a reload.
  }
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isRestoring: true,
  error: null,
  loading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "restore/done":
      return { ...state, isRestoring: false };
    case "loading":
      return { ...state, loading: true, error: null };
    case "login":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isRestoring: false,
        loading: false,
        error: null,
      };
    case "logout":
      return { ...initialState, isRestoring: false };
    case "error":
      return { ...state, loading: false, error: action.payload };
    case "clearError":
      return { ...state, error: null };
    default:
      throw new Error("Unknown auth action");
  }
}

/** Turns Firebase error codes into something worth showing a person. */
function readableError(err) {
  const code = err?.code ?? "";

  if (code === "auth/operation-not-allowed")
    return "Anonymous sign-in is turned off for this Firebase project. Enable it under Authentication > Sign-in method.";
  if (code === "auth/network-request-failed")
    return "Can't reach Firebase. Check your connection and try again.";
  if (code === "auth/too-many-requests")
    return "Too many attempts. Wait a moment and try again.";
  if (err?.message?.includes("PERMISSION_DENIED"))
    return "The database rejected that request. Check the Realtime Database rules.";

  return err?.message || "Something went wrong. Please try again.";
}

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user, isAuthenticated, isRestoring, error, loading } = state;

  // Restore a previous session: an anonymous Firebase user plus a stored PIN.
  useEffect(() => {
    if (!isFirebaseConfigured) {
      dispatch({ type: "restore/done" });
      return;
    }

    return onAuthStateChanged(auth, (firebaseUser) => {
      const pin = readStoredPin();

      if (firebaseUser && pin) {
        dispatch({ type: "login", payload: { uid: firebaseUser.uid, pin } });
      } else {
        dispatch({ type: "restore/done" });
      }
    });
  }, []);

  const ensureAnonymousUser = useCallback(async () => {
    if (auth.currentUser) return auth.currentUser;
    const credential = await signInAnonymously(auth);
    return credential.user;
  }, []);

  const login = useCallback(
    async (pin) => {
      if (!isFirebaseConfigured) {
        dispatch({
          type: "error",
          payload: "Firebase isn't configured. Copy .env.example to .env first.",
        });
        return { success: false };
      }

      if (!isValidPin(pin)) {
        dispatch({
          type: "error",
          payload: `Enter your ${PIN_LENGTH}-digit PIN.`,
        });
        return { success: false };
      }

      dispatch({ type: "loading" });

      try {
        const firebaseUser = await ensureAnonymousUser();

        if (!(await profileExists(pin))) {
          dispatch({
            type: "error",
            payload: "No travel log found for that PIN. Sign up to start one.",
          });
          return { success: false };
        }

        await touchProfile(pin);
        writeStoredPin(pin);
        dispatch({ type: "login", payload: { uid: firebaseUser.uid, pin } });
        return { success: true };
      } catch (err) {
        console.error("Login failed:", err);
        dispatch({ type: "error", payload: readableError(err) });
        return { success: false };
      }
    },
    [ensureAnonymousUser]
  );

  const signup = useCallback(
    async (pin) => {
      if (!isFirebaseConfigured) {
        const message = "Firebase isn't configured. Copy .env.example to .env first.";
        dispatch({ type: "error", payload: message });
        return { success: false, error: message };
      }

      if (!isValidPin(pin)) {
        const message = `Choose a ${PIN_LENGTH}-digit PIN (numbers only).`;
        dispatch({ type: "error", payload: message });
        return { success: false, error: message };
      }

      dispatch({ type: "loading" });

      try {
        const firebaseUser = await ensureAnonymousUser();

        if (await profileExists(pin)) {
          const message = "That PIN is already taken. Pick another one, or log in with it.";
          dispatch({ type: "error", payload: message });
          return { success: false, error: message };
        }

        await createProfile(pin);
        writeStoredPin(pin);
        dispatch({ type: "login", payload: { uid: firebaseUser.uid, pin } });
        return { success: true, error: null };
      } catch (err) {
        console.error("Signup failed:", err);
        const message = readableError(err);
        dispatch({ type: "error", payload: message });
        return { success: false, error: message };
      }
    },
    [ensureAnonymousUser]
  );

  const logout = useCallback(async () => {
    writeStoredPin(null);
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out failed:", err);
    }
    dispatch({ type: "logout" });
  }, []);

  const clearError = useCallback(() => dispatch({ type: "clearError" }), []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isRestoring,
      error,
      loading,
      login,
      signup,
      logout,
      clearError,
    }),
    [
      user,
      isAuthenticated,
      isRestoring,
      error,
      loading,
      login,
      signup,
      logout,
      clearError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("AuthContext was used outside AuthProvider");
  return context;
}

export { AuthProvider, useAuth };
