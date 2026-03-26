export const ADMIN_PERMISSION_ACTIONS = [
  "read",
  "create",
  "update",
  "delete",
] as const;

export type AdminPermissionAction =
  (typeof ADMIN_PERMISSION_ACTIONS)[number];

export const ADMIN_PERMISSION_RESOURCES = [
  "dashboard",
  "content",
  "projects",
  "services",
  "messages",
  "blog",
  "news",
] as const;

export type AdminPermissionResource =
  (typeof ADMIN_PERMISSION_RESOURCES)[number];

export type AdminPermissionSet = Record<AdminPermissionAction, boolean>;

export type AdminPermissionMatrix = Record<
  AdminPermissionResource,
  AdminPermissionSet
>;

export interface AdminRoleDefinition {
  id: string;
  name: string;
  isSystem: boolean;
  permissions: AdminPermissionMatrix;
}

export interface AdminPermissionGroup {
  resource: AdminPermissionResource;
  label: string;
  description: string;
  actions: readonly AdminPermissionAction[];
}

export interface AdminRouteDefinition {
  href: string;
  label: string;
  resource?: AdminPermissionResource;
  action?: AdminPermissionAction;
  adminOnly?: boolean;
}

export interface AdminAccessProfile {
  role: string;
  permissions: AdminPermissionMatrix;
}

export const ADMIN_PERMISSION_ACTION_LABELS: Record<
  AdminPermissionAction,
  string
> = {
  read: "Read",
  create: "Add",
  update: "Update",
  delete: "Delete",
};

export const ADMIN_PERMISSION_GROUPS: readonly AdminPermissionGroup[] = [
  {
    resource: "dashboard",
    label: "Dashboard",
    description: "Can access the dashboard overview.",
    actions: ["read"],
  },
  {
    resource: "content",
    label: "Pages Content",
    description: "Can open and update homepage, about, contact, and footer content.",
    actions: ["read", "update"],
  },
  {
    resource: "projects",
    label: "Projects",
    description: "Can manage portfolio projects.",
    actions: ["read", "create", "update", "delete"],
  },
  {
    resource: "services",
    label: "Services",
    description: "Can manage services content.",
    actions: ["read", "create", "update", "delete"],
  },
  {
    resource: "messages",
    label: "Messages",
    description: "Can view inbox messages, mark them as read, and delete them.",
    actions: ["read", "update", "delete"],
  },
  {
    resource: "blog",
    label: "Blog",
    description: "Can manage blog posts.",
    actions: ["read", "create", "update", "delete"],
  },
  {
    resource: "news",
    label: "News",
    description: "Can manage news items.",
    actions: ["read", "create", "update", "delete"],
  },
] as const;

export const ADMIN_ROUTE_DEFINITIONS: readonly AdminRouteDefinition[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    resource: "dashboard",
    action: "read",
  },
  {
    href: "/admin/content",
    label: "Pages",
    resource: "content",
    action: "read",
  },
  {
    href: "/admin/projects",
    label: "Projects",
    resource: "projects",
    action: "read",
  },
  {
    href: "/admin/blog",
    label: "Blog",
    resource: "blog",
    action: "read",
  },
  {
    href: "/admin/news",
    label: "News",
    resource: "news",
    action: "read",
  },
  {
    href: "/admin/services",
    label: "Services",
    resource: "services",
    action: "read",
  },
  {
    href: "/admin/messages",
    label: "Messages",
    resource: "messages",
    action: "read",
  },
  {
    href: "/admin/users",
    label: "Users",
    adminOnly: true,
  },
] as const;

function createEmptyPermissionSet(): AdminPermissionSet {
  return {
    read: false,
    create: false,
    update: false,
    delete: false,
  };
}

export function createEmptyPermissionMatrix(): AdminPermissionMatrix {
  return {
    dashboard: createEmptyPermissionSet(),
    content: createEmptyPermissionSet(),
    projects: createEmptyPermissionSet(),
    services: createEmptyPermissionSet(),
    messages: createEmptyPermissionSet(),
    blog: createEmptyPermissionSet(),
    news: createEmptyPermissionSet(),
  };
}

function createFullPermissionMatrix(): AdminPermissionMatrix {
  const matrix = createEmptyPermissionMatrix();

  ADMIN_PERMISSION_GROUPS.forEach((group) => {
    group.actions.forEach((action) => {
      matrix[group.resource][action] = true;
    });
  });

  return matrix;
}

function createPermissionMatrix(
  entries: Array<{
    resource: AdminPermissionResource;
    actions: AdminPermissionAction[];
  }>
): AdminPermissionMatrix {
  const matrix = createEmptyPermissionMatrix();

  entries.forEach((entry) => {
    entry.actions.forEach((action) => {
      matrix[entry.resource][action] = true;
    });
  });

  return matrix;
}

export const SYSTEM_ROLE_DEFINITIONS: Record<string, AdminRoleDefinition> = {
  admin: {
    id: "admin",
    name: "Admin",
    isSystem: true,
    permissions: createFullPermissionMatrix(),
  },
  editor: {
    id: "editor",
    name: "Editor",
    isSystem: true,
    permissions: createPermissionMatrix([
      { resource: "dashboard", actions: ["read"] },
      { resource: "content", actions: ["read", "update"] },
      { resource: "projects", actions: ["read", "create", "update", "delete"] },
      { resource: "services", actions: ["read", "create", "update", "delete"] },
      { resource: "messages", actions: ["read", "update", "delete"] },
    ]),
  },
  blog_manager: {
    id: "blog_manager",
    name: "Blog Manager",
    isSystem: true,
    permissions: createPermissionMatrix([
      { resource: "blog", actions: ["read", "create", "update", "delete"] },
      { resource: "news", actions: ["read", "create", "update", "delete"] },
    ]),
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isSystemRoleId(roleId: string) {
  return Object.prototype.hasOwnProperty.call(SYSTEM_ROLE_DEFINITIONS, roleId);
}

export function normalizeRoleId(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function humanizeRoleId(roleId: string) {
  return roleId
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function clonePermissionMatrix(
  matrix: AdminPermissionMatrix
): AdminPermissionMatrix {
  const next = createEmptyPermissionMatrix();

  ADMIN_PERMISSION_RESOURCES.forEach((resource) => {
    ADMIN_PERMISSION_ACTIONS.forEach((action) => {
      next[resource][action] = matrix[resource][action];
    });
  });

  return next;
}

export function normalizePermissionMatrix(
  value: unknown
): AdminPermissionMatrix {
  const normalized = createEmptyPermissionMatrix();
  const raw = isRecord(value) ? value : {};

  ADMIN_PERMISSION_RESOURCES.forEach((resource) => {
    const resourceValue = isRecord(raw[resource]) ? raw[resource] : {};

    ADMIN_PERMISSION_ACTIONS.forEach((action) => {
      normalized[resource][action] = resourceValue[action] === true;
    });
  });

  return normalized;
}

export function resolveRoleDefinition(
  roleId: string,
  value?: unknown
): AdminRoleDefinition | null {
  if (!roleId) {
    return null;
  }

  if (isSystemRoleId(roleId)) {
    const systemRole = SYSTEM_ROLE_DEFINITIONS[roleId];
    return {
      ...systemRole,
      permissions: clonePermissionMatrix(systemRole.permissions),
    };
  }

  if (!isRecord(value)) {
    return null;
  }

  const name =
    typeof value.name === "string" && value.name.trim().length > 0
      ? value.name.trim()
      : humanizeRoleId(roleId);

  return {
    id: roleId,
    name,
    isSystem: false,
    permissions: normalizePermissionMatrix(value.permissions),
  };
}

export function hasPermission(
  permissions: AdminPermissionMatrix | null | undefined,
  resource: AdminPermissionResource,
  action: AdminPermissionAction = "read"
) {
  return permissions?.[resource]?.[action] === true;
}

export function hasAnyAdminAccess(
  profile: AdminAccessProfile | null | undefined
) {
  return ADMIN_ROUTE_DEFINITIONS.some((route) => canAccessAdminRoute(profile, route.href));
}

export function canAccessAdminRoute(
  profile: AdminAccessProfile | null | undefined,
  href: string
) {
  if (!profile) {
    return false;
  }

  const route = ADMIN_ROUTE_DEFINITIONS.find((entry) => entry.href === href);

  if (!route) {
    return false;
  }

  if (profile.role === "admin") {
    return true;
  }

  if (route.adminOnly) {
    return false;
  }

  if (!route.resource || !route.action) {
    return false;
  }

  return hasPermission(profile.permissions, route.resource, route.action);
}

export function getDefaultAdminRoute(
  profile: AdminAccessProfile | null | undefined
) {
  if (!profile) {
    return "/admin/login";
  }

  const firstMatch = ADMIN_ROUTE_DEFINITIONS.find((route) =>
    canAccessAdminRoute(profile, route.href)
  );

  return firstMatch?.href ?? "/admin/login";
}
