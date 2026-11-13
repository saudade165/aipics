"use client";

import { useEffect } from "react";

import { ErrorFallback } from "@/components/error-fallback";

export default function PlatformError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[route error]", error);
  }, [error]);
  return <ErrorFallback error={error} reset={reset} />;
}
