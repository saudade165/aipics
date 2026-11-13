"use client";

import { MotionConfig } from "framer-motion";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * UI preferences held in React memory for the current session only.
 * Persistence will move to the account system once AUTH_ENABLED and
 * DATABASE_ENABLED are active; browser storage is intentionally not used.
 */
export interface Preferences {
  accent: "violet" | "indigo" | "cyan" | "rose";
  density: "comfortable" | "compact";
  reducedMotion: "system" | "always" | "never";
  language: string;
  sidebarCollapsed: boolean;
  notifications: { productUpdates: boolean; generationComplete: boolean; billing: boolean; weeklyDigest: boolean };
  defaults: { imageModel: string; videoModel: string; autoEnhancePrompt: boolean; showCostEstimates: boolean };
}

const DEFAULT_PREFERENCES: Preferences = {
  accent: "violet",
  density: "comfortable",
  reducedMotion: "system",
  language: "en",
  sidebarCollapsed: false,
  notifications: { productUpdates: true, generationComplete: true, billing: false, weeklyDigest: false },
  defaults: { imageModel: "flux", videoModel: "kling", autoEnhancePrompt: false, showCostEstimates: true },
};

interface PreferencesContextValue {
  preferences: Preferences;
  update: (patch: Partial<Preferences>) => void;
  reset: () => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.accent = preferences.accent;
    root.dataset.density = preferences.density;
    root.lang = preferences.language;
  }, [preferences.accent, preferences.density, preferences.language]);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      preferences,
      update: (patch) => setPreferences((p) => ({ ...p, ...patch })),
      reset: () => setPreferences(DEFAULT_PREFERENCES),
    }),
    [preferences],
  );

  const motionMode = preferences.reducedMotion === "system" ? "user" : preferences.reducedMotion;

  return (
    <PreferencesContext.Provider value={value}>
      <MotionConfig reducedMotion={motionMode}>{children}</MotionConfig>
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}
