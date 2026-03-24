"use client";

import { useFirestore } from "@/hooks/useFirestore";
import { orderBy, where } from "firebase/firestore";
import { Service } from "@/types";
import Card from "@/components/ui/Card";
import Section from "@/components/layout/Section";
import {
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
import { ReactNode } from "react";

const ICON_MAP: Record<string, ReactNode> = {
  HiCode: <HiCode className="text-2xl" />,
  HiDeviceMobile: <HiDeviceMobile className="text-2xl" />,
  HiColorSwatch: <HiColorSwatch className="text-2xl" />,
  HiCloud: <HiCloud className="text-2xl" />,
  HiLightningBolt: <HiLightningBolt className="text-2xl" />,
  HiShieldCheck: <HiShieldCheck className="text-2xl" />,
  HiDatabase: <HiDatabase className="text-2xl" />,
  HiChatAlt: <HiChatAlt2 className="text-2xl" />,
  HiChatAlt2: <HiChatAlt2 className="text-2xl" />,
  HiCog: <HiCog className="text-2xl" />,
  HiGlobe: <HiGlobe className="text-2xl" />,
};

export default function ServicesPreview() {
  const { data: services, loading } = useFirestore<Service>(
    "services",
    where("status", "==", "active"),
    orderBy("order", "asc")
  );

  const displayed = services.slice(0, 6);

  return (
    <Section className="bg-[var(--color-dark)]">
      <div className="mb-10 text-center sm:mb-14">
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-primary-light)]">
          What We Do
        </p>
        <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
          Services Built for Scale
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--color-text-muted)] sm:mt-4 sm:text-base">
          End-to-end development services that take your product from concept to
          launch and beyond.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary-light)] border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {displayed.map((service) => (
            <Card key={service.id} className="overflow-hidden p-0">
              <div className="relative h-40 bg-[var(--color-dark-border)]">
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)] via-[var(--color-dark)]/20 to-transparent" />
                <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-primary)]/15 text-[var(--color-primary-light)] backdrop-blur">
                  {ICON_MAP[service.icon] ?? <HiCode className="text-2xl" />}
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-white">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {service.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}
