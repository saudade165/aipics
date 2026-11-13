"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CreditCard, Globe, KeyRound, Lock, Palette, RotateCcw, Server, SlidersHorizontal, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { useModels, usePlatform } from "@/features/platform/platform-provider";
import { usePreferences, type Preferences } from "@/features/platform/preferences-provider";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "general", label: "General", icon: SlidersHorizontal },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "language", label: "Language", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account", icon: UserRound, soon: true },
  { id: "security", label: "Security", icon: Lock, soon: true },
  { id: "subscription", label: "Subscription", icon: CreditCard, soon: true },
  { id: "system", label: "System status", icon: Server },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const ACCENT_SWATCH: Record<Preferences["accent"], string> = {
  violet: "linear-gradient(135deg,#8b5cf6,#6366f1)",
  indigo: "linear-gradient(135deg,#6366f1,#3b82f6)",
  cyan: "linear-gradient(135deg,#22d3ee,#0ea5e9)",
  rose: "linear-gradient(135deg,#f43f5e,#a855f7)",
};

const workspaceSchema = z.object({
  workspaceName: z.string().trim().min(2, "Use at least 2 characters.").max(40, "Use 40 characters or fewer."),
  contactEmail: z.union([z.literal(""), z.string().email("Enter a valid email address.")]),
});
type WorkspaceForm = z.infer<typeof workspaceSchema>;

export function SettingsView() {
  const [section, setSection] = useState<SectionId>("general");
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-[28px]">Settings</h2>
        <p className="mt-1.5 text-sm text-muted">Preferences apply to this session only. They will sync to your account once sign-in is available.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[232px_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = s.id === section;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring relative flex h-10 shrink-0 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors",
                  active ? "text-fg" : "text-muted hover:bg-white/[0.03] hover:text-fg",
                )}
              >
                {active && <motion.span layoutId="settings-active" className="absolute inset-0 rounded-lg border border-white/[0.08] bg-white/[0.05]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <Icon className={cn("relative size-4", active ? "text-accent-3" : "text-subtle")} />
                <span className="relative whitespace-nowrap">{s.label}</span>
                {"soon" in s && <span className="relative ml-auto hidden text-2xs text-subtle lg:inline">Soon</span>}
              </button>
            );
          })}
        </nav>
        <AnimatePresence mode="wait">
          <motion.div key={section} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }} className="min-w-0 space-y-5">
            {section === "general" && <General />}
            {section === "appearance" && <Appearance />}
            {section === "language" && <Language />}
            {section === "notifications" && <Notifications />}
            {section === "account" && (
              <Placeholder icon={<UserRound />} title="Account" feature="auth" description="Profile details, connected sign-in methods and data export will be managed here.">
                <DisabledField label="Display name" placeholder="Your name" />
                <DisabledField label="Email" placeholder="you@example.com" />
              </Placeholder>
            )}
            {section === "security" && (
              <Placeholder icon={<KeyRound />} title="Security" feature="auth" description="Password, two-factor authentication and active sessions will be available with accounts.">
                <SettingRow title="Two-factor authentication" description="Add a second step when signing in" control={<Switch disabled aria-label="Two-factor authentication" />} />
                <SettingRow title="Active sessions" description="Review and sign out other devices" control={<Button size="sm" disabled>Manage</Button>} />
              </Placeholder>
            )}
            {section === "subscription" && (
              <Placeholder icon={<CreditCard />} title="Subscription" feature="payments" description="Your plan, token balance, invoices and payment methods will appear here once billing is enabled.">
                <SettingRow title="Current plan" description="No active plan" control={<Link href="/pricing" className={buttonVariants({ size: "sm" })}>View plans</Link>} />
                <SettingRow title="Token balance" description="Wallet not connected" control={<span className="text-sm tabular-nums text-subtle">—</span>} />
              </Placeholder>
            )}
            {section === "system" && <SystemStatus />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

function SettingsCard({ title, description, children, footer }: { title: string; description?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <section className="card overflow-hidden">
      <div className="border-b border-white/[0.06] px-6 py-5">
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      <div className="divide-y divide-white/[0.05] px-6">{children}</div>
      {footer && <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] bg-white/[0.015] px-6 py-4">{footer}</div>}
    </section>
  );
}

function SettingRow({ title, description, control }: { title: string; description?: string; control: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function General() {
  const { preferences, update, reset } = usePreferences();
  const toast = useToast();
  const imageModels = useModels("image");
  const videoModels = useModels("video");
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<WorkspaceForm>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { workspaceName: "Guest workspace", contactEmail: "" },
    mode: "onBlur",
  });
  const setDefaults = (patch: Partial<Preferences["defaults"]>) => update({ defaults: { ...preferences.defaults, ...patch } });

  return (
    <>
      <form
        noValidate
        onSubmit={handleSubmit(() => toast({ tone: "info", title: "Looks good", description: "The form is valid, but workspace details cannot be saved until accounts are connected." }))}
      >
        <SettingsCard
          title="Workspace"
          description="Basic details for this workspace."
          footer={<Button type="submit" variant="primary" disabled={!isDirty}>Save changes</Button>}
        >
          <div className="grid gap-5 py-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="workspaceName">Workspace name</Label>
              <Input id="workspaceName" className="mt-2" aria-invalid={Boolean(errors.workspaceName)} {...register("workspaceName")} />
              <FieldError message={errors.workspaceName?.message} />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact email</Label>
              <Input id="contactEmail" type="email" className="mt-2" placeholder="Optional" aria-invalid={Boolean(errors.contactEmail)} {...register("contactEmail")} />
              <FieldError message={errors.contactEmail?.message} />
            </div>
          </div>
        </SettingsCard>
      </form>

      <SettingsCard title="Generation defaults" description="Starting values used when you open a studio.">
        <SettingRow title="Default image model" control={<Select aria-label="Default image model" className="w-52" value={preferences.defaults.imageModel} onValueChange={(v) => setDefaults({ imageModel: v })} options={imageModels.map((m) => ({ value: m.id, label: m.name }))} placeholder="Unavailable" />} />
        <SettingRow title="Default video model" control={<Select aria-label="Default video model" className="w-52" value={preferences.defaults.videoModel} onValueChange={(v) => setDefaults({ videoModel: v })} options={videoModels.map((m) => ({ value: m.id, label: m.name }))} placeholder="Unavailable" />} />
        <SettingRow title="Show cost estimates" description="Display estimated tokens next to generate buttons" control={<Switch aria-label="Show cost estimates" checked={preferences.defaults.showCostEstimates} onCheckedChange={(v) => setDefaults({ showCostEstimates: v })} />} />
        <SettingRow title="Reset preferences" description="Restore all settings on this page to their defaults" control={<Button size="sm" onClick={() => { reset(); toast({ tone: "success", title: "Preferences reset" }); }}><RotateCcw />Reset</Button>} />
      </SettingsCard>
    </>
  );
}

function Appearance() {
  const { preferences, update } = usePreferences();
  return (
    <SettingsCard title="Appearance" description="Tune how the interface looks and moves.">
      <SettingRow title="Theme" description="A light theme is planned for a later release" control={<Segmented aria-label="Theme" size="sm" value="dark" onChange={() => undefined} options={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light", disabled: true }]} />} />
      <SettingRow
        title="Accent color"
        description="Used for highlights, buttons and active states"
        control={
          <div role="radiogroup" aria-label="Accent color" className="flex gap-2">
            {(Object.keys(ACCENT_SWATCH) as Preferences["accent"][]).map((accent) => (
              <button
                key={accent}
                type="button"
                role="radio"
                aria-checked={preferences.accent === accent}
                aria-label={accent}
                onClick={() => update({ accent })}
                className={cn("focus-ring size-8 rounded-full ring-2 ring-offset-2 ring-offset-surface transition-transform hover:scale-110", preferences.accent === accent ? "ring-white/70" : "ring-transparent")}
                style={{ background: ACCENT_SWATCH[accent] }}
              />
            ))}
          </div>
        }
      />
      <SettingRow title="Density" description="Compact fits more on screen" control={<Segmented aria-label="Density" size="sm" value={preferences.density} onChange={(v) => update({ density: v })} options={[{ value: "comfortable", label: "Comfortable" }, { value: "compact", label: "Compact" }]} />} />
      <SettingRow title="Motion" description="Reduce or disable interface animations" control={<Segmented aria-label="Motion" size="sm" value={preferences.reducedMotion} onChange={(v) => update({ reducedMotion: v })} options={[{ value: "system", label: "System" }, { value: "never", label: "Full" }, { value: "always", label: "Reduced" }]} />} />
      <SettingRow title="Collapsed sidebar" description="Show only icons in the navigation" control={<Switch aria-label="Collapsed sidebar" checked={preferences.sidebarCollapsed} onCheckedChange={(v) => update({ sidebarCollapsed: v })} />} />
    </SettingsCard>
  );
}

function Language() {
  const { preferences, update } = usePreferences();
  const { config } = usePlatform();
  const languages = config?.ui.languages ?? [{ code: "en", label: "English" }];
  return (
    <SettingsCard title="Language & region" description="Interface translations are in progress — the app is currently displayed in English.">
      <SettingRow title="Interface language" description="Your choice is remembered for this session" control={<Select aria-label="Interface language" className="w-52" value={preferences.language} onValueChange={(v) => update({ language: v })} options={languages.map((l) => ({ value: l.code, label: l.label, hint: l.code === "en" ? undefined : "Planned" }))} />} />
      <SettingRow title="Number format" description="Used for token amounts and prices" control={<span className="text-sm text-muted">1,234.56</span>} />
    </SettingsCard>
  );
}

function Notifications() {
  const { preferences, update } = usePreferences();
  const set = (patch: Partial<Preferences["notifications"]>) => update({ notifications: { ...preferences.notifications, ...patch } });
  const rows: { key: keyof Preferences["notifications"]; title: string; description: string }[] = [
    { key: "generationComplete", title: "Generation complete", description: "When a queued image or video finishes" },
    { key: "productUpdates", title: "Product updates", description: "New models and features" },
    { key: "billing", title: "Billing and tokens", description: "Low balance and renewal reminders" },
    { key: "weeklyDigest", title: "Weekly digest", description: "A summary of your activity" },
  ];
  return (
    <SettingsCard title="Notifications" description="Choose what you want to hear about. Delivery starts once accounts are connected.">
      {rows.map((r) => (
        <SettingRow key={r.key} title={r.title} description={r.description} control={<Switch aria-label={r.title} checked={preferences.notifications[r.key]} onCheckedChange={(v) => set({ [r.key]: v })} />} />
      ))}
    </SettingsCard>
  );
}

function DisabledField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="py-4">
      <Label>{label}</Label>
      <Input className="mt-2 max-w-sm" placeholder={placeholder} disabled aria-label={label} />
    </div>
  );
}

function Placeholder({ icon, title, description, feature, children }: { icon: React.ReactNode; title: string; description: string; feature: string; children: React.ReactNode }) {
  const { features } = usePlatform();
  const info = features.find((f) => f.key === feature);
  return (
    <>
      <div className="card flex items-start gap-4 border-warning/15 bg-warning/[0.03] p-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-muted [&_svg]:size-5">{icon}</span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{title} is not available yet</p>
            <Badge tone="warning">Future release</Badge>
          </div>
          <p className="mt-1 text-sm text-muted">{description}</p>
          {info && <p className="mt-2 font-mono text-2xs text-subtle">{info.env_var}={String(info.flag_enabled)}</p>}
        </div>
      </div>
      <div className="pointer-events-none select-none opacity-60" aria-hidden={false}>
        <SettingsCard title={title}>{children}</SettingsCard>
      </div>
    </>
  );
}

function SystemStatus() {
  const { features, config, status, retry } = usePlatform();
  const groups = ["generation", "account", "infrastructure"] as const;
  return (
    <>
      <SettingsCard title="API connection" description="The web app reads configuration, catalogs and feature flags from the backend.">
        <SettingRow title="Endpoint" description={env.staticData ? "Static demo: build-time data snapshot, no live API" : env.apiUrl || "NEXT_PUBLIC_API_URL is not set"} control={<Badge tone={status === "ready" ? "success" : status === "loading" ? "neutral" : "danger"}>{status === "ready" ? "Connected" : status === "loading" ? "Connecting…" : "Unreachable"}</Badge>} />
        <SettingRow title="API version" description={config ? `Environment: ${config.environment}` : undefined} control={<span className="font-mono text-sm text-muted">{config?.app_version ?? "—"}</span>} />
        <SettingRow title="Reload configuration" control={<Button size="sm" onClick={retry}><RotateCcw />Reload</Button>} />
      </SettingsCard>
      {groups.map((group) => {
        const items = features.filter((f) => f.category === group);
        if (!items.length) return null;
        return (
          <SettingsCard key={group} title={`${group[0]!.toUpperCase()}${group.slice(1)} integrations`}>
            {items.map((f) => (
              <SettingRow
                key={f.key}
                title={f.name}
                description={f.description}
                control={
                  <div className="flex items-center gap-2">
                    <code className="hidden font-mono text-2xs text-subtle md:inline">{f.env_var}</code>
                    <Badge tone={f.available ? "success" : "warning"}>{f.available ? "Active" : f.status === "provider_not_configured" ? "No provider" : "Disabled"}</Badge>
                  </div>
                }
              />
            ))}
          </SettingsCard>
        );
      })}
    </>
  );
}
