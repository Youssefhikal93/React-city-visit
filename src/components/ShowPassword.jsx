import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./ShowPassword.module.css";
import { useState } from "react";

function ShowPassword({ setShowPassword, showPassword }) {
  //   const [showPassword, setShowPassword] = useState(false);

  return (
    <button
      type="button"
      className={styles.showPasswordBtn}
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <FaEyeSlash /> : <FaEye />}
    </button>
  );
}

export default ShowPassword;
