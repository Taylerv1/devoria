"use client";

import { useFirestore } from "@/hooks/useFirestore";
import { orderBy, where } from "firebase/firestore";
import { Service } from "@/types";
import Section from "@/components/layout/Section";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
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
  HiCode: <HiCode className="text-3xl" />,
  HiDeviceMobile: <HiDeviceMobile className="text-3xl" />,
  HiColorSwatch: <HiColorSwatch className="text-3xl" />,
  HiCloud: <HiCloud className="text-3xl" />,
  HiLightningBolt: <HiLightningBolt className="text-3xl" />,
  HiShieldCheck: <HiShieldCheck className="text-3xl" />,
  HiDatabase: <HiDatabase className="text-3xl" />,
  HiChatAlt: <HiChatAlt2 className="text-3xl" />,
  HiChatAlt2: <HiChatAlt2 className="text-3xl" />,
  HiCog: <HiCog className="text-3xl" />,
  HiGlobe: <HiGlobe className="text-3xl" />,
};

export default function ServicesPage() {
  const { data: services, loading } = useFirestore<Service>(
    "services",
    where("status", "==", "active"),
    orderBy("order", "asc")
  );

  return (
    <Section>
      <PageHeader
        title="Our Services"
        description="Comprehensive development services to take your product from idea to launch and beyond."
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary-light)] border-t-transparent" />
        </div>
      ) : services.length === 0 ? (
        <p className="py-12 text-center text-[var(--color-text-muted)]">
          No services available at the moment.
        </p>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:gap-8">
          {services.map((service) => (
            <Card key={service.id} className="p-5 sm:p-7 lg:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] sm:mb-5 sm:h-14 sm:w-14">
                {ICON_MAP[service.icon] ?? <HiCode className="text-3xl" />}
              </div>
              <h3 className="text-xl font-semibold text-white">
                {service.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
                {service.description}
              </p>
              {service.features?.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {service.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full bg-white/5 px-3 py-1 text-xs text-[var(--color-text-muted)]"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}
