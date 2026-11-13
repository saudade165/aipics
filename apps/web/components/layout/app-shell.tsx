"use client";

import { useState } from "react";

import { ApiStatusBanner } from "./api-status-banner";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="relative flex min-h-dvh">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-48 left-1/3 h-[480px] w-[720px] rounded-full bg-accent/[0.07] blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[420px] w-[520px] rounded-full bg-accent-3/[0.04] blur-[120px]" />
      </div>
      <Sidebar />
      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMobileNav={() => setMobileOpen(true)} />
        <ApiStatusBanner />
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
