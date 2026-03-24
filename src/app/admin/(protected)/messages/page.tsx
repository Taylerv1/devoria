"use client";

import { useFirestore } from "@/hooks/useFirestore";
import {
  updateDocument,
  deleteDocument,
} from "@/firebase/firestore";
import { orderBy } from "firebase/firestore";
import { ContactMessage } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import AdminModal from "@/components/admin/AdminModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import AdminGuard from "@/components/admin/AdminGuard";
import { HiEye, HiTrash } from "react-icons/hi";
import { formatDate } from "@/utils";
import { useState } from "react";

export default function AdminMessagesPage() {
  return (
    <AdminGuard
      allowedRoles={["admin", "editor"]}
      unauthorizedMode="not-found"
    >
      <AdminMessagesContent />
    </AdminGuard>
  );
}

function AdminMessagesContent() {
  const {
    data: messages,
    loading,
    setData,
  } = useFirestore<ContactMessage>("messages", orderBy("createdAt", "desc"));

  const [viewing, setViewing] = useState<ContactMessage | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleView(msg: ContactMessage) {
    setViewing(msg);
    if (!msg.read) {
      try {
        await updateDocument("messages", msg.id, { read: true });
        setData(
          messages.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
        );
      } catch {
        console.error("Failed to mark as read");
      }
    }
  }

  function requestDelete(msg: ContactMessage) {
    setDeletingMessage(msg);
  }

  async function handleDelete() {
    if (!deletingMessage) return;
    setDeleting(true);
    try {
      await deleteDocument("messages", deletingMessage.id);
      setData(messages.filter((m) => m.id !== deletingMessage.id));
      setDeletingMessage(null);
    } catch {
      alert("Failed to delete message.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary-light)] border-t-transparent" />
      </div>
    );
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Contact and project inquiry submissions from your website.
          {unreadCount > 0 && (
            <span className="ml-2 text-[var(--color-primary-light)]">
              ({unreadCount} unread)
            </span>
          )}
        </p>
      </div>

      {messages.length === 0 ? (
        <Card hover={false}>
          <p className="py-8 text-center text-[var(--color-text-muted)]">
            No messages yet.
          </p>
        </Card>
      ) : (
        <Card hover={false}>
          <div className="space-y-3 sm:hidden">
            {messages.map((msg) => (
              <div key={msg.id} className="rounded-xl border border-[var(--color-dark-border)] bg-[var(--color-dark)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className={`${msg.read ? "text-[var(--color-text)]" : "font-medium text-white"}`}>
                      {msg.subject}
                    </p>
                    <p className="truncate text-xs text-[var(--color-text-muted)]">{msg.email}</p>
                  </div>
                  <Badge variant={msg.read ? "muted" : "primary"}>
                    {msg.read ? "read" : "new"}
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <p className="text-[var(--color-text-muted)]">From</p>
                  <p className="truncate text-right text-[var(--color-text)]">{msg.name}</p>
                  <p className="text-[var(--color-text-muted)]">Date</p>
                  <p className="text-right text-[var(--color-text)]">
                    {msg.createdAt ? formatDate(msg.createdAt) : "—"}
                  </p>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() => handleView(msg)}
                    className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <HiEye />
                  </button>
                  <button
                    onClick={() => requestDelete(msg)}
                    className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <HiTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-dark-border)]">
                  <th className="pb-3 font-medium text-[var(--color-text-muted)]">Name</th>
                  <th className="pb-3 font-medium text-[var(--color-text-muted)]">Email</th>
                  <th className="pb-3 font-medium text-[var(--color-text-muted)]">Subject</th>
                  <th className="pb-3 font-medium text-[var(--color-text-muted)]">Date</th>
                  <th className="pb-3 font-medium text-[var(--color-text-muted)]">Status</th>
                  <th className="pb-3 text-right font-medium text-[var(--color-text-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg.id} className="border-b border-[var(--color-dark-border)] last:border-0">
                    <td className={`py-4 ${msg.read ? "text-[var(--color-text-muted)]" : "font-medium text-white"}`}>
                      {msg.name}
                    </td>
                    <td className="py-4 text-[var(--color-text-muted)]">{msg.email}</td>
                    <td className={`py-4 ${msg.read ? "text-[var(--color-text-muted)]" : "text-white"}`}>
                      {msg.subject}
                    </td>
                    <td className="py-4 text-[var(--color-text-muted)]">
                      {msg.createdAt ? formatDate(msg.createdAt) : "—"}
                    </td>
                    <td className="py-4">
                      <Badge variant={msg.read ? "muted" : "primary"}>
                        {msg.read ? "read" : "new"}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(msg)}
                          className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <HiEye />
                        </button>
                        <button
                          onClick={() => requestDelete(msg)}
                          className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                        >
                          <HiTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <AdminModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing?.subject ?? "Message"}
      >
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">From</p>
                <p className="text-sm font-medium text-white">{viewing.name}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Email</p>
                <p className="text-sm text-white">{viewing.email}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Date</p>
              <p className="text-sm text-white">
                {viewing.createdAt ? formatDate(viewing.createdAt) : "—"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-[var(--color-text-muted)]">Message</p>
              <p className="whitespace-pre-wrap rounded-lg bg-[var(--color-dark)] p-4 text-sm text-[var(--color-text)]">
                {viewing.message}
              </p>
            </div>
          </div>
        )}
      </AdminModal>

      <DeleteConfirmModal
        open={!!deletingMessage}
        title="Delete Message"
        description={
          deletingMessage
            ? `Are you sure you want to delete the message from "${deletingMessage.name}"? This action cannot be undone.`
            : ""
        }
        loading={deleting}
        onClose={() => {
          if (!deleting) setDeletingMessage(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
