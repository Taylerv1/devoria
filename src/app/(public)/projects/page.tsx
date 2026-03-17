"use client";

import Link from "next/link";
import { useFirestore } from "@/hooks/useFirestore";
import { orderBy, where } from "firebase/firestore";
import { Project } from "@/types";
import Section from "@/components/layout/Section";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function ProjectsPage() {
  const { data: projects, loading } = useFirestore<Project>(
    "projects",
    where("status", "==", "published"),
    orderBy("createdAt", "desc")
  );

  return (
    <Section>
      <PageHeader
        title="Our Projects"
        description="A showcase of the digital products we've built for startups and enterprises."
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary-light)] border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <p className="py-12 text-center text-[var(--color-text-muted)]">
          No projects published yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {projects.map((project) => (
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
                      <span className="text-sm">{project.category}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-[var(--color-primary-light)]">
                  {project.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
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
    </Section>
  );
}
