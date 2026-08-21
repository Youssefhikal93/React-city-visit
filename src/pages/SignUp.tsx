import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import PageNav from "../components/PageNav";
import PinInput from "../components/PinInput";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import {
  PIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  isValidUsername,
} from "../services/users";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);

  const { signup, isAuthenticated, error, loading, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/app", { replace: true });
  }, [isAuthenticated, navigate]);

  const canSubmit = isValidUsername(username) && pin.length === PIN_LENGTH;

  function resetError() {
    if (error) clearError();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await signup(username, pin);
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
            <h2 className="text-2xl md:text-3xl font-bold text-light-1 text-center mb-2">
              Create Account
            </h2>
            <p className="text-sm md:text-base text-light-0 text-center mb-8">
              Pick a username and a {PIN_LENGTH}-digit PIN. That's the whole
              sign-up.
            </p>

            {/* Username */}
            <div className="flex flex-col gap-2 mb-2">
              <label
                htmlFor="username"
                className="text-base md:text-lg font-semibold text-light-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => {
                  resetError();
                  setUsername(e.target.value);
                }}
                disabled={loading}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={USERNAME_MAX_LENGTH}
                placeholder="Pick a username"
                className="w-full p-3 md:p-4 rounded-lg bg-light-2 text-dark-0 text-base placeholder-dark-2 border-2 border-transparent focus:outline-none focus:border-brand-2 focus:bg-white transition-all duration-300 disabled:opacity-50"
              />
              <p className="text-xs text-light-0">
                <span
                  className={
                    isValidUsername(username) ? "text-brand-2" : "text-light-0"
                  }
                >
                  ✓ {USERNAME_MIN_LENGTH}–{USERNAME_MAX_LENGTH} characters:
                  letters, numbers, hyphens, underscores
                </span>
              </p>
            </div>

            {/* PIN */}
            <div className="flex flex-col gap-3 mb-4 mt-6">
              <label className="text-base md:text-lg font-semibold text-light-2">
                Choose a PIN
              </label>
              <PinInput
                value={pin}
                onChange={(next) => {
                  resetError();
                  setPin(next);
                }}
                disabled={loading}
                autoFocus={false}
                mask={!showPin}
                label="New PIN"
              />
            </div>

            <div className="flex justify-center mb-6">
              <button
                type="button"
                onClick={() => setShowPin((shown) => !shown)}
                className="text-xs md:text-sm text-light-0 hover:text-brand-2 transition-colors duration-300 focus:outline-none focus:text-brand-2"
              >
                {showPin ? "Hide PIN" : "Show PIN"}
              </button>
            </div>

            {error && (
              <div className="mb-6">
                <p
                  role="alert"
                  className="text-red-400 text-center text-sm md:text-base bg-red-900/20 p-3 rounded-lg border border-red-500/30"
                >
                  {error}
                </p>
              </div>
            )}

            <div className="mb-6">
              {loading ? (
                <div className="text-center">
                  <Spinner />
                  <p className="text-xl md:text-2xl font-bold text-brand-2 mt-4 animate-pulse">
                    Creating your account...
                  </p>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full uppercase px-4 py-3 font-bold text-base rounded-lg bg-brand-2 text-dark-1
                             transition-all duration-300 hover:bg-brand-1 hover:scale-[1.02]
                             focus:outline-none focus:ring-2 focus:ring-brand-2
                             disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Sign up
                </button>
              )}
            </div>

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

            <div className="mt-6 p-4 bg-dark-1/50 rounded-lg border border-dark-1">
              <p className="text-xs md:text-sm text-brand-1 font-semibold text-center mb-2">
                Join Worldvisit today!
              </p>
              <ul className="text-xs text-light-2 space-y-1">
                <li>✓ Track your travel adventures</li>
                <li>✓ Interactive world map</li>
                <li>✓ Saved to Firebase in real time</li>
                <li>✓ Log back in from any device</li>
              </ul>
              <p className="text-xs text-light-0/80 mt-3 text-center">
                Remember your PIN — there's no way to reset it.
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
