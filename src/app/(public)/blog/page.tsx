"use client";

import Link from "next/link";
import { useFirestore } from "@/hooks/useFirestore";
import { orderBy, where } from "firebase/firestore";
import { BlogPost } from "@/types";
import Section from "@/components/layout/Section";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/utils";

export default function BlogPage() {
  const { data: posts, loading } = useFirestore<BlogPost>(
    "blog",
    where("status", "==", "published"),
    orderBy("createdAt", "desc")
  );

  return (
    <Section>
      <PageHeader
        title="Blog"
        description="Insights, tutorials, and thoughts on modern software development."
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary-light)] border-t-transparent" />
        </div>
      ) : posts.length === 0 ? (
        <p className="py-12 text-center text-[var(--color-text-muted)]">
          No blog posts published yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:gap-8">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="group h-full">
                <div className="mb-3 flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                  <span>{post.createdAt ? formatDate(post.createdAt) : ""}</span>
                  <span>&middot;</span>
                  <span>{post.author}</span>
                </div>
                <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-[var(--color-primary-light)]">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags?.map((tag) => (
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
