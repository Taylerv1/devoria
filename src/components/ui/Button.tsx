import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const variants = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-text)] hover:bg-[var(--color-primary-light)]",
  secondary:
    "bg-[var(--color-accent)] text-[var(--color-dark)] hover:bg-[var(--color-accent-light)]",
  outline:
    "border border-[var(--color-dark-border)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary-light)]",
  ghost: "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/5",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
