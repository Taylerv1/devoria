const { admin, getAdminAuth, getAdminDb } = require("./firebase-admin-init");

const auth = getAdminAuth();
const db = getAdminDb();

const timestamp = () => admin.firestore.FieldValue.serverTimestamp();

// Default admin credentials
const ADMIN_EMAIL = "admin@devoria.dev";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "Admin";

// Demo data
const demoProjects = [
  {
    title: "Nexus Dashboard",
    slug: "nexus-dashboard",
    description: "A real-time analytics platform with collaborative workspaces and AI-powered insights.",
    content: "Nexus Dashboard is a comprehensive analytics solution that helps teams make data-driven decisions.",
    coverImage: "",
    images: [],
    tags: ["React", "Node.js", "PostgreSQL"],
    techStack: ["React", "Node.js", "PostgreSQL", "WebSocket"],
    category: "Web App",
    liveUrl: "https://example.com",
    githubUrl: "",
    featured: true,
    status: "published",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    title: "Pulse Commerce",
    slug: "pulse-commerce",
    description: "Headless e-commerce engine with multi-currency support and Stripe integration.",
    content: "Pulse Commerce revolutionizes online shopping with its headless architecture.",
    coverImage: "",
    images: [],
    tags: ["Next.js", "Stripe", "TypeScript"],
    techStack: ["Next.js", "Stripe", "Redis", "TypeScript"],
    category: "E-Commerce",
    liveUrl: "",
    githubUrl: "",
    featured: true,
    status: "published",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    title: "CloudSync",
    slug: "cloudsync",
    description: "Enterprise file sync with end-to-end encryption and real-time collaboration.",
    content: "CloudSync provides secure file synchronization for enterprises.",
    coverImage: "",
    images: [],
    tags: ["TypeScript", "AWS", "Electron"],
    techStack: ["TypeScript", "AWS S3", "WebRTC", "Electron"],
    category: "SaaS",
    liveUrl: "",
    githubUrl: "",
    featured: true,
    status: "published",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
];

const demoBlogPosts = [
  {
    title: "Building Scalable APIs with Node.js",
    slug: "building-scalable-apis-nodejs",
    excerpt: "Learn how to design and implement scalable REST APIs using Node.js and best practices.",
    content: "Building scalable APIs is crucial for modern web applications.\n\n## Key Topics\n\n- RESTful API design\n- Database optimization\n- Caching with Redis\n- Error handling",
    coverImage: "",
    author: "Alex Rivera",
    tags: ["Node.js", "API", "Backend"],
    status: "published",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    title: "The Future of Web Development",
    slug: "future-web-development",
    excerpt: "Exploring emerging trends and technologies that will shape web development.",
    content: "The web development landscape is evolving rapidly.\n\n## Trends\n\n- AI-powered tools\n- WebAssembly\n- Edge computing\n- Web3",
    coverImage: "",
    author: "Sam Chen",
    tags: ["WebDev", "Trends", "AI"],
    status: "published",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
];

const demoNews = [
  {
    title: "Devoria Launches AI-Powered Design Tool",
    slug: "devoria-launches-ai-design-tool",
    excerpt: "New AI-powered design tool that helps developers create stunning UIs in minutes.",
    content: "Our new AI design tool leverages machine learning to generate production-ready UI components.",
    coverImage: "",
    status: "published",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
];

const demoServices = [
  {
    title: "Web Development",
    description: "Custom web applications built with modern frameworks like React and Next.js.",
    features: ["Responsive design", "Performance optimization", "SEO-friendly", "PWA capabilities"],
    icon: "HiCode",
    order: 1,
    status: "active",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    title: "Mobile Development",
    description: "Native and cross-platform mobile apps for iOS and Android.",
    features: ["Cross-platform", "Native performance", "Offline-first", "Push notifications"],
    icon: "HiDeviceMobile",
    order: 2,
    status: "active",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    title: "UI/UX Design",
    description: "Beautiful, intuitive interfaces designed with your users in mind.",
    features: ["User research", "Wireframing", "Design systems", "Usability testing"],
    icon: "HiColorSwatch",
    order: 3,
    status: "active",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
];

async function createAdminUser() {
  try {
    // Check if user already exists
    try {
      const existingUser = await auth.getUserByEmail(ADMIN_EMAIL);
      console.log(`Admin user already exists (${existingUser.uid})`);
      return existingUser;
    } catch (error) {
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    // Create new admin user
    const userRecord = await auth.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      displayName: ADMIN_NAME,
      emailVerified: true,
    });

    await db.collection("users").doc(userRecord.uid).set({
      email: ADMIN_EMAIL,
      displayName: ADMIN_NAME,
      role: "admin",
      createdAt: timestamp(),
      updatedAt: timestamp(),
    });

    console.log(`Admin user created (${userRecord.uid})`);
    return userRecord;
  } catch (error) {
    console.error("Error creating admin:", error.message);
    throw error;
  }
}

async function seedCollection(name, items) {
  const batch = db.batch();
  for (const item of items) {
    const ref = db.collection(name).doc();
    batch.set(ref, item);
  }
  await batch.commit();
}

async function seed() {
  console.log("\n========================================");
  console.log("  Devoria Database Seed");
  console.log("========================================\n");

  try {
    // Create admin user
    console.log("Creating admin user...");
    await createAdminUser();
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}\n`);

    // Seed collections
    console.log("Seeding projects...");
    await seedCollection("projects", demoProjects);
    console.log(`  Added ${demoProjects.length} projects\n`);

    console.log("Seeding blog posts...");
    await seedCollection("blog", demoBlogPosts);
    console.log(`  Added ${demoBlogPosts.length} posts\n`);

    console.log("Seeding news...");
    await seedCollection("news", demoNews);
    console.log(`  Added ${demoNews.length} news items\n`);

    console.log("Seeding services...");
    await seedCollection("services", demoServices);
    console.log(`  Added ${demoServices.length} services\n`);

    console.log("========================================");
    console.log("  Done!");
    console.log("========================================\n");
    console.log("  Site: http://localhost:3000");
    console.log("  Admin: http://localhost:3000/admin\n");
  } catch (error) {
    console.error("\nError:", error.message);
    process.exit(1);
  }

  process.exit(0);
}

seed();
