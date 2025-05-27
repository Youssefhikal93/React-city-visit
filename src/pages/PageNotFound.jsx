// import { Link } from "react-router-dom";

// export default function PageNotFound() {
//   return (
//     <div className="flex flex-col items-center justify-center h-screen bg-dark-1 text-light-2 text-center p-8">
//       <h1 className="text-3xl md:text-5xl mb-8 animate-bounce">
//         Page not found{" "}
//         <span className="inline-block text-4xl md:text-6xl animate-shake">
//           😢
//         </span>
//       </h1>
//       <Link
//         to="/"
//         className="mt-8 px-8 py-4 bg-brand-2 text-dark-1 rounded-lg font-semibold transition-colors hover:bg-brand-1 hover:-translate-y-1 duration-200"
//       >
//         Go back home
//       </Link>
//     </div>
//   );
// }
// import { Link } from "react-router-dom";

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-0 via-dark-1 to-dark-2 flex items-center justify-center p-4 font-manrope">
      <div className="text-center max-w-md mx-auto">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-gradient-to-r from-brand-1 to-brand-2 bg-clip-text animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 text-8xl md:text-9xl font-bold text-brand-1 opacity-20 blur-sm">
            404
          </div>
        </div>

        {/* Floating emoji with animation */}
        <div className="mb-8 relative">
          <div className="text-6xl animate-bounce inline-block">😢</div>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-brand-2 rounded-full animate-ping"></div>
        </div>

        {/* Main message */}
        <div className="mb-8 space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-light-1 leading-tight">
            Oops! Page not found
          </h2>
          <p className="text-light-0 text-lg leading-relaxed">
            The page you're looking for seems to have wandered off into the
            digital void.
          </p>
        </div>

        {/* Enhanced CTA button */}
        <a
          href="/"
          className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-brand-1 to-brand-2 text-dark-0 font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-brand-1/25 active:scale-95"
        >
          <svg
            className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Take me home</span>

          {/* Animated background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-1 to-brand-2 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10 scale-110"></div>
        </a>

        {/* Decorative elements */}
        <div className="mt-12 flex justify-center space-x-6 opacity-30">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-brand-2 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            ></div>
          ))}
        </div>
      </div>

      {/* Background decorative circles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-brand-1/10 to-brand-2/10 rounded-full blur-xl animate-pulse"></div>
        <div
          className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-gradient-to-r from-brand-2/10 to-brand-1/10 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 right-1/3 w-16 h-16 bg-brand-1/5 rounded-full blur-lg animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>
    </div>
  );
}
