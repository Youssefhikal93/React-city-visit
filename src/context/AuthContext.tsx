import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signInAnonymously, signOut } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";

import { auth, isFirebaseConfigured } from "../services/firebase";
import {
  PIN_LENGTH,
  createProfile,
  isValidPin,
  profileExists,
  touchProfile,
} from "../services/profiles";
import type { AuthResult, AuthUser } from "../types";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  error: string | null;
  loading: boolean;
}

type AuthAction =
  | { type: "restore/done" }
  | { type: "loading" }
  | { type: "login"; payload: AuthUser }
  | { type: "logout" }
  | { type: "error"; payload: string }
  | { type: "clearError" };

interface AuthContextValue extends AuthState {
  login: (pin: string) => Promise<AuthResult>;
  signup: (pin: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// The Firebase anonymous session lives in IndexedDB and survives a reload, but
// the PIN that selects *which* travel log to open does not, so we keep it here.
const PIN_STORAGE_KEY = "worldvisit:pin";

const NOT_CONFIGURED =
  "Firebase isn't configured. Copy .env.example to .env first.";

function readStoredPin(): string | null {
  try {
    const pin = window.localStorage.getItem(PIN_STORAGE_KEY);
    return isValidPin(pin) ? pin : null;
  } catch {
    return null;
  }
}

function writeStoredPin(pin: string | null): void {
  try {
    if (pin) window.localStorage.setItem(PIN_STORAGE_KEY, pin);
    else window.localStorage.removeItem(PIN_STORAGE_KEY);
  } catch {
    // Private-browsing modes can block storage; the session still works, it
    // just won't survive a reload.
  }
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isRestoring: true,
  error: null,
  loading: false,
};

function reducer(state: AuthState, action: AuthAction): AuthState {
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
function readableError(err: unknown): string {
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? String((err as { code: unknown }).code)
      : "";
  const message = err instanceof Error ? err.message : "";

  if (code === "auth/operation-not-allowed")
    return "Anonymous sign-in is turned off for this Firebase project. Enable it under Authentication > Sign-in method.";
  if (code === "auth/network-request-failed")
    return "Can't reach Firebase. Check your connection and try again.";
  if (code === "auth/too-many-requests")
    return "Too many attempts. Wait a moment and try again.";
  if (message.includes("PERMISSION_DENIED"))
    return "The database rejected that request. Check the Realtime Database rules.";

  return message || "Something went wrong. Please try again.";
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user, isAuthenticated, isRestoring, error, loading } = state;

  // Restore a previous session: an anonymous Firebase user plus a stored PIN.
  useEffect(() => {
    if (!isFirebaseConfigured) {
      dispatch({ type: "restore/done" });
      return;
    }

    return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      const pin = readStoredPin();

      if (firebaseUser && pin) {
        dispatch({ type: "login", payload: { uid: firebaseUser.uid, pin } });
      } else {
        dispatch({ type: "restore/done" });
      }
    });
  }, []);

  const ensureAnonymousUser = useCallback(async (): Promise<FirebaseUser> => {
    if (auth.currentUser) return auth.currentUser;
    const credential = await signInAnonymously(auth);
    return credential.user;
  }, []);

  const login = useCallback(
    async (pin: string): Promise<AuthResult> => {
      if (!isFirebaseConfigured) {
        dispatch({ type: "error", payload: NOT_CONFIGURED });
        return { success: false, error: NOT_CONFIGURED };
      }

      if (!isValidPin(pin)) {
        const message = `Enter your ${PIN_LENGTH}-digit PIN.`;
        dispatch({ type: "error", payload: message });
        return { success: false, error: message };
      }

      dispatch({ type: "loading" });

      try {
        const firebaseUser = await ensureAnonymousUser();

        if (!(await profileExists(pin))) {
          const message =
            "No travel log found for that PIN. Sign up to start one.";
          dispatch({ type: "error", payload: message });
          return { success: false, error: message };
        }

        await touchProfile(pin);
        writeStoredPin(pin);
        dispatch({ type: "login", payload: { uid: firebaseUser.uid, pin } });
        return { success: true, error: null };
      } catch (err) {
        console.error("Login failed:", err);
        const message = readableError(err);
        dispatch({ type: "error", payload: message });
        return { success: false, error: message };
      }
    },
    [ensureAnonymousUser]
  );

  const signup = useCallback(
    async (pin: string): Promise<AuthResult> => {
      if (!isFirebaseConfigured) {
        dispatch({ type: "error", payload: NOT_CONFIGURED });
        return { success: false, error: NOT_CONFIGURED };
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
          const message =
            "That PIN is already taken. Pick another one, or log in with it.";
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

  const logout = useCallback(async (): Promise<void> => {
    writeStoredPin(null);
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out failed:", err);
    }
    dispatch({ type: "logout" });
  }, []);

  const clearError = useCallback(() => dispatch({ type: "clearError" }), []);

  const value = useMemo<AuthContextValue>(
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

function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("AuthContext was used outside AuthProvider");
  return context;
}

export { AuthProvider, useAuth };
