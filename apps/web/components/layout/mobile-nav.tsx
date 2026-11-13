"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { useBranding } from "@/features/platform/platform-provider";
import { easeOutExpo } from "@/lib/motion";

import { LogoMark } from "./logo";
import { PlanCard, SidebarNav } from "./sidebar";

export function MobileNav({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const branding = useBranding();
  const close = () => onOpenChange(false);
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                className="fixed inset-y-0 left-0 z-50 flex w-[288px] max-w-[85vw] flex-col border-r border-white/[0.07] bg-surface lg:hidden"
                initial={{ x: "-100%" }}
                animate={{ x: 0, transition: { duration: 0.4, ease: easeOutExpo } }}
                exit={{ x: "-100%", transition: { duration: 0.25 } }}
              >
                <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
                <DialogPrimitive.Description className="sr-only">Main navigation menu</DialogPrimitive.Description>
                <div className="flex h-16 items-center justify-between px-5">
                  <div className="flex items-center gap-3">
                    <LogoMark />
                    <span className="text-[15px] font-semibold tracking-tight">{branding.name}</span>
                  </div>
                  <DialogPrimitive.Close className="focus-ring grid size-9 place-items-center rounded-lg text-subtle hover:bg-white/[0.06] hover:text-fg">
                    <X className="size-5" />
                    <span className="sr-only">Close navigation</span>
                  </DialogPrimitive.Close>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-4">
                  <SidebarNav onNavigate={close} />
                </div>
                <div className="border-t border-white/[0.06] p-3">
                  <PlanCard onNavigate={close} />
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
