import { Link, useLocation } from "react-router-dom";

const tabClassName =
  "flex h-12 flex-1 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors";

function BottomBar() {
  const { pathname } = useLocation();
  const isMapView = pathname === "/app/map";
  const isCitiesView =
    pathname === "/app/form" || pathname.startsWith("/app/cities");
  const isCountriesView = pathname === "/app/countries";

  return (
    <nav
      aria-label="Views"
      className="fixed inset-x-0 bottom-0 z-[1000] flex h-[calc(4rem+env(safe-area-inset-bottom))] items-center gap-1 border-t border-dark-2 bg-dark-1 px-2 pb-[env(safe-area-inset-bottom)] shadow-2xl"
    >
      <Link
        to="map"
        aria-current={isMapView ? "page" : undefined}
        className={`${tabClassName} ${
          isMapView ? "bg-brand-2 text-white" : "text-light-1 hover:bg-dark-2"
        }`}
      >
        Map
      </Link>
      <Link
        to="cities"
        aria-current={isCitiesView ? "page" : undefined}
        className={`${tabClassName} ${
          isCitiesView
            ? "bg-brand-2 text-white"
            : "text-light-1 hover:bg-dark-2"
        }`}
      >
        Cities
      </Link>
      <Link
        to="countries"
        aria-current={isCountriesView ? "page" : undefined}
        className={`${tabClassName} ${
          isCountriesView
            ? "bg-brand-2 text-white"
            : "text-light-1 hover:bg-dark-2"
        }`}
      >
        Countries
      </Link>
    </nav>
  );
}

export default BottomBar;


