import {
  AdminAccessProfile,
  ADMIN_ROUTE_DEFINITIONS,
  canAccessAdminRoute,
  getDefaultAdminRoute,
} from "@/lib/admin-permissions";

export const ADMIN_ROUTE_ACCESS = ADMIN_ROUTE_DEFINITIONS;

export function getAdminHomeRoute(profile?: AdminAccessProfile | null) {
  return getDefaultAdminRoute(profile);
}

export function getAdminRouteState(
  pathname: string,
  profile?: AdminAccessProfile | null
): "allowed" | "unauthorized" | "missing" {
  const route = ADMIN_ROUTE_DEFINITIONS.find((entry) => entry.href === pathname);

  if (!route) {
    return "missing";
  }

  if (!canAccessAdminRoute(profile, pathname)) {
    return "unauthorized";
  }

  return "allowed";
}
