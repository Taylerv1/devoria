import { Timestamp } from "firebase/firestore";

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImage: string;
  images: string[];
  tags: string[];
  techStack: string[];
  category: string;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  status: "draft" | "published";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  tags: string[];
  status: "draft" | "published";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  status: "draft" | "published";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  order: number;
  status: "active" | "inactive";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  source?: "contact" | "project_interest";
  projectTitle?: string | null;
  projectSlug?: string | null;
  createdAt: Timestamp;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string | null;
  role: "admin" | "editor" | "blog_manager";
  photoURL?: string;
  createdAt: Timestamp;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  navLinks: NavLink[];
}
