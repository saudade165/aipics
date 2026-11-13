"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function ErrorFallback({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="card">
      <EmptyState
        icon={<TriangleAlert className="text-danger" />}
        title="Something went wrong"
        description={
          <>
            This view failed to render. {error.digest ? <>Reference: <code className="font-mono">{error.digest}</code>.</> : null} You can try
            again — the rest of the app keeps working.
          </>
        }
        action={
          <Button onClick={reset}>
            <RotateCcw />
            Try again
          </Button>
        }
      />
    </div>
  );
}
