import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import PageNav from "../components/PageNav";
import PinInput from "../components/PinInput";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { PIN_LENGTH } from "../services/profiles";

export default function Signup() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [localError, setLocalError] = useState("");

  const { signup, isAuthenticated, error, loading, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/app", { replace: true });
  }, [isAuthenticated, navigate]);

  const isComplete =
    pin.length === PIN_LENGTH && confirmPin.length === PIN_LENGTH;

  function resetErrors() {
    if (localError) setLocalError("");
    if (error) clearError();
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (pin.length !== PIN_LENGTH) {
      setLocalError(`Choose a ${PIN_LENGTH}-digit PIN.`);
      return;
    }

    if (pin !== confirmPin) {
      setLocalError("The two PINs don't match.");
      return;
    }

    setLocalError("");
    await signup(pin);
  }

  const shownError = localError || error;

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
              Pick a {PIN_LENGTH}-digit PIN. That's the whole sign-up.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-light-2 text-center mb-3">
                Choose your PIN
              </label>
              <PinInput
                value={pin}
                onChange={(next) => {
                  resetErrors();
                  setPin(next);
                }}
                disabled={loading}
                mask={!showPin}
                label="New PIN"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-light-2 text-center mb-3">
                Confirm your PIN
              </label>
              <PinInput
                value={confirmPin}
                onChange={(next) => {
                  resetErrors();
                  setConfirmPin(next);
                }}
                disabled={loading}
                autoFocus={false}
                mask={!showPin}
                label="Confirm PIN"
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

            {shownError && (
              <div className="mb-6">
                <p
                  role="alert"
                  className="text-red-400 text-center text-sm md:text-base bg-red-900/20 p-3 rounded-lg border border-red-500/30"
                >
                  {shownError}
                </p>
              </div>
            )}

            <div className="mb-6">
              {loading ? (
                <div className="text-center">
                  <Spinner />
                  <p className="text-xl md:text-2xl font-bold text-brand-2 mt-4 animate-pulse">
                    Creating your log...
                  </p>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!isComplete}
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
                Already have a PIN?{" "}
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
                <li>✓ Free to use</li>
              </ul>
              <p className="text-xs text-light-0/80 mt-3 text-center">
                Write your PIN down — it's the only way back into this log.
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
