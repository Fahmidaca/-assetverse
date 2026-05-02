"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { MdInventory, MdPeople, MdAssignment, MdCheckCircle } from "react-icons/md";
import Link from "next/link";

interface Stats {
  totalAssets: number;
  totalEmployees: number;
  pendingRequests: number;
  approvedRequests: number;
}

export default function HRDashboard() {
  const { user, authHeaders } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [assetsRes, empRes, reqRes] = await Promise.all([
          axios.get("/api/assets?limit=1", { headers: authHeaders }),
          axios.get("/api/employees", { headers: authHeaders }),
          axios.get("/api/requests?limit=5", { headers: authHeaders }),
        ]);
        const approved = await axios.get("/api/requests?status=approved&limit=1", { headers: authHeaders });

        setStats({
          totalAssets: assetsRes.data.total || 0,
          totalEmployees: empRes.data.total || 0,
          pendingRequests: reqRes.data.total || 0,
          approvedRequests: approved.data.total || 0,
        });
        setRecentRequests(reqRes.data.requests || []);
      } catch { /* silently handle */ }
    };
    if (authHeaders.Authorization) load();
  }, [authHeaders]);

  const cards = [
    { label: "Total Assets", value: stats?.totalAssets ?? "—", icon: MdInventory, color: "bg-blue-500", href: "/hr/assets" },
    { label: "Employees", value: stats?.totalEmployees ?? "—", icon: MdPeople, color: "bg-violet-500", href: "/hr/employees" },
    { label: "Pending Requests", value: stats?.pendingRequests ?? "—", icon: MdAssignment, color: "bg-amber-500", href: "/hr/requests" },
    { label: "Approved", value: stats?.approvedRequests ?? "—", icon: MdCheckCircle, color: "bg-emerald-500", href: "/hr/requests?status=approved" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, <span className="gradient-text">{user?.name}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1">{user?.companyName} · HR Dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="stat-card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer block">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Package bar */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">Current Plan</p>
            <p className="text-2xl font-bold capitalize">{user?.subscription || "Basic"}</p>
            <p className="text-indigo-200 text-sm mt-1">
              {user?.currentEmployees || 0} / {user?.packageLimit || 5} employees used
            </p>
          </div>
          <Link href="/hr/package" className="btn bg-white text-indigo-600 hover:bg-indigo-50 border-0 rounded-xl">
            Upgrade
          </Link>
        </div>
        <div className="mt-4 bg-indigo-500/40 rounded-full h-2">
          <div
            className="bg-white rounded-full h-2 transition-all"
            style={{ width: `${Math.min(((user?.currentEmployees || 0) / (user?.packageLimit || 5)) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
          <Link href="/hr/requests" className="text-sm text-indigo-600 hover:underline">View all</Link>
        </div>
        {recentRequests.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No requests yet</p>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((r: any) => (
              <div key={r._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-800">{r.assetName}</p>
                  <p className="text-xs text-gray-400">{r.requesterName} · {r.requesterEmail}</p>
                </div>
                <span className={`badge badge-sm text-white capitalize ${
                  r.status === "approved" ? "badge-success" :
                  r.status === "rejected" ? "badge-error" :
                  r.status === "returned" ? "badge-info" : "badge-warning"
                }`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
