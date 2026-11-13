import { z } from "zod";

export const promptSchema = z.string().trim().min(3, "Describe what you want in at least 3 characters.").max(4000, "Prompt is too long.");
export const negativePromptSchema = z.string().max(2000, "Negative prompt is too long.");
export const seedSchema = z
  .string()
  .trim()
  .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) <= 4294967295), "Seed must be a whole number between 0 and 4294967295.");

export type FieldErrors = Record<string, string>;

/** Runs a Zod schema and flattens issues into `{ field: message }`. */
export function validate<T>(schema: z.ZodType<T>, values: unknown): { ok: true; data: T } | { ok: false; errors: FieldErrors } {
  const result = schema.safeParse(values);
  if (result.success) return { ok: true, data: result.data };
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".") || "form";
    errors[key] ??= issue.message;
  }
  return { ok: false, errors };
}

export const parseSeed = (seed: string) => (seed.trim() === "" ? undefined : Number(seed));
