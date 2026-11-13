"use client";

import { ArrowRight, Box, CornerDownLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Dialog } from "@/components/ui/dialog";
import { usePlatform } from "@/features/platform/platform-provider";
import { NAV_ITEMS } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const CATEGORY_ROUTE: Record<string, string> = {
  image: "/image-studio",
  video: "/video-studio",
  character: "/character-studio",
  upscale: "/image-upscaler",
  video_enhance: "/video-enhancer",
};

interface Result {
  id: string;
  label: string;
  hint: string;
  href: string;
  group: "Pages" | "Models";
  icon: React.ReactNode;
}

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const { catalog } = usePlatform();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    const pages: Result[] = NAV_ITEMS.map((item) => {
      const Icon = item.icon;
      return { id: item.href, label: item.label, hint: item.description, href: item.href, group: "Pages", icon: <Icon /> };
    });
    const models: Result[] = (catalog?.models ?? []).map((m) => ({
      id: `model-${m.id}`,
      label: m.name,
      hint: `${m.vendor} · ${m.tagline}`,
      href: `${CATEGORY_ROUTE[m.category] ?? "/"}?model=${m.id}`,
      group: "Models",
      icon: <Box />,
    }));
    const all = [...pages, ...models];
    return q ? all.filter((r) => `${r.label} ${r.hint}`.toLowerCase().includes(q)) : all.slice(0, 12);
  }, [catalog, query]);

  useEffect(() => setCursor(0), [query]);
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const go = (result: Result | undefined) => {
    if (!result) return;
    onOpenChange(false);
    router.push(result.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[cursor]);
    }
  };

  let lastGroup = "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Search" bare className="max-w-xl">
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4 pr-14">
        <Search className="size-[18px] text-subtle" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search tools, pages and models…"
          aria-label="Search tools, pages and models"
          className="flex-1 bg-transparent text-[15px] text-fg placeholder:text-subtle focus:outline-none"
        />
      </div>
      <div className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
        {results.length === 0 && <p className="px-3 py-10 text-center text-sm text-muted">No results for “{query}”.</p>}
        {results.map((r, i) => {
          const header = r.group !== lastGroup ? r.group : null;
          lastGroup = r.group;
          return (
            <div key={r.id}>
              {header && <p className="label-eyebrow px-3 pb-1.5 pt-3">{header}</p>}
              <button
                type="button"
                onMouseEnter={() => setCursor(i)}
                onClick={() => go(r)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors [&>span:first-child_svg]:size-4",
                  i === cursor ? "bg-white/[0.06]" : "hover:bg-white/[0.03]",
                )}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-muted">{r.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-fg">{r.label}</span>
                  <span className="block truncate text-xs text-subtle">{r.hint}</span>
                </span>
                {i === cursor && <ArrowRight className="size-4 text-subtle" />}
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 border-t border-white/[0.06] px-5 py-3 text-2xs text-subtle">
        <span className="flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
        <span className="flex items-center gap-1.5"><Kbd><CornerDownLeft className="size-3" /></Kbd> open</span>
        <span className="flex items-center gap-1.5"><Kbd>esc</Kbd> close</span>
      </div>
    </Dialog>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-grid h-5 min-w-5 place-items-center rounded border border-white/[0.1] bg-white/[0.04] px-1 font-sans text-2xs text-muted">
      {children}
    </kbd>
  );
}
