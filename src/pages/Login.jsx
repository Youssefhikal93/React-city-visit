import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import PageNav from "../components/PageNav";
import { useAuth } from "../context/FakeAuthContext";
import styles from "./Login.module.css";
import { Link } from "react-router-dom";
import Signup from "./SignUp";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ShowPassword from "../components/ShowPassword";
export default function Login() {
  // PRE-FILL FOR DEV PURPOSES
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated, error } = useAuth();
  const navigate = useNavigate();

  // function handleSubmit(e) {
  //   e.preventDefault();

  //   if (email && password) login(email, password);
  // }
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
    <main className={styles.login}>
      <PageNav />

      <form className={styles.form} onSubmit={handleLogin}>
        <div className={styles.row}>
          <label htmlFor="email">Email address</label>
          <input
            type="text"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>

        {/* <div className={styles.row}>
          <label htmlFor="password">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <ShowPassword
            setShowPassword={setShowPassword}
            showPassword={showPassword}
          />
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

        <div>
          <Button type="primary">Login</Button>
          {error && <p className={styles.error}> {error}</p>}
        </div>
        <div className={styles.footer}>
          <p>
            Don't have an account ,{" "}
            <Link to="/signup" element={<Signup />} className={styles.link}>
              Sign up now
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}
