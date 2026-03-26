import Link from "next/link";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import { DEFAULT_HOME_PAGE_CONTENT, HomeCtaContent } from "@/lib/site-content";
import { HiArrowRight } from "react-icons/hi";

interface CTASectionProps {
  content?: HomeCtaContent;
}

export default function CTASection({
  content = DEFAULT_HOME_PAGE_CONTENT.cta,
}: CTASectionProps) {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-2xl border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] p-8 text-center sm:rounded-3xl sm:p-12 md:p-20">
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-primary)] opacity-[0.08] blur-[80px]" />
        </div>

        <div className="relative z-10">
          {content.title ? (
            <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              {content.title}
            </h2>
          ) : null}
          {content.description ? (
            <p className="mx-auto mt-4 max-w-lg text-[var(--color-text-muted)]">
              {content.description}
            </p>
          ) : null}
          {content.buttonLabel && content.buttonHref ? (
            <div className="mt-8 flex justify-center gap-4">
              <Link href={content.buttonHref}>
                <Button size="lg">
                  {content.buttonLabel} <HiArrowRight />
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
