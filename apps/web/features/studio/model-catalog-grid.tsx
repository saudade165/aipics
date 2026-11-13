"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ModelDefinition } from "@/lib/api/types";
import { fadeUp, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { ModelAvatar } from "./model-avatar";

const CAPABILITY_LABEL: Record<string, string> = {
  text_to_image: "Text → Image",
  image_to_image: "Image → Image",
  image_edit: "Editing",
  text_to_video: "Text → Video",
  image_to_video: "Image → Video",
  reference_to_video: "Reference → Video",
  motion_transfer: "Motion transfer",
  character_replacement: "Replacement",
  multi_image_conditioning: "Multi-image",
};

export function capabilityLabel(cap: string) {
  return CAPABILITY_LABEL[cap] ?? cap.replace(/_/g, " ");
}

/** Configuration-driven catalog: renders whatever models the API returns. */
export function ModelCatalogGrid({ models, selectedId, onSelect }: { models: ModelDefinition[]; selectedId?: string; onSelect?: (id: string) => void }) {
  return (
    <motion.div variants={stagger(0.05)} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
      {models.map((m) => (
        <motion.button
          key={m.id}
          variants={fadeUp}
          type="button"
          whileHover={{ y: -2 }}
          onClick={() => onSelect?.(m.id)}
          className={cn(
            "card card-hover focus-ring group relative overflow-hidden p-4 text-left",
            selectedId === m.id && "border-accent/40 shadow-glow",
          )}
        >
          <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-35" style={{ background: m.accent[0] }} />
          <div className="relative flex items-start justify-between">
            <ModelAvatar model={m} />
            <ArrowUpRight className="size-4 text-subtle transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
          </div>
          <div className="relative mt-4 flex items-center gap-2">
            <h3 className="font-semibold tracking-tight">{m.name}</h3>
            {m.badges.map((b) => (
              <Badge key={b} tone={b === "New" ? "accent" : "neutral"}>{b}</Badge>
            ))}
          </div>
          <p className="relative mt-0.5 text-2xs text-subtle">{m.vendor}</p>
          <p className="relative mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{m.description}</p>
          <div className="relative mt-3 flex flex-wrap gap-1">
            {m.capabilities.slice(0, 3).map((c) => (
              <span key={c} className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-2xs text-muted">{capabilityLabel(c)}</span>
            ))}
          </div>
          <div className="relative mt-3 flex items-center gap-1.5 border-t border-white/[0.06] pt-3 text-2xs text-subtle">
            <span className="size-1.5 rounded-full bg-warning/80" />
            Provider not connected
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}
