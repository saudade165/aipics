"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CircleAlert, CircleCheck, Info, Plug, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ToastTone = "info" | "success" | "error" | "integration";

interface ToastItem {
  id: number;
  title: string;
  description?: React.ReactNode;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (toast: Omit<ToastItem, "id" | "tone"> & { tone?: ToastTone; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastTone, React.ReactNode> = {
  info: <Info className="text-accent-3" />,
  success: <CircleCheck className="text-success" />,
  error: <CircleAlert className="text-danger" />,
  integration: <Plug className="text-warning" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const toast = useCallback<ToastContextValue["toast"]>(
    ({ duration = 5000, tone = "info", ...rest }) => {
      const id = ++counter.current;
      setToasts((list) => [...list.slice(-3), { id, tone, ...rest }]);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-[80] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: easeOutExpo } }}
              exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
              role="status"
              className={cn(
                "pointer-events-auto relative flex w-full max-w-sm gap-3 overflow-hidden rounded-xl border border-white/[0.09] bg-surface-2/95 p-4 pr-10 shadow-lift backdrop-blur-xl sm:w-96",
                "[&>svg]:mt-0.5 [&>svg]:size-[18px] [&>svg]:shrink-0",
              )}
            >
              {t.tone === "integration" && <div className="absolute inset-y-0 left-0 w-0.5 bg-warning/70" />}
              {ICONS[t.tone]}
              <div className="min-w-0">
                <p className="text-sm font-medium text-fg">{t.title}</p>
                {t.description && <div className="mt-1 text-xs leading-relaxed text-muted">{t.description}</div>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="focus-ring absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-md text-subtle hover:bg-white/[0.06] hover:text-fg"
              >
                <X className="size-3.5" />
                <span className="sr-only">Dismiss</span>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.toast;
}
