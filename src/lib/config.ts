import { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  name: "Devoria",
  description:
    "Modern developer studio crafting exceptional digital experiences.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  navLinks: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Projects", href: "/projects" },
    { label: "Blog", href: "/blog" },
    { label: "News", href: "/news" },
    { label: "Contact", href: "/contact" },
  ],
};
