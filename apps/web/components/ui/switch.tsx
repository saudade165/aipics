"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Switch = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        "focus-ring peer inline-flex h-[22px] w-[38px] shrink-0 cursor-pointer items-center rounded-full border border-white/[0.08] bg-white/[0.08] p-0.5 transition-colors duration-200 data-[state=checked]:border-transparent data-[state=checked]:bg-accent disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-4 rounded-full bg-white shadow-md transition-transform duration-200 ease-out-expo data-[state=checked]:translate-x-4" />
    </SwitchPrimitive.Root>
  ),
);
Switch.displayName = "Switch";
