"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { MdStorage, MdRefresh } from "react-icons/md";

const COLLECTIONS = ["users", "assets", "requests", "affiliations", "payments"];

export default function BackendDataDashboard() {
  const { authHeaders } = useAuth();
  const [collection, setCollection] = useState("users");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!authHeaders.Authorization) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/db?collection=${collection}`, { headers: authHeaders });
      setData(res.data);
    } catch (err: any) {
      setData({ error: err.response?.data?.error || "Failed" });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [collection, authHeaders]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MdStorage className="w-6 h-6 text-indigo-500" />
            <h1 className="text-2xl font-bold text-gray-900">Backend Data Viewer</h1>
          </div>
          <p className="text-gray-500 text-sm">Inspect MongoDB collections in real-time</p>
        </div>
        <button onClick={load} className="btn btn-ghost rounded-xl gap-2">
          <MdRefresh className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Collection counts */}
      {data?.counts && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {COLLECTIONS.map((c) => (
            <button
              key={c}
              onClick={() => setCollection(c)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                collection === c
                  ? "border-indigo-500 bg-indigo-50 shadow-md"
                  : "border-gray-100 bg-white hover:border-indigo-200"
              }`}
            >
              <p className="text-2xl font-black text-gray-900">{data.counts[c] ?? 0}</p>
              <p className="text-xs text-gray-500 capitalize mt-1">{c}</p>
            </button>
          ))}
        </div>
      )}

      {/* Data viewer */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 capitalize">
            {collection} ({data?.total || 0})
          </h2>
          {loading && <span className="loading loading-spinner loading-sm text-primary" />}
        </div>

        {data?.error ? (
          <div className="p-6 text-red-500 text-sm">{data.error}</div>
        ) : data?.docs?.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p>No documents in this collection yet.</p>
            <p className="text-xs mt-1">Try registering a user, adding an asset, or creating a request.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[70vh]">
            <pre className="text-xs leading-relaxed p-5 text-gray-700 font-mono">
              {JSON.stringify(data?.docs || [], null, 2)}
            </pre>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Showing latest {data?.shown || 0} of {data?.total || 0} documents.
      </p>
    </div>
  );
}
