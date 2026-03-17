import { InputHTMLAttributes } from "react";
import { cn } from "@/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--color-text)]">
          {label}
        </label>
      )}
      <input
        className={cn(
          "rounded-lg border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] px-4 py-2.5 text-sm text-white placeholder-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-primary)]",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
