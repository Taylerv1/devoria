"use client";

import { ReactNode, useEffect, useRef } from "react";
import { cn } from "@/utils";
import { HiX } from "react-icons/hi";

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  align?: "top" | "center";
}

export default function AdminModal({
  open,
  onClose,
  title,
  children,
  className,
  align = "top",
}: AdminModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className={cn(
        "fixed inset-0 z-50 flex justify-center overflow-y-auto bg-black/60 p-3 sm:p-4",
        align === "center" ? "items-center" : "items-center sm:items-start sm:pt-[10vh]"
      )}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={cn(
          "w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] shadow-2xl",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-dark-border)] px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="line-clamp-1 pr-3 text-base font-semibold text-white sm:text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
          >
            <HiX className="text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[calc(100vh-7rem)] overflow-y-auto p-4 sm:max-h-[calc(100vh-12rem)] sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
