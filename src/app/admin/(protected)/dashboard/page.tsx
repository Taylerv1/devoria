"use client";

import { useState, useEffect } from "react";
import { getCollectionCount } from "@/firebase/firestore";
import { useFirestore } from "@/hooks/useFirestore";
import { orderBy } from "firebase/firestore";
import { ContactMessage } from "@/types";
import Card from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import AdminGuard from "@/components/admin/AdminGuard";
import {
  HiFolder,
  HiDocumentText,
  HiMail,
  HiUsers,
  HiNewspaper,
  HiBriefcase,
} from "react-icons/hi";
import { formatDate } from "@/utils";

interface StatCard {
  label: string;
  value: number | null;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

export default function DashboardPage() {
  return (
    <AdminGuard allowedRoles={["admin", "editor"]}>
      <DashboardContent />
    </AdminGuard>
  );
}

function DashboardContent() {
  const { profile } = useAuth();
  const canSeeUsers = profile?.role === "admin";

  const [counts, setCounts] = useState<Record<string, number | null>>({
    projects: null,
    blog: null,
    news: null,
    messages: null,
    services: null,
    users: null,
  });

  const {
    data: recentMessages,
    loading: messagesLoading,
  } = useFirestore<ContactMessage>("messages", orderBy("createdAt", "desc"));

  useEffect(() => {
    async function fetchCounts() {
      const collections = canSeeUsers
        ? ["projects", "blog", "news", "messages", "services", "users"]
        : ["projects", "blog", "news", "messages", "services"];
      const results = await Promise.allSettled(
        collections.map((collection) => getCollectionCount(collection))
      );
      const newCounts: Record<string, number | null> = {};
      collections.forEach((collection, index) => {
        newCounts[collection] =
          results[index].status === "fulfilled" ? results[index].value : 0;
      });
      setCounts((current) => ({ ...current, ...newCounts }));
    }

    fetchCounts();
  }, [canSeeUsers]);

  const unreadCount = recentMessages.filter((message) => !message.read).length;

  const stats: StatCard[] = [
    {
      label: "Projects",
      value: counts.projects,
      icon: <HiFolder className="text-2xl" />,
      color: "text-[var(--color-primary-light)]",
      bg: "bg-[var(--color-primary)]/10",
    },
    {
      label: "Blog Posts",
      value: counts.blog,
      icon: <HiDocumentText className="text-2xl" />,
      color: "text-[var(--color-accent)]",
      bg: "bg-[var(--color-accent)]/10",
    },
    {
      label: "News Items",
      value: counts.news,
      icon: <HiNewspaper className="text-2xl" />,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Messages",
      value: counts.messages,
      icon: <HiMail className="text-2xl" />,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
    {
      label: "Services",
      value: counts.services,
      icon: <HiBriefcase className="text-2xl" />,
      color: "text-pink-400",
      bg: "bg-pink-400/10",
    },
  ];

  if (canSeeUsers) {
    stats.push({
      label: "Users",
      value: counts.users,
      icon: <HiUsers className="text-2xl" />,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Welcome back! Here&apos;s an overview of your content.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {stat.label}
                </p>
                <p className="mt-1 text-3xl font-bold text-white">
                  {stat.value === null ? (
                    <span className="inline-block h-8 w-12 animate-pulse rounded bg-white/10" />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}
              >
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 lg:mt-10">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Recent Messages
          {unreadCount > 0 && (
            <span className="ml-2 text-sm font-normal text-[var(--color-primary-light)]">
              ({unreadCount} unread)
            </span>
          )}
        </h2>
        <Card hover={false}>
          {messagesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary-light)] border-t-transparent" />
            </div>
          ) : recentMessages.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
              No messages yet.
            </p>
          ) : (
            <div className="space-y-4">
              {recentMessages.slice(0, 5).map((message) => (
                <div
                  key={message.id}
                  className="flex items-center justify-between border-b border-[var(--color-dark-border)] pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    {!message.read && (
                      <span className="h-2 w-2 rounded-full bg-[var(--color-primary-light)]" />
                    )}
                    <div>
                      <span
                        className={`text-sm ${message.read ? "text-[var(--color-text)]" : "font-medium text-white"}`}
                      >
                        {message.subject}
                      </span>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        from {message.name}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {message.createdAt ? formatDate(message.createdAt) : "-"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
