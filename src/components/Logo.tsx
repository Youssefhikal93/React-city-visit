import { Link } from "react-router-dom";
function Logo() {
  return (
    <Link to="/" className="brand-logo" aria-label="WorldVisit home">
      <img src="/icon.svg" alt="" width="36" height="36" />
      <span>
        World<span>Visit</span>
      </span>
    </Link>
  );
}
export default Logo;
