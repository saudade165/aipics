"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Tooltip } from "@/components/ui/tooltip";
import { useBranding } from "@/features/platform/platform-provider";
import { usePreferences } from "@/features/platform/preferences-provider";
import { easeOutExpo, spring } from "@/lib/motion";
import { NAV_ITEMS, NAV_SECTIONS, findNavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

import { LogoMark } from "./logo";

export function SidebarNav({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = findNavItem(pathname);

  return (
    <nav aria-label="Main" className="flex flex-col gap-5">
      {NAV_SECTIONS.map((section) => (
        <div key={section}>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="label-eyebrow mb-1.5 px-3"
              >
                {section}
              </motion.p>
            )}
          </AnimatePresence>
          {collapsed && <div className="mx-auto mb-2 h-px w-6 bg-white/[0.06]" />}
          <ul className="flex flex-col gap-0.5">
            {NAV_ITEMS.filter((item) => item.section === section).map((item) => {
              const isActive = active?.href === item.href;
              const Icon = item.icon;
              const link = (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "focus-ring group relative flex h-10 items-center gap-3 rounded-lg text-sm font-medium transition-colors duration-200",
                    collapsed ? "justify-center px-0" : "px-3",
                    isActive ? "text-fg" : "text-muted hover:bg-white/[0.035] hover:text-fg",
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId={collapsed ? "nav-active-collapsed" : "nav-active"}
                      transition={spring}
                      className="absolute inset-0 rounded-lg border border-white/[0.08] bg-gradient-to-r from-accent/[0.16] via-white/[0.04] to-white/[0.02] shadow-[inset_0_1px_0_rgb(255_255_255/0.05)]"
                    >
                      <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-x-px -translate-y-1/2 rounded-full bg-accent-3 shadow-[0_0_12px_rgb(var(--accent-3)/0.8)]" />
                    </motion.span>
                  )}
                  <Icon
                    className={cn(
                      "relative size-[18px] shrink-0 transition-colors",
                      isActive ? "text-accent-3" : "text-subtle group-hover:text-fg",
                    )}
                    strokeWidth={1.8}
                  />
                  {!collapsed && <span className="relative truncate">{item.label}</span>}
                </Link>
              );
              return (
                <li key={item.href}>
                  {collapsed ? (
                    <Tooltip content={item.label} side="right">
                      {link}
                    </Tooltip>
                  ) : (
                    link
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function PlanCard({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-4">
      <div className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-accent/25 blur-2xl" />
      <div className="relative flex items-center justify-between">
        <span className="label-eyebrow">Plan</span>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-2xs text-muted">Preview</span>
      </div>
      <p className="relative mt-2 text-sm font-semibold">No active plan</p>
      <p className="relative mt-1 text-xs leading-relaxed text-muted">Subscriptions and tokens arrive with the billing release.</p>
      <Link
        href="/pricing"
        onClick={onNavigate}
        className="focus-ring relative mt-3 flex h-8 items-center justify-center gap-1.5 rounded-lg bg-white/[0.06] text-xs font-medium text-fg transition-colors hover:bg-white/[0.1]"
      >
        <Crown className="size-3.5 text-warning" />
        View plans
      </Link>
    </div>
  );
}

export function Sidebar() {
  const { preferences, update } = usePreferences();
  const branding = useBranding();
  const collapsed = preferences.sidebarCollapsed;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 264 }}
      transition={{ duration: 0.4, ease: easeOutExpo }}
      className="sticky top-0 z-30 hidden h-dvh shrink-0 flex-col border-r border-white/[0.06] bg-surface/40 lg:flex"
    >
      <div className={cn("flex h-16 items-center gap-3", collapsed ? "justify-center px-0" : "px-5")}>
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-lg" aria-label={`${branding.name} home`}>
          <LogoMark />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="whitespace-nowrap text-[15px] font-semibold tracking-tight"
              >
                {branding.name}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      <div className={cn("no-scrollbar flex-1 overflow-y-auto overflow-x-hidden py-4", collapsed ? "px-3" : "px-3")}>
        <SidebarNav collapsed={collapsed} />
      </div>

      <div className={cn("border-t border-white/[0.06] p-3", collapsed && "flex flex-col items-center")}>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-3 [@media(max-height:820px)]:hidden">
              <PlanCard />
            </motion.div>
          )}
        </AnimatePresence>
        <Tooltip content={collapsed ? "Expand sidebar" : "Collapse sidebar"} side="right">
          <button
            type="button"
            onClick={() => update({ sidebarCollapsed: !collapsed })}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "focus-ring flex h-9 items-center gap-2.5 rounded-lg text-sm text-subtle transition-colors hover:bg-white/[0.04] hover:text-fg",
              collapsed ? "w-10 justify-center" : "w-full px-3",
            )}
          >
            {collapsed ? <PanelLeftOpen className="size-[18px]" /> : <PanelLeftClose className="size-[18px]" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </Tooltip>
      </div>
    </motion.aside>
  );
}
