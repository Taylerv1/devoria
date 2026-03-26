"use client";

import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/utils";
import { signOut } from "@/firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_ROUTE_DEFINITIONS, canAccessAdminRoute } from "@/lib/admin-permissions";
import devoriaLogo from "../../../devoriaLogo.png";
import {
  HiViewGrid,
  HiPencil,
  HiFolder,
  HiDocumentText,
  HiNewspaper,
  HiBriefcase,
  HiMail,
  HiUsers,
  HiArrowLeft,
  HiLogout,
  HiX,
} from "react-icons/hi";

const LINK_ICONS: Record<string, ReactNode> = {
  "/admin/dashboard": <HiViewGrid />,
  "/admin/content": <HiPencil />,
  "/admin/projects": <HiFolder />,
  "/admin/blog": <HiDocumentText />,
  "/admin/news": <HiNewspaper />,
  "/admin/services": <HiBriefcase />,
  "/admin/messages": <HiMail />,
  "/admin/users": <HiUsers />,
};

interface AdminSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ mobileOpen, onClose }: AdminSidebarProps) {
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
    ? ADMIN_ROUTE_DEFINITIONS.filter((link) => canAccessAdminRoute(profile, link.href))
    : [];

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-72 max-w-[86vw] flex-col border-r border-[var(--color-dark-border)] bg-[var(--color-dark-card)] transition-transform duration-300 lg:w-64 lg:max-w-none lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 border-b border-[var(--color-dark-border)] px-4 py-4 sm:px-6 sm:py-5">
          <Link href="/" className="relative block h-10 w-32 shrink-0 overflow-hidden sm:w-36" onClick={onClose}>
            <Image
              src={devoriaLogo}
              alt="Devoria"
              fill
              sizes="144px"
              className="object-cover [object-position:50%_45%] scale-130 -translate-x-[5%]"
            />
          </Link>
          <span className="rounded-md bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-primary-light)]">
            Admin
          </span>
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <HiX className="text-lg" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3 sm:p-4">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors",
                pathname === link.href
                  ? "bg-[var(--color-primary)]/10 text-[var(--color-primary-light)]"
                  : "text-[var(--color-text-muted)] hover:bg-white/5 hover:text-white"
              )}
            >
              <span className="text-lg">{LINK_ICONS[link.href]}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-1 border-t border-[var(--color-dark-border)] p-3 sm:p-4">
          {profile && (
            <div className="mb-1 px-4 py-2">
              <p className="truncate text-xs text-[var(--color-text-muted)]">{profile.email}</p>
              <p className="text-xs font-medium text-[var(--color-primary-light)]">{profile.roleName}</p>
            </div>
          )}
          <Link
            href="/"
            onClick={onClose}
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
    </>
  );
}
