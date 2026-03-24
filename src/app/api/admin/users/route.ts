import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/constants";
import { verifyFirebaseToken } from "@/lib/firebase-auth-verify";
import {
  FieldValue,
  getFirebaseAdminAuth,
  getFirebaseAdminDb,
} from "@/lib/firebase-admin";

export const runtime = "nodejs";

const VALID_ROLES = ["admin", "editor", "blog_manager"] as const;

type UserRole = (typeof VALID_ROLES)[number];

interface ApiUser {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
}

function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    (VALID_ROLES as readonly string[]).includes(value)
  );
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function toApiUser(
  id: string,
  data: Record<string, unknown> | undefined
): ApiUser | null {
  if (!data || !isUserRole(data.role)) {
    return null;
  }

  return {
    id,
    email: typeof data.email === "string" ? data.email : "",
    displayName:
      typeof data.displayName === "string" ? data.displayName : null,
    role: data.role,
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
  const currentUser = toApiUser(
    currentUserSnapshot.id,
    currentUserSnapshot.data() as Record<string, unknown> | undefined
  );

  if (!currentUser || currentUser.role !== "admin") {
    return { response: jsonError("Only admins can manage users", 403) };
  }

  return { db, currentUser };
}

export async function GET() {
  try {
    const adminCheck = await requireAdmin();
    if ("response" in adminCheck) {
      return adminCheck.response;
    }

    const snapshot = await adminCheck.db
      .collection("users")
      .orderBy("createdAt", "desc")
      .get();

    const users = snapshot.docs
      .map((doc) =>
        toApiUser(doc.id, doc.data() as Record<string, unknown> | undefined)
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
    const { email, password, role, displayName } = body;
    const normalizedEmail = typeof email === "string" ? email.trim() : "";

    if (
      !normalizedEmail ||
      typeof password !== "string" ||
      password.length < 6 ||
      !isUserRole(role)
    ) {
      return jsonError(
        "Invalid input. Email, password (min 6 chars), and valid role required.",
        400
      );
    }

    const normalizedDisplayName =
      typeof displayName === "string" && displayName.trim().length > 0
        ? displayName.trim()
        : null;

    const userRecord = await getFirebaseAdminAuth().createUser({
      email: normalizedEmail,
      password,
      displayName: normalizedDisplayName,
    });

    await adminCheck.db
      .collection("users")
      .doc(userRecord.uid)
      .set({
        email: userRecord.email ?? normalizedEmail,
        role,
        displayName: normalizedDisplayName,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: userRecord.uid,
          email: userRecord.email ?? normalizedEmail,
          role,
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
    const { uid, role, displayName, password } = body;

    if (typeof uid !== "string" || !uid || !isUserRole(role)) {
      return jsonError("User ID and a valid role are required.", 400);
    }

    if (
      typeof password === "string" &&
      password.length > 0 &&
      password.length < 6
    ) {
      return jsonError("Password must be at least 6 characters.", 400);
    }

    if (uid === adminCheck.currentUser.id && role !== "admin") {
      return jsonError("You cannot remove the admin role from your own account.", 400);
    }

    const userRef = adminCheck.db.collection("users").doc(uid);
    const existingSnapshot = await userRef.get();

    if (!existingSnapshot.exists) {
      return jsonError("User not found", 404);
    }

    const existingUser = toApiUser(
      existingSnapshot.id,
      existingSnapshot.data() as Record<string, unknown> | undefined
    );

    if (!existingUser) {
      return jsonError("User profile is invalid", 400);
    }

    const normalizedDisplayName =
      typeof displayName === "string" && displayName.trim().length > 0
        ? displayName.trim()
        : null;

    const updatePayload: {
      displayName: string | null;
      password?: string;
    } = {
      displayName: normalizedDisplayName,
    };

    if (typeof password === "string" && password.length >= 6) {
      updatePayload.password = password;
    }

    await getFirebaseAdminAuth().updateUser(uid, updatePayload);

    await userRef.update({
      role,
      displayName: normalizedDisplayName,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      user: {
        ...existingUser,
        role,
        displayName: normalizedDisplayName,
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
    const { uid } = body;

    if (typeof uid !== "string" || !uid) {
      return jsonError("User ID is required.", 400);
    }

    if (uid === adminCheck.currentUser.id) {
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
      if (previousData) {
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
