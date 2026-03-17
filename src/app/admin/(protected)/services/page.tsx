"use client";

import { useState, FormEvent } from "react";
import { useFirestore } from "@/hooks/useFirestore";
import {
  createDocument,
  updateDocument,
  deleteDocument,
} from "@/firebase/firestore";
import { orderBy } from "firebase/firestore";
import { Service } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import AdminModal from "@/components/admin/AdminModal";
import { HiPlus, HiPencil, HiTrash } from "react-icons/hi";

const ICON_OPTIONS = [
  "HiCode",
  "HiDeviceMobile",
  "HiColorSwatch",
  "HiCloud",
  "HiLightningBolt",
  "HiShieldCheck",
  "HiDatabase",
  "HiChatAlt",
  "HiCog",
  "HiGlobe",
];

export default function AdminServicesPage() {
  const {
    data: services,
    loading,
    setData,
  } = useFirestore<Service>("services", orderBy("order", "asc"));

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const data = {
      title: form.get("title") as string,
      description: form.get("description") as string,
      icon: form.get("icon") as string,
      features: (form.get("features") as string)
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
      order: parseInt(form.get("order") as string) || 0,
      status: form.get("status") as "active" | "inactive",
    };

    try {
      if (editing) {
        await updateDocument("services", editing.id, data);
        setData(
          services.map((s) => (s.id === editing.id ? { ...s, ...data } : s))
        );
      } else {
        const ref = await createDocument("services", data);
        setData([...services, { id: ref.id, ...data } as unknown as Service]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save service.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(service: Service) {
    if (!confirm(`Delete "${service.title}"?`)) return;
    try {
      await deleteDocument("services", service.id);
      setData(services.filter((s) => s.id !== service.id));
    } catch {
      alert("Failed to delete service.");
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
          <h1 className="text-2xl font-bold text-white">Services</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Manage your service offerings.
          </p>
        </div>
        <Button onClick={openCreate}>
          <HiPlus /> Add Service
        </Button>
      </div>

      {services.length === 0 ? (
        <Card hover={false}>
          <p className="py-8 text-center text-[var(--color-text-muted)]">
            No services yet. Create your first service.
          </p>
        </Card>
      ) : (
        <Card hover={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-dark-border)]">
                  <th className="pb-3 font-medium text-[var(--color-text-muted)]">Order</th>
                  <th className="pb-3 font-medium text-[var(--color-text-muted)]">Title</th>
                  <th className="pb-3 font-medium text-[var(--color-text-muted)]">Status</th>
                  <th className="pb-3 text-right font-medium text-[var(--color-text-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-b border-[var(--color-dark-border)] last:border-0">
                    <td className="py-4 text-[var(--color-text-muted)]">#{service.order}</td>
                    <td className="py-4 font-medium text-white">{service.title}</td>
                    <td className="py-4">
                      <Badge variant={service.status === "active" ? "accent" : "muted"}>
                        {service.status}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(service)}
                          className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <HiPencil />
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
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
        title={editing ? "Edit Service" : "New Service"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" name="title" required defaultValue={editing?.title ?? ""} />
          <Textarea label="Description" name="description" required defaultValue={editing?.description ?? ""} />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Icon</label>
              <select
                name="icon"
                defaultValue={editing?.icon ?? ICON_OPTIONS[0]}
                className="rounded-lg border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-primary)]"
              >
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <Input label="Order" name="order" type="number" required defaultValue={editing?.order ?? services.length + 1} />
          </div>
          <Textarea label="Features (one per line)" name="features" defaultValue={editing?.features?.join("\n") ?? ""} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Status</label>
            <select
              name="status"
              defaultValue={editing?.status ?? "active"}
              className="rounded-lg border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-primary)]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
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
