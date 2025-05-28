// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Button from "../components/Button";
// import PageNav from "../components/PageNav";
// import { useAuth } from "../context/FakeAuthContext";
// import { Link } from "react-router-dom";
// import Signup from "./SignUp";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import Spinner from "../components/Spinner";
// import ShowPassword from "../components/ShowPassword";

// export default function Login() {
//   // PRE-FILL FOR DEV PURPOSES
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const { login, isAuthenticated, error, loading } = useAuth();
//   const navigate = useNavigate();

//   // function handleSubmit(e) {
//   //   e.preventDefault();

//   //   if (email && password) login(email, password);
//   // }
//   function handleLogin(e) {
//     e.preventDefault();
//     login(email, password);
//   }

//   useEffect(
//     function () {
//       if (isAuthenticated) navigate("/app", { replace: true });
//     },
//     [isAuthenticated, navigate]
//   );

//   return (
//     <main className="min-h-[calc(100vh-5rem)] m-10 p-10 bg-dark-1 flex flex-col">
//       <PageNav />
//       <form
//         className="bg-dark-2 rounded-lg p-8 w-full max-w-xl flex flex-col gap-8 my-8 mx-auto"
//         onSubmit={handleLogin}
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
//               className="w-full p-2 rounded bg-light-2 text-dark-0 text-base border-none focus:outline-none focus:bg-white"
//             />
//             <button
//               type="button"
//               className="absolute right-4 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-light-0 p-1 text-xl z-10 hover:text-brand-2"
//               onClick={() => setShowPassword(!showPassword)}
//             >
//               {showPassword ? <FaEyeSlash /> : <FaEye />}
//             </button>
//           </div>
//         </div>
//         <div>
//           {loading ? (
//             <div>
//               <Spinner />
//               <p className="text-2xl font-bold text-brand-2 text-center mt-8 animate-pulse">
//                 Logging in... might take up to 50 seconds.
//               </p>
//             </div>
//           ) : (
//             <>
//               <Button type="primary">Login</Button>
//               {error && (
//                 <p className="text-red-500 text-center text-base mt-2">
//                   {" "}
//                   {error}
//                 </p>
//               )}
//             </>
//           )}
//         </div>
//         <div className="text-center text-base mt-4">
//           <p>
//             Don't have an account,{" "}
//             <Link
//               to="/signup"
//               element={<Signup />}
//               className="text-brand-2 font-semibold hover:underline hover:text-brand-1 transition-colors"
//             >
//               Sign up now
//             </Link>
//           </p>
//         </div>
//       </form>
//     </main>
//   );
// }
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import PageNav from "../components/PageNav";
import { useAuth } from "../context/FakeAuthContext";
import { Link } from "react-router-dom";
import Signup from "./SignUp";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Spinner from "../components/Spinner";
import ShowPassword from "../components/ShowPassword";

export default function Login() {
  // PRE-FILL FOR DEV PURPOSES
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated, error, loading } = useAuth();
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    login(email, password);
  }

  useEffect(
    function () {
      if (isAuthenticated) navigate("/app", { replace: true });
    },
    [isAuthenticated, navigate]
  );

  return (
    <main className="min-h-screen bg-cover bg-center bg-no-repeat bg-[url('/bg.jpg')] font-manrope">
      <div className="bg-dark-0/80 min-h-screen flex flex-col">
        <PageNav />

        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <form
            className="bg-dark-2/90 backdrop-blur-sm rounded-xl p-6 md:p-8 w-full max-w-md md:max-w-lg shadow-2xl"
            onSubmit={handleLogin}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-light-1 text-center mb-6 md:mb-8">
              Welcome Back
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
                placeholder="Enter your username"
                className="w-full p-3 md:p-4 rounded-lg bg-light-2 text-dark-0 text-base placeholder-dark-2 border-2 border-transparent focus:outline-none focus:border-brand-2 focus:bg-white transition-all duration-300"
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
                  placeholder="Enter your password"
                  className="w-full p-3 md:p-4 pr-12 rounded-lg bg-light-2 text-dark-0 text-base placeholder-dark-2 border-2 border-transparent focus:outline-none focus:border-brand-2 focus:bg-white transition-all duration-300"
                />
                <button
                  type="button"
                  className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-dark-2 hover:text-brand-2 transition-colors duration-300 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-5 h-5" />
                  ) : (
                    <FaEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Section */}
            <div className="mb-6">
              {loading ? (
                <div className="text-center">
                  <Spinner />
                  <p className="text-xl md:text-2xl font-bold text-brand-2 mt-4 animate-pulse">
                    Logging in...
                  </p>
                  <p className="text-sm text-light-0 mt-2">
                    This might take up to 50 seconds
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button type="primary" className="w-full">
                    Login
                  </Button>
                  {error && (
                    <p className="text-red-400 text-center text-sm md:text-base bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                      {error}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-light-2 text-sm md:text-base">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-brand-2 font-semibold hover:text-brand-1 hover:underline transition-all duration-300"
                >
                  Sign up now
                </Link>
              </p>
            </div>

            {/* Demo Credentials Helper */}
            <div className="mt-6 p-4 bg-dark-1/50 rounded-lg border border-dark-1">
              <p className="text-xs md:text-sm text-light-0 text-center mb-2">
                <strong className="text-brand-1">Demo Credentials:</strong>
              </p>
              <div className="text-center grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-light-2">
                <div>
                  <span className="font-semibold">Username:</span> jack
                </div>
                <div>
                  <span className="font-semibold">Password:</span> qwerty
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
