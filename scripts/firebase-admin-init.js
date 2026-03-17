const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

function loadServiceAccountFromEnv() {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n")
    : null;

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

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));

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
  return loadServiceAccountFromEnv() || loadServiceAccountFromFile();
}

function initializeAdminApp() {
  if (admin.apps.length) {
    return admin.app();
  }

  const serviceAccount = getServiceAccount();

  if (!serviceAccount) {
    throw new Error(
      "Firebase Admin credentials are missing. Add service-account-key.json or FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY."
    );
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

function getAdminAuth() {
  initializeAdminApp();
  return admin.auth();
}

function getAdminDb() {
  initializeAdminApp();
  return admin.firestore();
}

module.exports = {
  admin,
  getAdminAuth,
  getAdminDb,
};
