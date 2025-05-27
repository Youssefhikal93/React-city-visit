// import { Link } from "react-router-dom";

// function Logo() {
//   return (
//     <Link to="/">
//       <img
//         src="/logo2.png"
//         alt="WorldWise logo"
//         className="h-20 md:h-14 object-contain"
//       />
//     </Link>
//   );
// }

// export default Logo;
// function Logo() {
//   return (
//     <Link to="/">
//       <img
//         src="/logo2.png"
//         alt="WorldWise logo"
//         className="h-20 md:h-14 object-contain"
//       />
//     </Link>
//   );
// }
// export default Logo;
import { Link } from "react-router-dom";

function Logo() {
  return (
    <Link to="/" className="transition-transform duration-300 hover:scale-105">
      <img
        src="/logo2.png"
        alt="WorldWise logo"
        className="h-10 md:h-12 object-contain drop-shadow-lg"
      />
    </Link>
  );
}

export default Logo;
