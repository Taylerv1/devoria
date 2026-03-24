import { UserRole } from "@/context/AuthContext";

export const ADMIN_ROUTE_ACCESS: Array<{
  href: string;
  roles: UserRole[];
}> = [
  { href: "/admin/dashboard", roles: ["admin", "editor"] },
  { href: "/admin/projects", roles: ["admin", "editor"] },
  { href: "/admin/services", roles: ["admin", "editor"] },
  { href: "/admin/messages", roles: ["admin", "editor"] },
  { href: "/admin/blog", roles: ["admin", "blog_manager"] },
  { href: "/admin/news", roles: ["admin", "blog_manager"] },
  { href: "/admin/users", roles: ["admin"] },
];

export function getAdminHomeRoute(role?: UserRole | null) {
  if (role === "blog_manager") {
    return "/admin/blog";
  }

  return "/admin/dashboard";
}

export function getAdminRouteState(
  pathname: string,
  role?: UserRole | null
): "allowed" | "unauthorized" | "missing" {
  const route = ADMIN_ROUTE_ACCESS.find((entry) => entry.href === pathname);

  if (!route) {
    return "missing";
  }

  if (!role || !(route.roles as string[]).includes(role)) {
    return "unauthorized";
  }

  return "allowed";
}
