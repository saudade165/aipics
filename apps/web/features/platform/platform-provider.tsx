"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { ApiError, api } from "@/lib/api/client";
import type { FeatureInfo, ModelCategory, ModelDefinition, ModelCatalog, PlatformConfig, PricingResponse } from "@/lib/api/types";

type Status = "loading" | "ready" | "error";

interface PlatformState {
  status: Status;
  error: ApiError | null;
  config: PlatformConfig | null;
  features: FeatureInfo[];
  catalog: ModelCatalog | null;
  pricing: PricingResponse | null;
  retry: () => void;
}

const PlatformContext = createContext<PlatformState | null>(null);

/**
 * Loads all platform configuration from the backend once per session and
 * keeps it in React memory. Nothing is persisted in browser storage.
 */
export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<Omit<PlatformState, "retry">>({
    status: "loading",
    error: null,
    config: null,
    features: [],
    catalog: null,
    pricing: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, status: "loading", error: null }));
    Promise.all([api.config(), api.features(), api.models(), api.pricing()])
      .then(([config, features, catalog, pricing]) => {
        if (!cancelled) setState({ status: "ready", error: null, config, features: features.features, catalog, pricing });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const apiError = error instanceof ApiError ? error : new ApiError("Unexpected error while loading configuration.", 0, "unknown");
        console.warn("[platform] Failed to load configuration:", apiError.message);
        setState((s) => ({ ...s, status: "error", error: apiError }));
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const value = useMemo(() => ({ ...state, retry }), [state, retry]);

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used within PlatformProvider");
  return ctx;
}

export function useModels(category: ModelCategory): ModelDefinition[] {
  const { catalog } = usePlatform();
  return useMemo(() => catalog?.models.filter((m) => m.category === category) ?? [], [catalog, category]);
}

export function useFeature(key: string | undefined): FeatureInfo | undefined {
  const { features } = usePlatform();
  return key ? features.find((f) => f.key === key) : undefined;
}

export function useBranding() {
  const { config } = usePlatform();
  return config?.branding ?? { name: "Aether Studio", short_name: "Aether", tagline: "", support_email: null };
}
