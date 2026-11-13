"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Coins, CreditCard, Info, Minus } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlatform } from "@/features/platform/platform-provider";
import type { Plan } from "@/lib/api/types";
import { fadeUp, stagger } from "@/lib/motion";
import { cn, formatNumber } from "@/lib/utils";

type Interval = "monthly" | "annual";

export function PricingView() {
  const { pricing, status } = usePlatform();
  const [interval, setInterval] = useState<Interval>("monthly");
  const [selected, setSelected] = useState<Plan | null>(null);

  const symbol = pricing?.currency === "USD" ? "$" : `${pricing?.currency ?? ""} `;
  const priceOf = (plan: Plan) => {
    const value = interval === "annual" ? plan.annual_monthly_price : plan.monthly_price;
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  };

  return (
    <>
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <Badge tone="warning" className="mb-4"><CreditCard /> Billing is not enabled yet</Badge>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Plans for every stage of <span className="text-gradient">creation</span></h2>
        <p className="mt-3 text-sm text-muted">Preview the upcoming subscription tiers. Prices and token amounts are loaded from configuration and may change before launch.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Segmented
            aria-label="Billing interval"
            value={interval}
            onChange={setInterval}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "annual", label: <>Annual <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-2xs text-success">−{pricing?.annual_discount_percent ?? 20}%</span></> },
            ]}
          />
        </div>
      </div>

      {status === "loading" && !pricing && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[460px] rounded-xl" />)}</div>
      )}
      {status === "error" && !pricing && <p className="card p-8 text-center text-sm text-muted">Pricing could not be loaded from the API.</p>}

      {pricing && (
        <>
          <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pricing.plans.map((plan) => (
              <motion.div
                key={plan.id}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className={cn("card relative flex flex-col overflow-hidden p-6", plan.highlight && "border-accent/40 shadow-glow")}
              >
                {plan.highlight && (
                  <>
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-accent/[0.14] to-transparent" />
                    <Badge tone="accent" className="absolute right-4 top-4">Most popular</Badge>
                  </>
                )}
                <p className="relative text-xs font-semibold uppercase tracking-[0.16em] text-muted">{plan.name}</p>
                <p className="relative mt-1 text-xs text-subtle">{plan.tagline}</p>
                <div className="relative mt-5 flex h-12 items-end gap-1.5">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={`${plan.id}-${interval}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="text-4xl font-semibold tracking-tight tabular-nums"
                    >
                      {plan.monthly_price === 0 ? "Free" : `${symbol}${priceOf(plan)}`}
                    </motion.span>
                  </AnimatePresence>
                  {plan.monthly_price > 0 && <span className="pb-1.5 text-xs text-subtle">/ month{interval === "annual" && ", billed yearly"}</span>}
                </div>
                <div className="relative mt-5 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2.5 text-sm">
                  <Coins className="size-4 text-warning" />
                  <span className="font-semibold tabular-nums">{formatNumber(plan.monthly_tokens)}</span>
                  <span className="text-muted">tokens / month</span>
                </div>
                <dl className="relative mt-5 space-y-2.5 text-xs">
                  <Row k="Model access" v={plan.model_access} />
                  <Row k="Concurrent generations" v={String(plan.limits.concurrent_jobs)} />
                  <Row k="Max video length" v={`${plan.limits.max_video_seconds}s`} />
                  <Row k="Max resolution" v={plan.limits.max_resolution} />
                </dl>
                <ul className="relative mt-5 flex-1 space-y-2 border-t border-white/[0.06] pt-5 text-[13px]">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-fg/90">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-accent-3" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.highlight ? "primary" : "secondary"} className="relative mt-6 w-full" onClick={() => setSelected(plan)}>
                  {plan.monthly_price === 0 ? "Start with Explorer" : plan.cta}
                </Button>
                <p className="relative mt-2 text-center text-2xs text-subtle">Available in a future release</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-muted">
            <Info className="mt-0.5 size-4 shrink-0 text-accent-3" />
            {pricing.billing_enabled_note}
          </div>

          <section className="mt-12">
            <h3 className="mb-4 text-lg font-semibold tracking-tight">Compare plans</h3>
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="w-[28%] px-5 py-4 text-left text-xs font-medium text-subtle">Feature</th>
                    {pricing.plans.map((p) => (
                      <th key={p.id} className={cn("px-4 py-4 text-center text-xs font-semibold uppercase tracking-[0.12em]", p.highlight ? "text-accent-3" : "text-muted")}>{p.name}</th>
                    ))}
                  </tr>
                </thead>
                {pricing.comparison.map((group) => (
                  <tbody key={group.group}>
                    <tr>
                      <th colSpan={pricing.plans.length + 1} className="bg-white/[0.02] px-5 py-2.5 text-left label-eyebrow">{group.group}</th>
                    </tr>
                    {group.rows.map((row) => (
                      <tr key={row.label} className="border-t border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                        <td className="px-5 py-3 text-[13px] text-fg/90">{row.label}</td>
                        {pricing.plans.map((p) => {
                          const v = row.values[p.id];
                          return (
                            <td key={p.id} className="px-4 py-3 text-center text-[13px] tabular-nums text-muted">
                              {v === true ? <Check className="mx-auto size-4 text-success" aria-label="Included" /> : v === false || v === undefined ? <Minus className="mx-auto size-4 text-subtle/60" aria-label="Not included" /> : v}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            </div>
          </section>
        </>
      )}

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        title="Billing will be enabled in a future release"
        description={selected ? `The ${selected.name} plan cannot be purchased yet. No payment details are collected and nothing is charged.` : undefined}
        footer={<Button variant="primary" onClick={() => setSelected(null)}>Got it</Button>}
      >
        {selected && (
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{selected.name}</span>
              <span className="tabular-nums text-muted">{selected.monthly_price === 0 ? "Free" : `${symbol}${priceOf(selected)} / month`}</span>
            </div>
            <p className="mt-1 text-xs text-subtle">{formatNumber(selected.monthly_tokens)} tokens per month · {interval === "annual" ? "annual" : "monthly"} billing (planned)</p>
          </div>
        )}
      </Dialog>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-subtle">{k}</dt>
      <dd className="text-right text-fg/90">{v}</dd>
    </div>
  );
}
