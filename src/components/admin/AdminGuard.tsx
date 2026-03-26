"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/context/AuthContext";
import { getAdminHomeRoute } from "@/lib/admin-routes";
import AdminNotFound from "@/components/admin/AdminNotFound";
import {
  AdminPermissionAction,
  AdminPermissionResource,
  hasPermission,
} from "@/lib/admin-permissions";

interface RequiredPermission {
  resource: AdminPermissionResource;
  action?: AdminPermissionAction;
}

interface AdminGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: RequiredPermission;
  unauthorizedMode?: "redirect" | "not-found";
}

export default function AdminGuard({
  children,
  allowedRoles,
  requiredPermission,
  unauthorizedMode = "redirect",
}: AdminGuardProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const passesRoleCheck = allowedRoles
    ? !!profile && allowedRoles.includes(profile.role)
    : true;
  const passesPermissionCheck = requiredPermission
    ? !!profile &&
      (profile.role === "admin" ||
        hasPermission(
          profile.permissions,
          requiredPermission.resource,
          requiredPermission.action ?? "read"
        ))
    : true;
  const isAuthorized =
    !loading && user !== null && profile !== null && passesRoleCheck && passesPermissionCheck;

  useEffect(() => {
    if (loading) return;

    if (!user || !profile) {
      router.replace("/admin/login");
      return;
    }

    if (unauthorizedMode === "redirect" && !(passesRoleCheck && passesPermissionCheck)) {
      router.replace(getAdminHomeRoute(profile));
    }
  }, [
    user,
    profile,
    loading,
    router,
    unauthorizedMode,
    passesRoleCheck,
    passesPermissionCheck,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-dark)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary-light)] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthorized) {
    if (unauthorizedMode === "not-found" && !loading && user !== null && profile !== null) {
      return <AdminNotFound variant="unauthorized" />;
    }

    return null;
  }

  return <>{children}</>;
}
