"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import {
  MdDashboard, MdInventory, MdAddBox, MdAssignment,
  MdPeople, MdUpgrade, MdBarChart, MdPerson, MdLogout, MdStorage,
} from "react-icons/md";

const links = [
  { href: "/hr", label: "Dashboard", icon: MdDashboard },
  { href: "/hr/assets", label: "Asset List", icon: MdInventory },
  { href: "/hr/add-asset", label: "Add Asset", icon: MdAddBox },
  { href: "/hr/requests", label: "All Requests", icon: MdAssignment },
  { href: "/hr/employees", label: "Employee List", icon: MdPeople },
  { href: "/hr/analytics", label: "Analytics", icon: MdBarChart },
  { href: "/hr/package", label: "Upgrade Package", icon: MdUpgrade },
  { href: "/hr/profile", label: "Profile", icon: MdPerson },
  { href: "/admin/db", label: "Backend Data", icon: MdStorage },
];

export default function HRSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex w-64 min-h-screen bg-white border-r border-gray-100 flex-col shadow-sm flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <Link href="/hr" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-black text-sm">AV</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">AssetVerse</span>
        </Link>
      </div>

      {/* Company info */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
          {user?.companyLogo ? (
            <Image
              src={user.companyLogo}
              alt="Company"
              width={36}
              height={36}
              className="rounded-lg object-cover"
              unoptimized
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">
              {user?.companyName?.[0] || "C"}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs text-indigo-600 font-medium truncate">HR Manager</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.companyName || "Company"}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/hr" ? pathname === "/hr" : pathname.startsWith(href);
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

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase() || "H"}
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
