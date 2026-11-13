"use client";

import { Dices, Eraser, WandSparkles } from "lucide-react";
import { useId } from "react";

import { FieldError, Textarea } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function PromptField({
  value,
  onChange,
  label = "Prompt",
  placeholder,
  maxLength = 4000,
  error,
  samples,
  minRows = 5,
  enhance = true,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder: string;
  maxLength?: number;
  error?: string;
  /** Curated example prompts for "Inspire me" — local only, no AI involved. */
  samples?: string[];
  minRows?: number;
  enhance?: boolean;
  className?: string;
}) {
  const id = useId();
  const pickSample = () => {
    if (!samples?.length) return;
    const options = samples.filter((s) => s !== value);
    onChange(options[Math.floor(Math.random() * options.length)] ?? samples[0]!);
  };

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2.5 block text-[13px] font-medium text-fg/90">
        {label}
      </label>
      <div
        className={cn(
          "rounded-xl border bg-surface-2/60 transition-colors focus-within:border-accent/45 focus-within:ring-4 focus-within:ring-accent/10",
          error ? "border-danger/50" : "border-white/[0.08] hover:border-white/[0.12]",
        )}
      >
        <Textarea
          id={id}
          value={value}
          rows={minRows}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="border-0 bg-transparent text-[14.5px] hover:border-0 focus:bg-transparent focus:ring-0"
        />
        <div className="flex items-center gap-1.5 px-2.5 pb-2.5">
          {samples && (
            <button type="button" onClick={pickSample} className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 text-xs font-medium text-muted transition-colors hover:bg-white/[0.06] hover:text-fg">
              <Dices className="size-3.5" />
              Inspire me
            </button>
          )}
          {enhance && (
            <Tooltip content="Prompt enhancement uses an AI model and will be available once providers are connected.">
              <span tabIndex={0} className="inline-flex h-8 cursor-not-allowed items-center gap-1.5 rounded-lg border border-white/[0.05] px-2.5 text-xs font-medium text-subtle">
                <WandSparkles className="size-3.5" />
                Enhance
              </span>
            </Tooltip>
          )}
          {value && (
            <button type="button" onClick={() => onChange("")} className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs text-subtle transition-colors hover:text-fg" aria-label="Clear prompt">
              <Eraser className="size-3.5" />
            </button>
          )}
          <span className={cn("ml-auto pr-1 text-2xs tabular-nums", value.length > maxLength * 0.9 ? "text-warning" : "text-subtle")}>
            {value.length} / {maxLength}
          </span>
        </div>
      </div>
      <FieldError message={error} />
    </div>
  );
}
