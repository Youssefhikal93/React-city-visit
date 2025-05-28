import { FaEye, FaEyeSlash } from "react-icons/fa";

function ShowPassword({ setShowPassword, showPassword }) {
  //   const [showPassword, setShowPassword] = useState(false);

  return (
    <button
      type="button"
      className="absolute right-4 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer p-2 flex items-center justify-center text-light-0 text-lg z-10 hover:text-brand-2 focus:outline-none"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <FaEyeSlash /> : <FaEye />}
    </button>
  );
}

export default ShowPassword;
