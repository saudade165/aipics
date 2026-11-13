"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, ServerCrash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePlatform } from "@/features/platform/platform-provider";
import { env } from "@/lib/env";

export function ApiStatusBanner() {
  const { status, error, retry } = usePlatform();
  return (
    <AnimatePresence>
      {status === "error" && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
          <div className="mx-4 mt-4 flex flex-col gap-3 rounded-xl border border-danger/20 bg-danger/[0.06] p-4 sm:mx-6 sm:flex-row sm:items-center lg:mx-8">
            <ServerCrash className="size-5 shrink-0 text-danger" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium text-fg">Cannot reach the platform API</p>
              <p className="mt-0.5 text-xs text-muted">
                {error?.message} {env.apiUrl ? <>Expected at <code className="font-mono text-fg/80">{env.apiUrl}</code>.</> : "Set NEXT_PUBLIC_API_URL."} Model
                catalogs and pricing load from the backend.
              </p>
            </div>
            <Button size="sm" onClick={retry}>
              <RefreshCw />
              Retry
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
