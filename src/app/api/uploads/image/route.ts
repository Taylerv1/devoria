import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { SESSION_COOKIE } from "@/lib/constants";
import { verifyFirebaseToken } from "@/lib/firebase-auth-verify";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const VALID_ROLES = ["admin", "editor", "blog_manager"] as const;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function sanitizeFolder(value: string) {
  const cleaned = value.replace(/[^a-zA-Z0-9/_-]/g, "").replace(/^\/+|\/+$/g, "");
  return cleaned || "uploads";
}

function sanitizeFilename(value: string) {
  const cleaned = value
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "image";
}

async function requirePanelUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return { response: jsonError("Unauthorized", 401) };
  }

  const payload = await verifyFirebaseToken(sessionToken);
  const db = getFirebaseAdminDb();
  const currentUserSnapshot = await db.collection("users").doc(payload.uid).get();
  const currentUser = currentUserSnapshot.data() as { role?: string } | undefined;

  if (!currentUser?.role || !(VALID_ROLES as readonly string[]).includes(currentUser.role)) {
    return { response: jsonError("Only admin panel users can upload images", 403) };
  }

  return { role: currentUser.role };
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requirePanelUser();
    if ("response" in authCheck) {
      return authCheck.response;
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const storageBucket = process.env.SUPABASE_STORAGE_BUCKET;

    if (!supabaseUrl || !supabaseServiceRoleKey || !storageBucket) {
      return jsonError(
        "Supabase Storage is not configured. Add SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET.",
        500
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const formData = await request.formData();
    const file = formData.get("file");
    const folderValue = formData.get("folder");
    const folder =
      typeof folderValue === "string" && folderValue.trim().length > 0
        ? sanitizeFolder(folderValue)
        : "uploads";

    if (!(file instanceof File)) {
      return jsonError("Image file is required.", 400);
    }

    if (!file.type.startsWith("image/")) {
      return jsonError("Only image uploads are allowed.", 400);
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return jsonError("Image is too large. Maximum size is 10 MB.", 400);
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const safeName = sanitizeFilename(file.name);
    const path = `devoria/${folder}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(storageBucket)
      .upload(path, fileBuffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return jsonError(uploadError.message || "Failed to upload image to Supabase.", 500);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(storageBucket).getPublicUrl(path);

    if (!publicUrl) {
      return jsonError("Image uploaded, but public URL could not be generated.", 500);
    }

    return NextResponse.json({ url: publicUrl });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("[API] Image upload failed:", error);
    return jsonError(error.message || "Failed to upload image.", 500);
  }
}
