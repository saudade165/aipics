"use client";

import { motion } from "framer-motion";
import { Coins, Sparkles } from "lucide-react";

import { Tooltip } from "@/components/ui/tooltip";
import { usePreferences } from "@/features/platform/preferences-provider";
import { cn, formatNumber } from "@/lib/utils";

export function GenerateBar({
  tokens,
  label = "Generate",
  onGenerate,
  pending,
  breakdown,
  className,
}: {
  tokens: number;
  label?: string;
  onGenerate: () => void;
  pending?: boolean;
  breakdown?: string;
  className?: string;
}) {
  const { preferences } = usePreferences();
  return (
    <div className={cn("space-y-3", className)}>
      {preferences.defaults.showCostEstimates && (
        <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs">
          <span className="text-muted">Estimated cost</span>
          <Tooltip content={breakdown ? `${breakdown}. Estimate only — billing is not active.` : "Estimate only — billing is not active."}>
            <span tabIndex={0} className="flex items-center gap-1.5 font-medium tabular-nums text-fg">
              <Coins className="size-3.5 text-warning" />
              {formatNumber(tokens)} tokens
            </span>
          </Tooltip>
        </div>
      )}
      <motion.button
        type="button"
        whileTap={{ scale: 0.985 }}
        onClick={onGenerate}
        disabled={pending}
        className="focus-ring group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-accent-gradient text-[15px] font-semibold text-white shadow-inner-hi transition-[filter,box-shadow] duration-300 hover:shadow-glow hover:brightness-110 disabled:opacity-70"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out-expo group-hover:translate-x-full" />
        <Sparkles className={cn("relative size-[18px]", pending && "animate-pulse")} />
        <span className="relative">{pending ? "Validating…" : label}</span>
      </motion.button>
      <p className="text-center text-2xs text-subtle">AI providers are not connected — settings are validated only.</p>
    </div>
  );
}
