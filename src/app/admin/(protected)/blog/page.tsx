"use client";

import { useState, FormEvent } from "react";
import { useFirestore } from "@/hooks/useFirestore";
import {
  createDocument,
  updateDocument,
  deleteDocument,
} from "@/firebase/firestore";
import { orderBy, serverTimestamp } from "firebase/firestore";
import { BlogPost } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import AdminModal from "@/components/admin/AdminModal";
import ImageUpload from "@/components/admin/ImageUpload";
import { HiPlus, HiPencil, HiTrash } from "react-icons/hi";
import { slugify, formatDate } from "@/utils";

export default function AdminBlogPage() {
  const {
    data: posts,
    loading,
    setData,
  } = useFirestore<BlogPost>("blog", orderBy("createdAt", "desc"));

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [coverImage, setCoverImage] = useState("");

  function openCreate() {
    setEditing(null);
    setCoverImage("");
    setModalOpen(true);
  }

  function openEdit(post: BlogPost) {
    setEditing(post);
    setCoverImage(post.coverImage || "");
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
      author: form.get("author") as string,
      tags: (form.get("tags") as string)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status: form.get("status") as "draft" | "published",
    };

    try {
      if (editing) {
        await updateDocument("blog", editing.id, {
          ...data,
          updatedAt: serverTimestamp(),
        });
        setData(
          posts.map((p) => (p.id === editing.id ? { ...p, ...data } : p))
        );
      } else {
        const ref = await createDocument("blog", {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setData([
          { id: ref.id, ...data } as unknown as BlogPost,
          ...posts,
        ]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save blog post.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(post: BlogPost) {
    if (!confirm(`Delete "${post.title}"?`)) return;
    try {
      await deleteDocument("blog", post.id);
      setData(posts.filter((p) => p.id !== post.id));
    } catch {
      alert("Failed to delete blog post.");
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
          <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Manage your blog content.
          </p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <HiPlus /> New Post
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card hover={false}>
          <p className="py-8 text-center text-[var(--color-text-muted)]">
            No blog posts yet. Create your first post.
          </p>
        </Card>
      ) : (
        <Card hover={false}>
          <div className="space-y-3 sm:hidden">
            {posts.map((post) => (
              <div key={post.id} className="rounded-xl border border-[var(--color-dark-border)] bg-[var(--color-dark)] p-4">
                <p className="font-medium text-white">{post.title}</p>
                <p className="text-xs text-[var(--color-text-muted)]">/{post.slug}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <p className="text-[var(--color-text-muted)]">Author</p>
                  <p className="text-right text-[var(--color-text)]">{post.author}</p>
                  <p className="text-[var(--color-text-muted)]">Date</p>
                  <p className="text-right text-[var(--color-text)]">
                    {post.createdAt ? formatDate(post.createdAt) : "—"}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant={post.status === "published" ? "accent" : "muted"}>
                    {post.status}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(post)}
                      className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <HiPencil />
                    </button>
                    <button
                      onClick={() => handleDelete(post)}
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
                  <th className="pb-3 font-medium text-[var(--color-text-muted)]">Author</th>
                  <th className="pb-3 font-medium text-[var(--color-text-muted)]">Date</th>
                  <th className="pb-3 font-medium text-[var(--color-text-muted)]">Status</th>
                  <th className="pb-3 text-right font-medium text-[var(--color-text-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-[var(--color-dark-border)] last:border-0">
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-white">{post.title}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">/{post.slug}</p>
                      </div>
                    </td>
                    <td className="py-4 text-[var(--color-text-muted)]">{post.author}</td>
                    <td className="py-4 text-[var(--color-text-muted)]">
                      {post.createdAt ? formatDate(post.createdAt) : "—"}
                    </td>
                    <td className="py-4">
                      <Badge variant={post.status === "published" ? "accent" : "muted"}>
                        {post.status}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(post)}
                          className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <HiPencil />
                        </button>
                        <button
                          onClick={() => handleDelete(post)}
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
        title={editing ? "Edit Post" : "New Post"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" name="title" required defaultValue={editing?.title ?? ""} />
          <Input label="Author" name="author" required defaultValue={editing?.author ?? ""} />
          <Textarea label="Excerpt" name="excerpt" required defaultValue={editing?.excerpt ?? ""} />
          <Textarea label="Content" name="content" required defaultValue={editing?.content ?? ""} />
          <Input label="Tags (comma-separated)" name="tags" defaultValue={editing?.tags?.join(", ") ?? ""} />

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
            folder="blog"
          />

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
