"use client";

import { useState, FormEvent } from "react";
import { useFirestore } from "@/hooks/useFirestore";
import {
  createDocument,
  updateDocument,
  deleteDocument,
} from "@/firebase/firestore";
import { orderBy, serverTimestamp } from "firebase/firestore";
import { NewsItem } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import AdminModal from "@/components/admin/AdminModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import AdminGuard from "@/components/admin/AdminGuard";
import ImageUpload from "@/components/admin/ImageUpload";
import { HiPlus, HiPencil, HiTrash } from "react-icons/hi";
import { slugify, formatDate } from "@/utils";

export default function AdminNewsPage() {
  return (
    <AdminGuard
      allowedRoles={["admin", "blog_manager"]}
      unauthorizedMode="not-found"
    >
      <AdminNewsContent />
    </AdminGuard>
  );
}

function AdminNewsContent() {
  const {
    data: news,
    loading,
    setData,
  } = useFirestore<NewsItem>("news", orderBy("createdAt", "desc"));

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [deletingItem, setDeletingItem] = useState<NewsItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setEditing(null);
    setCoverImage("");
    setModalOpen(true);
  }

  function openEdit(item: NewsItem) {
    setEditing(item);
    setCoverImage(item.coverImage || "");
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const title = form.get("title") as string;
    const data = {
      title,
      slug: slugify(title),
      excerpt: form.get("excerpt") as string,
      content: form.get("content") as string,
      coverImage,
      status: form.get("status") as "draft" | "published",
    };

    try {
      if (editing) {
        await updateDocument("news", editing.id, {
          ...data,
          updatedAt: serverTimestamp(),
        });
        setData(
          news.map((n) => (n.id === editing.id ? { ...n, ...data } : n))
        );
      } else {
        const ref = await createDocument("news", {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setData([
          { id: ref.id, ...data } as unknown as NewsItem,
          ...news,
        ]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save news item.");
    } finally {
      setSaving(false);
    }
  }

  function requestDelete(item: NewsItem) {
    setDeletingItem(item);
  }

  async function handleDelete() {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      await deleteDocument("news", deletingItem.id);
      setData(news.filter((n) => n.id !== deletingItem.id));
      setDeletingItem(null);
    } catch {
      alert("Failed to delete news item.");
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

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">News</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Manage company news and announcements.
          </p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <HiPlus /> Add News
        </Button>
      </div>

      {news.length === 0 ? (
        <Card hover={false}>
          <p className="py-8 text-center text-[var(--color-text-muted)]">
            No news items yet. Create your first announcement.
          </p>
        </Card>
      ) : (
        <Card hover={false}>
          <div className="space-y-3 sm:hidden">
            {news.map((item) => (
              <div key={item.id} className="rounded-xl border border-[var(--color-dark-border)] bg-[var(--color-dark)] p-4">
                <div className="flex items-start gap-3">
                  {item.coverImage && (
                    <img
                      src={item.coverImage}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{item.title}</p>
                    <p className="truncate text-xs text-[var(--color-text-muted)]">/{item.slug}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <p className="text-[var(--color-text-muted)]">Date</p>
                  <p className="text-right text-[var(--color-text)]">
                    {item.createdAt ? formatDate(item.createdAt) : "—"}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant={item.status === "published" ? "accent" : "muted"}>
                    {item.status}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <HiPencil />
                    </button>
                    <button
                      onClick={() => requestDelete(item)}
                      className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <HiTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-dark-border)]">
                  <th className="pb-3 font-medium text-[var(--color-text-muted)]">Title</th>
                  <th className="pb-3 font-medium text-[var(--color-text-muted)]">Date</th>
                  <th className="pb-3 font-medium text-[var(--color-text-muted)]">Status</th>
                  <th className="pb-3 text-right font-medium text-[var(--color-text-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {news.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--color-dark-border)] last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {item.coverImage && (
                          <img
                            src={item.coverImage}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-white">{item.title}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">/{item.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-[var(--color-text-muted)]">
                      {item.createdAt ? formatDate(item.createdAt) : "—"}
                    </td>
                    <td className="py-4">
                      <Badge variant={item.status === "published" ? "accent" : "muted"}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <HiPencil />
                        </button>
                        <button
                          onClick={() => requestDelete(item)}
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
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit News" : "New News Item"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" name="title" required defaultValue={editing?.title ?? ""} />
          <Textarea label="Excerpt" name="excerpt" required defaultValue={editing?.excerpt ?? ""} />
          <Textarea label="Content" name="content" required defaultValue={editing?.content ?? ""} />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Status</label>
            <select
              name="status"
              defaultValue={editing?.status ?? "draft"}
              className="rounded-lg border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-primary)]"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <ImageUpload
            label="Cover Image"
            value={coverImage}
            onChange={(url) => setCoverImage(url as string)}
            folder="news"
          />

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </AdminModal>

      <DeleteConfirmModal
        open={!!deletingItem}
        title="Delete News Item"
        description={
          deletingItem
            ? `Are you sure you want to delete "${deletingItem.title}"? This action cannot be undone.`
            : ""
        }
        loading={deleting}
        onClose={() => {
          if (!deleting) setDeletingItem(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
