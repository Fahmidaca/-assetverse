"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { MdCake, MdPeople } from "react-icons/md";

export default function MyTeamPage() {
  const { authHeaders } = useAuth();
  const [team, setTeam] = useState<any[]>([]);
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("/api/team", { headers: authHeaders });
        setTeam(res.data.team || []);
        setBirthdays(res.data.upcomingBirthdays || []);
      } catch { /* silently */ }
      finally { setLoading(false); }
    };
    if (authHeaders.Authorization) load();
  }, [authHeaders]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Team</h1>
        <p className="text-gray-500 text-sm mt-1">{team.length} colleagues in your company</p>
      </div>

      {/* Upcoming Birthdays */}
      {birthdays.length > 0 && (
        <div className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl p-5 text-white mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MdCake className="w-5 h-5" />
            <h2 className="font-semibold">Upcoming Birthdays 🎂</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {birthdays.map((b) => (
              <div key={b._id} className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2">
                <span className="text-sm font-medium">{b.employeeName}</span>
                <span className="text-xs text-pink-100">
                  {new Date(b.dateOfBirth!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : team.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MdPeople className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="text-lg">No teammates yet</p>
          <p className="text-sm mt-1">Join a company to see your colleagues</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((member) => (
            <div key={member._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3">
                {member.profileImage || member.employeeImage ? (
                  <Image
                    src={member.profileImage || member.employeeImage}
                    alt={member.employeeName}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                    {member.employeeName?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800">{member.employeeName}</p>
                  <p className="text-xs text-gray-400">{member.employeeEmail}</p>
                  <p className="text-xs text-indigo-500 font-medium mt-0.5">{member.position || "Employee"}</p>
                </div>
              </div>
              {member.dateOfBirth && (
                <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                  <MdCake className="w-3 h-3" />
                  {new Date(member.dateOfBirth).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
