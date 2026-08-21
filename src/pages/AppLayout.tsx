import SideBar from "../components/SideBar";
import Map from "../components/Map";
import User from "../components/User";

// function AppLayout() {
//   return (
//     <div className="h-screen p-6 md:p-3 flex flex-row md:flex-col relative overscroll-none">
//       <SideBar />
//       <Map />
//       <User />
//     </div>
//   );
// }

// export default AppLayout;
function AppLayout() {
  return (
    <>
      <div className="h-screen w-screen bg-dark-0 ">
        <div className="grid grid-rows-2 md:grid-cols-2 h-full gap-4  md:gap-2 sm:gap-1">
          {/* Sidebar */}
          <SideBar />

          {/* Map */}
          <Map />
        </div>
      </div>
      <User />
    </>
  );
}
export default AppLayout;
