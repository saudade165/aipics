"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, Plug } from "lucide-react";

import type { GenerationPreviewResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * The canvas where outputs will render once providers are connected.
 * Shows the last server-side validation result — never a fake output.
 */
export function OutputStage({
  result,
  icon,
  emptyTitle = "Your results will appear here",
  emptyDescription,
  aspect = "aspect-[16/10]",
  accent,
  className,
}: {
  result: GenerationPreviewResponse | null;
  icon: React.ReactNode;
  emptyTitle?: string;
  emptyDescription: string;
  aspect?: string;
  accent?: [string, string];
  className?: string;
}) {
  const [from, to] = accent ?? ["rgb(var(--accent))", "rgb(var(--accent-2))"];
  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-white/[0.07] bg-surface-2/40", aspect, className)}>
      <div className="absolute inset-0 bg-grid opacity-50 mask-radial" />
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 size-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.16] blur-3xl"
        style={{ background: `radial-gradient(circle, ${from}, ${to} 60%, transparent 70%)` }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative flex h-full flex-col items-center justify-center p-6 text-center">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="result" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-md">
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl border border-warning/25 bg-warning/10 text-warning">
                <Plug className="size-5" />
              </div>
              <p className="text-base font-semibold">{result.message}</p>
              <p className="mt-2 text-sm text-muted">Nothing was generated. The configuration below was checked by the API.</p>
              <ul className="mx-auto mt-4 inline-flex flex-col gap-1.5 text-left text-xs text-muted">
                <li className="flex items-center gap-2"><CircleCheck className="size-3.5 text-success" /> Model: {result.model_name}</li>
                <li className="flex items-center gap-2"><CircleCheck className="size-3.5 text-success" /> Settings validated against the catalog</li>
                <li className="flex items-center gap-2"><CircleCheck className="size-3.5 text-success" /> Estimated {result.estimated_cost.tokens} tokens (not charged)</li>
              </ul>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-sm">
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.07] to-white/[0.01] text-muted shadow-card [&_svg]:size-5">
                {icon}
              </div>
              <p className="text-sm font-semibold">{emptyTitle}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{emptyDescription}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
