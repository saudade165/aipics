"use client";

import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { popover } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function DropdownMenu({
  trigger,
  children,
  align = "end",
  className,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dropdown.Root open={open} onOpenChange={setOpen}>
      <Dropdown.Trigger asChild>{trigger}</Dropdown.Trigger>
      <AnimatePresence>
        {open && (
          <Dropdown.Portal forceMount>
            <Dropdown.Content asChild forceMount align={align} sideOffset={8}>
              <motion.div
                variants={popover}
                initial="hidden"
                animate="show"
                exit="exit"
                className={cn(
                  "z-[60] min-w-56 origin-[var(--radix-dropdown-menu-content-transform-origin)] overflow-hidden rounded-xl border border-white/[0.09] bg-surface-2/95 p-1.5 shadow-lift backdrop-blur-xl",
                  className,
                )}
              >
                {children}
              </motion.div>
            </Dropdown.Content>
          </Dropdown.Portal>
        )}
      </AnimatePresence>
    </Dropdown.Root>
  );
}

export function DropdownItem({
  className,
  icon,
  children,
  hint,
  ...props
}: React.ComponentPropsWithoutRef<typeof Dropdown.Item> & { icon?: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <Dropdown.Item
      className={cn(
        "flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-fg/90 outline-none transition-colors data-[disabled]:cursor-not-allowed data-[highlighted]:bg-white/[0.06] data-[disabled]:opacity-45 [&_svg]:size-4 [&_svg]:text-muted",
        className,
      )}
      {...props}
    >
      {icon}
      <span className="flex-1">{children}</span>
      {hint && <span className="text-2xs text-subtle">{hint}</span>}
    </Dropdown.Item>
  );
}

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return <Dropdown.Label className="px-2.5 pb-1 pt-2 label-eyebrow">{children}</Dropdown.Label>;
}

export function DropdownSeparator() {
  return <Dropdown.Separator className="my-1.5 h-px bg-white/[0.06]" />;
}

export const DropdownRadioGroup = Dropdown.RadioGroup;

export function DropdownRadioItem({ children, className, ...props }: React.ComponentPropsWithoutRef<typeof Dropdown.RadioItem>) {
  return (
    <Dropdown.RadioItem
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-2.5 text-sm text-fg/90 outline-none data-[highlighted]:bg-white/[0.06]",
        className,
      )}
      {...props}
    >
      <Dropdown.ItemIndicator className="absolute left-2.5 grid size-4 place-items-center">
        <span className="size-1.5 rounded-full bg-accent-3" />
      </Dropdown.ItemIndicator>
      {children}
    </Dropdown.RadioItem>
  );
}
