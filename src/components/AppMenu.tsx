import {
  FiMap,
  FiMapPin,
  FiGlobe,
  FiHome,
  FiInfo,
  FiTag,
  FiLogOut,
  FiLogIn,
} from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCities } from "../context/CitiesContext";
import HomeCountrySelector from "./HomeCountrySelector";
import PlannedCountrySelector from "./PlannedCountrySelector";

const itemClassName =
  "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold text-light-1 transition-colors hover:bg-dark-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-2";

/**
 * On a phone the bottom bar only moves between the three views, which leaves
 * an Account with no way out of the app and nowhere to sign out from.
 */
function AppMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cities } = useCities();
  const panelRef = useRef<HTMLDivElement>(null);

  const countryCount = new Set(cities.map((city) => city.country)).size;

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent): void {
      if (!panelRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  async function handleSignOut(): Promise<void> {
    setIsOpen(false);
    await logout();
    navigate("/");
  }

  return (
    <div className="app-menu fixed left-3 z-[1100]" ref={panelRef}>
      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="flex h-11 w-11 items-center justify-center rounded-lg border border-dark-2 bg-dark-1/95 text-light-1 shadow-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-2"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {isOpen && (
        <nav
          aria-label="Menu"
          className="mt-2 max-h-[calc(100dvh-env(safe-area-inset-top)-8rem)] overflow-y-auto w-60 rounded-xl border border-dark-2 bg-dark-1/98 p-2 shadow-2xl backdrop-blur-sm"
        >
          {user && (
            <div className="border-b border-dark-2 px-3 pb-3 pt-2">
              <p className="text-sm font-semibold text-light-1">
                {user.displayName}
              </p>
              <p className="text-xs text-light-0">
                {cities.length} {cities.length === 1 ? "City" : "Cities"} in{" "}
                {countryCount} {countryCount === 1 ? "Country" : "Countries"}
              </p>
            </div>
          )}

          {user && (
            <>
              <PlannedCountrySelector />
              <HomeCountrySelector />
            </>
          )}

          <ul className="list-none space-y-1 py-2">
            <li>
              <Link
                className={itemClassName}
                onClick={() => setIsOpen(false)}
                to="/app/map"
              >
                <FiMap aria-hidden="true" /> Map
              </Link>
            </li>
            <li>
              <Link
                className={itemClassName}
                onClick={() => setIsOpen(false)}
                to="/app/cities"
              >
                <FiMapPin aria-hidden="true" /> Cities
              </Link>
            </li>
            <li>
              <Link
                className={itemClassName}
                onClick={() => setIsOpen(false)}
                to="/app/countries"
              >
                <FiGlobe aria-hidden="true" /> Countries
              </Link>
            </li>
            <li>
              <Link
                className={itemClassName}
                onClick={() => setIsOpen(false)}
                to="/"
              >
                <FiHome aria-hidden="true" /> Home
              </Link>
            </li>
            <li>
              <Link
                className={itemClassName}
                onClick={() => setIsOpen(false)}
                to="/product"
              >
                <FiInfo aria-hidden="true" /> Products
              </Link>
            </li>
            <li>
              <Link
                className={itemClassName}
                onClick={() => setIsOpen(false)}
                to="/pricing"
              >
                <FiTag aria-hidden="true" /> Pricing
              </Link>
            </li>
          </ul>

          {user ? (
            <div className="border-t border-dark-2 pt-2">
              <button
                className={`${itemClassName} text-red-400 hover:bg-red-500/15`}
                onClick={handleSignOut}
                type="button"
              >
                <FiLogOut aria-hidden="true" /> Sign out
              </button>
            </div>
          ) : (
            <Link
              className={itemClassName}
              onClick={() => setIsOpen(false)}
              to="/login"
            >
              <FiLogIn aria-hidden="true" /> Sign in
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

export default AppMenu;
