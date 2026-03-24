"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
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
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import AdminGuard from "@/components/admin/AdminGuard";
import ImageUpload from "@/components/admin/ImageUpload";
import { cn } from "@/utils";
import { IconType } from "react-icons";
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiCode,
  HiDeviceMobile,
  HiColorSwatch,
  HiCloud,
  HiLightningBolt,
  HiShieldCheck,
  HiDatabase,
  HiChatAlt2,
  HiCog,
  HiGlobe,
  HiCheck,
  HiChevronDown,
} from "react-icons/hi";

type IconOption = {
  value: string;
  Icon: IconType;
};

const ICON_OPTIONS: IconOption[] = [
  { value: "HiCode", Icon: HiCode },
  { value: "HiDeviceMobile", Icon: HiDeviceMobile },
  { value: "HiColorSwatch", Icon: HiColorSwatch },
  { value: "HiCloud", Icon: HiCloud },
  { value: "HiLightningBolt", Icon: HiLightningBolt },
  { value: "HiShieldCheck", Icon: HiShieldCheck },
  { value: "HiDatabase", Icon: HiDatabase },
  { value: "HiChatAlt", Icon: HiChatAlt2 },
  { value: "HiCog", Icon: HiCog },
  { value: "HiGlobe", Icon: HiGlobe },
];

function IconSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selected =
    ICON_OPTIONS.find((option) => option.value === value) ?? ICON_OPTIONS[0];
  const SelectedIcon = selected.Icon;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--color-text)]">Icon</label>
      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-lg border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] px-4 py-2.5 text-sm text-white outline-none transition-colors hover:border-[var(--color-primary)] focus:border-[var(--color-primary)]"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-[var(--color-primary-light)]">
              <SelectedIcon className="text-lg" />
            </span>
            <span>{selected.value}</span>
          </span>
          <HiChevronDown
            className={cn(
              "text-base text-[var(--color-text-muted)] transition-transform",
              open && "rotate-180"
            )}
          />
        </button>

        {open && (
          <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] p-1 shadow-2xl">
            {ICON_OPTIONS.map((option) => {
              const OptionIcon = option.Icon;
              const isSelected = option.value === selected.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-white transition-colors hover:bg-white/5",
                    isSelected && "bg-white/5"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-[var(--color-primary-light)]">
                      <OptionIcon className="text-lg" />
                    </span>
                    <span>{option.value}</span>
                  </span>
                  {isSelected ? (
                    <HiCheck className="text-base text-[var(--color-primary-light)]" />
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminServicesPage() {
  return (
    <AdminGuard
      allowedRoles={["admin", "editor"]}
      unauthorizedMode="not-found"
    >
      <AdminServicesContent />
    </AdminGuard>
  );
}

function AdminServicesContent() {
  const {
    data: services,
    loading,
    setData,
  } = useFirestore<Service>("services", orderBy("order", "asc"));

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0].value);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setEditing(null);
    setImage("");
    setSelectedIcon(ICON_OPTIONS[0].value);
    setModalOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setImage(service.image || "");
    setSelectedIcon(service.icon || ICON_OPTIONS[0].value);
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const data = {
      title: form.get("title") as string,
      description: form.get("description") as string,
      icon: selectedIcon,
      image,
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

  function requestDelete(service: Service) {
    setDeletingService(service);
  }

  async function handleDelete() {
    if (!deletingService) return;
    setDeleting(true);
    try {
      await deleteDocument("services", deletingService.id);
      setData(services.filter((s) => s.id !== deletingService.id));
      setDeletingService(null);
    } catch {
      alert("Failed to delete service.");
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
          <h1 className="text-2xl font-bold text-white">Services</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Manage your service offerings.
          </p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
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
          <div className="space-y-3 sm:hidden">
            {services.map((service) => (
              <div key={service.id} className="rounded-xl border border-[var(--color-dark-border)] bg-[var(--color-dark)] p-4">
                <div className="flex items-start gap-3">
                  {service.image && (
                    <img
                      src={service.image}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  )}
                  <p className="font-medium text-white">{service.title}</p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <p className="text-[var(--color-text-muted)]">Order</p>
                  <p className="text-right text-[var(--color-text)]">#{service.order}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant={service.status === "active" ? "accent" : "muted"}>
                    {service.status}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(service)}
                      className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <HiPencil />
                    </button>
                    <button
                      onClick={() => requestDelete(service)}
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
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {service.image && (
                          <img
                            src={service.image}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        )}
                        <p className="font-medium text-white">{service.title}</p>
                      </div>
                    </td>
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
                          onClick={() => requestDelete(service)}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <IconSelect value={selectedIcon} onChange={setSelectedIcon} />
            <Input label="Order" name="order" type="number" required defaultValue={editing?.order ?? services.length + 1} />
          </div>
          <Textarea label="Features (one per line)" name="features" defaultValue={editing?.features?.join("\n") ?? ""} />
          <ImageUpload
            label="Service Image"
            value={image}
            onChange={(url) => setImage(url as string)}
            folder="services"
          />
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
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </AdminModal>

      <DeleteConfirmModal
        open={!!deletingService}
        title="Delete Service"
        description={
          deletingService
            ? `Are you sure you want to delete "${deletingService.title}"? This action cannot be undone.`
            : ""
        }
        loading={deleting}
        onClose={() => {
          if (!deleting) setDeletingService(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
