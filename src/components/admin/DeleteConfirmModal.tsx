"use client";

import AdminModal from "@/components/admin/AdminModal";
import Button from "@/components/ui/Button";

interface DeleteConfirmModalProps {
  open: boolean;
  title?: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function DeleteConfirmModal({
  open,
  title = "Delete Item",
  description,
  confirmLabel = "Delete",
  loading = false,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <AdminModal open={open} onClose={onClose} title={title} className="max-w-md">
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
          {description}
        </p>

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end sm:gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void onConfirm()}
            disabled={loading}
            className="bg-red-600 text-white hover:bg-red-500"
          >
            {loading ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      </div>
    </AdminModal>
  );
}
