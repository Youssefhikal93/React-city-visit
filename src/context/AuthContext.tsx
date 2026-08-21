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
  closeSession,
  createUser,
  fetchProfile,
  isValidPin,
  normalizeUsername,
  openSession,
  readSession,
  touchLogin,
  usernameError,
} from "../services/users";
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
  login: (username: string, pin: string) => Promise<AuthResult>;
  signup: (username: string, pin: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const NOT_CONFIGURED =
  "Firebase isn't configured. Copy .env.example to .env first.";

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

function isPermissionDenied(err: unknown): boolean {
  const message = err instanceof Error ? err.message : "";
  return message.includes("PERMISSION_DENIED") || message.includes("permission_denied");
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

  return message || "Something went wrong. Please try again.";
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user, isAuthenticated, isRestoring, error, loading } = state;

  /**
   * Restore a previous session. The anonymous Firebase account survives a
   * reload, and the account it is signed into is recorded in the database
   * under sessions/{uid}, so nothing sensitive sits in localStorage.
   */
  useEffect(() => {
    if (!isFirebaseConfigured) {
      dispatch({ type: "restore/done" });
      return;
    }

    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        dispatch({ type: "restore/done" });
        return;
      }

      try {
        const username = await readSession(firebaseUser.uid);
        if (!username) {
          dispatch({ type: "restore/done" });
          return;
        }

        const profile = await fetchProfile(username);
        dispatch({
          type: "login",
          payload: {
            uid: firebaseUser.uid,
            username,
            displayName: profile?.displayName ?? username,
          },
        });
      } catch (err) {
        console.error("Could not restore session:", err);
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
    async (rawUsername: string, pin: string): Promise<AuthResult> => {
      if (!isFirebaseConfigured) {
        dispatch({ type: "error", payload: NOT_CONFIGURED });
        return { success: false, error: NOT_CONFIGURED };
      }

      const nameProblem = usernameError(rawUsername);
      if (nameProblem) {
        dispatch({ type: "error", payload: nameProblem });
        return { success: false, error: nameProblem };
      }

      if (!isValidPin(pin)) {
        const message = `Enter your ${PIN_LENGTH}-digit PIN.`;
        dispatch({ type: "error", payload: message });
        return { success: false, error: message };
      }

      const username = normalizeUsername(rawUsername);
      dispatch({ type: "loading" });

      try {
        const firebaseUser = await ensureAnonymousUser();

        const profile = await fetchProfile(username);
        if (!profile) {
          const message = `No account named "${rawUsername.trim()}". Sign up to create one.`;
          dispatch({ type: "error", payload: message });
          return { success: false, error: message };
        }

        // The rules reject this write unless the PIN matches the stored one.
        try {
          await openSession(firebaseUser.uid, username, pin);
        } catch (err) {
          if (isPermissionDenied(err)) {
            const message = "That PIN doesn't match this account.";
            dispatch({ type: "error", payload: message });
            return { success: false, error: message };
          }
          throw err;
        }

        await touchLogin(username);
        dispatch({
          type: "login",
          payload: {
            uid: firebaseUser.uid,
            username,
            displayName: profile.displayName,
          },
        });
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
    async (rawUsername: string, pin: string): Promise<AuthResult> => {
      if (!isFirebaseConfigured) {
        dispatch({ type: "error", payload: NOT_CONFIGURED });
        return { success: false, error: NOT_CONFIGURED };
      }

      const nameProblem = usernameError(rawUsername);
      if (nameProblem) {
        dispatch({ type: "error", payload: nameProblem });
        return { success: false, error: nameProblem };
      }

      if (!isValidPin(pin)) {
        const message = `Choose a ${PIN_LENGTH}-digit PIN (numbers only).`;
        dispatch({ type: "error", payload: message });
        return { success: false, error: message };
      }

      const displayName = rawUsername.trim();
      const username = normalizeUsername(displayName);
      dispatch({ type: "loading" });

      try {
        const firebaseUser = await ensureAnonymousUser();

        if (await fetchProfile(username)) {
          const message = `"${displayName}" is taken. Try another username, or log in.`;
          dispatch({ type: "error", payload: message });
          return { success: false, error: message };
        }

        await createUser(username, displayName, pin);
        await openSession(firebaseUser.uid, username, pin);

        dispatch({
          type: "login",
          payload: { uid: firebaseUser.uid, username, displayName },
        });
        return { success: true, error: null };
      } catch (err) {
        console.error("Signup failed:", err);
        // The PIN write is only allowed while the username is unclaimed, so a
        // denial here means somebody took the name in between the two calls.
        const message = isPermissionDenied(err)
          ? `"${displayName}" was just taken. Try another username.`
          : readableError(err);
        dispatch({ type: "error", payload: message });
        return { success: false, error: message };
      }
    },
    [ensureAnonymousUser]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      if (auth.currentUser) await closeSession(auth.currentUser.uid);
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
