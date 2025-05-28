import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import bcrypt from "bcryptjs";
const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "login":
      return { ...state, user: action.payload, isAuthenticated: true };
    case "logout":
      return { ...initialState };
    default:
      throw new Error("Unknown action");
  }
}
const URL = "https://cities-json-server-api.onrender.com";
// const URL = "http://localhost:8000";

function AuthProvider({ children }) {
  const [{ user, isAuthenticated }, dispatch] = useReducer(
    reducer,
    initialState
  );
  const [error, setError] = useState(null); // State to store error messages
  const [loading, setLoading] = useState(false);

  async function login(email, password) {
    setLoading(true);
    try {
      const res = await fetch(`${URL}/users`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const users = await res.json();

      // const hashedPassword = await bcrypt.hash(password, 10);
      // const isMatch = await bcrypt.compare(password, hashedPassword);

      // Find the user with matching credentials
      // const foundUser = users.find(
      //   // (u) => u.email === email && u.password === password
      //   (u) => u.email === email && isMatch
      // );
      const foundUser = users.find((u) => u.email === email);

      if (!foundUser) setError("Invalid username or password");
      // Compare the provided password with the hashed password
      const isMatch = await bcrypt.compare(password, foundUser.password);

      if (!isMatch) setError("Invalid username or password");

      if (isMatch) {
        dispatch({ type: "login", payload: foundUser });
        setError(null);
      }
    } catch (err) {
      setError("An error occurred during login");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    dispatch({ type: "logout" });
  }

  async function signup(email, password) {
    try {
      setLoading(true);
      // Check if user already exists
      const res = await fetch(`${URL}/users`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const users = await res.json();

      const userExists = users.some((u) => u.email === email);
      if (userExists) {
        return { success: false, error: "User already exists" };
      }

      const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
      // Create new user
      const newUser = {
        // id: Date.now().toString(),
        email,
        password: hashedPassword,
        // name,
      };

      // In a real app, you would send this to your API endpoint for creating users
      // For JSON server, we can simulate this by fetching the current users,
      // adding the new one, and then sending a PUT request

      //   const updatedUsers = [...users, newUser];
      //   const putResponse = await fetch(`${URL}/users`, {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(newUser),
      //   });

      //   if (!putResponse.ok) throw new Error("Failed to create user");

      //   // Automatically log in the new user
      //   dispatch({ type: "login", payload: newUser });
      //   return { success: true, error: null };
      // } catch (err) {
      //   console.error("Signup error:", err);
      //   return { success: false, error: err.message };
      // }
      // Send POST request to create the user
      const postResponse = await fetch(`${URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!postResponse.ok) throw new Error("Failed to create user");

      // THE FIX: Use the response from server which includes the auto-generated ID
      const createdUserWithId = await postResponse.json();

      // Login with the user object that has the proper ID from JSON Server
      dispatch({ type: "login", payload: createdUserWithId });
      return { success: true, error: null };
    } catch (err) {
      console.error("Signup error:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, error, signup, loading }}
    >
      {children}
      {/* {error && <p style={{ color: "red" }}>{error}</p>} */}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("AuthContext was used outside AuthProvider");
  return context;
}

export { AuthProvider, useAuth };
