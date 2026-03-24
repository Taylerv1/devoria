"use client";

import { useState, useEffect, use, FormEvent } from "react";
import Link from "next/link";
import { getDocumentBySlug } from "@/firebase/firestore";
import { Project } from "@/types";
import Section from "@/components/layout/Section";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { HiArrowLeft, HiExternalLink } from "react-icons/hi";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [interestSending, setInterestSending] = useState(false);
  const [interestSent, setInterestSent] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      try {
        const doc = await getDocumentBySlug("projects", slug);
        setProject(doc as unknown as Project | null);
      } catch {
        setProject(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [slug]);

  async function handleInterestSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setInterestSending(true);
    const formElement = e.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "project_interest",
          name: form.get("name"),
          email: form.get("email"),
          subject: `Project Interest: ${project?.title ?? slug}`,
          message: form.get("message"),
          projectTitle: project?.title ?? slug,
          projectSlug: slug,
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Failed to send inquiry.");
      }

      formElement.reset();
      setInterestSent(true);
    } catch {
      alert("Failed to send. Please try again.");
    } finally {
      setInterestSending(false);
    }
  }

  if (loading) {
    return (
      <Section>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary-light)] border-t-transparent" />
        </div>
      </Section>
    );
  }

  if (!project) {
    return (
      <Section>
        <div className="mx-auto max-w-4xl">
          <Link
            href="/projects"
            className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] transition-colors hover:text-white"
          >
            <HiArrowLeft /> Back to Projects
          </Link>
          <p className="py-12 text-center text-[var(--color-text-muted)]">
            Project not found.
          </p>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className="mx-auto max-w-4xl">
        <Link
          href="/projects"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] transition-colors hover:text-white sm:mb-8"
        >
          <HiArrowLeft /> Back to Projects
        </Link>

        {/* Cover image */}
        <div className="mb-6 h-48 overflow-hidden rounded-xl border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] sm:mb-8 sm:h-64 sm:rounded-2xl md:h-96">
          {project.coverImage ? (
            <img
              src={project.coverImage}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--color-text-muted)]">
              Project Cover Image
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              {project.title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.category && <Badge>{project.category}</Badge>}
              {project.status === "published" && (
                <Badge variant="accent">Live</Badge>
              )}
            </div>
          </div>
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              <Button>
                Visit Live <HiExternalLink />
              </Button>
            </a>
          )}
        </div>

        <div className="mt-8 space-y-5 text-[var(--color-text-muted)] leading-relaxed sm:mt-10 sm:space-y-6">
          <p>{project.description}</p>

          {project.content && (
            <div className="whitespace-pre-wrap">{project.content}</div>
          )}

          {project.techStack?.length > 0 && (
            <>
              <h2 className="text-xl font-semibold text-white">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <Badge key={tech} variant="muted">
                    {tech}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Gallery images */}
        {project.images?.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-xl font-semibold text-white">Gallery</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {project.images.map((img, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-xl border border-[var(--color-dark-border)]"
                >
                  <img
                    src={img}
                    alt={`${project.title} screenshot ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Project Interest Form */}
        <div className="mt-16 border-t border-[var(--color-dark-border)] pt-10">
          <h2 className="mb-2 text-2xl font-bold text-white">Interested in a Similar Project?</h2>
          <p className="mb-6 text-[var(--color-text-muted)]">
            Let us know about your project and we&apos;ll get back to you within 24 hours.
          </p>
          <Card hover={false} className="p-5 sm:p-7">
            {interestSent ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-3xl text-[var(--color-accent)]">
                  ✓
                </div>
                <h3 className="text-xl font-semibold text-white">Message Sent!</h3>
                <p className="mt-2 text-[var(--color-text-muted)]">
                  We&apos;ll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInterestSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input label="Name" name="name" placeholder="Ali Hassan" required />
                  <Input label="Email" name="email" type="email" placeholder="ali@example.com" required />
                </div>
                <Textarea label="Tell us about your project" name="message" placeholder="Describe your project needs..." required />
                <Button type="submit" disabled={interestSending}>
                  {interestSending ? "Sending..." : "Send Inquiry"}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </Section>
  );
}
