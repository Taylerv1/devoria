"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import AdminModal from "@/components/admin/AdminModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAuth, UserRole } from "@/context/AuthContext";
import { HiPencil, HiTrash, HiPlus, HiEye, HiEyeOff } from "react-icons/hi";

const ROLE_OPTIONS: UserRole[] = ["admin", "editor", "blog_manager"];

interface AdminUser {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
}

interface PasswordFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  helperText?: string;
  visible: boolean;
  onToggle: () => void;
}

function PasswordField({
  label,
  name,
  placeholder,
  required,
  minLength,
  helperText,
  visible,
  onToggle,
}: PasswordFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--color-text)]">
        {label}
      </label>
      <div className="relative">
        <input
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete="new-password"
          className="w-full rounded-lg border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] px-4 py-2.5 pr-12 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-primary)]"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[var(--color-text-muted)] transition-colors hover:text-white"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <HiEyeOff className="text-lg" /> : <HiEye className="text-lg" />}
        </button>
      </div>
      {helperText && (
        <p className="text-xs text-[var(--color-text-muted)]">{helperText}</p>
      )}
    </div>
  );
}

interface EditablePasswordFieldProps {
  value: string;
  editing: boolean;
  visible: boolean;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
  onToggleEditing: () => void;
}

function EditablePasswordField({
  value,
  editing,
  visible,
  onChange,
  onToggleVisibility,
  onToggleEditing,
}: EditablePasswordFieldProps) {
  const displayValue = editing ? value : "********";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--color-text)]">
        Password
      </label>
      <div className="relative">
        <input
          name={editing ? "password" : undefined}
          type={editing && visible ? "text" : "password"}
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          readOnly={!editing}
          minLength={editing ? 6 : undefined}
          autoComplete="new-password"
          className="w-full rounded-lg border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] px-4 py-2.5 pr-28 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-primary)]"
        />
        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
          {editing && (
            <button
              type="button"
              onClick={onToggleVisibility}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
              aria-label={visible ? "Hide password" : "Show password"}
            >
              {visible ? <HiEyeOff className="text-lg" /> : <HiEye className="text-lg" />}
            </button>
          )}
          <button
            type="button"
            onClick={onToggleEditing}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
          >
            {editing ? "Cancel" : "Reset"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [editPasswordValue, setEditPasswordValue] = useState("");

  const adminCount = useMemo(
    () => users.filter((user) => user.role === "admin").length,
    [users]
  );

  useEffect(() => {
    if (profile?.role !== "admin") {
      return;
    }

    void fetchUsers();
  }, [profile?.role]);

  async function fetchUsers() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || "Failed to load users");
      }

      const result = (await res.json()) as { users?: AdminUser[] };
      setUsers(Array.isArray(result.users) ? result.users : []);
    } catch (err) {
      console.error("Load users failed:", err);
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  function openEdit(user: AdminUser) {
    setEditing(user);
    setShowEditPassword(false);
    setIsEditingPassword(false);
    setEditPasswordValue("");
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const submittedRole = form.get("role");
    const payload = {
      uid: editing.id,
      displayName: String(form.get("displayName") || "").trim(),
      role: (submittedRole || editing.role) as UserRole,
      password: isEditingPassword ? editPasswordValue : "",
    };

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorPayload = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(errorPayload?.error || "Failed to update user");
      }

      const result = (await res.json()) as { user: AdminUser };
      setUsers((current) =>
        current.map((user) => (user.id === result.user.id ? result.user : user))
      );
      setModalOpen(false);
      setEditing(null);
      setShowEditPassword(false);
      setIsEditingPassword(false);
      setEditPasswordValue("");
    } catch (err) {
      console.error("Save failed:", err);
      alert(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  }

  function requestDelete(user: AdminUser) {
    setDeletingUser(user);
  }

  async function handleDelete() {
    if (!deletingUser) return;
    setDeletingId(deletingUser.id);

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: deletingUser.id }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || "Failed to delete user");
      }

      setUsers((current) => current.filter((item) => item.id !== deletingUser.id));
      setDeletingUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAdding(true);

    const formElement = e.currentTarget;
    const form = new FormData(formElement);
    const payload = {
      email: String(form.get("email") || "").trim(),
      password: String(form.get("password") || ""),
      role: form.get("role") as UserRole,
      displayName: String(form.get("displayName") || "").trim(),
    };

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorPayload = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(errorPayload?.error || "Failed to create user");
      }

      const result = (await res.json()) as { user: AdminUser };
      setUsers((current) => [result.user, ...current]);
      formElement.reset();
      setAddModalOpen(false);
      setShowAddPassword(false);
    } catch (err) {
      console.error("Create user failed:", err);
      alert(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setAdding(false);
    }
  }

  return (
    <AdminGuard allowedRoles={["admin"]}>
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary-light)] border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Users</h1>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Manage team accounts. This section is only visible to admins.
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowAddPassword(false);
                  setAddModalOpen(true);
                }}
                className="w-full sm:w-auto"
              >
                <HiPlus className="mr-1.5 inline" /> Add User
              </Button>
            </div>

            {error && (
              <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}

            {users.length === 0 ? (
              <Card hover={false}>
                <p className="py-8 text-center text-[var(--color-text-muted)]">
                  No users found.
                </p>
              </Card>
            ) : (
              <Card hover={false}>
                <div className="space-y-3 sm:hidden">
                  {users.map((user) => {
                    const isCurrentAdmin = user.id === profile?.uid;

                    return (
                      <div key={user.id} className="rounded-xl border border-[var(--color-dark-border)] bg-[var(--color-dark)] p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-xs font-bold text-[var(--color-primary-light)]">
                            {(user.displayName || user.email || "?")
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-white">{user.displayName || user.email}</p>
                            <p className="truncate text-xs text-[var(--color-text-muted)]">{user.email}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <Badge variant={user.role === "admin" ? "primary" : "muted"}>
                            {user.role}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(user)}
                              className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
                            >
                              <HiPencil />
                            </button>
                            <button
                              onClick={() => requestDelete(user)}
                              disabled={isCurrentAdmin || deletingId === user.id}
                              title={
                                isCurrentAdmin
                                  ? "You cannot delete your own admin account."
                                  : undefined
                              }
                              className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <HiTrash />
                            </button>
                          </div>
                        </div>

                        {isCurrentAdmin && (
                          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                            Current admin account
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="hidden sm:block">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-dark-border)]">
                        <th className="pb-3 font-medium text-[var(--color-text-muted)]">
                          Name
                        </th>
                        <th className="pb-3 font-medium text-[var(--color-text-muted)]">
                          Email
                        </th>
                        <th className="pb-3 font-medium text-[var(--color-text-muted)]">
                          Role
                        </th>
                        <th className="pb-3 text-right font-medium text-[var(--color-text-muted)]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => {
                        const isCurrentAdmin = user.id === profile?.uid;

                        return (
                          <tr
                            key={user.id}
                            className="border-b border-[var(--color-dark-border)] last:border-0"
                          >
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-xs font-bold text-[var(--color-primary-light)]">
                                  {(user.displayName || user.email || "?")
                                    .split(" ")
                                    .map((part) => part[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-medium text-white">
                                    {user.displayName || user.email}
                                  </span>
                                  {isCurrentAdmin && (
                                    <p className="text-xs text-[var(--color-text-muted)]">
                                      Current admin account
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-[var(--color-text-muted)]">
                              {user.email}
                            </td>
                            <td className="py-4">
                              <Badge
                                variant={user.role === "admin" ? "primary" : "muted"}
                              >
                                {user.role}
                              </Badge>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEdit(user)}
                                  className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
                                >
                                  <HiPencil />
                                </button>
                                <button
                                  onClick={() => requestDelete(user)}
                                  disabled={isCurrentAdmin || deletingId === user.id}
                                  title={
                                    isCurrentAdmin
                                      ? "You cannot delete your own admin account."
                                      : undefined
                                  }
                                  className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <HiTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            <AdminModal
              open={modalOpen}
              onClose={() => {
                setModalOpen(false);
                setEditing(null);
                setShowEditPassword(false);
                setIsEditingPassword(false);
                setEditPasswordValue("");
              }}
              title="Edit User"
            >
              {editing && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[var(--color-text)]">
                      Email
                    </label>
                    <p className="rounded-lg border border-[var(--color-dark-border)] bg-[var(--color-dark)] px-4 py-2.5 text-sm text-[var(--color-text-muted)]">
                      {editing.email}
                    </p>
                  </div>
                  <Input
                    label="Display Name"
                    name="displayName"
                    defaultValue={editing.displayName ?? ""}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[var(--color-text)]">
                      Role
                    </label>
                    <select
                      name="role"
                      defaultValue={editing.role}
                      disabled={editing.id === profile?.uid}
                      className="rounded-lg border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    {editing.id === profile?.uid && adminCount >= 1 && (
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Your own role is locked here so the panel always keeps an admin.
                      </p>
                    )}
                  </div>
                  <EditablePasswordField
                    value={editPasswordValue}
                    editing={isEditingPassword}
                    visible={showEditPassword}
                    onChange={setEditPasswordValue}
                    onToggleVisibility={() => setShowEditPassword((current) => !current)}
                    onToggleEditing={() => {
                      setIsEditingPassword((current) => {
                        const next = !current;
                        if (!next) {
                          setEditPasswordValue("");
                          setShowEditPassword(false);
                        }
                        return next;
                      });
                    }}
                  />
                  <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setModalOpen(false);
                        setEditing(null);
                        setShowEditPassword(false);
                        setIsEditingPassword(false);
                        setEditPasswordValue("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Update"}
                    </Button>
                  </div>
                </form>
              )}
            </AdminModal>

            <AdminModal
              open={addModalOpen}
              onClose={() => {
                setAddModalOpen(false);
                setShowAddPassword(false);
              }}
              title="Add User"
            >
              <form onSubmit={handleAdd} className="space-y-4">
                <Input
                  label="Display Name"
                  name="displayName"
                  placeholder="Team member name"
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="name@devoria.dev"
                  required
                />
                <PasswordField
                  label="Password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  required
                  visible={showAddPassword}
                  onToggle={() => setShowAddPassword((current) => !current)}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--color-text)]">
                    Role
                  </label>
                  <select
                    name="role"
                    defaultValue="editor"
                    className="rounded-lg border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-primary)]"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setAddModalOpen(false);
                      setShowAddPassword(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={adding}>
                    {adding ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </form>
            </AdminModal>

            <DeleteConfirmModal
              open={!!deletingUser}
              title="Delete User"
              description={
                deletingUser
                  ? `Are you sure you want to remove "${deletingUser.displayName || deletingUser.email}"? This action cannot be undone.`
                  : ""
              }
              loading={!!deletingId}
              onClose={() => {
                if (!deletingId) setDeletingUser(null);
              }}
              onConfirm={handleDelete}
            />
          </>
        )}
      </div>
    </AdminGuard>
  );
}
