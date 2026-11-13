"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/components/ui/toast";
import { PlatformProvider } from "@/features/platform/platform-provider";
import { PreferencesProvider } from "@/features/platform/preferences-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PreferencesProvider>
      <PlatformProvider>
        <TooltipProvider delayDuration={250}>
          <ToastProvider>{children}</ToastProvider>
        </TooltipProvider>
      </PlatformProvider>
    </PreferencesProvider>
  );
}
