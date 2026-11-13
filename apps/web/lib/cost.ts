import type { ModelDefinition } from "@/lib/api/types";

/**
 * Client-side mirror of apps/api/app/services/cost.py for instant feedback.
 * The backend estimate returned by /generations/preview is authoritative.
 */
export type CostInput =
  | { kind: "image"; resolution: string; outputs: number }
  | { kind: "video"; resolution: string; duration: number; audio?: boolean }
  | { kind: "upscale"; scale: number }
  | { kind: "video_enhance"; resolution: string; fps: number; seconds: number };

export function estimateTokens(model: ModelDefinition | undefined, input: CostInput): number {
  if (!model) return 0;
  const { pricing } = model;
  const resMult = (id: string) => model.resolutions.find((r) => r.id === id)?.multiplier ?? 1;
  let total: number;

  switch (input.kind) {
    case "image":
      total = pricing.base_tokens * resMult(input.resolution) * input.outputs;
      break;
    case "video":
      total = pricing.base_tokens * resMult(input.resolution) * input.duration;
      if (input.audio) total += pricing.audio_tokens_per_second * input.duration;
      break;
    case "upscale":
      total = pricing.base_tokens * (pricing.scale_multipliers[String(input.scale)] ?? 1);
      break;
    case "video_enhance":
      total = pricing.base_tokens * Math.max(input.seconds, 1) * resMult(input.resolution) * (pricing.fps_multipliers[String(input.fps)] ?? 1);
      break;
  }
  return Math.max(1, Math.ceil(total));
}
