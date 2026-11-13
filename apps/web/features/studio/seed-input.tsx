"use client";

import { Shuffle } from "lucide-react";

import { FieldError, Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";

import { Field } from "./field";

export function SeedInput({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  return (
    <Field label="Seed" hint="Use the same seed to reproduce a result. Leave empty for a random seed." htmlFor="seed">
      <div className="flex gap-2">
        <Input id="seed" inputMode="numeric" placeholder="Random" value={value} aria-invalid={Boolean(error)} onChange={(e) => onChange(e.target.value)} />
        <Tooltip content="Randomize seed">
          <button
            type="button"
            onClick={() => onChange(String(Math.floor(Math.random() * 4294967295)))}
            className="focus-ring grid size-10 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-surface-2/70 text-muted transition-colors hover:text-fg"
            aria-label="Randomize seed"
          >
            <Shuffle className="size-4" />
          </button>
        </Tooltip>
      </div>
      <FieldError message={error} />
    </Field>
  );
}
