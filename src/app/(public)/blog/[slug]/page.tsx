"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getDocumentBySlug } from "@/firebase/firestore";
import { BlogPost } from "@/types";
import Section from "@/components/layout/Section";
import Badge from "@/components/ui/Badge";
import { HiArrowLeft } from "react-icons/hi";
import { formatDate } from "@/utils";
import { use } from "react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: PageProps) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const doc = await getDocumentBySlug("blog", slug);
        setPost(doc as unknown as BlogPost | null);
      } catch {
        setPost(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <Section>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary-light)] border-t-transparent" />
        </div>
      </Section>
    );
  }

  if (!post) {
    return (
      <Section>
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] transition-colors hover:text-white"
          >
            <HiArrowLeft /> Back to Blog
          </Link>
          <p className="py-12 text-center text-[var(--color-text-muted)]">
            Blog post not found.
          </p>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <article className="mx-auto max-w-3xl">
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] transition-colors hover:text-white sm:mb-8"
        >
          <HiArrowLeft /> Back to Blog
        </Link>

        <div className="mb-4 flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
          <span>{post.createdAt ? formatDate(post.createdAt) : ""}</span>
          <span>&middot;</span>
          <span>{post.author}</span>
        </div>

        <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
          {post.title}
        </h1>

        {post.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="muted">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Cover image */}
        {post.coverImage ? (
          <div className="my-6 overflow-hidden rounded-xl border border-[var(--color-dark-border)] sm:my-8 sm:rounded-2xl">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full object-cover"
            />
          </div>
        ) : (
          <div className="my-6 h-48 overflow-hidden rounded-xl border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] sm:my-8 sm:h-64 sm:rounded-2xl md:h-80">
            <div className="flex h-full items-center justify-center text-[var(--color-text-muted)]">
              Cover Image
            </div>
          </div>
        )}

        <div className="space-y-5 whitespace-pre-wrap text-[var(--color-text-muted)] leading-relaxed sm:space-y-6">
          {post.content}
        </div>
      </article>
    </Section>
  );
}
