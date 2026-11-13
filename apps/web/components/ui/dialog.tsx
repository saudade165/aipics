"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  /** Hide the visual header while keeping an accessible title. */
  bare?: boolean;
}

export function Dialog({ open, onOpenChange, title, description, children, footer, className, bare }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </DialogPrimitive.Overlay>
            <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center p-4">
              <DialogPrimitive.Content asChild forceMount>
                <motion.div
                  className={cn(
                    "pointer-events-auto relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.09] bg-surface shadow-lift focus:outline-none",
                    className,
                  )}
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.32, ease: easeOutExpo } }}
                  exit={{ opacity: 0, scale: 0.98, y: 4, transition: { duration: 0.15 } }}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px hairline" />
                  {bare ? (
                    <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
                  ) : (
                    <div className="flex items-start justify-between gap-4 px-6 pt-6">
                      <div>
                        <DialogPrimitive.Title className="text-base font-semibold tracking-tight">{title}</DialogPrimitive.Title>
                        {description && (
                          <DialogPrimitive.Description className="mt-1 text-sm text-muted">{description}</DialogPrimitive.Description>
                        )}
                      </div>
                    </div>
                  )}
                  {(bare || !description) && <DialogPrimitive.Description className="sr-only">{description ?? title}</DialogPrimitive.Description>}
                  <DialogPrimitive.Close className="focus-ring absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-lg text-subtle transition-colors hover:bg-white/[0.06] hover:text-fg">
                    <X className="size-4" />
                    <span className="sr-only">Close</span>
                  </DialogPrimitive.Close>
                  {children && <div className={cn(!bare && "px-6 pb-6 pt-4")}>{children}</div>}
                  {footer && <div className="flex justify-end gap-2 border-t border-white/[0.06] bg-white/[0.015] px-6 py-4">{footer}</div>}
                </motion.div>
              </DialogPrimitive.Content>
            </div>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
