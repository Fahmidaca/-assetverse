"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { MdCheck, MdStar } from "react-icons/md";
import { Suspense } from "react";

const PACKAGES = [
  {
    name: "basic",
    label: "Basic",
    price: 0,
    limit: 5,
    features: ["Up to 5 employees", "Unlimited assets", "Basic analytics", "Email support"],
    color: "border-gray-200",
    badge: "",
  },
  {
    name: "standard",
    label: "Standard",
    price: 5,
    limit: 10,
    features: ["Up to 10 employees", "Unlimited assets", "Advanced analytics", "Priority support", "PDF reports"],
    color: "border-indigo-400",
    badge: "Popular",
  },
  {
    name: "premium",
    label: "Premium",
    price: 10,
    limit: 20,
    features: ["Up to 20 employees", "Unlimited assets", "Full analytics", "24/7 support", "PDF reports", "Custom branding"],
    color: "border-violet-400",
    badge: "Best Value",
  },
];

function PackagePageContent() {
  const { authHeaders, user, updateUser } = useAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const success = searchParams.get("success");
    const sessionId = searchParams.get("session_id");
    const pkgName = searchParams.get("package");

    if (success === "true" && sessionId) {
      axios.post("/api/payment/success", { sessionId }, { headers: authHeaders })
        .then((res) => {
          toast.success(`Upgraded to ${pkgName} plan!`);
          updateUser({ subscription: pkgName as any, packageLimit: res.data.newLimit });
          window.history.replaceState({}, "", "/hr/package");
        })
        .catch(() => toast.error("Failed to verify payment"));
    }
    if (searchParams.get("cancelled") === "true") {
      toast.error("Payment cancelled");
      window.history.replaceState({}, "", "/hr/package");
    }
  }, [searchParams]);

  const handleUpgrade = async (pkgName: string) => {
    if (pkgName === "basic") return;
    setLoading(pkgName);
    try {
      const res = await axios.post("/api/payment/create-checkout", { packageName: pkgName }, { headers: authHeaders });
      window.location.href = res.data.url;
    } catch {
      toast.error("Payment setup failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upgrade Package</h1>
        <p className="text-gray-500 text-sm mt-1">
          Current plan: <span className="font-semibold text-indigo-600 capitalize">{user?.subscription || "basic"}</span>
          {" "}· {user?.currentEmployees || 0} / {user?.packageLimit || 5} employees
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PACKAGES.map((pkg) => {
          const isCurrent = user?.subscription === pkg.name;
          const isPopular = pkg.badge === "Popular";

          return (
            <div
              key={pkg.name}
              className={`bg-white rounded-2xl border-2 shadow-sm p-6 relative flex flex-col ${pkg.color} ${isPopular ? "scale-105 shadow-lg" : ""}`}
            >
              {pkg.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`badge text-white px-3 py-2 ${isPopular ? "badge-primary" : "badge-secondary"}`}>
                    <MdStar className="w-3 h-3 mr-1" /> {pkg.badge}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">{pkg.label}</h3>
                <div className="flex items-end gap-1 mt-2">
                  <span className="text-4xl font-black text-gray-900">${pkg.price}</span>
                  <span className="text-gray-400 mb-1">/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Up to {pkg.limit} employees</p>
              </div>

              <ul className="space-y-3 flex-1 mb-6">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <MdCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(pkg.name)}
                disabled={isCurrent || !!loading || pkg.price === 0}
                className={`btn w-full rounded-xl ${
                  isCurrent ? "btn-ghost bg-gray-100 cursor-default" :
                  pkg.price === 0 ? "btn-ghost bg-gray-100 cursor-default" :
                  isPopular ? "btn-primary text-white" : "btn-outline btn-primary"
                }`}
              >
                {loading === pkg.name ? <span className="loading loading-spinner loading-sm" /> :
                  isCurrent ? "Current Plan" :
                  pkg.price === 0 ? "Free Plan" : `Upgrade to ${pkg.label}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PackagePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>}>
      <PackagePageContent />
    </Suspense>
  );
}
