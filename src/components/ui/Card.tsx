import { ReactNode } from "react";
import { cn } from "@/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] p-5 sm:rounded-2xl sm:p-6",
        hover &&
          "transition-all duration-300 hover:border-[var(--color-primary)]/30 hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
}
