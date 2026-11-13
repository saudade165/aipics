"use client";

import { Bell, ChevronRight, Coins, Crown, LogIn, Menu, Search, Settings, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownItem, DropdownLabel, DropdownMenu, DropdownSeparator } from "@/components/ui/dropdown-menu";
import { Tooltip } from "@/components/ui/tooltip";
import { usePlatform } from "@/features/platform/platform-provider";
import { findNavItem } from "@/lib/navigation";

import { CommandPalette, Kbd } from "./command-palette";

export function Header({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const current = findNavItem(pathname);
  const { config } = usePlatform();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const announcements = config?.ui.announcements ?? [];

  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-bg/70 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="icon" className="-ml-1.5 lg:hidden" onClick={onOpenMobileNav} aria-label="Open navigation">
          <Menu className="!size-5" />
        </Button>

        <div className="min-w-0 flex-1">
          <nav aria-label="Breadcrumb" className="hidden items-center gap-1 text-2xs text-subtle sm:flex">
            <Link href="/" className="hover:text-muted">Home</Link>
            {current && current.href !== "/" && (
              <>
                <ChevronRight className="size-3" />
                <span>{current.section}</span>
              </>
            )}
          </nav>
          <h1 className="truncate text-[15px] font-semibold tracking-tight sm:text-base">{current?.label ?? "Not found"}</h1>
        </div>

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="focus-ring hidden h-9 w-64 items-center gap-2.5 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 text-sm text-subtle transition-colors hover:border-white/[0.12] hover:text-muted xl:flex 2xl:w-72"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">Search tools & models</span>
          <span className="flex gap-1"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
        </button>
        <Button variant="ghost" size="icon" className="xl:hidden" onClick={() => setSearchOpen(true)} aria-label="Search">
          <Search />
        </Button>

        <Tooltip content="Token wallet is not connected yet. Balances appear once billing is enabled.">
          <div className="hidden h-9 items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 text-sm sm:flex" tabIndex={0}>
            <Coins className="size-4 text-warning" />
            <span className="font-medium tabular-nums text-muted">—</span>
            <span className="text-xs text-subtle">tokens</span>
          </div>
        </Tooltip>

        <Button variant="primary" size="sm" className="hidden h-9 sm:inline-flex" onClick={() => router.push("/pricing")}>
          <Crown />
          Upgrade
        </Button>

        <DropdownMenu
          className="w-80"
          trigger={
            <Button variant="ghost" size="icon" aria-label="Announcements" className="relative">
              <Bell />
              {announcements.length > 0 && <span className="absolute right-2 top-2 size-1.5 rounded-full bg-accent-3 ring-2 ring-bg" />}
            </Button>
          }
        >
          <DropdownLabel>Announcements</DropdownLabel>
          {announcements.length === 0 && <p className="px-2.5 py-3 text-sm text-muted">Nothing new right now.</p>}
          {announcements.map((a) => (
            <DropdownItem key={a.id} className="items-start py-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-fg">{a.title}</span>
                  <Badge tone="accent">{a.tag}</Badge>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted">{a.body}</p>
              </div>
            </DropdownItem>
          ))}
        </DropdownMenu>

        <DropdownMenu
          trigger={
            <button type="button" aria-label="Account menu" className="focus-ring grid size-9 place-items-center rounded-full border border-white/[0.1] bg-gradient-to-br from-white/[0.08] to-white/[0.02] text-muted transition-colors hover:text-fg">
              <UserRound className="size-4" />
            </button>
          }
        >
          <div className="px-2.5 pb-2 pt-1.5">
            <p className="text-sm font-medium">Guest workspace</p>
            <p className="text-xs text-subtle">Accounts are not enabled yet</p>
          </div>
          <DropdownSeparator />
          <DropdownItem icon={<LogIn />} disabled hint="Soon">Sign in</DropdownItem>
          <DropdownItem icon={<ShieldCheck />} disabled hint="Soon">Security</DropdownItem>
          <DropdownSeparator />
          <DropdownItem icon={<Settings />} onSelect={() => router.push("/settings")}>Settings</DropdownItem>
          <DropdownItem icon={<Crown />} onSelect={() => router.push("/pricing")}>Plans & pricing</DropdownItem>
        </DropdownMenu>
      </div>
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
