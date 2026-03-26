"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { getCollectionCount, getDocuments } from "@/firebase/firestore";
import { ContactMessage } from "@/types";
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
  key: string;
  label: string;
  value: number | null;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

export default function DashboardPage() {
  return (
    <AdminGuard requiredPermission={{ resource: "dashboard" }} unauthorizedMode="not-found">
      <DashboardContent />
    </AdminGuard>
  );
}

function DashboardContent() {
  const access = useAdminAccess();
  const canReadProjects = access.can("projects");
  const canReadBlog = access.can("blog");
  const canReadNews = access.can("news");
  const canReadServices = access.can("services");
  const canReadMessages = access.can("messages");
  const canSeeUsers = access.isAdmin;

  const [counts, setCounts] = useState<Record<string, number | null>>({
    projects: null,
    blog: null,
    news: null,
    messages: null,
    services: null,
    users: null,
  });
  const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(canReadMessages);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboardData() {
      const nextCounts: Record<string, number | null> = {
        projects: canReadProjects ? null : 0,
        blog: canReadBlog ? null : 0,
        news: canReadNews ? null : 0,
        messages: canReadMessages ? null : 0,
        services: canReadServices ? null : 0,
        users: canSeeUsers ? null : null,
      };

      const countTasks: Array<Promise<void>> = [];

      if (canReadProjects) {
        countTasks.push(
          getCollectionCount("projects").then((value) => {
            nextCounts.projects = value;
          })
        );
      }

      if (canReadBlog) {
        countTasks.push(
          getCollectionCount("blog").then((value) => {
            nextCounts.blog = value;
          })
        );
      }

      if (canReadNews) {
        countTasks.push(
          getCollectionCount("news").then((value) => {
            nextCounts.news = value;
          })
        );
      }

      if (canReadMessages) {
        countTasks.push(
          getCollectionCount("messages").then((value) => {
            nextCounts.messages = value;
          })
        );
      }

      if (canReadServices) {
        countTasks.push(
          getCollectionCount("services").then((value) => {
            nextCounts.services = value;
          })
        );
      }

      if (canSeeUsers) {
        countTasks.push(
          fetch("/api/admin/users", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          })
            .then(async (response) => {
              if (!response.ok) {
                throw new Error("Failed to load users count");
              }

              const payload = (await response.json()) as {
                users?: Array<{ id: string }>;
              };
              nextCounts.users = Array.isArray(payload.users)
                ? payload.users.length
                : 0;
            })
            .catch(() => {
              nextCounts.users = 0;
            })
        );
      }

      try {
        await Promise.allSettled(countTasks);
      } finally {
        if (!cancelled) {
          setCounts(nextCounts);
        }
      }

      if (!canReadMessages) {
        if (!cancelled) {
          setRecentMessages([]);
          setMessagesLoading(false);
        }
        return;
      }

      setMessagesLoading(true);

      try {
        const messages = (await getDocuments("messages")) as ContactMessage[];
        const sorted = [...messages].sort((left, right) => {
          const leftTime = left.createdAt?.toMillis?.() ?? 0;
          const rightTime = right.createdAt?.toMillis?.() ?? 0;
          return rightTime - leftTime;
        });

        if (!cancelled) {
          setRecentMessages(sorted.slice(0, 5));
        }
      } catch {
        if (!cancelled) {
          setRecentMessages([]);
        }
      } finally {
        if (!cancelled) {
          setMessagesLoading(false);
        }
      }
    }

    void fetchDashboardData();

    return () => {
      cancelled = true;
    };
  }, [
    canReadBlog,
    canReadMessages,
    canReadNews,
    canReadProjects,
    canReadServices,
    canSeeUsers,
  ]);

  const unreadCount = recentMessages.filter((message) => !message.read).length;
  const stats: StatCard[] = [];

  if (canReadProjects) {
    stats.push({
      key: "projects",
      label: "Projects",
      value: counts.projects,
      icon: <HiFolder className="text-2xl" />,
      color: "text-[var(--color-primary-light)]",
      bg: "bg-[var(--color-primary)]/10",
    });
  }

  if (canReadBlog) {
    stats.push({
      key: "blog",
      label: "Blog Posts",
      value: counts.blog,
      icon: <HiDocumentText className="text-2xl" />,
      color: "text-[var(--color-accent)]",
      bg: "bg-[var(--color-accent)]/10",
    });
  }

  if (canReadNews) {
    stats.push({
      key: "news",
      label: "News Items",
      value: counts.news,
      icon: <HiNewspaper className="text-2xl" />,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    });
  }

  if (canReadMessages) {
    stats.push({
      key: "messages",
      label: "Messages",
      value: counts.messages,
      icon: <HiMail className="text-2xl" />,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    });
  }

  if (canReadServices) {
    stats.push({
      key: "services",
      label: "Services",
      value: counts.services,
      icon: <HiBriefcase className="text-2xl" />,
      color: "text-pink-400",
      bg: "bg-pink-400/10",
    });
  }

  if (canSeeUsers) {
    stats.push({
      key: "users",
      label: "Users",
      value: counts.users,
      icon: <HiUsers className="text-2xl" />,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    });
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Overview for the admin sections available to your role.
        </p>
      </div>

      {stats.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {stats.map((stat) => (
            <Card key={stat.key} hover={false}>
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
      ) : (
        <Card hover={false}>
          <p className="py-8 text-center text-[var(--color-text-muted)]">
            No dashboard widgets are assigned to this role yet.
          </p>
        </Card>
      )}

      {canReadMessages ? (
        <div className="mt-8 lg:mt-10">
          <h2 className="mb-4 flex flex-wrap items-center gap-1 text-lg font-semibold text-white">
            Recent Messages
            {unreadCount > 0 ? (
              <span className="text-sm font-normal text-[var(--color-primary-light)] sm:ml-2">
                ({unreadCount} unread)
              </span>
            ) : null}
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
                {recentMessages.map((message) => (
                  <div
                    key={message.id}
                    className="flex flex-col gap-2 border-b border-[var(--color-dark-border)] pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {!message.read ? (
                        <span className="h-2 w-2 rounded-full bg-[var(--color-primary-light)]" />
                      ) : null}
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
                    <span className="pl-5 text-xs text-[var(--color-text-muted)] sm:pl-0">
                      {message.createdAt ? formatDate(message.createdAt) : "-"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      ) : null}
    </div>
  );
}
