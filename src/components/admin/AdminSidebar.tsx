"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/utils";
import { signOut } from "@/firebase/auth";
import { useAuth, UserRole } from "@/context/AuthContext";
import {
  HiViewGrid,
  HiFolder,
  HiDocumentText,
  HiNewspaper,
  HiBriefcase,
  HiMail,
  HiUsers,
  HiArrowLeft,
  HiLogout,
} from "react-icons/hi";

const links: {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <HiViewGrid />, roles: ["admin", "editor"] },
  { href: "/admin/projects", label: "Projects", icon: <HiFolder />, roles: ["admin", "editor"] },
  { href: "/admin/blog", label: "Blog", icon: <HiDocumentText />, roles: ["admin", "blog_manager"] },
  { href: "/admin/news", label: "News", icon: <HiNewspaper />, roles: ["admin", "blog_manager"] },
  { href: "/admin/services", label: "Services", icon: <HiBriefcase />, roles: ["admin", "editor"] },
  { href: "/admin/messages", label: "Messages", icon: <HiMail />, roles: ["admin", "editor"] },
  { href: "/admin/users", label: "Users", icon: <HiUsers />, roles: ["admin"] },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();

  async function handleLogout() {
    await signOut();
    // The session cookie is HttpOnly — it cannot be cleared by document.cookie.
    // Must go through the API route which has server access to clear it.
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/admin/login");
  }

  const visibleLinks = profile
    ? links.filter((l) => (l.roles as string[]).includes(profile.role))
    : [];

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[var(--color-dark-border)] bg-[var(--color-dark-card)]">
      <div className="flex items-center gap-3 border-b border-[var(--color-dark-border)] px-6 py-5">
        <span className="text-xl font-bold">
          <span className="text-[var(--color-primary-light)]">Dev</span>oria
        </span>
        <span className="rounded-md bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-primary-light)]">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {visibleLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors",
              pathname === link.href
                ? "bg-[var(--color-primary)]/10 text-[var(--color-primary-light)]"
                : "text-[var(--color-text-muted)] hover:bg-white/5 hover:text-white"
            )}
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-[var(--color-dark-border)] p-4 space-y-1">
        {profile && (
          <div className="px-4 py-2 mb-1">
            <p className="text-xs text-[var(--color-text-muted)] truncate">{profile.email}</p>
            <p className="text-xs font-medium text-[var(--color-primary-light)] capitalize">{profile.role}</p>
          </div>
        )}
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
        >
          <HiArrowLeft />
          Back to Site
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-[var(--color-text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <HiLogout />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
