import Link from "next/link";
import Button from "@/components/ui/Button";
import { HiArrowRight } from "react-icons/hi";

export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background gradient effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-primary)] opacity-[0.07] blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-[var(--color-accent)] opacity-[0.05] blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl py-16 text-center sm:py-20 lg:py-24">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] px-4 py-1.5 text-sm text-[var(--color-text-muted)]">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
          We&apos;re building the future
        </div>

        <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-7xl">
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

        {/* Stats */}
        <div className="mt-14 grid grid-cols-2 gap-6 border-t border-[var(--color-dark-border)] pt-8 sm:mt-16 sm:gap-8 sm:pt-10 md:grid-cols-4">
          {[
            { value: "50+", label: "Projects Delivered" },
            { value: "30+", label: "Happy Clients" },
            { value: "5+", label: "Years Experience" },
            { value: "99%", label: "Client Satisfaction" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</div>
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
