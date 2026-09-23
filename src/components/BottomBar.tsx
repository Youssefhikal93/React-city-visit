import { FiGlobe, FiHome, FiMap, FiMapPin } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";

const tabClassName =
  "flex h-14 min-w-0 flex-1 flex-col items-center justify-center rounded-xl px-1 text-[11px] font-semibold leading-tight transition-colors";

function BottomBar() {
  const { pathname } = useLocation();
  const tabs = [
    { to: "home", label: "Home", icon: FiHome, isActive: pathname === "/app/home" },
    { to: "map", label: "Map", icon: FiMap, isActive: pathname === "/app/map" },
    {
      to: "cities",
      label: "Cities",
      icon: FiMapPin,
      isActive: pathname === "/app/form" || pathname.startsWith("/app/cities"),
    },
    {
      to: "countries",
      label: "Countries",
      icon: FiGlobe,
      isActive: pathname === "/app/countries",
    },
  ];

  return (
    <nav
      aria-label="Views"
      className="fixed inset-x-0 bottom-0 z-[1000] flex h-[calc(4rem+env(safe-area-inset-bottom))] items-center gap-1 border-t border-dark-2 bg-dark-1 px-2 pb-[env(safe-area-inset-bottom)] shadow-2xl"
    >
      {tabs.map(({ to, label, icon: Icon, isActive }) => (
        <Link
          key={to}
          to={to}
          aria-current={isActive ? "page" : undefined}
          className={`${tabClassName} ${
            isActive ? "bg-brand-2/10 text-brand-2" : "text-light-1 hover:bg-dark-2"
          }`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export default BottomBar;
