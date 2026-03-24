"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminNotFound from "@/components/admin/AdminNotFound";
import { useAuth } from "@/context/AuthContext";
import { getAdminRouteState } from "@/lib/admin-routes";
import { HiMenu } from "react-icons/hi";

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { profile } = useAuth();
  const routeState = getAdminRouteState(pathname, profile?.role);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  return (
    <AdminGuard>
      {routeState !== "allowed" ? (
        <div className="min-h-screen bg-[var(--color-dark)] px-4 py-8 sm:px-6 lg:px-8">
          <AdminNotFound
            variant={routeState === "unauthorized" ? "unauthorized" : "missing"}
          />
        </div>
      ) : (
        <div className="min-h-screen bg-[var(--color-dark)]">
          <div className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-dark-border)] bg-[var(--color-dark-card)] px-4 lg:hidden">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Open menu"
            >
              <HiMenu className="text-xl" />
            </button>
            <span className="text-sm font-medium text-[var(--color-text)]">Admin Panel</span>
            <div className="w-8" />
          </div>

          <AdminSidebar
            mobileOpen={mobileSidebarOpen}
            onClose={() => setMobileSidebarOpen(false)}
          />

          <main className="min-h-screen px-4 pb-8 pt-20 sm:px-6 sm:pb-10 lg:ml-64 lg:px-10 lg:py-10">
            {children}
          </main>
        </div>
      )}
    </AdminGuard>
  );
}
