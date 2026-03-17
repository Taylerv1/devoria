import { existsSync, readFileSync } from "fs";
import path from "path";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

interface ServiceAccountShape {
  project_id?: string;
  client_email?: string;
  private_key?: string;
}

function loadServiceAccountFromEnv() {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ??
    process.env.GOOGLE_CLOUD_PROJECT ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

function loadServiceAccountFromFile() {
  const filePath = path.join(process.cwd(), "service-account-key.json");

  if (!existsSync(filePath)) {
    return null;
  }

  const raw = JSON.parse(readFileSync(filePath, "utf8")) as ServiceAccountShape;

  if (!raw.project_id || !raw.client_email || !raw.private_key) {
    throw new Error(
      "service-account-key.json is missing project_id, client_email, or private_key."
    );
  }

  return {
    projectId: raw.project_id,
    clientEmail: raw.client_email,
    privateKey: raw.private_key,
  };
}

function getServiceAccount() {
  return loadServiceAccountFromEnv() ?? loadServiceAccountFromFile();
}

function initializeFirebaseAdminApp() {
  const serviceAccount = getServiceAccount();

  if (!serviceAccount) {
    throw new Error(
      "Firebase Admin credentials are missing. Add service-account-key.json or FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY."
    );
  }

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export function getFirebaseAdminApp() {
  return getApps().length ? getApp() : initializeFirebaseAdminApp();
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getFirebaseAdminDb() {
  return getFirestore(getFirebaseAdminApp());
}

export { FieldValue };
