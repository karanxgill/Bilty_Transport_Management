import type { ReactElement } from "react";
import { NavLink } from "react-router-dom";

interface card {
  icon: ReactElement;
  text: string;
  path: string;
}

export function SidebarCard({ icon, text, path }: card) {
  return (
    <NavLink
      to={path}
      end
      className={({ isActive }) =>
        `flex items-center mx-4 gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-purple-100 text-purple-700" : "text-gray-700 hover:bg-gray-100"}`
      }
    >
      {icon}
      {text}
    </NavLink>
  );
}
