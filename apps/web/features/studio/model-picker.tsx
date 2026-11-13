"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useId } from "react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlatform } from "@/features/platform/platform-provider";
import type { ModelDefinition } from "@/lib/api/types";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { ModelAvatar } from "./model-avatar";

export function ModelPicker({
  models,
  value,
  onChange,
  isDisabled,
}: {
  models: ModelDefinition[];
  value: string;
  onChange: (id: string) => void;
  /** Optionally grey out models that don't support the current mode. */
  isDisabled?: (model: ModelDefinition) => string | false;
}) {
  const { status } = usePlatform();
  const id = useId();

  if (status === "loading" && models.length === 0) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[74px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (models.length === 0) {
    return <p className="rounded-xl border border-dashed border-white/[0.08] p-4 text-center text-xs text-muted">Model catalog unavailable. Check the API connection.</p>;
  }

  return (
    <div role="radiogroup" aria-label="Model" className="space-y-2">
      {models.map((model) => {
        const active = model.id === value;
        const disabledReason = isDisabled?.(model) || false;
        return (
          <button
            key={model.id}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={Boolean(disabledReason)}
            title={disabledReason || undefined}
            onClick={() => onChange(model.id)}
            className={cn(
              "focus-ring group relative flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40",
              active ? "border-accent/45" : "border-white/[0.07] bg-white/[0.015] hover:border-white/[0.13] hover:bg-white/[0.03]",
            )}
          >
            {active && <motion.span layoutId={`model-${id}`} transition={spring} className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent/[0.12] to-transparent shadow-[inset_0_0_0_1px_rgb(var(--accent)/0.3)]" />}
            <ModelAvatar model={model} className="relative" />
            <span className="relative min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold">{model.name}</span>
                {model.badges.slice(0, 1).map((b) => (
                  <Badge key={b} tone={b === "New" ? "accent" : "neutral"}>{b}</Badge>
                ))}
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted">{disabledReason || model.tagline}</span>
              <span className="mt-1 block text-2xs text-subtle">{model.vendor} · Not connected</span>
            </span>
            <span className={cn("relative grid size-5 shrink-0 place-items-center rounded-full border transition-colors", active ? "border-transparent bg-accent text-white" : "border-white/[0.14]")}>
              {active && <Check className="size-3" strokeWidth={3} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
