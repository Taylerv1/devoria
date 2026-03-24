"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import {
  HiArrowLeft,
  HiOutlineExclamationCircle,
  HiShieldExclamation,
} from "react-icons/hi";
import { useAuth } from "@/context/AuthContext";
import { getAdminHomeRoute } from "@/lib/admin-routes";

type AdminNotFoundVariant = "missing" | "unauthorized";

interface AdminNotFoundProps {
  variant?: AdminNotFoundVariant;
}

const CONTENT: Record<
  AdminNotFoundVariant,
  {
    badge: string;
    title: string;
    description: string;
    sideText: string;
    Icon: typeof HiOutlineExclamationCircle;
  }
> = {
  missing: {
    badge: "Not Found",
    title: "This page doesn&apos;t exist",
    description:
      "The admin page you tried to open could not be found. It may have been moved, removed, or the URL may be incorrect.",
    sideText:
      "Your session is still active. You can head back to your admin home and continue from there.",
    Icon: HiOutlineExclamationCircle,
  },
  unauthorized: {
    badge: "Access Restricted",
    title: "You don&apos;t have access to this page",
    description:
      "This admin page exists, but it isn&apos;t available for your current role. We blocked it before loading its protected data.",
    sideText:
      "Your session is still active. You can jump back to the part of the panel that belongs to your role.",
    Icon: HiShieldExclamation,
  },
};

export default function AdminNotFound({
  variant = "missing",
}: AdminNotFoundProps) {
  const { profile } = useAuth();
  const homeRoute = getAdminHomeRoute(profile?.role);
  const content = CONTENT[variant];
  const Icon = content.Icon;

  return (
    <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center py-6">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[32px] border border-[var(--color-dark-border)] bg-[linear-gradient(145deg,rgba(31,33,28,0.98),rgba(22,23,21,0.96))] px-6 py-10 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:px-10 sm:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,178,138,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(212,178,138,0.08),transparent_28%)]" />
        <div className="absolute -right-12 top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(212,178,138,0.18),transparent_68%)] blur-2xl" />
        <div className="absolute -left-8 bottom-6 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06),transparent_72%)] blur-2xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.28em] text-[var(--color-primary-light)]">
            <Icon className="text-sm" />
            {content.badge}
          </div>

          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-6xl font-semibold leading-none text-white/10 sm:text-7xl">
                404
              </p>
              <h1 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">
                {content.title}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--color-text-muted)] sm:text-base">
                {content.description}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/10 p-4 backdrop-blur sm:p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-primary-light)]">
                Devoria Admin
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                {content.sideText}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={homeRoute}>
              <Button>Go to My Admin Home</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost">
                <HiArrowLeft />
                Back to Site
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
