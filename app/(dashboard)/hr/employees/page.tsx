"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { MdSearch, MdPersonRemove } from "react-icons/md";

export default function EmployeesPage() {
  const { authHeaders, user } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [packageLimit, setPackageLimit] = useState(5);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const res = await axios.get(`/api/employees?${params}`, { headers: authHeaders });
      setEmployees(res.data.employees || []);
      setPackageLimit(res.data.packageLimit || 5);
    } catch { toast.error("Failed to load employees"); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (authHeaders.Authorization) load(); }, [authHeaders, search]);

  const handleRemove = async (email: string, name: string) => {
    if (!confirm(`Remove ${name} from your company?`)) return;
    try {
      await axios.delete(`/api/employees/${encodeURIComponent(email)}`, { headers: authHeaders });
      toast.success(`${name} removed`);
      load();
    } catch { toast.error("Failed to remove employee"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee List</h1>
          <p className="text-gray-500 text-sm mt-1">
            {employees.length} / {packageLimit} employees
          </p>
        </div>
        <div className="badge badge-lg badge-primary text-white px-4 py-3 rounded-xl">
          {user?.subscription?.toUpperCase() || "BASIC"} Plan
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Employee capacity</span>
          <span className="font-semibold">{employees.length} / {packageLimit}</span>
        </div>
        <progress
          className="progress progress-primary w-full"
          value={employees.length}
          max={packageLimit}
        />
      </div>

      <label className="input input-bordered flex items-center gap-2 max-w-sm rounded-xl mb-6">
        <MdSearch className="w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search employees..." value={search}
          onChange={(e) => setSearch(e.target.value)} className="grow text-sm" />
      </label>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No employees yet</p>
          <p className="text-sm mt-1">Employees join when their asset requests are approved</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div key={emp._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {emp.employeeImage ? (
                    <Image src={emp.employeeImage} alt={emp.employeeName} width={44} height={44}
                      className="rounded-full object-cover" unoptimized />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                      {emp.employeeName?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{emp.employeeName}</p>
                    <p className="text-xs text-gray-400">{emp.employeeEmail}</p>
                  </div>
                </div>
                <button onClick={() => handleRemove(emp.employeeEmail, emp.employeeName)}
                  className="btn btn-ghost btn-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <MdPersonRemove className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  Joined {emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : "—"}
                </span>
                <span className="badge badge-sm badge-ghost">{emp.assetCount} assets</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
