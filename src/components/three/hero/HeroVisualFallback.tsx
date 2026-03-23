import { cn } from "@/utils";

interface HeroVisualFallbackProps {
  className?: string;
  reducedMotion?: boolean;
}

export default function HeroVisualFallback({
  className,
  reducedMotion = false,
}: HeroVisualFallbackProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,22,22,0.04)_0%,rgba(22,22,22,0.16)_40%,rgba(22,22,22,0.8)_100%)]" />

      <div className="absolute left-[8%] top-[10%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(111,98,81,0.28)_0%,rgba(111,98,81,0)_72%)] blur-3xl sm:h-80 sm:w-80" />
      <div className="absolute right-[-8%] top-[6%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(219,212,204,0.18)_0%,rgba(219,212,204,0)_72%)] blur-3xl sm:right-[2%] sm:h-[30rem] sm:w-[30rem]" />

      <div className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(237,234,229,0.06)] bg-[radial-gradient(circle_at_38%_38%,rgba(237,234,229,0.12),rgba(22,22,22,0)_66%)] opacity-70" />
      <div className="absolute right-[6%] top-[15%] hidden h-72 w-72 rounded-full border border-[rgba(237,234,229,0.08)] md:block" />
      <div className="absolute right-[12%] top-[21%] hidden h-52 w-52 rounded-full border border-[rgba(237,234,229,0.06)] md:block" />

      <div className="absolute bottom-[16%] left-[12%] h-40 w-40 rotate-12 rounded-[2rem] border border-[rgba(237,234,229,0.08)] bg-[linear-gradient(180deg,rgba(31,33,28,0.58)_0%,rgba(31,33,28,0.12)_100%)] backdrop-blur-[2px]" />
      <div className="absolute right-[12%] top-[38%] hidden h-28 w-52 -rotate-12 rounded-[1.75rem] border border-[rgba(237,234,229,0.08)] bg-[linear-gradient(180deg,rgba(31,33,28,0.48)_0%,rgba(31,33,28,0.08)_100%)] md:block" />

      <div
        className={cn(
          "absolute inset-0 opacity-[0.08]",
          !reducedMotion && "transition-opacity duration-700"
        )}
        style={{
          backgroundImage:
            "linear-gradient(rgba(237,234,229,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(237,234,229,.06) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(circle at 60% 35%, black 0%, rgba(0,0,0,0.9) 36%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(circle at 60% 35%, black 0%, rgba(0,0,0,0.9) 36%, transparent 85%)",
        }}
      />
    </div>
  );
}
