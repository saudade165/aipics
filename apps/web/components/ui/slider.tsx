"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Slider = forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <SliderPrimitive.Root ref={ref} className={cn("relative flex h-5 w-full touch-none select-none items-center", className)} {...props}>
      <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-white/[0.08]">
        <SliderPrimitive.Range className="absolute h-full bg-accent-gradient" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        aria-label={props["aria-label"]}
        className="focus-ring block size-4 rounded-full border-2 border-white bg-accent shadow-[0_0_0_4px_rgb(var(--accent)/0.15)] transition-transform hover:scale-110"
      />
    </SliderPrimitive.Root>
  ),
);
Slider.displayName = "Slider";
