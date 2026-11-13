import type { ModelDefinition } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function ModelAvatar({ model, size = "md", className }: { model: Pick<ModelDefinition, "name" | "accent">; size?: "sm" | "md" | "lg"; className?: string }) {
  const initials = model.name
    .split(/[\s-]+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const [from, to] = model.accent;
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden font-semibold text-white",
        size === "sm" && "size-8 rounded-lg text-2xs",
        size === "md" && "size-10 rounded-[11px] text-xs",
        size === "lg" && "size-12 rounded-xl text-sm",
        className,
      )}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      aria-hidden
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgb(255_255_255/0.35),transparent_55%)]" />
      <span className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/20" />
      <span className="relative tracking-tight">{initials}</span>
    </span>
  );
}
