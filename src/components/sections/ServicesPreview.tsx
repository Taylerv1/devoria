"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useFirestore } from "@/hooks/useFirestore";
import { orderBy, where } from "firebase/firestore";
import { Service } from "@/types";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import {
  HiArrowRight,
  HiCode,
  HiDeviceMobile,
  HiColorSwatch,
  HiCloud,
  HiLightningBolt,
  HiShieldCheck,
  HiDatabase,
  HiChatAlt2,
  HiCog,
  HiGlobe,
} from "react-icons/hi";

const ICON_MAP: Record<string, ReactNode> = {
  HiCode: <HiCode className="text-xl" />,
  HiDeviceMobile: <HiDeviceMobile className="text-xl" />,
  HiColorSwatch: <HiColorSwatch className="text-xl" />,
  HiCloud: <HiCloud className="text-xl" />,
  HiLightningBolt: <HiLightningBolt className="text-xl" />,
  HiShieldCheck: <HiShieldCheck className="text-xl" />,
  HiDatabase: <HiDatabase className="text-xl" />,
  HiChatAlt: <HiChatAlt2 className="text-xl" />,
  HiChatAlt2: <HiChatAlt2 className="text-xl" />,
  HiCog: <HiCog className="text-xl" />,
  HiGlobe: <HiGlobe className="text-xl" />,
};

export default function ServicesPreview() {
  const { data: services, loading } = useFirestore<Service>(
    "services",
    where("status", "==", "active"),
    orderBy("order", "asc")
  );

  const displayed = services.slice(0, 4);

  return (
    <Section className="relative overflow-hidden bg-[var(--color-dark)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56" />

      <div className="relative z-10">
        <div className="mb-10 text-center sm:mb-12">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--color-primary-light)]">
            What We Do
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            Services Built for Scale
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-text-muted)] sm:text-base">
            Focused service tracks for product strategy, platform delivery, and
            technical operations.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary-light)] border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:gap-5">
              {displayed.map((service, index) => {
                const order = String(index + 1).padStart(2, "0");

                return (
                  <article
                    key={service.id}
                    className="group relative overflow-hidden rounded-[24px] border border-[var(--color-dark-border)] bg-[linear-gradient(145deg,rgba(31,33,28,0.98),rgba(24,25,23,0.96))] p-4 sm:p-5"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(212,178,138,0.6),transparent)]" />
                    <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(212,178,138,0.12),transparent_65%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="relative flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[var(--color-primary)]/12 text-[var(--color-primary-light)]">
                        {ICON_MAP[service.icon] ?? <HiCode className="text-xl" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-primary-light)]">
                            {order}
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                            Service Track
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-white sm:text-[1.32rem]">
                          {service.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                          {service.description}
                        </p>

                        {service.features?.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {service.features.slice(0, 2).map((feature) => (
                              <span
                                key={feature}
                                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-[var(--color-text-muted)]"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="relative hidden w-28 shrink-0 overflow-hidden rounded-[18px] border border-white/10 bg-[var(--color-dark-border)] sm:block">
                        <div className="aspect-[4/5]">
                          {service.image ? (
                            <img
                              src={service.image}
                              alt={service.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-[var(--color-text-muted)]">
                              Preview
                            </div>
                          )}
                        </div>
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(20,20,19,0.06)_0%,rgba(20,20,19,0.56)_100%)]" />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <Link href="/services">
                <Button variant="outline">
                  View All Services <HiArrowRight />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </Section>
  );
}
