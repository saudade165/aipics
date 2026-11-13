"use client";

import { motion } from "framer-motion";
import { useId } from "react";

import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface GridOption<T extends string | number> {
  value: T;
  label: React.ReactNode;
  detail?: React.ReactNode;
  visual?: React.ReactNode;
  disabled?: boolean;
}

/** Radio-style grid used for aspect ratios, resolutions, durations and counts. */
export function OptionGrid<T extends string | number>({
  value,
  onChange,
  options,
  columns = 4,
  "aria-label": ariaLabel,
}: {
  value: T;
  onChange: (value: T) => void;
  options: GridOption<T>[];
  columns?: 2 | 3 | 4 | 5 | 6;
  "aria-label"?: string;
}) {
  const id = useId();
  const cols = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6" }[columns];
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn("grid gap-2", cols)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "focus-ring relative flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-center transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-35",
              active ? "border-accent/50 text-fg" : "border-white/[0.07] bg-white/[0.02] text-muted hover:border-white/[0.14] hover:text-fg",
            )}
          >
            {active && (
              <motion.span layoutId={`grid-${id}`} transition={spring} className="absolute inset-0 -z-0 rounded-lg bg-accent/[0.1] shadow-[inset_0_0_0_1px_rgb(var(--accent)/0.35)]" />
            )}
            {option.visual && <span className="relative">{option.visual}</span>}
            <span className="relative text-[13px] font-medium leading-none">{option.label}</span>
            {option.detail && <span className="relative text-2xs leading-none text-subtle">{option.detail}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Small outline that previews an aspect ratio. */
export function RatioShape({ ratio }: { ratio: string }) {
  const [w = 1, h = 1] = ratio.split(":").map(Number);
  const max = 18;
  const scale = max / Math.max(w, h);
  return (
    <span
      className="block rounded-[3px] border-[1.5px] border-current opacity-80"
      style={{ width: Math.max(6, w * scale), height: Math.max(6, h * scale) }}
    />
  );
}

export function ratioOptions(ratios: string[]): GridOption<string>[] {
  return ratios.map((r) => ({ value: r, label: r, visual: <RatioShape ratio={r} /> }));
}
