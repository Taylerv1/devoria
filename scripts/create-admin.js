const readline = require("readline");
const { admin, getAdminAuth, getAdminDb } = require("./firebase-admin-init");

const auth = getAdminAuth();
const db = getAdminDb();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function createAdmin() {
  try {
    console.log("\nCreate Admin User for Devoria\n");
    console.log("====================================\n");

    const email = await question("Enter admin email: ");
    const password = await question("Enter admin password (min 6 chars): ");
    const displayName = await question("Enter display name: ");

    if (!email || !password || password.length < 6) {
      console.error(
        "Invalid input. Email is required and password must be at least 6 characters."
      );
      return;
    }

    console.log("\nCreating admin user...\n");

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: displayName || "Admin",
      emailVerified: true,
    });

    await db.collection("users").doc(userRecord.uid).set({
      email,
      displayName: displayName || "Admin",
      role: "admin",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("====================================");
    console.log("Admin user created successfully.\n");
    console.log(`Email: ${email}`);
    console.log(`UID: ${userRecord.uid}`);
    console.log("Role: admin");
    console.log("\nLogin URL: http://localhost:3000/admin/login\n");
  } catch (error) {
    console.error("\nError creating admin user:", error.message);

    if (error.code === "auth/email-already-exists") {
      console.log(
        "\nThis email already exists. Use a different email or delete the existing user first."
      );
    }
  } finally {
    rl.close();
    process.exit();
  }
}

createAdmin();
