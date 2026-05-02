"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import HRSidebar from "@/components/HRSidebar";
import EmployeeSidebar from "@/components/EmployeeSidebar";
import MobileNav from "@/components/MobileNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!user) return null;

  const isHR = user.role === "hr";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {isHR ? <HRSidebar /> : <EmployeeSidebar />}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* pb-20 on mobile gives room above the fixed bottom nav */}
        <div className="p-4 pb-24 md:pb-8 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
