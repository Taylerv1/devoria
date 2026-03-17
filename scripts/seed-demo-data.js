const { admin, getAdminDb } = require("./firebase-admin-init");

const db = getAdminDb();

const timestamp = () => admin.firestore.FieldValue.serverTimestamp();

const demoProjects = [
  {
    title: "Nexus Dashboard",
    slug: "nexus-dashboard",
    description:
      "A real-time analytics platform with collaborative workspaces, AI-powered insights, and customizable dashboards.",
    content:
      "Nexus Dashboard is a comprehensive analytics solution that helps teams make data-driven decisions. Built with modern technologies and scalable architecture.",
    coverImage: "",
    images: [],
    tags: ["React", "Node.js", "PostgreSQL", "WebSocket"],
    techStack: ["React", "Node.js", "PostgreSQL", "WebSocket", "Redis"],
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
    description:
      "Headless e-commerce engine supporting multi-currency, global storefronts, and seamless Stripe integration.",
    content:
      "Pulse Commerce revolutionizes online shopping with its headless architecture, allowing businesses to create unique shopping experiences.",
    coverImage: "",
    images: [],
    tags: ["Next.js", "Stripe", "Redis", "TypeScript"],
    techStack: ["Next.js", "Stripe", "Redis", "TypeScript", "Tailwind"],
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
    description:
      "Enterprise file sync with end-to-end encryption, real-time collaboration, and version history.",
    content:
      "CloudSync provides secure file synchronization for enterprises, with military-grade encryption and real-time collaboration features.",
    coverImage: "",
    images: [],
    tags: ["TypeScript", "AWS", "WebRTC", "Electron"],
    techStack: ["TypeScript", "AWS S3", "WebRTC", "Electron", "Node.js"],
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
    excerpt:
      "Learn how to design and implement scalable REST APIs using Node.js, Express, and best practices from the industry.",
    content: `Building scalable APIs is crucial for modern web applications. In this comprehensive guide, we'll explore architectural patterns, caching strategies, and performance optimization techniques.

## Key Topics Covered

- RESTful API design principles
- Database optimization and indexing
- Caching with Redis
- Rate limiting and security
- Error handling best practices
- Testing and documentation

Let's dive into each topic in detail...`,
    coverImage: "",
    author: "Alex Rivera",
    tags: ["Node.js", "API", "Backend", "Performance"],
    status: "published",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    title: "The Future of Web Development in 2026",
    slug: "future-web-development-2026",
    excerpt:
      "Exploring emerging trends, technologies, and paradigm shifts that will shape the future of web development.",
    content: `The web development landscape is evolving rapidly. Let's explore the trends that will dominate in 2026 and beyond.

## Emerging Technologies

- AI-powered development tools
- WebAssembly adoption
- Edge computing and serverless
- Web3 and decentralized apps

The future is exciting, and developers need to stay ahead of the curve...`,
    coverImage: "",
    author: "Sam Chen",
    tags: ["WebDev", "Trends", "Future", "AI"],
    status: "published",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
];

const demoNews = [
  {
    title: "Devoria Launches AI-Powered Design Tool",
    slug: "devoria-launches-ai-design-tool",
    excerpt:
      "We're excited to announce the release of our new AI-powered design tool that helps developers create stunning UIs in minutes.",
    content:
      "Our new AI design tool leverages machine learning to generate production-ready UI components based on your requirements.",
    coverImage: "",
    status: "published",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    title: "Partnership with Leading Cloud Provider",
    slug: "partnership-cloud-provider",
    excerpt:
      "Devoria partners with a major cloud infrastructure provider to offer enhanced services to our clients.",
    content:
      "This strategic partnership allows us to deliver faster, more reliable solutions with enterprise-grade infrastructure.",
    coverImage: "",
    status: "published",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
];

const demoServices = [
  {
    title: "Web Development",
    description:
      "Custom web applications built with modern frameworks like React, Next.js, and Vue.js.",
    features: [
      "Responsive design",
      "Performance optimization",
      "SEO-friendly architecture",
      "PWA capabilities",
    ],
    icon: "HiCode",
    order: 1,
    status: "active",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    title: "Mobile Development",
    description:
      "Native and cross-platform mobile apps for iOS and Android using React Native and Flutter.",
    features: [
      "Cross-platform development",
      "Native performance",
      "Offline-first architecture",
      "Push notifications",
    ],
    icon: "HiDeviceMobile",
    order: 2,
    status: "active",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    title: "UI/UX Design",
    description: "Beautiful, intuitive interfaces designed with your users in mind.",
    features: [
      "User research",
      "Wireframing & prototyping",
      "Design systems",
      "Usability testing",
    ],
    icon: "HiColorSwatch",
    order: 3,
    status: "active",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    title: "Cloud Solutions",
    description:
      "Scalable cloud infrastructure on AWS, Google Cloud, and Azure.",
    features: [
      "Infrastructure as Code",
      "Auto-scaling",
      "Load balancing",
      "Disaster recovery",
    ],
    icon: "HiCloud",
    order: 4,
    status: "active",
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
];

async function seedCollection(collectionName, items) {
  for (const item of items) {
    await db.collection(collectionName).add(item);
  }
}

async function seedData() {
  try {
    console.log("\nSeeding demo data to Firestore...\n");
    console.log("====================================\n");

    console.log("Adding projects...");
    await seedCollection("projects", demoProjects);
    console.log(`Added ${demoProjects.length} projects\n`);

    console.log("Adding blog posts...");
    await seedCollection("blog", demoBlogPosts);
    console.log(`Added ${demoBlogPosts.length} blog posts\n`);

    console.log("Adding news items...");
    await seedCollection("news", demoNews);
    console.log(`Added ${demoNews.length} news items\n`);

    console.log("Adding services...");
    await seedCollection("services", demoServices);
    console.log(`Added ${demoServices.length} services\n`);

    console.log("====================================");
    console.log("Demo data seeded successfully.\n");
    console.log("Visit your site:");
    console.log("  - http://localhost:3000");
    console.log("  - http://localhost:3000/admin\n");
  } catch (error) {
    console.error("\nError seeding data:", error.message);
  } finally {
    process.exit();
  }
}

seedData();
