import { ReactNode } from "react";
import { Metadata } from "next";
import Section from "@/components/layout/Section";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import { getAboutPageContent } from "@/lib/site-content.server";
import { AboutValueIcon } from "@/lib/site-content";
import {
  HiLightningBolt,
  HiHeart,
  HiEye,
  HiShieldCheck,
  HiGlobe,
  HiCog,
} from "react-icons/hi";

export const metadata: Metadata = {
  title: "About",
};

const VALUE_ICON_MAP: Record<AboutValueIcon, ReactNode> = {
  HiLightningBolt: <HiLightningBolt className="text-2xl" />,
  HiHeart: <HiHeart className="text-2xl" />,
  HiEye: <HiEye className="text-2xl" />,
  HiShieldCheck: <HiShieldCheck className="text-2xl" />,
  HiGlobe: <HiGlobe className="text-2xl" />,
  HiCog: <HiCog className="text-2xl" />,
};

export default async function AboutPage() {
  const content = await getAboutPageContent();
  const storyParagraphs = content.story.body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <Section>
      <PageHeader
        title={content.header.title}
        description={content.header.description}
      />

      <div className="mx-auto mb-14 max-w-3xl text-center sm:mb-20">
        {content.story.title ? (
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
            {content.story.title}
          </h2>
        ) : null}
        <div className="space-y-4">
          {storyParagraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="text-base leading-relaxed text-[var(--color-text-muted)] sm:text-lg"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="mb-14 sm:mb-20">
        {content.valuesTitle ? (
          <h2 className="mb-8 text-center text-xl font-bold text-white sm:mb-10 sm:text-2xl">
            {content.valuesTitle}
          </h2>
        ) : null}
        {content.values.length === 0 ? (
          <p className="text-center text-sm text-[var(--color-text-muted)]">
            No company values added yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3">
            {content.values.map((value, index) => (
              <Card key={`${value.title}-${index}`}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary-light)]">
                  {VALUE_ICON_MAP[value.icon]}
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  {value.description}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        {content.teamTitle ? (
          <h2 className="mb-8 text-center text-xl font-bold text-white sm:mb-10 sm:text-2xl">
            {content.teamTitle}
          </h2>
        ) : null}
        {content.teamMembers.length === 0 ? (
          <p className="text-center text-sm text-[var(--color-text-muted)]">
            No team members added yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
            {content.teamMembers.map((member, index) => (
              <div key={`${member.name}-${index}`} className="text-center">
                <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full border-2 border-[var(--color-dark-border)] bg-[var(--color-dark-card)]">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl font-bold text-[var(--color-primary-light)]">
                      {(member.name || "?")
                        .split(" ")
                        .filter(Boolean)
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
