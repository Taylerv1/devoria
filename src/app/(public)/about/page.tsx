import { Metadata } from "next";
import Section from "@/components/layout/Section";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import { HiLightningBolt, HiHeart, HiEye } from "react-icons/hi";

export const metadata: Metadata = {
  title: "About",
};

const values = [
  {
    icon: <HiLightningBolt className="text-2xl" />,
    title: "Innovation First",
    description:
      "We embrace cutting-edge technologies and forward-thinking approaches to solve complex problems.",
  },
  {
    icon: <HiHeart className="text-2xl" />,
    title: "Craft & Quality",
    description:
      "Every line of code, every pixel, every interaction is thoughtfully crafted to deliver excellence.",
  },
  {
    icon: <HiEye className="text-2xl" />,
    title: "Transparency",
    description:
      "Open communication, honest timelines, and clear processes. No surprises, just great results.",
  },
];

const team = [
  { name: "Alex Rivera", role: "Founder & CEO", image: "/team/alex.jpg" },
  { name: "Sam Chen", role: "CTO", image: "/team/sam.jpg" },
  { name: "Jordan Lee", role: "Lead Designer", image: "/team/jordan.jpg" },
  { name: "Taylor Kim", role: "Full-Stack Developer", image: "/team/taylor.jpg" },
];

export default function AboutPage() {
  return (
    <Section>
      <PageHeader
        title="About Devoria"
        description="We're a team of engineers, designers, and strategists passionate about building exceptional digital products."
      />

      {/* Story */}
      <div className="mx-auto mb-14 max-w-3xl text-center sm:mb-20">
        <p className="text-base leading-relaxed text-[var(--color-text-muted)] sm:text-lg">
          Founded with a mission to bridge the gap between great ideas and
          outstanding software, Devoria has grown into a trusted partner for
          startups and enterprises alike. We combine technical depth with
          creative design to deliver products that users love.
        </p>
      </div>

      {/* Values */}
      <div className="mb-14 sm:mb-20">
        <h2 className="mb-8 text-center text-xl font-bold text-white sm:mb-10 sm:text-2xl">
          Our Values
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3">
          {values.map((value) => (
            <Card key={value.title}>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary-light)]">
                {value.icon}
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
      </div>

      {/* Team */}
      <div>
        <h2 className="mb-8 text-center text-xl font-bold text-white sm:mb-10 sm:text-2xl">
          Meet the Team
        </h2>
        <div className="grid gap-6 grid-cols-2 sm:gap-8 lg:grid-cols-4">
          {team.map((member) => (
            <div key={member.name} className="text-center">
              <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full border-2 border-[var(--color-dark-border)] bg-[var(--color-dark-card)]">
                <div className="flex h-full items-center justify-center text-2xl font-bold text-[var(--color-primary-light)]">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
              </div>
              <h3 className="font-semibold text-white">{member.name}</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
