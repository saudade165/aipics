"use client";

import { Plug } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { useFeature } from "@/features/platform/platform-provider";

const STATUS_LABEL = {
  active: "Connected",
  disabled: "Integration disabled",
  provider_not_configured: "Provider missing",
} as const;

export function IntegrationBadge({ feature }: { feature: string }) {
  const info = useFeature(feature);
  const status = info?.status ?? "disabled";
  return (
    <Tooltip content={info?.message ?? "AI integrations are not connected yet."}>
      <span tabIndex={0}>
        <Badge tone={status === "active" ? "success" : "warning"}>
          <Plug />
          {STATUS_LABEL[status]}
        </Badge>
      </span>
    </Tooltip>
  );
}

export function StudioIntro({ title, description, feature, children }: { title: string; description: string; feature: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-[28px]">{title}</h2>
          <IntegrationBadge feature={feature} />
        </div>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}
