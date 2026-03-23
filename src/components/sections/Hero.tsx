"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import Button from "@/components/ui/Button";
import HeroVisualFallback from "@/components/three/hero/HeroVisualFallback";
import { HiArrowRight } from "react-icons/hi";

const HeroVisual = dynamic(() => import("@/components/three/hero/HeroVisual"), {
  ssr: false,
  loading: () => <HeroVisualFallback />,
});

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-[var(--color-dark)] px-4 sm:px-6 lg:px-8">
      <HeroVisual />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(237,234,229,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(237,234,229,.08) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(22,22,22,0.08)_0%,rgba(22,22,22,0.18)_35%,rgba(22,22,22,0.88)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[14%] mx-auto h-64 max-w-4xl rounded-full bg-[radial-gradient(circle,rgba(219,212,204,0.12)_0%,rgba(22,22,22,0)_72%)] blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl py-16 text-center sm:py-20 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-dark-border)] bg-[rgba(31,33,28,0.76)] px-4 py-1.5 text-sm text-[var(--color-text-muted)] backdrop-blur-md">
            <span className="motion-safe:animate-pulse h-2 w-2 rounded-full bg-[var(--color-accent)]" />
            We&apos;re building the future
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-[var(--color-text)] sm:text-5xl md:text-7xl">
            We Build{" "}
            <span className="bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-accent)] bg-clip-text text-transparent">
              Digital Products
            </span>{" "}
            That Matter
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-text-muted)] sm:mt-6 sm:text-lg md:text-xl">
            Devoria is a modern developer studio that turns bold ideas into
            exceptional software. From web apps to cloud infrastructure, we
            deliver end-to-end solutions.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <Link href="/projects">
              <Button size="lg">
                View Our Work <HiArrowRight />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                Start a Project
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-6 border-t border-[var(--color-dark-border)] pt-8 sm:mt-16 sm:gap-8 sm:pt-10 md:grid-cols-4">
          {[
            { value: "50+", label: "Projects Delivered" },
            { value: "30+", label: "Happy Clients" },
            { value: "5+", label: "Years Experience" },
            { value: "99%", label: "Client Satisfaction" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">{stat.value}</div>
              <div className="mt-1 text-xs text-[var(--color-text-muted)] sm:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
