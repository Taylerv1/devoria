import Hero from "@/components/sections/Hero";
import ServicesPreview from "@/components/sections/ServicesPreview";
import FeaturedProjects from "@/components/sections/FeaturedProjects";
import CTASection from "@/components/sections/CTASection";
import { getHomePageContent } from "@/lib/site-content.server";

export default async function Home() {
  const content = await getHomePageContent();

  return (
    <>
      <Hero content={content.hero} stats={content.stats} />
      <ServicesPreview content={content.services} />
      <FeaturedProjects content={content.projects} />
      <CTASection content={content.cta} />
    </>
  );
}
