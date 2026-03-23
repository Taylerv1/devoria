interface BadgeProps {
  children: string;
  variant?: "primary" | "accent" | "muted";
}

const variants = {
  primary:
    "bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] border-[var(--color-primary)]/20",
  accent:
    "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20",
  muted:
    "bg-[var(--color-dark)]/35 text-[var(--color-text-muted)] border-[var(--color-dark-border)]",
};

export default function Badge({
  children,
  variant = "primary",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
