import type { ReactNode } from "react";

import Logo from "./Logo";

interface SideBarProps {
  children: ReactNode;
  navigation?: ReactNode;
  footer?: ReactNode;
}

function SideBar({ children, navigation, footer }: SideBarProps) {
  return (
    <aside className="journal-sidebar flex h-full min-w-0 w-full flex-col overflow-hidden bg-dark-1 p-4 text-light-1">
      <div className="sidebar-header w-full flex shrink-0 flex-col items-center gap-4 mb-5">
        <Logo />
        {navigation}
      </div>
      {/* Lists scroll inside themselves; a City detail or the form scrolls here. */}
      <div className="flex-1 min-h-0 w-full overflow-y-auto">{children}</div>
      {footer && <div className="shrink-0 pt-3">{footer}</div>}
    </aside>
  );
}

export default SideBar;
