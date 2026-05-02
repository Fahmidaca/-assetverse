"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  MdDashboard, MdInventory2, MdRequestPage,
  MdGroups, MdPerson, MdLogout,
} from "react-icons/md";

const links = [
  { href: "/employee", label: "Dashboard", icon: MdDashboard },
  { href: "/employee/my-assets", label: "My Assets", icon: MdInventory2 },
  { href: "/employee/request-asset", label: "Request Asset", icon: MdRequestPage },
  { href: "/employee/my-team", label: "My Team", icon: MdGroups },
  { href: "/employee/profile", label: "Profile", icon: MdPerson },
];

export default function EmployeeSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex w-64 min-h-screen bg-white border-r border-gray-100 flex-col shadow-sm flex-shrink-0">
      <div className="px-6 py-5 border-b border-gray-100">
        <Link href="/employee" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-black text-sm">AV</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">AssetVerse</span>
        </Link>
      </div>

      <div className="px-4 py-4 border-b border-gray-100">
        <div className="p-3 bg-indigo-50 rounded-xl">
          <p className="text-xs text-indigo-600 font-medium">Employee</p>
          <p className="text-sm font-semibold text-gray-800 truncate">
            {user?.affiliatedCompany || "No company yet"}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/employee" ? pathname === "/employee" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${isActive ? "active" : "text-gray-600"}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase() || "E"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="sidebar-link text-red-500 w-full hover:bg-red-50 hover:text-red-600"
        >
          <MdLogout className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
