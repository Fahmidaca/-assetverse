"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  MdDashboard, MdInventory, MdAssignment, MdPeople,
  MdBarChart, MdPerson, MdInventory2, MdRequestPage, MdGroups,
} from "react-icons/md";

const HR_LINKS = [
  { href: "/hr", label: "Home", icon: MdDashboard },
  { href: "/hr/assets", label: "Assets", icon: MdInventory },
  { href: "/hr/requests", label: "Requests", icon: MdAssignment },
  { href: "/hr/employees", label: "Team", icon: MdPeople },
  { href: "/hr/analytics", label: "Analytics", icon: MdBarChart },
  { href: "/hr/profile", label: "Profile", icon: MdPerson },
];

const EMPLOYEE_LINKS = [
  { href: "/employee", label: "Home", icon: MdDashboard },
  { href: "/employee/my-assets", label: "My Assets", icon: MdInventory2 },
  { href: "/employee/request-asset", label: "Request", icon: MdRequestPage },
  { href: "/employee/my-team", label: "Team", icon: MdGroups },
  { href: "/employee/profile", label: "Profile", icon: MdPerson },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const links = user?.role === "hr" ? HR_LINKS : EMPLOYEE_LINKS;
  const root = user?.role === "hr" ? "/hr" : "/employee";

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-40">
      <div className="flex items-center justify-around px-1 py-2">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = href === root ? pathname === root : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                isActive ? "text-indigo-600" : "text-gray-400"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
