"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useModels } from "@/features/platform/platform-provider";
import type { ModelCategory, ModelDefinition } from "@/lib/api/types";

/**
 * Selects a model from the catalog, honouring ?model= deep links and a
 * preferred default. Falls back to the first available model.
 */
export function useModelSelection(category: ModelCategory, preferred?: string) {
  const models = useModels(category);
  const params = useSearchParams();
  const requested = params.get("model");
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    if (!models.length) return;
    setSelectedId((current) => {
      if (current && models.some((m) => m.id === current)) return current;
      const candidates = [requested, preferred].filter(Boolean) as string[];
      return candidates.find((id) => models.some((m) => m.id === id)) ?? models[0]!.id;
    });
  }, [models, requested, preferred]);

  useEffect(() => {
    if (requested && models.some((m) => m.id === requested)) setSelectedId(requested);
  }, [requested, models]);

  const model: ModelDefinition | undefined = useMemo(() => models.find((m) => m.id === selectedId), [models, selectedId]);

  return { models, model, selectedId, setSelectedId };
}

/** Keeps a value valid when the allowed set changes (e.g. after switching models). */
export function useConstrained<T>(value: T, allowed: T[], setValue: (v: T) => void) {
  useEffect(() => {
    if (allowed.length && !allowed.includes(value)) setValue(allowed[0]!);
  }, [allowed, value, setValue]);
}
