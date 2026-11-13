"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown, Clapperboard, Database, Download, Eye, Film, Image as ImageIcon, ListFilter, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { DropdownLabel, DropdownMenu, DropdownRadioGroup, DropdownRadioItem } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Tooltip } from "@/components/ui/tooltip";
import { useFeature, useModels } from "@/features/platform/platform-provider";
import type { ModelCategory } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type Tab = "image" | "video" | "character";

interface HistoryItem {
  id: string;
  title: string;
  model: string;
  meta: string;
}

const TABS: { value: Tab; label: string; icon: React.ReactNode; href: string; noun: string }[] = [
  { value: "image", label: "Images", icon: <ImageIcon />, href: "/image-studio", noun: "images" },
  { value: "video", label: "Videos", icon: <Film />, href: "/video-studio", noun: "videos" },
  { value: "character", label: "Character workflows", icon: <UserRound />, href: "/character-studio", noun: "character workflows" },
];

const SORTS = { newest: "Newest first", oldest: "Oldest first", cost: "Token cost" } as const;

// Layout samples only: they demonstrate the card and modal design and are
// labelled as such in the UI. Real items will come from DatabaseRepository.
const LAYOUT_SAMPLES: HistoryItem[] = [
  { id: "sample-1", title: "Generation title", model: "Model name", meta: "Resolution · Date" },
  { id: "sample-2", title: "Generation title", model: "Model name", meta: "Resolution · Date" },
  { id: "sample-3", title: "Generation title", model: "Model name", meta: "Resolution · Date" },
];

export function HistoryView() {
  const [tab, setTab] = useState<Tab>("image");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<keyof typeof SORTS>("newest");
  const [modelFilter, setModelFilter] = useState("all");
  const [preview, setPreview] = useState<HistoryItem | null>(null);
  const [showSamples, setShowSamples] = useState(false);

  const database = useFeature("database");
  const storage = useFeature("storage");
  const models = useModels(tab as ModelCategory);
  const active = TABS.find((t) => t.value === tab)!;

  // No persistence layer exists yet, so the result set is always empty.
  const items = useMemo<HistoryItem[]>(() => [], []);
  const filtersActive = query.trim() !== "" || modelFilter !== "all";

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-[28px]">Generation History</h2>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">Everything you create will be collected here once storage and accounts are connected.</p>
      </div>

      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="overflow-x-auto no-scrollbar">
          <Segmented aria-label="History type" value={tab} onChange={(v) => { setTab(v); setModelFilter("all"); }} options={TABS} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-52 flex-1 xl:w-64 xl:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${active.noun}…`} aria-label="Search history" className="pl-9" />
          </div>
          <DropdownMenu
            trigger={
              <Button>
                <ListFilter />
                {modelFilter === "all" ? "All models" : models.find((m) => m.id === modelFilter)?.name}
              </Button>
            }
          >
            <DropdownLabel>Filter by model</DropdownLabel>
            <DropdownRadioGroup value={modelFilter} onValueChange={setModelFilter}>
              <DropdownRadioItem value="all">All models</DropdownRadioItem>
              {models.map((m) => (
                <DropdownRadioItem key={m.id} value={m.id}>{m.name}</DropdownRadioItem>
              ))}
            </DropdownRadioGroup>
          </DropdownMenu>
          <DropdownMenu
            trigger={
              <Button>
                <ArrowUpDown />
                {SORTS[sort]}
              </Button>
            }
          >
            <DropdownLabel>Sort by</DropdownLabel>
            <DropdownRadioGroup value={sort} onValueChange={(v) => setSort(v as keyof typeof SORTS)}>
              {Object.entries(SORTS).map(([k, label]) => (
                <DropdownRadioItem key={k} value={k}>{label}</DropdownRadioItem>
              ))}
            </DropdownRadioGroup>
          </DropdownMenu>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          {items.length === 0 && (
            <div className="card">
              <EmptyState
                icon={<Database />}
                title={filtersActive ? "Nothing matches — and nothing is stored yet" : `No ${active.noun} yet`}
                description={
                  <>
                    Generation history will become available after the storage and account systems are connected. Until then, nothing you configure
                    in the studios is saved.
                  </>
                }
                action={
                  <>
                    <Link href={active.href} className={buttonVariants({ variant: "primary" })}>
                      <Clapperboard />
                      Open studio
                    </Link>
                    <Button onClick={() => setShowSamples((s) => !s)}>
                      <Eye />
                      {showSamples ? "Hide card layout" : "Preview card layout"}
                    </Button>
                  </>
                }
              />
              <div className="flex flex-wrap items-center justify-center gap-2 border-t border-white/[0.06] px-6 py-4 text-xs text-muted">
                Requires:
                <Badge tone={database?.available ? "success" : "warning"}>Database · {database?.available ? "connected" : "not connected"}</Badge>
                <Badge tone={storage?.available ? "success" : "warning"}>File storage · {storage?.available ? "connected" : "not connected"}</Badge>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showSamples && (
          <motion.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-8 flex items-center gap-2">
              <h3 className="text-[15px] font-semibold tracking-tight">Card layout</h3>
              <Badge tone="accent">Layout sample — not real generations</Badge>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {LAYOUT_SAMPLES.map((item, i) => (
                <motion.article key={item.id} whileHover={{ y: -3 }} className="card card-hover group overflow-hidden">
                  <button type="button" onClick={() => setPreview(item)} className={cn("focus-ring relative block w-full overflow-hidden bg-surface-2", tab === "image" ? "aspect-square" : "aspect-video")} aria-label="Open preview">
                    <div className="absolute inset-0 bg-grid opacity-60" />
                    <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at ${30 + i * 20}% 40%, rgb(var(--accent)), transparent 60%)` }} />
                    <span className="absolute inset-0 grid place-items-center text-subtle [&_svg]:size-7">{active.icon}</span>
                    <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur"><Eye className="size-3.5" /> Preview</span>
                    </span>
                  </button>
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-muted">{item.title}</p>
                      <p className="truncate text-xs text-subtle">{item.model} · {item.meta}</p>
                    </div>
                    <DownloadPlaceholder />
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <Dialog
        open={preview !== null}
        onOpenChange={(open) => !open && setPreview(null)}
        title="Preview layout"
        description="This is how a generation will open. No real output is shown."
        className="max-w-2xl"
        footer={
          <>
            <Button onClick={() => setPreview(null)}>Close</Button>
            <DownloadPlaceholder labelled />
          </>
        }
      >
        <div className="relative grid aspect-video place-items-center overflow-hidden rounded-xl border border-white/[0.07] bg-surface-2">
          <div className="absolute inset-0 bg-grid opacity-60 mask-radial" />
          <p className="relative text-sm text-muted">Output canvas</p>
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
          {["Model", "Settings", "Token cost"].map((k) => (
            <div key={k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <dt className="text-subtle">{k}</dt>
              <dd className="mt-0.5 text-muted">—</dd>
            </div>
          ))}
        </dl>
      </Dialog>
    </>
  );
}

function DownloadPlaceholder({ labelled }: { labelled?: boolean }) {
  return (
    <Tooltip content="Downloads become available once file storage is connected.">
      <span tabIndex={0}>
        <Button variant={labelled ? "primary" : "ghost"} size={labelled ? "md" : "icon-sm"} disabled aria-label="Download (unavailable)">
          <Download />
          {labelled && "Download"}
        </Button>
      </span>
    </Tooltip>
  );
}
