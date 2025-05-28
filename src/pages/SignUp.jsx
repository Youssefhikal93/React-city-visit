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

// import PageNav from "../components/PageNav";
// import { useEffect, useState } from "react";
// import { useAuth } from "../context/FakeAuthContext";
// import { useNavigate } from "react-router-dom";
// import { Link } from "react-router-dom";
// import Button from "../components/Button";
// import ShowPassword from "../components/ShowPassword";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import Spinner from "../components/Spinner";

// export default function Signup() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const { signup, isAuthenticated, loading } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (isAuthenticated) navigate("/app");
//   }, [isAuthenticated, navigate]);

//   async function handleSubmit(e) {
//     e.preventDefault();

//     if (!email || !password) {
//       setError("All fields are required");
//       return;
//     }

//     if (password.length < 6) {
//       setError("Password must be at least 6 characters");
//       return;
//     }

//     setError("");
//     setIsLoading(true);

//     try {
//       const { success, error } = await signup(email, password);
//       if (!success) {
//         setError(error || "Signup failed");
//       }
//     } catch (err) {
//       setError("An unexpected error occurred");
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   return (
//     <main className="min-h-[calc(100vh-5rem)] m-10 p-10 bg-dark-1 flex flex-col">
//       <PageNav />
//       <form
//         className="bg-dark-2 rounded-lg p-8 w-full max-w-xl flex flex-col gap-8 my-8 mx-auto"
//         onSubmit={handleSubmit}
//       >
//         <div className="flex flex-col gap-2 relative">
//           <label htmlFor="email" className="text-lg font-semibold">
//             User Name
//           </label>
//           <input
//             type="text"
//             id="email"
//             onChange={(e) => setEmail(e.target.value)}
//             value={email}
//             placeholder="Use dummy username"
//             disabled={isLoading}
//             required
//             className="w-full p-2 rounded bg-light-2 text-dark-0 text-base border-none focus:outline-none focus:bg-white"
//           />
//         </div>
//         <div className="flex flex-col gap-2 relative">
//           <label htmlFor="password" className="text-lg font-semibold">
//             Password
//           </label>
//           <div className="relative">
//             <input
//               type={showPassword ? "text" : "password"}
//               id="password"
//               onChange={(e) => setPassword(e.target.value)}
//               value={password}
//               placeholder="Use dummy password of 6 characters"
//               disabled={isLoading}
//               minLength={6}
//               required
//               className="w-full p-2 rounded bg-light-2 text-dark-0 text-base border-none focus:outline-none focus:bg-white"
//             />
//             <button
//               type="button"
//               className="absolute right-4 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-light-0 p-1 text-xl z-10 hover:text-brand-2"
//               onClick={() => setShowPassword(!showPassword)}
//               aria-label={showPassword ? "Hide password" : "Show password"}
//             >
//               {showPassword ? <FaEyeSlash /> : <FaEye />}
//             </button>
//           </div>
//         </div>
//         {error && (
//           <p className="text-red-500 text-center text-base mt-2">{error}</p>
//         )}
//         <div>
//           <Button type="primary" disabled={isLoading}>
//             {isLoading ? "Creating account..." : "Sign up"}
//           </Button>
//         </div>
//         <div className="text-center text-base mt-4">
//           <span>Already have an account? </span>
//           <Link
//             to="/login"
//             className="text-brand-2 font-semibold hover:underline hover:text-brand-1 transition-colors"
//           >
//             Log in
//           </Link>
//         </div>
//       </form>
//     </main>
//   );
// }
import PageNav from "../components/PageNav";
import { useEffect, useState } from "react";
import { useAuth } from "../context/FakeAuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import ShowPassword from "../components/ShowPassword";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Spinner from "../components/Spinner";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signup, isAuthenticated, loading } = useAuth();
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
    <main className="min-h-screen bg-cover bg-center bg-no-repeat bg-[url('/bg.jpg')] font-manrope">
      <div className="bg-dark-0/80 min-h-screen flex flex-col">
        <PageNav />

        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <form
            className="bg-dark-2/90 backdrop-blur-sm rounded-xl p-6 md:p-8 w-full max-w-md md:max-w-lg shadow-2xl"
            onSubmit={handleSubmit}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-light-1 text-center mb-6 md:mb-8">
              Create Account
            </h2>

            {/* Email Field */}
            <div className="flex flex-col gap-2 mb-6">
              <label
                htmlFor="email"
                className="text-base md:text-lg font-semibold text-light-2"
              >
                Username
              </label>
              <input
                type="text"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                placeholder="use dummy username..."
                disabled={isLoading}
                required
                className="w-full p-3 md:p-4 rounded-lg bg-light-2 text-dark-0 text-base placeholder-dark-2 border-2 border-transparent focus:outline-none focus:border-brand-2 focus:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2 mb-6">
              <label
                htmlFor="password"
                className="text-base md:text-lg font-semibold text-light-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  placeholder="use dummy username..."
                  disabled={isLoading}
                  minLength={6}
                  required
                  className="w-full p-3 md:p-4 pr-12 rounded-lg bg-light-2 text-dark-0 text-base placeholder-dark-2 border-2 border-transparent focus:outline-none focus:border-brand-2 focus:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-dark-2 hover:text-brand-2 transition-colors duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-5 h-5" />
                  ) : (
                    <FaEye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              <div className="text-xs text-light-0 mt-1">
                <span
                  className={
                    password.length >= 6 ? "text-brand-2" : "text-light-0"
                  }
                >
                  ✓ At least 6 characters
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6">
                <p className="text-red-400 text-center text-sm md:text-base bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="mb-6">
              {isLoading || loading ? (
                <div className="text-center">
                  <Spinner />
                  <p className="text-xl md:text-2xl font-bold text-brand-2 mt-4 animate-pulse">
                    Creating account...
                  </p>
                  <p className="text-sm text-light-0 mt-2">
                    This might take a moment
                  </p>
                </div>
              ) : (
                <Button type="primary" disabled={isLoading} className="w-full">
                  Sign up
                </Button>
              )}
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-light-2 text-sm md:text-base">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-brand-2 font-semibold hover:text-brand-1 hover:underline transition-all duration-300"
                >
                  Log in
                </Link>
              </p>
            </div>

            {/* Sign Up Benefits */}
            <div className="mt-6 p-4 bg-dark-1/50 rounded-lg border border-dark-1">
              <p className="text-xs md:text-sm text-brand-1 font-semibold text-center mb-2">
                Join Worldvisit today!
              </p>
              <ul className="text-xs text-light-2 space-y-1">
                <li>✓ Track your travel adventures</li>
                <li>✓ Interactive world map</li>
                <li>✓ Share with friends</li>
                <li>✓ Free to use</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
