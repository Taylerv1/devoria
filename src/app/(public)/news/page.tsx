"use client";

import Link from "next/link";
import { useFirestore } from "@/hooks/useFirestore";
import { orderBy, where } from "firebase/firestore";
import { NewsItem } from "@/types";
import Section from "@/components/layout/Section";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import { formatDate } from "@/utils";

export default function NewsPage() {
  const { data: news, loading } = useFirestore<NewsItem>(
    "news",
    where("status", "==", "published"),
    orderBy("createdAt", "desc")
  );

  return (
    <Section>
      <PageHeader
        title="News"
        description="The latest updates, announcements, and milestones from Devoria."
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary-light)] border-t-transparent" />
        </div>
      ) : news.length === 0 ? (
        <p className="py-12 text-center text-[var(--color-text-muted)]">
          No news published yet.
        </p>
      ) : (
        <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
          {news.map((item) => (
            <Link key={item.id} href={`/news/${item.slug}`}>
              <Card className="group p-5 sm:p-7 lg:p-8">
                <span className="text-xs font-medium text-[var(--color-primary-light)]">
                  {item.createdAt ? formatDate(item.createdAt) : ""}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-white transition-colors group-hover:text-[var(--color-primary-light)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {item.excerpt}
                </p>
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)] transition-colors group-hover:text-white">
                  Read full update
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Section>
  );
}
