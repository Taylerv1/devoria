import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/constants";
import { verifyFirebaseToken } from "@/lib/firebase-auth-verify";
import {
  FieldValue,
  getFirebaseAdminDb,
} from "@/lib/firebase-admin";
import {
  ADMIN_PERMISSION_GROUPS,
  AdminRoleDefinition,
  SYSTEM_ROLE_DEFINITIONS,
  hasAnyAdminAccess,
  humanizeRoleId,
  isSystemRoleId,
  normalizePermissionMatrix,
  normalizeRoleId,
  resolveRoleDefinition,
} from "@/lib/admin-permissions";

export const runtime = "nodejs";

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return { response: jsonError("Unauthorized", 401) };
  }

  const payload = await verifyFirebaseToken(sessionToken);
  const db = getFirebaseAdminDb();
  const currentUserSnapshot = await db.collection("users").doc(payload.uid).get();
  const currentUserData = currentUserSnapshot.data();

  if (!currentUserData || currentUserData.role !== "admin") {
    return { response: jsonError("Only admins can manage roles", 403) };
  }

  return { db };
}

function listSystemRoles() {
  return Object.values(SYSTEM_ROLE_DEFINITIONS).map((role) => ({
    ...role,
    permissions: normalizePermissionMatrix(role.permissions),
  }));
}

function hasAtLeastOnePermission(permissions: ReturnType<typeof normalizePermissionMatrix>) {
  return ADMIN_PERMISSION_GROUPS.some((group) =>
    group.actions.some((action) => permissions[group.resource][action])
  );
}

export async function GET() {
  try {
    const adminCheck = await requireAdmin();
    if ("response" in adminCheck) {
      return adminCheck.response;
    }

    const snapshot = await adminCheck.db.collection("roles").orderBy("name", "asc").get();
    const customRoles = snapshot.docs
      .map((doc) => resolveRoleDefinition(doc.id, doc.data()))
      .filter((role): role is AdminRoleDefinition => role !== null && !role.isSystem);

    return NextResponse.json({
      roles: [...listSystemRoles(), ...customRoles],
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("[API] List roles failed:", error);
    return jsonError(error.message || "Failed to load roles", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if ("response" in adminCheck) {
      return adminCheck.response;
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const permissions = normalizePermissionMatrix(body.permissions);

    if (name.length < 2) {
      return jsonError("Role name must be at least 2 characters.", 400);
    }

    if (!hasAtLeastOnePermission(permissions)) {
      return jsonError("Select at least one permission for the role.", 400);
    }

    const roleId = normalizeRoleId(name);

    if (!roleId) {
      return jsonError("Role name must contain letters or numbers.", 400);
    }

    if (isSystemRoleId(roleId)) {
      return jsonError("This role name is reserved by a built-in system role.", 409);
    }

    const roleRef = adminCheck.db.collection("roles").doc(roleId);
    const existingSnapshot = await roleRef.get();

    if (existingSnapshot.exists) {
      const existingRole = resolveRoleDefinition(roleId, existingSnapshot.data());
      const existingName = existingRole?.name || humanizeRoleId(roleId);
      return jsonError(`Role "${existingName}" already exists.`, 409);
    }

    const roleDefinition = resolveRoleDefinition(roleId, {
      name,
      permissions,
      isSystem: false,
    });

    if (!roleDefinition || !hasAnyAdminAccess({
      role: roleId,
      permissions: roleDefinition.permissions,
    })) {
      return jsonError("The role must be able to access at least one admin page.", 400);
    }

    await roleRef.set({
      name: roleDefinition.name,
      isSystem: false,
      permissions: roleDefinition.permissions,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      {
        success: true,
        role: roleDefinition,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("[API] Create role failed:", error);
    return jsonError(error.message || "Failed to create role", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if ("response" in adminCheck) {
      return adminCheck.response;
    }

    const body = await request.json();
    const roleId = typeof body.id === "string" ? body.id.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const permissions = normalizePermissionMatrix(body.permissions);

    if (!roleId) {
      return jsonError("Role ID is required.", 400);
    }

    if (isSystemRoleId(roleId)) {
      return jsonError("System roles cannot be modified.", 403);
    }

    if (name.length < 2) {
      return jsonError("Role name must be at least 2 characters.", 400);
    }

    if (!hasAtLeastOnePermission(permissions)) {
      return jsonError("Select at least one permission for the role.", 400);
    }

    const roleRef = adminCheck.db.collection("roles").doc(roleId);
    const existingSnapshot = await roleRef.get();

    if (!existingSnapshot.exists) {
      return jsonError("Role not found.", 404);
    }

    const roleDefinition = resolveRoleDefinition(roleId, {
      name,
      permissions,
      isSystem: false,
    });

    if (!roleDefinition || !hasAnyAdminAccess({
      role: roleId,
      permissions: roleDefinition.permissions,
    })) {
      return jsonError("The role must be able to access at least one admin page.", 400);
    }

    await roleRef.update({
      name: roleDefinition.name,
      permissions: roleDefinition.permissions,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      role: roleDefinition,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("[API] Update role failed:", error);
    return jsonError(error.message || "Failed to update role", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if ("response" in adminCheck) {
      return adminCheck.response;
    }

    const body = await request.json();
    const roleId = typeof body.id === "string" ? body.id.trim() : "";

    if (!roleId) {
      return jsonError("Role ID is required.", 400);
    }

    if (isSystemRoleId(roleId)) {
      return jsonError("System roles cannot be deleted.", 403);
    }

    const roleRef = adminCheck.db.collection("roles").doc(roleId);
    const existingSnapshot = await roleRef.get();

    if (!existingSnapshot.exists) {
      return jsonError("Role not found.", 404);
    }

    // Check if any users are using this role
    const usersWithRole = await adminCheck.db
      .collection("users")
      .where("role", "==", roleId)
      .limit(1)
      .get();

    if (!usersWithRole.empty) {
      return jsonError(
        "Cannot delete this role because it is assigned to one or more users. Reassign them first.",
        409
      );
    }

    await roleRef.delete();

    return NextResponse.json({
      success: true,
      deletedId: roleId,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("[API] Delete role failed:", error);
    return jsonError(error.message || "Failed to delete role", 500);
  }
}
