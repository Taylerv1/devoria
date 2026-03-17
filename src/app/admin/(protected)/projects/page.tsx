"use client";

import { useState, FormEvent } from "react";
import { useFirestore } from "@/hooks/useFirestore";
import {
  createDocument,
  updateDocument,
  deleteDocument,
} from "@/firebase/firestore";
import { orderBy, serverTimestamp } from "firebase/firestore";
import { Project } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import AdminModal from "@/components/admin/AdminModal";
import ImageUpload from "@/components/admin/ImageUpload";
import { HiPlus, HiPencil, HiTrash } from "react-icons/hi";
import { slugify } from "@/utils";

const CATEGORY_OPTIONS = [
  "Web App",
  "Mobile App",
  "E-Commerce",
  "SaaS",
  "Dashboard",
  "API / Backend",
  "Other",
];

export default function AdminProjectsPage() {
  const {
    data: projects,
    loading,
    setData,
  } = useFirestore<Project>("projects", orderBy("createdAt", "desc"));

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [images, setImages] = useState<string[]>([]);

  function openCreate() {
    setEditing(null);
    setCoverImage("");
    setImages([]);
    setModalOpen(true);
  }

  function openEdit(project: Project) {
    setEditing(project);
    setCoverImage(project.coverImage || "");
    setImages(project.images || []);
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
      description: form.get("description") as string,
      content: form.get("content") as string,
      coverImage,
      images,
      tags: (form.get("tags") as string)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      techStack: (form.get("techStack") as string)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      category: form.get("category") as string,
      liveUrl: (form.get("liveUrl") as string) || undefined,
      githubUrl: (form.get("githubUrl") as string) || undefined,
      featured: form.get("featured") === "on",
      status: form.get("status") as "draft" | "published",
    };

    try {
      if (editing) {
        await updateDocument("projects", editing.id, {
          ...data,
          updatedAt: serverTimestamp(),
        });
        setData(
          projects.map((p) =>
            p.id === editing.id ? { ...p, ...data } : p
          )
        );
      } else {
        const ref = await createDocument("projects", {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setData([
          { id: ref.id, ...data } as unknown as Project,
          ...projects,
        ]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save project.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(project: Project) {
    if (!confirm(`Delete "${project.title}"?`)) return;
    try {
      await deleteDocument("projects", project.id);
      setData(projects.filter((p) => p.id !== project.id));
    } catch {
      alert("Failed to delete project.");
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Manage your portfolio projects.
          </p>
        </div>
        <Button onClick={openCreate}>
          <HiPlus /> Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card hover={false}>
          <p className="py-8 text-center text-[var(--color-text-muted)]">
            No projects yet. Create your first project.
          </p>
        </Card>
      ) : (
        <Card hover={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-dark-border)]">
                  <th className="pb-3 font-medium text-[var(--color-text-muted)]">Title</th>
                  <th className="pb-3 font-medium text-[var(--color-text-muted)]">Category</th>
                  <th className="pb-3 font-medium text-[var(--color-text-muted)]">Status</th>
                  <th className="pb-3 font-medium text-[var(--color-text-muted)]">Featured</th>
                  <th className="pb-3 text-right font-medium text-[var(--color-text-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b border-[var(--color-dark-border)] last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {project.coverImage && (
                          <img
                            src={project.coverImage}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-white">{project.title}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">/{project.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-[var(--color-text-muted)]">{project.category}</td>
                    <td className="py-4">
                      <Badge variant={project.status === "published" ? "accent" : "muted"}>
                        {project.status}
                      </Badge>
                    </td>
                    <td className="py-4 text-[var(--color-text-muted)]">
                      {project.featured ? "Yes" : "—"}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(project)}
                          className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <HiPencil />
                        </button>
                        <button
                          onClick={() => handleDelete(project)}
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
        title={editing ? "Edit Project" : "New Project"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" name="title" required defaultValue={editing?.title ?? ""} />
          <Textarea label="Description" name="description" required defaultValue={editing?.description ?? ""} />
          <Textarea label="Content" name="content" required defaultValue={editing?.content ?? ""} />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Category</label>
              <select
                name="category"
                defaultValue={editing?.category ?? CATEGORY_OPTIONS[0]}
                className="rounded-lg border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-primary)]"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
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
          </div>

          <Input label="Tags (comma-separated)" name="tags" defaultValue={editing?.tags?.join(", ") ?? ""} />
          <Input label="Tech Stack (comma-separated)" name="techStack" defaultValue={editing?.techStack?.join(", ") ?? ""} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Live URL" name="liveUrl" type="url" defaultValue={editing?.liveUrl ?? ""} />
            <Input label="GitHub URL" name="githubUrl" type="url" defaultValue={editing?.githubUrl ?? ""} />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="featured"
              id="featured"
              defaultChecked={editing?.featured ?? false}
              className="h-4 w-4 rounded border-[var(--color-dark-border)] bg-[var(--color-dark-card)]"
            />
            <label htmlFor="featured" className="text-sm text-[var(--color-text)]">
              Featured project
            </label>
          </div>

          <ImageUpload
            label="Cover Image"
            value={coverImage}
            onChange={(url) => setCoverImage(url as string)}
            folder="projects"
          />

          <ImageUpload
            label="Gallery Images"
            value={images}
            onChange={(urls) => setImages(urls as string[])}
            folder="projects"
            multiple
          />

          <div className="flex justify-end gap-3 pt-2">
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
