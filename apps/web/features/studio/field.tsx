"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Info } from "lucide-react";
import { useId, useState } from "react";

import { Tooltip } from "@/components/ui/tooltip";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  aside,
  children,
  className,
  htmlFor,
}: {
  label: string;
  hint?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-[13px] font-medium text-fg/90">
          {label}
          {hint && (
            <Tooltip content={hint}>
              <button type="button" className="text-subtle transition-colors hover:text-muted" aria-label={`About ${label}`}>
                <Info className="size-3.5" />
              </button>
            </Tooltip>
          )}
        </label>
        {aside && <div className="text-xs text-subtle">{aside}</div>}
      </div>
      {children}
    </div>
  );
}

export function Panel({ title, icon, action, children, className }: {
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("card p-5", className)}>
      {title && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight [&_svg]:size-4 [&_svg]:text-muted">
            {icon}
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Collapsible({ title, description, children, defaultOpen = false }: {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.015]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="focus-ring flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left"
      >
        <span>
          <span className="block text-[13px] font-medium">{title}</span>
          {description && <span className="block text-xs text-subtle">{description}</span>}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="size-4 text-subtle" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1, transition: { duration: 0.35, ease: easeOutExpo } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
            className="overflow-hidden"
          >
            <div className="space-y-5 border-t border-white/[0.06] px-4 pb-4 pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ToggleRow({ label, description, control }: { label: string; description?: string; control: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-fg/90">{label}</p>
        {description && <p className="text-xs text-subtle">{description}</p>}
      </div>
      {control}
    </div>
  );
}
