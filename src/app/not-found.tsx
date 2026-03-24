import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import {
  HiArrowLeft,
  HiArrowRight,
  HiOutlineExclamationCircle,
} from "react-icons/hi";

export default function RootNotFoundPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--color-dark)] pt-16">
        <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,178,138,0.16),transparent_28%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.05),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.015),transparent_35%)]" />
          <div className="pointer-events-none absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,178,138,0.12),transparent_68%)] blur-3xl" />

          <div className="relative mx-auto max-w-6xl">
            <div className="overflow-hidden rounded-[32px] border border-[var(--color-dark-border)] bg-[linear-gradient(145deg,rgba(31,33,28,0.98),rgba(22,23,21,0.96))] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
              <div className="grid gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:px-14 lg:py-16">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.28em] text-[var(--color-primary-light)]">
                    <HiOutlineExclamationCircle className="text-sm" />
                    Not Found
                  </div>

                  <p className="mt-8 text-6xl font-semibold leading-none text-white/10 sm:text-7xl md:text-8xl">
                    404
                  </p>

                  <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
                    This page wandered off the map
                  </h1>

                  <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[var(--color-text-muted)] sm:text-base">
                    The page you tried to reach doesn&apos;t exist, may have moved,
                    or the URL might be incorrect. Let&apos;s get you back to a useful
                    place.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link href="/">
                      <Button>
                        Go Home
                        <HiArrowRight />
                      </Button>
                    </Link>
                    <Link href="/projects">
                      <Button variant="ghost">
                        View Projects
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-black/10 p-5 backdrop-blur sm:p-6">
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-primary-light)]">
                    Quick Recovery
                  </p>

                  <div className="mt-5 space-y-3">
                    <Link
                      href="/services"
                      className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)]/30 hover:text-white"
                    >
                      <span>Explore our services</span>
                      <HiArrowRight className="text-base" />
                    </Link>
                    <Link
                      href="/blog"
                      className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)]/30 hover:text-white"
                    >
                      <span>Read the latest from our blog</span>
                      <HiArrowRight className="text-base" />
                    </Link>
                    <Link
                      href="/contact"
                      className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)]/30 hover:text-white"
                    >
                      <span>Get in touch with our team</span>
                      <HiArrowRight className="text-base" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
