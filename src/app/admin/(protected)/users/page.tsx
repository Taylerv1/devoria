"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import AdminModal from "@/components/admin/AdminModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAuth } from "@/context/AuthContext";
import {
  ADMIN_PERMISSION_ACTION_LABELS,
  ADMIN_PERMISSION_GROUPS,
  AdminPermissionAction,
  AdminPermissionMatrix,
  AdminPermissionResource,
  AdminRoleDefinition,
  createEmptyPermissionMatrix,
} from "@/lib/admin-permissions";
import {
  HiEye,
  HiEyeOff,
  HiPlus,
  HiPencil,
  HiShieldCheck,
  HiTrash,
} from "react-icons/hi";

const CREATE_ROLE_OPTION = "__create_role__";

interface AdminUser {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  roleName: string;
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
      {helperText ? (
        <p className="text-xs text-[var(--color-text-muted)]">{helperText}</p>
      ) : null}
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
          onChange={(event) => onChange(event.target.value)}
          readOnly={!editing}
          minLength={editing ? 6 : undefined}
          autoComplete="new-password"
          className="w-full rounded-lg border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] px-4 py-2.5 pr-28 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-primary)]"
        />
        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
          {editing ? (
            <button
              type="button"
              onClick={onToggleVisibility}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
              aria-label={visible ? "Hide password" : "Show password"}
            >
              {visible ? <HiEyeOff className="text-lg" /> : <HiEye className="text-lg" />}
            </button>
          ) : null}
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

function applyFullAccess(enabled: boolean): AdminPermissionMatrix {
  const matrix = createEmptyPermissionMatrix();

  ADMIN_PERMISSION_GROUPS.forEach((group) => {
    group.actions.forEach((action) => {
      matrix[group.resource][action] = enabled;
    });
  });

  return matrix;
}

function hasFullAccess(permissions: AdminPermissionMatrix) {
  return ADMIN_PERMISSION_GROUPS.every((group) =>
    group.actions.every((action) => permissions[group.resource][action])
  );
}

function PermissionGroupEditor({
  group,
  permissions,
  onToggle,
}: {
  group: (typeof ADMIN_PERMISSION_GROUPS)[number];
  permissions: AdminPermissionMatrix;
  onToggle: (
    resource: AdminPermissionResource,
    action: AdminPermissionAction,
    value: boolean
  ) => void;
}) {
  const enabledCount = group.actions.filter(
    (action) => permissions[group.resource][action]
  ).length;

  return (
    <details className="rounded-2xl border border-[var(--color-dark-border)] bg-[var(--color-dark)]/60 p-4">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
        <div>
          <p className="font-medium text-white">{group.label}</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {group.description}
          </p>
        </div>
        <span className="rounded-full border border-[var(--color-dark-border)] px-2.5 py-1 text-xs text-[var(--color-text-muted)]">
          {enabledCount}/{group.actions.length}
        </span>
      </summary>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {group.actions.map((action) => (
          <label
            key={`${group.resource}-${action}`}
            className="flex items-center gap-3 rounded-xl border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] px-4 py-3"
          >
            <input
              type="checkbox"
              checked={permissions[group.resource][action]}
              onChange={(event) =>
                onToggle(group.resource, action, event.target.checked)
              }
              className="h-4 w-4 rounded border-[var(--color-dark-border)] bg-[var(--color-dark-card)]"
            />
            <div>
              <p className="text-sm font-medium text-white">
                {ADMIN_PERMISSION_ACTION_LABELS[action]}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {group.label} - {ADMIN_PERMISSION_ACTION_LABELS[action]}
              </p>
            </div>
          </label>
        ))}
      </div>
    </details>
  );
}

export default function AdminUsersPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [creatingRole, setCreatingRole] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [editPasswordValue, setEditPasswordValue] = useState("");
  const [selectedAddRole, setSelectedAddRole] = useState("editor");
  const [selectedEditRole, setSelectedEditRole] = useState("editor");
  const [roleModalTarget, setRoleModalTarget] = useState<"add" | "edit">("add");
  const [roleName, setRoleName] = useState("");
  const [rolePermissions, setRolePermissions] = useState<AdminPermissionMatrix>(
    createEmptyPermissionMatrix()
  );

  const adminCount = useMemo(
    () => users.filter((user) => user.role === "admin").length,
    [users]
  );
  const customRoles = useMemo(
    () => roles.filter((role) => !role.isSystem),
    [roles]
  );

  useEffect(() => {
    if (profile?.role !== "admin") {
      return;
    }

    void fetchData();
  }, [profile?.role]);

  async function fetchData() {
    setLoading(true);
    setError(null);

    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch("/api/admin/users", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
        fetch("/api/admin/roles", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
      ]);

      if (!usersRes.ok) {
        const payload = (await usersRes.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || "Failed to load users");
      }

      if (!rolesRes.ok) {
        const payload = (await rolesRes.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || "Failed to load roles");
      }

      const usersPayload = (await usersRes.json()) as { users?: AdminUser[] };
      const rolesPayload = (await rolesRes.json()) as {
        roles?: AdminRoleDefinition[];
      };

      setUsers(Array.isArray(usersPayload.users) ? usersPayload.users : []);
      setRoles(Array.isArray(rolesPayload.roles) ? rolesPayload.roles : []);
    } catch (err) {
      console.error("Load users/roles failed:", err);
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  function openEdit(user: AdminUser) {
    setEditing(user);
    setSelectedEditRole(user.role);
    setShowEditPassword(false);
    setIsEditingPassword(false);
    setEditPasswordValue("");
    setModalOpen(true);
  }

  function resetRoleModal() {
    setRoleName("");
    setRolePermissions(createEmptyPermissionMatrix());
    setCreatingRole(false);
  }

  function openRoleModal(target: "add" | "edit") {
    setRoleModalTarget(target);
    resetRoleModal();
    setRoleModalOpen(true);
  }

  function handleRolePickerChange(target: "add" | "edit", value: string) {
    if (value === CREATE_ROLE_OPTION) {
      openRoleModal(target);
      return;
    }

    if (target === "add") {
      setSelectedAddRole(value);
      return;
    }

    setSelectedEditRole(value);
  }

  function updateRolePermission(
    resource: AdminPermissionResource,
    action: AdminPermissionAction,
    value: boolean
  ) {
    setRolePermissions((current) => ({
      ...current,
      [resource]: {
        ...current[resource],
        [action]: value,
      },
    }));
  }

  async function handleCreateRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreatingRole(true);

    try {
      const response = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roleName,
          permissions: rolePermissions,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || "Failed to create role");
      }

      const result = (await response.json()) as { role: AdminRoleDefinition };
      const nextRoles = [...roles, result.role].sort((left, right) => {
        if (left.isSystem !== right.isSystem) {
          return left.isSystem ? -1 : 1;
        }

        return left.name.localeCompare(right.name);
      });

      setRoles(nextRoles);

      if (roleModalTarget === "add") {
        setSelectedAddRole(result.role.id);
      } else {
        setSelectedEditRole(result.role.id);
      }

      setRoleModalOpen(false);
      resetRoleModal();
    } catch (err) {
      console.error("Create role failed:", err);
      alert(err instanceof Error ? err.message : "Failed to create role");
    } finally {
      setCreatingRole(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) {
      return;
    }

    setSaving(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      uid: editing.id,
      displayName: String(form.get("displayName") || "").trim(),
      role: selectedEditRole,
      password: isEditingPassword ? editPasswordValue : "",
    };

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(errorPayload?.error || "Failed to update user");
      }

      const result = (await response.json()) as { user: AdminUser };
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
    if (!deletingUser) {
      return;
    }

    setDeletingId(deletingUser.id);

    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: deletingUser.id }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
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

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdding(true);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = {
      email: String(form.get("email") || "").trim(),
      password: String(form.get("password") || ""),
      role: selectedAddRole,
      displayName: String(form.get("displayName") || "").trim(),
    };

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(errorPayload?.error || "Failed to create user");
      }

      const result = (await response.json()) as { user: AdminUser };
      setUsers((current) => [result.user, ...current]);
      formElement.reset();
      setSelectedAddRole("editor");
      setAddModalOpen(false);
      setShowAddPassword(false);
    } catch (err) {
      console.error("Create user failed:", err);
      alert(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setAdding(false);
    }
  }

  const roleOptions = roles.map((role) => (
    <option key={role.id} value={role.id}>
      {role.name}
    </option>
  ));

  return (
    <AdminGuard allowedRoles={["admin"]} unauthorizedMode="not-found">
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
                  Manage team accounts and create custom roles with page-based permissions.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={() => {
                    setShowAddPassword(false);
                    setSelectedAddRole("editor");
                    setAddModalOpen(true);
                  }}
                  className="w-full sm:w-auto"
                >
                  <HiPlus className="mr-1.5 inline" /> Add User
                </Button>
              </div>
            </div>

            <div className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_2fr]">
              <Card hover={false}>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--color-primary-light)]">
                  Roles
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  Available Role Presets
                </h2>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  Built-in roles stay fixed. Custom roles can be created and assigned to users from the role selector.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <Badge
                      key={role.id}
                      variant={role.isSystem ? "accent" : "muted"}
                    >
                      {role.name}
                    </Badge>
                  ))}
                </div>
              </Card>

              <Card hover={false}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Custom Roles
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {customRoles.length === 0
                        ? "No custom roles created yet."
                        : `${customRoles.length} custom role${customRoles.length === 1 ? "" : "s"} available for assignment.`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => openRoleModal("add")}
                    className="w-full sm:w-auto"
                  >
                    <HiPlus /> New Custom Role
                  </Button>
                </div>
              </Card>
            </div>

            {error ? (
              <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            ) : null}

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
                      <div
                        key={user.id}
                        className="rounded-xl border border-[var(--color-dark-border)] bg-[var(--color-dark)] p-4"
                      >
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
                            <p className="truncate font-medium text-white">
                              {user.displayName || user.email}
                            </p>
                            <p className="truncate text-xs text-[var(--color-text-muted)]">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <Badge
                            variant={
                              user.role === "admin"
                                ? "primary"
                                : user.role === "editor" || user.role === "blog_manager"
                                  ? "accent"
                                  : "muted"
                            }
                          >
                            {user.roleName}
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

                        {isCurrentAdmin ? (
                          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                            Current admin account
                          </p>
                        ) : null}
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
                                  {isCurrentAdmin ? (
                                    <p className="text-xs text-[var(--color-text-muted)]">
                                      Current admin account
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-[var(--color-text-muted)]">
                              {user.email}
                            </td>
                            <td className="py-4">
                              <Badge
                                variant={
                                  user.role === "admin"
                                    ? "primary"
                                    : user.role === "editor" || user.role === "blog_manager"
                                      ? "accent"
                                      : "muted"
                                }
                              >
                                {user.roleName}
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
              {editing ? (
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
                      value={selectedEditRole}
                      onChange={(event) =>
                        handleRolePickerChange("edit", event.target.value)
                      }
                      disabled={editing.id === profile?.uid}
                      className="rounded-lg border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {roleOptions}
                      <option value={CREATE_ROLE_OPTION}>+ Create Role</option>
                    </select>
                    {editing.id === profile?.uid && adminCount >= 1 ? (
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Your own role is locked here so the panel always keeps an admin.
                      </p>
                    ) : (
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Pick an existing role or choose + Create Role to define a custom permission set.
                      </p>
                    )}
                  </div>
                  <EditablePasswordField
                    value={editPasswordValue}
                    editing={isEditingPassword}
                    visible={showEditPassword}
                    onChange={setEditPasswordValue}
                    onToggleVisibility={() =>
                      setShowEditPassword((current) => !current)
                    }
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
              ) : null}
            </AdminModal>

            <AdminModal
              open={addModalOpen}
              onClose={() => {
                setAddModalOpen(false);
                setShowAddPassword(false);
                setSelectedAddRole("editor");
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
                    value={selectedAddRole}
                    onChange={(event) =>
                      handleRolePickerChange("add", event.target.value)
                    }
                    className="rounded-lg border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-primary)]"
                  >
                    {roleOptions}
                    <option value={CREATE_ROLE_OPTION}>+ Create Role</option>
                  </select>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Built-in roles are fixed. Custom roles use the permissions you define.
                  </p>
                </div>
                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setAddModalOpen(false);
                      setShowAddPassword(false);
                      setSelectedAddRole("editor");
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

            <AdminModal
              open={roleModalOpen}
              onClose={() => {
                setRoleModalOpen(false);
                resetRoleModal();
              }}
              title="Create Role"
              className="max-w-3xl"
            >
              <form onSubmit={handleCreateRole} className="space-y-5">
                <Input
                  label="Role Name"
                  value={roleName}
                  onChange={(event) => setRoleName(event.target.value)}
                  placeholder="e.g. Project Reviewer"
                  required
                />

                <div className="rounded-2xl border border-[var(--color-dark-border)] bg-[var(--color-dark)]/60 p-4">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={hasFullAccess(rolePermissions)}
                      onChange={(event) =>
                        setRolePermissions(applyFullAccess(event.target.checked))
                      }
                      className="mt-1 h-4 w-4 rounded border-[var(--color-dark-border)] bg-[var(--color-dark-card)]"
                    />
                    <div>
                      <p className="font-medium text-white">Full Access</p>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        Grants access to every configurable admin section except the admin-only users screen.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-white">Permissions</p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Open any page section below and choose exactly which actions this role can do.
                    </p>
                  </div>

                  {ADMIN_PERMISSION_GROUPS.map((group) => (
                    <PermissionGroupEditor
                      key={group.resource}
                      group={group}
                      permissions={rolePermissions}
                      onToggle={updateRolePermission}
                    />
                  ))}
                </div>

                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setRoleModalOpen(false);
                      resetRoleModal();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creatingRole}>
                    {creatingRole ? "Creating..." : "Create Role"}
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
                if (!deletingId) {
                  setDeletingUser(null);
                }
              }}
              onConfirm={handleDelete}
            />
          </>
        )}
      </div>
    </AdminGuard>
  );
}
