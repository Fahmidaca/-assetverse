"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { MdEdit, MdDelete, MdSearch, MdAdd } from "react-icons/md";
import Link from "next/link";
import { Asset } from "@/types";

export default function AssetsPage() {
  const { authHeaders } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [editForm, setEditForm] = useState({ productName: "", productQuantity: 0 });

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search) params.append("search", search);
      if (typeFilter) params.append("type", typeFilter);
      const res = await axios.get(`/api/assets?${params}`, { headers: authHeaders });
      setAssets(res.data.assets || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch { toast.error("Failed to load assets"); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (authHeaders.Authorization) load(); }, [authHeaders, page, search, typeFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this asset?")) return;
    try {
      await axios.delete(`/api/assets/${id}`, { headers: authHeaders });
      toast.success("Asset deleted");
      load();
    } catch { toast.error("Failed to delete"); }
  };

  const handleEdit = async () => {
    if (!editAsset?._id) return;
    try {
      await axios.patch(`/api/assets/${editAsset._id}`, editForm, { headers: authHeaders });
      toast.success("Asset updated");
      setEditAsset(null);
      load();
    } catch { toast.error("Update failed"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset List</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total assets</p>
        </div>
        <Link href="/hr/add-asset" className="btn btn-primary text-white rounded-xl gap-2">
          <MdAdd className="w-5 h-5" /> Add Asset
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <label className="input input-bordered flex items-center gap-2 flex-1 max-w-sm rounded-xl">
          <MdSearch className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="grow text-sm"
          />
        </label>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="select select-bordered rounded-xl text-sm"
        >
          <option value="">All Types</option>
          <option value="returnable">Returnable</option>
          <option value="non-returnable">Non-Returnable</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Asset</th>
                <th>Type</th>
                <th>Qty (Total)</th>
                <th>Qty (Available)</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j}><div className="h-4 bg-gray-100 rounded animate-pulse w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : assets.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No assets found</td></tr>
              ) : (
                assets.map((a) => (
                  <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {a.productImage ? (
                            <Image src={a.productImage} alt={a.productName} width={40} height={40} className="object-cover w-full h-full" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">IMG</div>
                          )}
                        </div>
                        <span className="font-medium text-gray-800 text-sm">{a.productName}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-sm capitalize ${a.productType === "returnable" ? "badge-info" : "badge-warning"} text-white`}>
                        {a.productType}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600">{a.productQuantity}</td>
                    <td className="text-sm font-medium" style={{ color: (a.availableQuantity || 0) > 0 ? "#059669" : "#dc2626" }}>
                      {a.availableQuantity}
                    </td>
                    <td className="text-xs text-gray-400">
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditAsset(a); setEditForm({ productName: a.productName, productQuantity: a.productQuantity }); }}
                          className="btn btn-ghost btn-xs text-indigo-600 hover:bg-indigo-50"
                        >
                          <MdEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(a._id!)}
                          className="btn btn-ghost btn-xs text-red-500 hover:bg-red-50"
                        >
                          <MdDelete className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-100">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`btn btn-sm rounded-lg ${p === page ? "btn-primary text-white" : "btn-ghost"}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editAsset && (
        <dialog open className="modal modal-open">
          <div className="modal-box rounded-2xl">
            <h3 className="font-bold text-lg mb-4">Edit Asset</h3>
            <div className="space-y-4">
              <div>
                <label className="label text-sm font-medium text-gray-700">Product Name</label>
                <input
                  className="input input-bordered w-full rounded-xl"
                  value={editForm.productName}
                  onChange={(e) => setEditForm({ ...editForm, productName: e.target.value })}
                />
              </div>
              <div>
                <label className="label text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  className="input input-bordered w-full rounded-xl"
                  value={editForm.productQuantity}
                  onChange={(e) => setEditForm({ ...editForm, productQuantity: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="modal-action">
              <button onClick={() => setEditAsset(null)} className="btn btn-ghost rounded-xl">Cancel</button>
              <button onClick={handleEdit} className="btn btn-primary text-white rounded-xl">Save Changes</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setEditAsset(null)} />
        </dialog>
      )}
    </div>
  );
}
