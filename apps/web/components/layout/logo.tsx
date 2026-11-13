import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid size-9 shrink-0 place-items-center rounded-[11px] bg-accent-gradient shadow-inner-hi", className)}>
      <svg viewBox="0 0 24 24" fill="none" className="size-[18px]" aria-hidden>
        <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" stroke="white" strokeOpacity="0.95" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M12 3v9m0 0 8 4.5M12 12l-8 4.5" stroke="white" strokeOpacity="0.55" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <span className="pointer-events-none absolute inset-0 rounded-[11px] ring-1 ring-inset ring-white/20" />
    </span>
  );
}
