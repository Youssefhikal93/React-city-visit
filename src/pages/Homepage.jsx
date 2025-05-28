// // import styles from "./Homepage.module.css";
// // import { Link } from "react-router-dom";
// // import PageNav from "../components/PageNav";
// // export default function Homepage() {
// //   return (
// //     <main className={styles.homepage}>
// //       <PageNav></PageNav>
// //       <section>
// //         <h1 className="">
// //           You travel the world.
// //           <br />
// //           World visit keeps track of your adventures.
// //         </h1>
// //         <h2>
// //           A world map that tracks your footsteps into every city you can think
// //           of. Never forget your wonderful experiences, and show your friends how
// //           you have wandered the world.
// //         </h2>
// //         <Link to="/login" className="cta">
// //           Start Tracking Now
// //         </Link>
// //       </section>
// //     </main>
// //   );
// // }

// // import { Link } from "react-router-dom";
// // import PageNav from "../components/PageNav";

// // export default function Homepage() {
// //   return (
// //     <main className="min-h-[calc(100vh-5rem)] mx-10 my-10 bg-gradient-to-b from-dark-0/80 to-dark-0/80 bg-cover bg-center bg-[url('/bg.jpg')] p-10 md:p-20">
// //       <PageNav />
// //       <section className="flex flex-col items-center justify-center h-[85%] gap-10 text-center bg-brand-1">
// //         <h1 className="text-5xl md:text-7xl font-bold leading-tight text-brand-1">
// //           You travel the world.
// //           <br />
// //           Worldvisit keeps track of your adventures.
// //         </h1>
// //         <h2 className="w-[90%] text-xl md:text-3xl text-light-1 mb-10">
// //           A world map that tracks your footsteps into every city you can think
// //           of. Never forget your wonderful experiences, and show your friends how
// //           you have wandered the world.
// //         </h2>
// //         <Link
// //           to="/login"
// //           className="bg-brand-2 text-dark-0 px-8 py-4 rounded-md font-bold text-lg hover:bg-brand-1 transition-colors"
// //         >
// //           Start Tracking Now
// //         </Link>
// //       </section>
// //     </main>
// //   );
// // }

// import { Link } from "react-router-dom";
// import PageNav from "../components/PageNav";
// export default function Homepage() {
//   return (
//     <main className="h-screen w-screen bg-cover bg-center bg-[url('/bg.jpg')]">
//       <div className="bg-dark-0/70 h-screen w-screen flex flex-col">
//         <PageNav />
//         <section className="flex-1 flex flex-col items-center justify-center gap-8 text-center p-8 md:p-12">
//           <div className="max-w-4xl space-y-6">
//             <h1 className="text-4xl md:text-6xl font-bold text-light-1 leading-tight">
//               You travel the world.
//               <br />
//               <span className="text-brand-2">Worldvisit</span> keeps track.
//             </h1>
//             <h2 className="text-lg md:text-xl text-light-2 leading-relaxed">
//               Track your adventures with our interactive world map. Never forget
//               your experiences and share your journey with friends.
//             </h2>
//           </div>
//           <Link
//             to="/login"
//             className="bg-brand-2 hover:bg-brand-1 text-dark-0 px-6 py-3 rounded-md font-bold text-lg transition-all duration-300 transform hover:scale-105"
//           >
//             Start Tracking Now
//           </Link>
//         </section>
//       </div>
//     </main>
//   );
// }
import { Link, NavLink } from "react-router-dom";
import PageNav from "../components/PageNav";

export default function Homepage() {
  return (
    <main className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-[url('/bg.jpg')] font-manrope">
      <div className="bg-dark-0/80 min-h-screen w-full flex flex-col">
        <PageNav />

        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center gap-6 md:gap-8 lg:gap-10 text-center px-4 py-8 md:px-8 lg:px-12">
          <div className="max-w-5xl space-y-4 md:space-y-6 lg:space-y-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-light-1 leading-tight">
              You travel the world.
              <br />
              <span className="text-brand-2 drop-shadow-lg">
                Worldvisit
              </span>{" "}
              keeps track of your adventures.
            </h1>

            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl text-light-2 leading-relaxed max-w-4xl mx-auto">
              A world map that tracks your footsteps into every city you can
              think of. Never forget your wonderful experiences, and show your
              friends how you have wandered the world.
            </h2>
          </div>

          <Link
            to="/login"
            className="bg-brand-2 hover:bg-brand-1 text-dark-0 px-6 py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 rounded-lg font-bold text-base md:text-lg lg:text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mt-4 md:mt-6"
          >
            Start Tracking Now
          </Link>
        </section>

        {/* Optional: Mobile Navigation Menu */}
        <div className="sm:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-dark-1/90 backdrop-blur-sm rounded-full px-6 py-3">
          <ul className="flex items-center gap-6 list-none">
            <li>
              <NavLink
                to={"/"}
                className={({ isActive }) =>
                  `text-light-2 hover:text-brand-1 transition-colors duration-300 ${
                    isActive ? "text-brand-2" : ""
                  }`
                }
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </NavLink>
            </li>
            <li>
              <NavLink
                to={"/product"}
                className={({ isActive }) =>
                  `text-light-2 hover:text-brand-1 transition-colors duration-300 ${
                    isActive ? "text-brand-2" : ""
                  }`
                }
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </NavLink>
            </li>
            <li>
              <NavLink
                to={"/pricing"}
                className={({ isActive }) =>
                  `text-light-2 hover:text-brand-1 transition-colors duration-300 ${
                    isActive ? "text-brand-2" : ""
                  }`
                }
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clipRule="evenodd"
                  />
                </svg>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
