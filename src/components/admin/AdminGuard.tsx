"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/context/AuthContext";
import { getAdminHomeRoute } from "@/lib/admin-routes";
import AdminNotFound from "@/components/admin/AdminNotFound";

const VALID_ROLES: readonly UserRole[] = ["admin", "editor", "blog_manager"];

interface AdminGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  unauthorizedMode?: "redirect" | "not-found";
}

export default function AdminGuard({
  children,
  allowedRoles = [...VALID_ROLES],
  unauthorizedMode = "redirect",
}: AdminGuardProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const isAuthorized =
    !loading &&
    user !== null &&
    profile !== null &&
    (VALID_ROLES as readonly string[]).includes(profile.role) &&
    (allowedRoles as string[]).includes(profile.role);

  useEffect(() => {
    if (loading) return;

    if (!user || !profile) {
      router.replace("/admin/login");
      return;
    }

    if (!(VALID_ROLES as readonly string[]).includes(profile.role)) {
      router.replace("/admin/login");
      return;
    }

    if (
      unauthorizedMode === "redirect" &&
      !(allowedRoles as string[]).includes(profile.role)
    ) {
      router.replace(getAdminHomeRoute(profile.role));
    }
  }, [user, profile, loading, router, allowedRoles, unauthorizedMode]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-dark)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary-light)] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthorized) {
    if (
      unauthorizedMode === "not-found" &&
      !loading &&
      user !== null &&
      profile !== null &&
      (VALID_ROLES as readonly string[]).includes(profile.role)
    ) {
      return <AdminNotFound variant="unauthorized" />;
    }

    return null;
  }

  return <>{children}</>;
}
