"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { siteConfig } from "@/lib/config";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import devoriaLogo from "../../../devoriaLogo.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-dark-border)] bg-[var(--color-dark)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="relative -ml-7 block h-12 w-52 shrink-0 overflow-hidden sm:ml-0">
          <Image
            src={devoriaLogo}
            alt="Devoria"
            fill
            sizes="208px"
            priority
            className="object-cover [object-position:50%_45%]"
          />
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 lg:flex">
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="ml-2 rounded-lg bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white transition-all hover:bg-[var(--color-primary-light)]"
          >
            Get in Touch
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="text-2xl text-white lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <HiX /> : <HiMenuAlt3 />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[var(--color-dark-border)] bg-[var(--color-dark)] px-4 pb-6 pt-4 sm:px-6 lg:hidden">
          <div className="flex flex-col gap-1">
            {siteConfig.navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-3 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-center text-sm font-medium text-white"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
