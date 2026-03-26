import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/config";
import { getContactPageContent } from "@/lib/site-content.server";
import { HiHeart } from "react-icons/hi";
import devoriaLogo from "../../../devoriaLogo.png";

export default async function Footer() {
  const content = await getContactPageContent();

  return (
    <footer className="border-t border-[var(--color-dark-border)] bg-[var(--color-dark)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="relative block h-12 w-52 overflow-hidden">
              <Image
                src={devoriaLogo}
                alt="Devoria"
                fill
                sizes="208px"
                className="object-cover [object-position:50%_45%] -translate-x-[20%]"
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
              Crafting exceptional digital experiences with modern technology and
              creative innovation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <div className="flex flex-col gap-3">
              {siteConfig.navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary-light)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Services
            </h4>
            <div className="flex flex-col gap-3 text-sm text-[var(--color-text-muted)]">
              <span>Web Development</span>
              <span>Mobile Apps</span>
              <span>UI/UX Design</span>
              <span>Cloud Solutions</span>
              <span>Consulting</span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {content.footerTitle}
            </h4>
            <div className="flex flex-col gap-3 text-sm text-[var(--color-text-muted)]">
              {content.email.value ? (
                <a
                  href={`mailto:${content.email.value}`}
                  className="transition-colors hover:text-[var(--color-primary-light)]"
                >
                  {content.email.value}
                </a>
              ) : null}
              {content.phone.value ? (
                <a
                  href={`tel:${content.phone.value.replace(/\s+/g, "")}`}
                  className="transition-colors hover:text-[var(--color-primary-light)]"
                >
                  {content.phone.value}
                </a>
              ) : null}
              {content.location.value ? <span>{content.location.value}</span> : null}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-dark-border)] pt-8 md:flex-row">
          <p className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
            &copy; {new Date().getFullYear()} Devoria. Built with{" "}
            <HiHeart className="text-[var(--color-primary-light)]" /> and code.
          </p>
          <div className="flex gap-6 text-sm text-[var(--color-text-muted)]">
            <Link href="#" className="hover:text-white">
              Twitter
            </Link>
            <Link href="#" className="hover:text-white">
              GitHub
            </Link>
            <Link href="#" className="hover:text-white">
              LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
