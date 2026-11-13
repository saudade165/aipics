"use client";

import { useCallback, useState } from "react";

import { useToast } from "@/components/ui/toast";
import { ApiError, api } from "@/lib/api/client";
import type { GenerationPreviewResponse, GenerationRequest } from "@/lib/api/types";

const DISABLED_MESSAGE = "AI integrations are not connected yet.";

/**
 * Sends a configuration to POST /generations/preview for server-side
 * validation. The backend never generates content in this release; the UI
 * always surfaces the "not connected" notice.
 */
export function useGenerationPreview() {
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<GenerationPreviewResponse | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submit = useCallback(
    async (payload: GenerationRequest) => {
      setPending(true);
      setFieldErrors({});
      try {
        const response = await api.previewGeneration(payload);
        setResult(response);
        toast({
          tone: "integration",
          title: DISABLED_MESSAGE,
          description: (
            <>
              Your {response.model_name} settings passed validation (est. {response.estimated_cost.tokens} tokens), but nothing was generated.
              Generation will be available once providers are connected.
            </>
          ),
          duration: 7000,
        });
      } catch (error) {
        if (error instanceof ApiError && error.status === 422) {
          setFieldErrors(Object.fromEntries(error.details.map((d) => [d.field, d.message])));
          toast({ tone: "error", title: "Check your settings", description: error.details[0]?.message ?? error.message });
        } else {
          toast({
            tone: "integration",
            title: DISABLED_MESSAGE,
            description: "The API could not validate this request right now. Generation is disabled in this release either way.",
          });
        }
      } finally {
        setPending(false);
      }
    },
    [toast],
  );

  return { submit, pending, result, fieldErrors };
}
