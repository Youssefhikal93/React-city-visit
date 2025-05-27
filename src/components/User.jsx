// import { useAuth } from "../context/FakeAuthContext";
// import { useNavigate } from "react-router-dom";
// // const FAKE_USER = {
// //   name: "Jack",
// //   email: "jack@example.com",
// //   password: "qwerty",
// //   avatar: "https://i.pravatar.cc/100?u=zz",
// // };

// function User() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   function handleClick() {
//     logout();
//     navigate("/");
//   }

//   return (
//     <div className="absolute top-16 right-16 bg-dark-1 p-4 rounded-lg z-[999] shadow-lg text-lg font-semibold flex items-center gap-6 md:top-4 md:right-4 md:p-2 md:text-base md:gap-2">
//       {/* <img src={user.avatar} alt={user.name} /> */}
//       <span>Welcome, {user.email} 👋</span>
//       <button
//         onClick={handleClick}
//         className="bg-dark-2 rounded-lg border-none px-3 py-2 text-inherit font-manrope text-xs font-bold uppercase cursor-pointer hover:bg-dark-0"
//       >
//         Logout
//       </button>
//     </div>
//   );
// }

// export default User;

/*
CHALLENGE

1) Add `AuthProvider` to `App.jsx`
2) In the `Login.jsx` page, call `login()` from context
3) Inside an effect, check whether `isAuthenticated === true`. If so, programatically navigate to `/app`
4) In `User.js`, read and display logged in user from context (`user` object). Then include this component in `AppLayout.js`
5) Handle logout button by calling `logout()` and navigating back to `/`
*/

// Mock hooks for demonstration
// const useAuth = () => ({
//   user: {
//     email: "john.doe@example.com",
//     name: "John Doe",
//     avatar: "https://i.pravatar.cc/100?u=johndoe",
//   },
//   logout: () => console.log("User logged out"),
// });
// const useNavigate = () => (path) => console.log("Navigate to:", path);

import { useAuth } from "../context/FakeAuthContext";
import { useNavigate } from "react-router-dom";
import { useCities } from "../context/CitiesContext";

function User() {
  const { user, logout } = useAuth();
  const { cities } = useCities();
  const navigate = useNavigate();

  const countries = cities.reduce((arr, city) => {
    if (!arr.map((el) => el.country).includes(city.country))
      return [...arr, { country: city.country, emoji: city.emoji }];
    else return arr;
  }, []);

  function handleClick() {
    // navigate("/");
    logout();
  }

  return (
    <div className="absolute top-6 right-1 z-[999] group md:top-4 md:right-4">
      {/* Main user card */}
      <div className="bg-dark-1/95 backdrop-blur-sm border border-dark-2/50 p-2 gap-2 md:p-4 md:gap-4 rounded-2xl shadow-2xl flex items-center gap-4 transition-all duration-300 hover:shadow-brand-1/10 hover:border-brand-1/30">
        {/* Avatar */}
        <div className="relative">
          <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-brand-1 to-brand-2 rounded-full flex items-center justify-center shadow-lg md:w-10 md:h-10">
            <span className="text-dark-0 font-bold text-lg md:text-base">
              {user.email.charAt(0).toUpperCase()}
            </span>
          </div>
          {/* Online indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-brand-2 border-2 border-dark-1 rounded-full md:w-3 md:h-3"></div>
        </div>

        {/* User info */}
        <div className="flex-1 min-w-0 hidden md:block ">
          <div className="text-light-1 font-semibold text-xs md:text-sm truncate">
            Welcome back! 👋
          </div>
          <div className="text-light-0 text-xs md:text-sm truncate opacity-80">
            {user.email}
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleClick}
          className="bg-dark-2/80 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-red-600/20 text-light-1 hover:text-red-400 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 border border-transparent hover:border-red-500/30 md:px-2 md:py-1.5 md:text-[10px]"
          title="Sign out"
        >
          <div className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4 md:w-3 md:h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0A 3 3 0 0113 7v1"
              />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </div>
        </button>
      </div>

      {/* Dropdown menu (hidden by default, shows on hover) */}
      <div className="absolute top-full left-1/2 w-full -translate-x-1/2 mt-2 w-48 bg-dark-1/95 backdrop-blur-sm border border-dark-2/50 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
        <div className="p-3">
          {/* User details */}
          <div className="pb-3 border-b border-dark-2/50">
            <div className="text-light-1 font-semibold text-xs md:text-sm">
              {user.name || "Travel Explorer"}
            </div>
            <div className="text-light-0 text-xs md:text-sm opacity-80">
              {user.email}
            </div>
          </div>

          {/* Quick stats */}
          <div className="py-3 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-light-0">Cities visited</span>
              <span className="bg-brand-1/20 text-brand-1 px-2 py-1 rounded-lg font-semibold">
                {cities.length}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-light-0">Countries</span>
              <span className="bg-brand-2/20 text-brand-2 px-2 py-1 rounded-lg font-semibold">
                {countries.length}
              </span>
            </div>
          </div>

          {/* Menu items */}
          {/* <div className="pt-3 border-t border-dark-2/50 space-y-1">
            <button className="w-full text-left px-3 py-2 text-light-1 hover:bg-dark-2/50 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Profile
            </button>
            <button className="w-full text-left px-3 py-2 text-light-1 hover:bg-dark-2/50 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Settings
            </button>
          </div> */}
        </div>
      </div>

      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-1/10 to-brand-2/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 scale-110"></div>
    </div>
  );
}

export default User;
