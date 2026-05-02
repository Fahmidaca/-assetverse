"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { MdInventory, MdAssignment, MdGroups, MdCheckCircle } from "react-icons/md";

export default function EmployeeDashboard() {
  const { user, authHeaders } = useAuth();
  const [stats, setStats] = useState({ myAssets: 0, pending: 0, team: 0, returned: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [myAssetsRes, pendingRes, teamRes, returnedRes] = await Promise.all([
          axios.get("/api/requests?status=approved&limit=1", { headers: authHeaders }),
          axios.get("/api/requests?status=pending&limit=1", { headers: authHeaders }),
          axios.get("/api/team", { headers: authHeaders }),
          axios.get("/api/requests?status=returned&limit=1", { headers: authHeaders }),
        ]);
        setStats({
          myAssets: myAssetsRes.data.total || 0,
          pending: pendingRes.data.total || 0,
          team: (teamRes.data.team || []).length,
          returned: returnedRes.data.total || 0,
        });
      } catch { /* silently */ }
    };
    if (authHeaders.Authorization) load();
  }, [authHeaders]);

  const cards = [
    { label: "My Assets", value: stats.myAssets, icon: MdInventory, href: "/employee/my-assets", color: "bg-blue-500" },
    { label: "Pending Requests", value: stats.pending, icon: MdAssignment, href: "/employee/my-assets", color: "bg-amber-500" },
    { label: "Teammates", value: stats.team, icon: MdGroups, href: "/employee/my-team", color: "bg-violet-500" },
    { label: "Returned", value: stats.returned, icon: MdCheckCircle, href: "/employee/my-assets", color: "bg-emerald-500" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Hello, <span className="gradient-text">{user?.name}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {user?.affiliatedCompany ? `${user.affiliatedCompany} · Employee` : "You haven't joined a company yet"}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href} className="stat-card hover:shadow-md transition-shadow cursor-pointer">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {!user?.affiliatedCompany && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h3 className="font-semibold text-amber-800 mb-2">No company affiliation yet</h3>
          <p className="text-amber-700 text-sm">
            Request an asset from a company to get automatically affiliated. Go to{" "}
            <Link href="/employee/request-asset" className="underline font-medium">Request Asset</Link> to browse available items.
          </p>
        </div>
      )}
    </div>
  );
}
