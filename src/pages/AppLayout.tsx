import { Outlet, useLocation } from "react-router-dom";

import AppMenu from "../components/AppMenu";
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
        <div className="phone-shell bg-dark-0">
          {isMapView ? routedView : <SideBar>{routedView}</SideBar>}
        </div>
        <AppMenu />
        <BottomBar />
      </>
    );
  }

  return (
    <>
      <div className="h-dvh w-full bg-dark-0 ">
        <div className="grid grid-cols-[minmax(320px,420px)_1fr] h-full">
          <SideBar navigation={<AppNav />} footer={<User />}>{routedView}</SideBar>
          <Map />
        </div>
      </div>

    </>
  );
}
export default AppLayout;

