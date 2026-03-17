import Link from "next/link";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import { HiArrowRight } from "react-icons/hi";

export default function CTASection() {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-2xl border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] p-8 text-center sm:rounded-3xl sm:p-12 md:p-20">
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-primary)] opacity-[0.08] blur-[80px]" />
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            Ready to Build Something Great?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[var(--color-text-muted)]">
            Let&apos;s collaborate and turn your vision into a product that users
            love. Reach out and start the conversation.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/contact">
              <Button size="lg">
                Get in Touch <HiArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
