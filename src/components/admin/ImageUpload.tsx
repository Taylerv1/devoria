"use client";

import { useState, useRef } from "react";
import { HiPhotograph, HiX, HiCloudUpload } from "react-icons/hi";

interface ImageUploadProps {
  value: string | string[];
  onChange: (urls: string | string[]) => void;
  folder: string;
  multiple?: boolean;
  label?: string;
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  folder,
  multiple = false,
  label,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const urls = Array.isArray(value) ? value : value ? [value] : [];

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await fetch("/api/uploads/image", {
          method: "POST",
          body: formData,
        });

        const result = (await response.json()) as {
          url?: string;
          error?: string;
        };

        if (!response.ok || !result.url) {
          throw new Error(result.error || "Upload failed.");
        }

        return result.url;
      });

      const newUrls = await Promise.all(uploadPromises);

      if (multiple) {
        onChange([...urls, ...newUrls]);
      } else {
        onChange(newUrls[0]);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Check Supabase Storage settings and try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    const updated = urls.filter((_, i) => i !== index);
    if (multiple) {
      onChange(updated);
    } else {
      onChange("");
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--color-text)]">
          {label}
        </label>
      )}

      {/* Preview existing images */}
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {urls.map((url, i) => (
            <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-[var(--color-dark-border)]">
              <img src={url} alt="" className="h-full w-full object-cover" />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <HiX className="text-white text-lg" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {!disabled && (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--color-dark-border)] bg-[var(--color-dark)] px-4 py-6 text-sm text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-white disabled:opacity-50"
        >
          {uploading ? (
            <>
              <HiCloudUpload className="animate-bounce text-lg" />
              Uploading...
            </>
          ) : (
            <>
              <HiPhotograph className="text-lg" />
              {multiple ? "Add Images" : "Upload Image"}
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}

      {!disabled && (
        <p className="text-xs text-[var(--color-text-muted)]">
          Images are uploaded automatically and only the returned URL is stored in Firestore.
        </p>
      )}
    </div>
  );
}
