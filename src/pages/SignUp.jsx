// import PageNav from "../components/PageNav";
// import styles from "./Login.module.css"; // Reusing the same styles
// import { useState } from "react";
// import { useAuth } from "../context/FakeAuthContext";
// import { useNavigate } from "react-router-dom";

// export default function Signup() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [name, setName] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const { signup } = useAuth();
//   const navigate = useNavigate();

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");
//     setIsLoading(true);

//     try {
//       const { success, error } = await signup(email, password, name);
//       if (success) {
//         navigate("/app", { replace: true });
//       } else {
//         setError(error);
//       }
//     } catch (err) {
//       setError("An unexpected error occurred");
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   return (
//     <main className={styles.login}>
//       <PageNav />
//       <form className={styles.form} onSubmit={handleSubmit}>
//         {/* <div className={styles.row}>
//           <label htmlFor="name">Full Name</label>
//           <input
//             type="text"
//             id="name"
//             onChange={(e) => setName(e.target.value)}
//             value={name}
//             disabled={isLoading}
//             required
//           />
//         </div> */}

//         <div className={styles.row}>
//           <label htmlFor="email">User Name</label>
//           <input
//             type="text"
//             id="email"
//             onChange={(e) => setEmail(e.target.value)}
//             value={email}
//             disabled={isLoading}
//             required
//           />
//         </div>

//         <div className={styles.row}>
//           <label htmlFor="password">Password</label>
//           <input
//             type="password"
//             id="password"
//             onChange={(e) => setPassword(e.target.value)}
//             value={password}
//             disabled={isLoading}
//             minLength="6"
//             required
//           />
//         </div>

//         {error && <p className={styles.error}>{error}</p>}

//         <div>
//           <button className={styles.btn} type="submit" disabled={isLoading}>
//             {isLoading ? "Creating account..." : "Sign up"}
//           </button>
//         </div>
//       </form>
//     </main>
//   );
// }

/////===========claude===============
// import PageNav from "../components/PageNav";
// import styles from "./Login.module.css"; // Reusing the same styles
// import { useState } from "react";
// import { useAuth } from "../context/FakeAuthContext";
// import { useNavigate } from "react-router-dom";
// import { Link } from "react-router-dom";
// import Button from "../components/Button";
// import { FaEye, FaEyeSlash } from "react-icons/fa";

// export default function Signup() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [name, setName] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const { signup } = useAuth();
//   const navigate = useNavigate();

//   async function handleSubmit(e) {
//     e.preventDefault();

//     if (!username || !password || !name) {
//       setError("All fields are required");
//       return;
//     }

//     setError("");
//     setIsLoading(true);

//     try {
//       const { success, error } = await signup(username, password, name);
//       if (success) {
//         navigate("/app", { replace: true });
//       } else {
//         setError(error);
//       }
//     } catch (err) {
//       setError("An unexpected error occurred");
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   return (
//     <main className={styles.login}>
//       <PageNav />
//       <form className={styles.form} onSubmit={handleSubmit}>
//         <div className={styles.row}>
//           <label htmlFor="username">Username</label>
//           <input
//             type="text"
//             id="username"
//             onChange={(e) => setUsername(e.target.value)}
//             value={username}
//             disabled={isLoading}
//             placeholder="Dont use any real world usernames"
//             required
//           />
//         </div>

//         <div className={styles.row}>
//           <label htmlFor="password">Password</label>
//           <input
//             type={showPassword ? "text" : "password"}
//             id="password"
//             onChange={(e) => setPassword(e.target.value)}
//             value={password}
//             disabled={isLoading}
//             minLength="6"
//             placeholder="Use dummy password (min 6 characters)"
//             required
//           />
//           <button
//             type="button"
//             className={styles.toggleButton}
//             onClick={() => setShowPassword(!showPassword)}
//             aria-label={showPassword ? "Hide password" : "Show password"}
//           >
//             {showPassword ? <FaEyeSlash /> : <FaEye />}
//           </button>
//         </div>

//         {error && <p className={styles.error}>{error}</p>}

//         <div>
//           <Button type="primary" disabled={isLoading}>
//             {isLoading ? "Creating account..." : "Sign up"}
//           </Button>
//         </div>

//         <div className={styles.footer}>
//           <span>Already have an account? </span>
//           <Link to="/login" className={styles.link}>
//             Log in
//           </Link>
//         </div>
//       </form>
//     </main>
//   );
// }

////////////////////////////  DEEP SEEK

import PageNav from "../components/PageNav";
import styles from "./Login.module.css";
import { useEffect, useState } from "react";
import { useAuth } from "../context/FakeAuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import ShowPassword from "../components/ShowPassword";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/app");
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const { success, error } = await signup(email, password);
      if (!success) {
        setError(error || "Signup failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.login}>
      <PageNav />
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.row}>
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            disabled={isLoading}
            required
          />
        </div>

        {/* <div className={styles.row}>
          <label htmlFor="password">Password</label>
          <div className={styles.passwordInput}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              disabled={isLoading}
              minLength="6"
              required
            />
            <ShowPassword
              setShowPassword={setShowPassword}
              showPassword={showPassword}
            />
          </div>
        </div> */}
        <div className={styles.row}>
          <label htmlFor="password">Password</label>
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div>
          <Button type="primary" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign up"}
          </Button>
        </div>

        <div className={styles.footer}>
          <span>Already have an account? </span>
          <Link to="/login" className={styles.link}>
            Log in
          </Link>
        </div>
      </form>
    </main>
  );
}
