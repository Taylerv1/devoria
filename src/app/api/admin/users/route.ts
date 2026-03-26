import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/constants";
import { verifyFirebaseToken } from "@/lib/firebase-auth-verify";
import {
  FieldValue,
  getFirebaseAdminAuth,
  getFirebaseAdminDb,
} from "@/lib/firebase-admin";
import {
  AdminRoleDefinition,
  SYSTEM_ROLE_DEFINITIONS,
  humanizeRoleId,
  isSystemRoleId,
  resolveRoleDefinition,
} from "@/lib/admin-permissions";

export const runtime = "nodejs";

interface ApiUser {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  roleName: string;
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toApiUser(
  id: string,
  data: Record<string, unknown> | undefined,
  roleNameMap: Map<string, string>
): ApiUser | null {
  const roleId = typeof data?.role === "string" ? data.role.trim() : "";

  if (!data || !roleId) {
    return null;
  }

  return {
    id,
    email: typeof data.email === "string" ? data.email : "",
    displayName:
      typeof data.displayName === "string" ? data.displayName : null,
    role: roleId,
    roleName: roleNameMap.get(roleId) ?? humanizeRoleId(roleId),
  };
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
  const currentRole = currentUserSnapshot.data()?.role;

  if (currentRole !== "admin") {
    return { response: jsonError("Only admins can manage users", 403) };
  }

  return {
    db,
    currentUserId: payload.uid,
  };
}

async function getRoleNameMap(db: ReturnType<typeof getFirebaseAdminDb>) {
  const map = new Map<string, string>();

  Object.values(SYSTEM_ROLE_DEFINITIONS).forEach((role) => {
    map.set(role.id, role.name);
  });

  const snapshot = await db.collection("roles").get();
  snapshot.docs.forEach((doc) => {
    const role = resolveRoleDefinition(doc.id, doc.data());
    if (role) {
      map.set(role.id, role.name);
    }
  });

  return map;
}

async function getRoleDefinitionById(
  db: ReturnType<typeof getFirebaseAdminDb>,
  roleId: string
): Promise<AdminRoleDefinition | null> {
  if (!roleId) {
    return null;
  }

  if (isSystemRoleId(roleId)) {
    return resolveRoleDefinition(roleId, SYSTEM_ROLE_DEFINITIONS[roleId]);
  }

  const snapshot = await db.collection("roles").doc(roleId).get();

  if (!snapshot.exists) {
    return null;
  }

  return resolveRoleDefinition(roleId, snapshot.data());
}

export async function GET() {
  try {
    const adminCheck = await requireAdmin();
    if ("response" in adminCheck) {
      return adminCheck.response;
    }

    const [usersSnapshot, roleNameMap] = await Promise.all([
      adminCheck.db.collection("users").orderBy("createdAt", "desc").get(),
      getRoleNameMap(adminCheck.db),
    ]);

    const users = usersSnapshot.docs
      .map((doc) =>
        toApiUser(
          doc.id,
          doc.data() as Record<string, unknown> | undefined,
          roleNameMap
        )
      )
      .filter((user): user is ApiUser => user !== null);

    return NextResponse.json({ users });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("[API] List users failed:", error);
    return jsonError(error.message || "Failed to load users", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if ("response" in adminCheck) {
      return adminCheck.response;
    }

    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const roleId = typeof body.role === "string" ? body.role.trim() : "";
    const roleDefinition = await getRoleDefinitionById(adminCheck.db, roleId);

    if (!email || password.length < 6 || !roleDefinition) {
      return jsonError(
        "Invalid input. Email, password (min 6 chars), and a valid role are required.",
        400
      );
    }

    const normalizedDisplayName =
      typeof body.displayName === "string" && body.displayName.trim().length > 0
        ? body.displayName.trim()
        : null;

    const userRecord = await getFirebaseAdminAuth().createUser({
      email,
      password,
      displayName: normalizedDisplayName,
    });

    await adminCheck.db.collection("users").doc(userRecord.uid).set({
      email: userRecord.email ?? email,
      role: roleId,
      displayName: normalizedDisplayName,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: userRecord.uid,
          email: userRecord.email ?? email,
          role: roleId,
          roleName: roleDefinition.name,
          displayName: normalizedDisplayName,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error("[API] Create user failed:", error);

    if (error.code === "auth/email-already-exists") {
      return jsonError("Email already exists", 409);
    }

    return jsonError(error.message || "Failed to create user", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if ("response" in adminCheck) {
      return adminCheck.response;
    }

    const body = await request.json();
    const uid = typeof body.uid === "string" ? body.uid.trim() : "";
    const roleId = typeof body.role === "string" ? body.role.trim() : "";
    const roleDefinition = await getRoleDefinitionById(adminCheck.db, roleId);
    const password = typeof body.password === "string" ? body.password : "";

    if (!uid || !roleDefinition) {
      return jsonError("User ID and a valid role are required.", 400);
    }

    if (password.length > 0 && password.length < 6) {
      return jsonError("Password must be at least 6 characters.", 400);
    }

    if (uid === adminCheck.currentUserId && roleId !== "admin") {
      return jsonError("You cannot remove the admin role from your own account.", 400);
    }

    const userRef = adminCheck.db.collection("users").doc(uid);
    const existingSnapshot = await userRef.get();

    if (!existingSnapshot.exists) {
      return jsonError("User not found", 404);
    }

    const normalizedDisplayName =
      typeof body.displayName === "string" && body.displayName.trim().length > 0
        ? body.displayName.trim()
        : null;

    const updatePayload: {
      displayName: string | null;
      password?: string;
    } = {
      displayName: normalizedDisplayName,
    };

    if (password.length >= 6) {
      updatePayload.password = password;
    }

    await getFirebaseAdminAuth().updateUser(uid, updatePayload);
    await userRef.update({
      role: roleId,
      displayName: normalizedDisplayName,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const existingData = existingSnapshot.data();

    return NextResponse.json({
      success: true,
      user: {
        id: uid,
        email:
          typeof existingData?.email === "string" ? existingData.email : "",
        displayName: normalizedDisplayName,
        role: roleId,
        roleName: roleDefinition.name,
      },
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("[API] Update user failed:", error);
    return jsonError(error.message || "Failed to update user", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if ("response" in adminCheck) {
      return adminCheck.response;
    }

    const body = await request.json();
    const uid = typeof body.uid === "string" ? body.uid.trim() : "";

    if (!uid) {
      return jsonError("User ID is required.", 400);
    }

    if (uid === adminCheck.currentUserId) {
      return jsonError("You cannot delete your own admin account.", 400);
    }

    const userRef = adminCheck.db.collection("users").doc(uid);
    const existingSnapshot = await userRef.get();

    if (!existingSnapshot.exists) {
      return jsonError("User not found", 404);
    }

    const previousData = existingSnapshot.data();
    await userRef.delete();

    try {
      await getFirebaseAdminAuth().deleteUser(uid);
    } catch (authError) {
      if (isRecord(previousData)) {
        await userRef.set(previousData);
      }
      throw authError;
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("[API] Delete user failed:", error);
    return jsonError(error.message || "Failed to delete user", 500);
  }
}
