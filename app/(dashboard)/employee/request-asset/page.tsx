"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { MdSearch, MdAdd } from "react-icons/md";
import { Asset } from "@/types";

export default function RequestAssetPage() {
  const { authHeaders } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [note, setNote] = useState("");
  const [requesting, setRequesting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "30" });
      if (search) params.append("search", search);
      if (typeFilter) params.append("type", typeFilter);
      const res = await axios.get(`/api/assets?${params}`, { headers: authHeaders });
      setAssets(res.data.assets || []);
    } catch { toast.error("Failed to load assets"); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (authHeaders.Authorization) load(); }, [authHeaders, search, typeFilter]);

  const handleRequest = async () => {
    if (!selectedAsset?._id) return;
    setRequesting(true);
    try {
      await axios.post("/api/requests", { assetId: selectedAsset._id, note }, { headers: authHeaders });
      toast.success("Request submitted!");
      setSelectedAsset(null);
      setNote("");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Request failed");
    } finally { setRequesting(false); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Request Asset</h1>
        <p className="text-gray-500 text-sm mt-1">Browse available assets and submit a request</p>
      </div>

      <div className="flex gap-3 mb-6">
        <label className="input input-bordered flex items-center gap-2 flex-1 max-w-sm rounded-xl">
          <MdSearch className="w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search assets..." value={search}
            onChange={(e) => { setSearch(e.target.value); }} className="grow text-sm" />
        </label>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="select select-bordered rounded-xl text-sm">
          <option value="">All Types</option>
          <option value="returnable">Returnable</option>
          <option value="non-returnable">Non-Returnable</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-xl mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No assets available</p>
          <p className="text-sm mt-1">You need to be affiliated with a company first</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <div key={asset._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="h-44 bg-gray-100 relative">
                {asset.productImage ? (
                  <Image src={asset.productImage} alt={asset.productName} fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📦</div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <p className="font-semibold text-gray-800 text-sm mb-1">{asset.productName}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className={`badge badge-xs capitalize text-white ${asset.productType === "returnable" ? "badge-info" : "badge-warning"}`}>
                    {asset.productType}
                  </span>
                  <span className="text-xs text-gray-400">{asset.availableQuantity} left</span>
                </div>
                <button
                  onClick={() => setSelectedAsset(asset)}
                  disabled={asset.availableQuantity === 0}
                  className="btn btn-primary btn-sm text-white rounded-xl mt-auto gap-1 w-full"
                >
                  <MdAdd className="w-4 h-4" />
                  {asset.availableQuantity === 0 ? "Out of Stock" : "Request"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Modal */}
      {selectedAsset && (
        <dialog open className="modal modal-open">
          <div className="modal-box rounded-2xl max-w-md">
            <h3 className="font-bold text-lg mb-1">Request Asset</h3>
            <p className="text-gray-500 text-sm mb-4">Submit a request for <strong>{selectedAsset.productName}</strong></p>
            <div className="form-control mb-4">
              <label className="label text-sm font-medium text-gray-700">Note (optional)</label>
              <textarea
                className="textarea textarea-bordered rounded-xl resize-none"
                rows={3}
                placeholder="Why do you need this asset?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="modal-action">
              <button onClick={() => { setSelectedAsset(null); setNote(""); }} className="btn btn-ghost rounded-xl">Cancel</button>
              <button onClick={handleRequest} disabled={requesting} className="btn btn-primary text-white rounded-xl">
                {requesting ? <span className="loading loading-spinner loading-sm" /> : "Submit Request"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setSelectedAsset(null)} />
        </dialog>
      )}
    </div>
  );
}
