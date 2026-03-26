"use client";

import Image from "next/image";
import { useState, FormEvent } from "react";
import { signIn } from "@/firebase/auth";
import { getDocument } from "@/firebase/firestore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { getAdminHomeRoute } from "@/lib/admin-routes";
import {
  hasAnyAdminAccess,
  isSystemRoleId,
  resolveRoleDefinition,
} from "@/lib/admin-permissions";
import devoriaLogo from "../../../../devoriaLogo.png";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    try {
      const credential = await signIn(email, password);
      const idToken = await credential.user.getIdToken();

      const sessionRes = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!sessionRes.ok) {
        throw new Error("session_failed");
      }

      const profile = (await getDocument(
        "users",
        credential.user.uid
      )) as { role?: string } | null;
      const roleId = typeof profile?.role === "string" ? profile.role.trim() : "";
      const roleDoc = roleId && !isSystemRoleId(roleId)
        ? await getDocument("roles", roleId)
        : null;
      const roleDefinition = roleId
        ? resolveRoleDefinition(roleId, roleDoc)
        : null;

      if (
        !roleDefinition ||
        !hasAnyAdminAccess({
          role: roleId,
          permissions: roleDefinition.permissions,
        })
      ) {
        throw new Error("session_failed");
      }

      const defaultRoute = getAdminHomeRoute({
        role: roleId,
        permissions: roleDefinition.permissions,
      });
      const from = new URLSearchParams(window.location.search).get("from");
      const targetRoute =
        from && from !== "/admin/dashboard" ? from : defaultRoute;

      window.location.href = targetRoute;
    } catch (err: unknown) {
      const code = (err as { code?: string; message?: string }).code;
      const msg = (err as { message?: string }).message;
      console.error("[Login] error code:", code, "| message:", msg);
      if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential" ||
        code === "auth/invalid-login-credentials" ||
        code === "auth/invalid-email"
      ) {
        setError("Invalid email or password.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else if (code === "auth/user-disabled") {
        setError("This account has been disabled.");
      } else if (code === "auth/network-request-failed") {
        setError("Network error. Check your internet connection.");
      } else if (msg === "session_failed") {
        setError("Account is not authorized for admin access.");
      } else {
        setError(`Sign in failed (${code ?? "unknown"}). Check console for details.`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-dark)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="relative mx-auto h-[78px] w-full max-w-[240px] overflow-hidden">
            <Image
              src={devoriaLogo}
              alt="Devoria"
              fill
              sizes="240px"
              priority
              className="object-cover object-center"
            />
          </div>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Sign in to the admin panel
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="admin@devoria.dev"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            {error && (
              <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
