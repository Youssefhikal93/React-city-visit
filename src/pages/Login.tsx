import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import PageNav from "../components/PageNav";
import PinInput from "../components/PinInput";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { PIN_LENGTH } from "../services/profiles";

export default function Login() {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);

  const { login, isAuthenticated, error, loading, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/app", { replace: true });
  }, [isAuthenticated, navigate]);

  function handlePinChange(next: string) {
    if (error) clearError();
    setPin(next);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    login(pin);
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
              Welcome Back
            </h2>
            <p className="text-sm md:text-base text-light-0 text-center mb-8">
              Enter your {PIN_LENGTH}-digit PIN to open your travel log.
            </p>

            <div className="mb-4">
              <PinInput
                value={pin}
                onChange={handlePinChange}
                onComplete={(completed) => login(completed)}
                disabled={loading}
                mask={!showPin}
                label="Login PIN"
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

            <div className="mb-6">
              {loading ? (
                <div className="text-center">
                  <Spinner />
                  <p className="text-xl md:text-2xl font-bold text-brand-2 mt-4 animate-pulse">
                    Signing in...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={pin.length !== PIN_LENGTH}
                    className="w-full uppercase px-4 py-3 font-bold text-base rounded-lg bg-brand-2 text-dark-1
                               transition-all duration-300 hover:bg-brand-1 hover:scale-[1.02]
                               focus:outline-none focus:ring-2 focus:ring-brand-2
                               disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Login
                  </button>
                  {error && (
                    <p
                      role="alert"
                      className="text-red-400 text-center text-sm md:text-base bg-red-900/20 p-3 rounded-lg border border-red-500/30"
                    >
                      {error}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-light-2 text-sm md:text-base">
                No PIN yet?{" "}
                <Link
                  to="/signup"
                  className="text-brand-2 font-semibold hover:text-brand-1 hover:underline transition-all duration-300"
                >
                  Create one now
                </Link>
              </p>
            </div>

            <div className="mt-6 p-4 bg-dark-1/50 rounded-lg border border-dark-1">
              <p className="text-xs md:text-sm text-light-0 text-center">
                <strong className="text-brand-1">Your PIN is your account.</strong>{" "}
                No email, no password — the same PIN opens the same travel log on
                any device.
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
