import { cn } from "@/lib/utils";

/** Two-column studio: creative workspace on the left, settings rail on the right. */
export function StudioLayout({ main, aside, className }: { main: React.ReactNode; aside: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]", className)}>
      <div className="min-w-0 space-y-5">{main}</div>
      <aside className="min-w-0 space-y-5 xl:sticky xl:top-[88px] xl:max-h-[calc(100dvh-112px)] xl:self-start xl:overflow-y-auto xl:pb-1 no-scrollbar">{aside}</aside>
    </div>
  );
}
