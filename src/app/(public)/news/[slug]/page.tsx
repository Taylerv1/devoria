"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { getDocumentBySlug } from "@/firebase/firestore";
import { NewsItem } from "@/types";
import Section from "@/components/layout/Section";
import { HiArrowLeft } from "react-icons/hi";
import { formatDate } from "@/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function NewsDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNewsItem() {
      try {
        const doc = await getDocumentBySlug("news", slug);
        const parsed = doc as unknown as NewsItem | null;

        // Hide draft entries from public detail pages.
        if (!parsed || parsed.status !== "published") {
          setNewsItem(null);
          return;
        }

        setNewsItem(parsed);
      } catch {
        setNewsItem(null);
      } finally {
        setLoading(false);
      }
    }

    fetchNewsItem();
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

  if (!newsItem) {
    return (
      <Section>
        <div className="mx-auto max-w-3xl">
          <Link
            href="/news"
            className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] transition-colors hover:text-white"
          >
            <HiArrowLeft /> Back to News
          </Link>
          <p className="py-12 text-center text-[var(--color-text-muted)]">
            News article not found.
          </p>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <article className="mx-auto max-w-3xl">
        <Link
          href="/news"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] transition-colors hover:text-white sm:mb-8"
        >
          <HiArrowLeft /> Back to News
        </Link>

        <div className="mb-4 text-sm text-[var(--color-primary-light)]">
          {newsItem.createdAt ? formatDate(newsItem.createdAt) : ""}
        </div>

        <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
          {newsItem.title}
        </h1>

        {newsItem.coverImage ? (
          <div className="my-6 overflow-hidden rounded-xl border border-[var(--color-dark-border)] sm:my-8 sm:rounded-2xl">
            <img
              src={newsItem.coverImage}
              alt={newsItem.title}
              className="w-full object-cover"
            />
          </div>
        ) : (
          <div className="my-6 h-48 overflow-hidden rounded-xl border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] sm:my-8 sm:h-64 sm:rounded-2xl md:h-80">
            <div className="flex h-full items-center justify-center text-[var(--color-text-muted)]">
              News Cover Image
            </div>
          </div>
        )}

        <p className="mb-6 text-base leading-relaxed text-[var(--color-text-muted)]">
          {newsItem.excerpt}
        </p>

        <div className="space-y-5 whitespace-pre-wrap text-[var(--color-text-muted)] leading-relaxed sm:space-y-6">
          {newsItem.content}
        </div>
      </article>
    </Section>
  );
}
