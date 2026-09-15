import type { ReactNode } from "react";

import Logo from "./Logo";

interface SideBarProps {
  children: ReactNode;
  navigation?: ReactNode;
}

function SideBar({ children, navigation }: SideBarProps) {
  return (
    <aside className="flex flex-col h-full w-screen min-w-[16rem] bg-gradient-to-b from-dark-1 via-dark-1/98 to-dark-1/95 backdrop-blur-sm border-r border-dark-2/30 p-2 sm:p-2 overflow-y-auto shadow-2xl relative rounded-lg md:h-screen sm:max-w-full sm:min-w-0 w-screen sm:border-r-0 sm:border-b sm:rounded-b-lg">
      <div className="w-full flex flex-col items-center gap-2 mb-2">
        <Logo />
        {navigation}
      </div>
      <div className="flex-1 min-h-0 w-full">{children}</div>
    </aside>
  );
}

export default SideBar;
