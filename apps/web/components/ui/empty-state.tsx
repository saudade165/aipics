import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative flex flex-col items-center justify-center overflow-hidden px-6 py-16 text-center", className)}>
      <div className="pointer-events-none absolute inset-0 bg-grid mask-radial opacity-60" />
      <div className="relative mb-5 grid size-14 place-items-center rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.01] text-muted shadow-card [&_svg]:size-6">
        {icon}
      </div>
      <h3 className="relative text-base font-semibold tracking-tight">{title}</h3>
      <p className="relative mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p>
      {action && <div className="relative mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
