import { UserRole } from "@/context/AuthContext";

export function getAdminHomeRoute(role?: UserRole | null) {
  if (role === "blog_manager") {
    return "/admin/blog";
  }

  return "/admin/dashboard";
}
