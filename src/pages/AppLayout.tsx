import { Outlet, useLocation } from "react-router-dom";

import BottomBar from "../components/BottomBar";
import AppNav from "../components/AppNav";
import Map from "../components/Map";
import SideBar from "../components/SideBar";
import User from "../components/User";
import { useIsPhone } from "../hooks/useIsPhone";

function AppLayout() {
  const isPhone = useIsPhone();
  const { pathname } = useLocation();
  const routedView = <Outlet />;

  if (isPhone) {
    const isMapView = pathname === "/app/map";

    return (
      <>
        <div className="h-screen w-screen bg-dark-0 pb-[calc(4rem+env(safe-area-inset-bottom))]">
          {isMapView ? routedView : <SideBar>{routedView}</SideBar>}
        </div>
        <BottomBar />
        <User />
      </>
    );
  }

  return (
    <>
      <div className="h-screen w-screen bg-dark-0 ">
        <div className="grid grid-rows-2 md:grid-cols-2 h-full gap-4  md:gap-2 sm:gap-1">
          <SideBar navigation={<AppNav />}>{routedView}</SideBar>
          <Map />
        </div>
      </div>
      <User />
    </>
  );
}
export default AppLayout;

