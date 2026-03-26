"use client";

import Link from "next/link";
import { useFirestore } from "@/hooks/useFirestore";
import { orderBy, where } from "firebase/firestore";
import { Project } from "@/types";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { DEFAULT_HOME_PAGE_CONTENT, HomeSectionContent } from "@/lib/site-content";
import { HiArrowRight } from "react-icons/hi";

interface FeaturedProjectsProps {
  content?: HomeSectionContent;
}

export default function FeaturedProjects({
  content = DEFAULT_HOME_PAGE_CONTENT.projects,
}: FeaturedProjectsProps) {
  const { data: projects, loading } = useFirestore<Project>(
    "projects",
    where("status", "==", "published"),
    where("featured", "==", true),
    orderBy("createdAt", "desc")
  );

  const displayed = projects.slice(0, 3);

  return (
    <Section>
      <div className="mb-10 text-center sm:mb-12">
        {content.eyebrow ? (
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--color-primary-light)]">
            {content.eyebrow}
          </p>
        ) : null}
        {content.title ? (
          <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            {content.title}
          </h2>
        ) : null}
        {content.description ? (
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-text-muted)] sm:text-base">
            {content.description}
          </p>
        ) : null}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary-light)] border-t-transparent" />
        </div>
      ) : displayed.length === 0 ? (
        <p className="py-12 text-center text-[var(--color-text-muted)]">
          No featured projects yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {displayed.map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}`}>
              <Card className="group h-full">
                <div className="mb-4 h-40 overflow-hidden rounded-lg bg-[var(--color-dark-border)] sm:h-48">
                  {project.coverImage ? (
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--color-text-muted)]">
                      <span className="text-sm">Preview</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-[var(--color-primary-light)]">
                  {project.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  {project.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags?.map((tag) => (
                    <Badge key={tag} variant="muted">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {content.buttonLabel && content.buttonHref ? (
        <div className="mt-10 text-center sm:mt-12">
          <Link href={content.buttonHref}>
            <Button variant="outline">
              {content.buttonLabel} <HiArrowRight />
            </Button>
          </Link>
        </div>
      ) : null}
    </Section>
  );
}
