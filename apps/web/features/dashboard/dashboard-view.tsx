"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Coins, Crown, FlaskConical, Megaphone, Plug, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranding, usePlatform } from "@/features/platform/platform-provider";
import { ModelAvatar } from "@/features/studio/model-avatar";
import { fadeUp, stagger } from "@/lib/motion";
import { NAV_ITEMS, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const TOOLS = NAV_ITEMS.filter((item) => item.feature);

const TOOL_ART: Record<string, { from: string; to: string }> = {
  "/image-studio": { from: "#8b5cf6", to: "#ec4899" },
  "/video-studio": { from: "#6366f1", to: "#22d3ee" },
  "/character-studio": { from: "#a855f7", to: "#6366f1" },
  "/image-upscaler": { from: "#22d3ee", to: "#10b981" },
  "/video-enhancer": { from: "#0ea5e9", to: "#8b5cf6" },
};

const CATEGORY_ROUTE: Record<string, string> = {
  image: "/image-studio",
  video: "/video-studio",
  character: "/character-studio",
  upscale: "/image-upscaler",
  video_enhance: "/video-enhancer",
};

// Static demonstration content — there is no usage tracking in this release.
const DEMO_RECENT = [
  { href: "/image-studio", detail: "FLUX · 16:9 · 2K" },
  { href: "/video-studio", detail: "Kling · 1080p · 5s" },
  { href: "/image-upscaler", detail: "Clarity Upscaler · 4×" },
];

const QUICK_STARTS = [
  { title: "Product photo", prompt: "Minimal product shot of a matte ceramic mug on a linen backdrop, soft studio lighting", href: "/image-studio", tag: "Image" },
  { title: "Cinematic landscape", prompt: "Wide cinematic shot of a mountain lake at dawn, low fog, golden rim light", href: "/image-studio", tag: "Image" },
  { title: "Portrait", prompt: "Editorial portrait with dramatic side lighting, shallow depth of field, 85mm", href: "/image-studio", tag: "Image" },
  { title: "Animate a still", prompt: "", href: "/video-studio", tag: "Video" },
];

function ToolArt({ href, icon: Icon }: { href: string; icon: NavItem["icon"] }) {
  const art = TOOL_ART[href] ?? { from: "#8b5cf6", to: "#22d3ee" };
  return (
    <div className="relative h-28 overflow-hidden rounded-lg border border-white/[0.06] bg-surface-2">
      <div className="absolute inset-0 opacity-70" style={{ background: `radial-gradient(120% 90% at 15% 0%, ${art.from}55, transparent 55%), radial-gradient(100% 100% at 100% 100%, ${art.to}44, transparent 60%)` }} />
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute -bottom-5 -right-3 text-white/[0.08] transition-transform duration-500 ease-out-expo group-hover:-translate-y-1 group-hover:scale-105">
        <Icon className="size-28" strokeWidth={1} />
      </div>
      <span className="absolute left-3 top-3 grid size-9 place-items-center rounded-lg border border-white/15 bg-black/30 text-white backdrop-blur">
        <Icon className="size-[18px]" strokeWidth={1.8} />
      </span>
    </div>
  );
}

export function DashboardView() {
  const router = useRouter();
  const branding = useBranding();
  const { catalog, features, config, status } = usePlatform();
  const [prompt, setPrompt] = useState("");

  const featured = (catalog?.models ?? []).filter((m) => m.badges.includes("Popular") || m.badges.includes("New")).slice(0, 4);
  const generationFeatures = features.filter((f) => f.category === "generation");
  const connected = features.filter((f) => f.available).length;

  const startImage = (text: string) => router.push(text.trim() ? `/image-studio?prompt=${encodeURIComponent(text.trim())}` : "/image-studio");

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="space-y-10">
      {/* Welcome */}
      <motion.section variants={fadeUp} className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-surface">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-32 size-[420px] rounded-full bg-accent/30 blur-[110px]" />
          <div className="absolute -bottom-40 right-0 size-[460px] rounded-full bg-accent-2/20 blur-[120px]" />
          <div className="absolute right-1/4 top-0 size-[260px] rounded-full bg-accent-3/10 blur-[90px]" />
          <div className="absolute inset-0 bg-grid opacity-40 mask-fade-b" />
        </div>
        <div className="relative px-6 py-10 sm:px-10 sm:py-14">
          <Badge tone="accent" className="mb-5"><Sparkles /> Platform preview · v{config?.app_version ?? "0.1.0"}</Badge>
          <h2 className="max-w-3xl text-3xl font-semibold leading-[1.1] tracking-tight sm:text-[44px]">
            Welcome to <span className="text-gradient">{branding.name}</span>
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            {branding.tagline || "One workspace for every generative model"}. Explore every studio today — generation switches on as providers are connected.
          </p>
          <form
            className="mt-8 flex max-w-2xl flex-col gap-2 rounded-xl border border-white/[0.1] bg-black/40 p-2 backdrop-blur-xl sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              startImage(prompt);
            }}
          >
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={500}
              aria-label="Describe an image to start in Image Studio"
              placeholder="Describe an idea to start in Image Studio…"
              className="h-11 flex-1 bg-transparent px-3 text-[15px] placeholder:text-subtle focus:outline-none"
            />
            <Button type="submit" variant="primary" size="lg" className="h-11">
              Open in studio
              <ArrowRight />
            </Button>
          </form>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-success" /> {TOOLS.length} studios available</span>
            <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-accent-3" /> {catalog?.total ?? "—"} models in catalog</span>
            <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-warning" /> {connected} of {features.length || "—"} integrations connected</span>
          </div>
        </div>
      </motion.section>

      {/* Quick access */}
      <motion.section variants={fadeUp}>
        <SectionHeading title="AI tools" description="Jump straight into a studio." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {TOOLS.map((tool) => (
            <motion.div key={tool.href} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}>
              <Link href={tool.href} className="card card-hover focus-ring group block p-3">
                <ToolArt href={tool.href} icon={tool.icon} />
                <div className="flex items-start justify-between gap-2 px-1.5 pb-1 pt-3.5">
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight">{tool.label}</h3>
                    <p className="mt-0.5 text-xs text-muted">{tool.description}</p>
                  </div>
                  <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-subtle transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-10">
          {/* Featured models */}
          <motion.section variants={fadeUp}>
            <SectionHeading title="Featured models" description="From the model catalog. Providers are not connected yet." />
            <div className="grid gap-3 sm:grid-cols-2">
              {status === "loading" && featured.length === 0 && [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[92px] rounded-xl" />)}
              {status !== "loading" && featured.length === 0 && <p className="card p-5 text-sm text-muted sm:col-span-2">The model catalog could not be loaded.</p>}
              {featured.map((m) => (
                <Link key={m.id} href={`${CATEGORY_ROUTE[m.category]}?model=${m.id}`} className="card card-hover focus-ring group flex items-center gap-4 p-4">
                  <ModelAvatar model={m} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold">{m.name}</h3>
                      {m.badges.slice(0, 1).map((b) => <Badge key={b} tone={b === "New" ? "accent" : "neutral"}>{b}</Badge>)}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted">{m.tagline}</p>
                    <p className="mt-1 text-2xs capitalize text-subtle">{m.vendor} · {m.category.replace("_", " ")}</p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
                </Link>
              ))}
            </div>
          </motion.section>

          {/* Quick generation */}
          <motion.section variants={fadeUp}>
            <SectionHeading title="Quick start" description="Open a studio with a starting prompt." />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {QUICK_STARTS.map((q) => (
                <button
                  key={q.title}
                  type="button"
                  onClick={() => (q.prompt ? startImage(q.prompt) : router.push(q.href))}
                  className="card card-hover focus-ring group flex flex-col p-4 text-left"
                >
                  <Badge className="self-start">{q.tag}</Badge>
                  <h3 className="mt-3 text-sm font-semibold">{q.title}</h3>
                  <p className="mt-1 line-clamp-3 flex-1 text-xs leading-relaxed text-muted">{q.prompt || "Upload a first frame and describe the motion you want."}</p>
                  <span className="mt-3 flex items-center gap-1 text-xs font-medium text-accent-3">
                    Use this <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              ))}
            </div>
          </motion.section>

          {/* Tools overview */}
          <motion.section variants={fadeUp}>
            <SectionHeading title="Available tools" description="Live integration status reported by the API." />
            <div className="card divide-y divide-white/[0.05]">
              {TOOLS.map((tool) => {
                const info = generationFeatures.find((f) => f.key === tool.feature);
                const Icon = tool.icon;
                return (
                  <Link key={tool.href} href={tool.href} className="focus-ring flex items-center gap-4 px-5 py-3.5 transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-white/[0.025]">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-muted"><Icon className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{tool.label}</p>
                      <p className="truncate text-xs text-subtle">{info?.description ?? tool.description}</p>
                    </div>
                    <Badge tone="success" className="hidden sm:inline-flex">Interface ready</Badge>
                    <Badge tone={info?.available ? "success" : "warning"}><Plug />{info?.available ? "Connected" : "Not connected"}</Badge>
                  </Link>
                );
              })}
            </div>
          </motion.section>
        </div>

        <div className="space-y-6">
          {/* Plan & tokens */}
          <motion.section variants={fadeUp} className="card relative overflow-hidden p-5">
            <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative flex items-center justify-between">
              <h3 className="text-sm font-semibold">Plan & tokens</h3>
              <Badge>Placeholder</Badge>
            </div>
            <div className="relative mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="flex items-center gap-1.5 text-2xs text-subtle"><Crown className="size-3 text-warning" /> Plan</p>
                <p className="mt-1 text-sm font-semibold">None</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="flex items-center gap-1.5 text-2xs text-subtle"><Coins className="size-3 text-warning" /> Tokens</p>
                <p className="mt-1 text-sm font-semibold tabular-nums">—</p>
              </div>
            </div>
            <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden />
            <p className="relative mt-3 text-xs leading-relaxed text-muted">Balances and subscriptions will appear here when the token wallet and billing are connected.</p>
            <Link href="/pricing" className={cn(buttonVariants({ variant: "secondary" }), "relative mt-4 w-full")}>Preview plans</Link>
          </motion.section>

          {/* Recently used */}
          <motion.section variants={fadeUp} className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Recently used</h3>
              <Badge tone="accent"><FlaskConical /> Demo data</Badge>
            </div>
            <ul className="mt-3 space-y-1">
              {DEMO_RECENT.map((r) => {
                const tool = NAV_ITEMS.find((n) => n.href === r.href)!;
                const Icon = tool.icon;
                return (
                  <li key={r.href}>
                    <Link href={r.href} className="focus-ring -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.035]">
                      <span className="grid size-8 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-muted"><Icon className="size-4" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium">{tool.label}</span>
                        <span className="block truncate text-2xs text-subtle">{r.detail}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 border-t border-white/[0.06] pt-3 text-2xs leading-relaxed text-subtle">Illustrative examples only. Real activity will be shown once accounts and history are connected.</p>
          </motion.section>

          {/* Announcements */}
          <motion.section variants={fadeUp} className="card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><Megaphone className="size-4 text-muted" /> What&apos;s new</h3>
            <ul className="mt-4 space-y-4">
              {status === "loading" && !config && [0, 1].map((i) => <Skeleton key={i} className="h-14" />)}
              {(config?.ui.announcements ?? []).map((a) => (
                <li key={a.id} className="relative pl-4">
                  <span className="absolute left-0 top-1.5 size-1.5 rounded-full bg-accent-3" />
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-medium">{a.title}</p>
                    <Badge>{a.tag}</Badge>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{a.body}</p>
                </li>
              ))}
              {status === "error" && !config && <li className="text-xs text-muted">Announcements are unavailable while the API is unreachable.</li>}
            </ul>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}
