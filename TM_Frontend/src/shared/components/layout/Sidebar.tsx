import { Logo } from "../brand/Logo";
import {
  BiltiesIcon,
  CreateIcon,
  CustomersIcon,
  DashIcon,
  SettingsIcon,
  VehiclesIcon,
} from "../icons/SidebarIcons";
import { SidebarCard } from "./SidebarLink";

export function Sidebar() {
  const sidebarItems = [
    { title: "Dashboard", path: "/dashboard", key: 1, icon: <DashIcon size={"20"} /> },
    { title: "All Bilties", path: "/bilties", key: 2, icon: <BiltiesIcon size={"size-5"} /> },
    {
      title: "Create Biltie",
      path: "/bilties/create",
      key: 3,
      icon: <CreateIcon size={"size-5"} />,
    },
    { title: "Customers", path: "/customers", key: 4, icon: <CustomersIcon size={"size-5"} /> },
    { title: "Vehicles", path: "/vehicles", key: 5, icon: <VehiclesIcon size={"size-5"} /> },
    { title: "Settings", path: "/settings", key: 6, icon: <SettingsIcon size={"size-5"} /> },
  ];

  return (
    <div className="min-h-screen bg-white fixed relative top-0 left-0 w-60 rounded-md shadow-md ">
      <div className="flex flex-col gap-3">
        <div className="px-3 py-2 shadow-md">
          <Logo size={180} />
        </div>
        <div className="mt-3">
          {sidebarItems.map((item) => (
            <SidebarCard icon={item.icon} key={item.key} text={item.title} path={item.path} />
          ))}
        </div>
      </div>
    </div>
  );
}
