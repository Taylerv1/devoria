"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAdminHomeRoute } from "@/lib/admin-routes";

export default function AdminPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!profile) {
      router.replace("/admin/login");
      return;
    }

    router.replace(getAdminHomeRoute(profile));
  }, [loading, profile, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-dark)]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary-light)] border-t-transparent" />
    </div>
  );
}
