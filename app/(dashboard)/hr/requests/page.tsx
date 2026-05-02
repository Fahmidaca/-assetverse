"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { MdCheck, MdClose, MdSearch } from "react-icons/md";
import { AssetRequest } from "@/types";

export default function RequestsPage() {
  const { authHeaders } = useAuth();
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      const res = await axios.get(`/api/requests?${params}`, { headers: authHeaders });
      setRequests(res.data.requests || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch { toast.error("Failed to load requests"); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (authHeaders.Authorization) load(); }, [authHeaders, page, search, statusFilter]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id + action);
    try {
      await axios.patch(`/api/requests/${id}`, { action }, { headers: authHeaders });
      toast.success(`Request ${action}d`);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Action failed");
    } finally { setActionLoading(null); }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: "badge-warning", approved: "badge-success",
      rejected: "badge-error", returned: "badge-info",
    };
    return `badge badge-sm text-white capitalize ${map[s] || "badge-ghost"}`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Requests</h1>
        <p className="text-gray-500 text-sm mt-1">{total} total requests</p>
      </div>

      <div className="flex gap-3 mb-6">
        <label className="input input-bordered flex items-center gap-2 flex-1 max-w-sm rounded-xl">
          <MdSearch className="w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by asset name..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="grow text-sm" />
        </label>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="select select-bordered rounded-xl text-sm">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Employee</th>
                <th>Asset</th>
                <th>Type</th>
                <th>Request Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                  <td key={j}><div className="h-4 bg-gray-100 rounded animate-pulse w-20" /></td>
                ))}</tr>
              )) : requests.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No requests found</td></tr>
              ) : requests.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{r.requesterName}</p>
                      <p className="text-xs text-gray-400">{r.requesterEmail}</p>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {r.assetImage && (
                        <Image src={r.assetImage} alt={r.assetName || ""} width={32} height={32}
                          className="rounded-lg object-cover" unoptimized />
                      )}
                      <span className="text-sm text-gray-700">{r.assetName}</span>
                    </div>
                  </td>
                  <td><span className={`badge badge-sm capitalize ${r.assetType === "returnable" ? "badge-info" : "badge-warning"} text-white`}>{r.assetType}</span></td>
                  <td className="text-xs text-gray-400">
                    {r.requestDate ? new Date(r.requestDate).toLocaleDateString() : "—"}
                  </td>
                  <td><span className={statusBadge(r.status)}>{r.status}</span></td>
                  <td>
                    {r.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleAction(r._id!, "approve")}
                          disabled={!!actionLoading}
                          className="btn btn-success btn-xs text-white rounded-lg gap-1">
                          {actionLoading === r._id + "approve" ? <span className="loading loading-spinner loading-xs" /> : <MdCheck className="w-3 h-3" />}
                          Approve
                        </button>
                        <button onClick={() => handleAction(r._id!, "reject")}
                          disabled={!!actionLoading}
                          className="btn btn-error btn-xs text-white rounded-lg gap-1">
                          {actionLoading === r._id + "reject" ? <span className="loading loading-spinner loading-xs" /> : <MdClose className="w-3 h-3" />}
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-100">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`btn btn-sm rounded-lg ${p === page ? "btn-primary text-white" : "btn-ghost"}`}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
