import { ReactNode } from "react";
import { cn } from "@/utils";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24", className)}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}
