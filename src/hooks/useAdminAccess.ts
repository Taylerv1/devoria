"use client";

import { useAuth } from "@/context/AuthContext";
import {
  AdminPermissionAction,
  AdminPermissionResource,
  canAccessAdminRoute,
  hasPermission,
} from "@/lib/admin-permissions";

export function useAdminAccess() {
  const { profile } = useAuth();

  return {
    profile,
    isAdmin: profile?.role === "admin",
    can(resource: AdminPermissionResource, action: AdminPermissionAction = "read") {
      if (!profile) {
        return false;
      }

      if (profile.role === "admin") {
        return true;
      }

      return hasPermission(profile.permissions, resource, action);
    },
    canAccessRoute(href: string) {
      return canAccessAdminRoute(profile, href);
    },
  };
}
