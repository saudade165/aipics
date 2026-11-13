"use client";

import { Image as ImageIcon, Images, Layers } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { z } from "zod";

import { Select } from "@/components/ui/select";
import { SectionHeading } from "@/components/ui/section-heading";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { usePreferences } from "@/features/platform/preferences-provider";
import { Collapsible, Field, Panel, ToggleRow } from "@/features/studio/field";
import { GenerateBar } from "@/features/studio/generate-bar";
import { StudioIntro } from "@/features/studio/integration-notice";
import { ModelCatalogGrid } from "@/features/studio/model-catalog-grid";
import { ModelPicker } from "@/features/studio/model-picker";
import { OptionGrid, ratioOptions } from "@/features/studio/option-grid";
import { OutputStage } from "@/features/studio/output-stage";
import { PromptField } from "@/features/studio/prompt-field";
import { negativePromptSchema, parseSeed, promptSchema, seedSchema, validate, type FieldErrors } from "@/features/studio/schemas";
import { SeedInput } from "@/features/studio/seed-input";
import { StudioLayout } from "@/features/studio/studio-layout";
import { DropzoneMulti } from "@/features/studio/upload";
import { useGenerationPreview } from "@/hooks/use-generation-preview";
import { useMediaUpload } from "@/hooks/use-media-upload";
import { useConstrained, useModelSelection } from "@/hooks/use-model-selection";
import { estimateTokens } from "@/lib/cost";
import { toDescriptor } from "@/lib/files";

const SAMPLES = [
  "Editorial portrait of a ceramic artist in a sunlit studio, soft window light, 85mm, shallow depth of field",
  "Isometric floating island with a tiny observatory, pastel dusk sky, clean 3D render",
  "Minimal product shot of a matte black wireless speaker on travertine stone, studio lighting",
  "Rain-soaked neon alley in Tokyo at night, cinematic wide shot, reflections on wet asphalt",
  "Botanical illustration of a monstera leaf, gouache texture, cream paper background",
];

const formSchema = z.object({ prompt: promptSchema, negative_prompt: negativePromptSchema, seed: seedSchema });

export function ImageStudio() {
  const { preferences } = usePreferences();
  const { models, model, selectedId, setSelectedId } = useModelSelection("image", preferences.defaults.imageModel);
  const references = useMediaUpload("image", { max: model?.max_reference_images || 8 });
  const { submit, pending, result, fieldErrors } = useGenerationPreview();

  const initialPrompt = useSearchParams().get("prompt")?.slice(0, 4000) ?? "";
  const [prompt, setPrompt] = useState(initialPrompt);
  const [negative, setNegative] = useState("");
  const [aspect, setAspect] = useState("1:1");
  const [resolution, setResolution] = useState("");
  const [outputs, setOutputs] = useState(1);
  const [seed, setSeed] = useState("");
  const [guidance, setGuidance] = useState(3.5);
  const [format, setFormat] = useState("png");
  const [safety, setSafety] = useState(true);
  const [errors, setErrors] = useState<FieldErrors>({});

  const aspects = useMemo(() => model?.aspect_ratios ?? [], [model]);
  const resolutions = useMemo(() => model?.resolutions.map((r) => r.id) ?? [], [model]);
  const outputCounts = useMemo(() => Array.from({ length: model?.max_outputs ?? 1 }, (_, i) => i + 1), [model]);
  useConstrained(aspect, aspects, setAspect);
  useConstrained(resolution, resolutions, setResolution);
  useConstrained(outputs, outputCounts, setOutputs);

  const maxRefs = model?.max_reference_images ?? 0;
  const tokens = estimateTokens(model, { kind: "image", resolution, outputs });
  const allErrors = { ...fieldErrors, ...errors };

  const onGenerate = () => {
    const parsed = validate(formSchema, { prompt, negative_prompt: negative, seed });
    const next: FieldErrors = parsed.ok ? {} : parsed.errors;
    if (references.items.length > maxRefs) next.references = `${model?.name} accepts up to ${maxRefs} reference image(s).`;
    setErrors(next);
    if (Object.keys(next).length || !model) return;
    void submit({
      kind: "image",
      model_id: model.id,
      prompt: prompt.trim(),
      negative_prompt: model.supports_negative_prompt && negative.trim() ? negative.trim() : undefined,
      aspect_ratio: aspect,
      resolution,
      num_outputs: outputs,
      guidance,
      seed: parseSeed(seed),
      references: references.items.map(toDescriptor),
    });
  };

  const [rw = 1, rh = 1] = aspect.split(":").map(Number);

  return (
    <>
      <StudioIntro title="Image Studio" description="Describe an image, add references and choose a model. The catalog is loaded from the API, so new models appear here automatically." feature="ai_image" />
      <StudioLayout
        main={
          <>
            <Panel>
              <PromptField value={prompt} onChange={setPrompt} placeholder="Describe the image you want to create…" samples={SAMPLES} error={allErrors.prompt} />
              {model?.supports_negative_prompt && (
                <PromptField
                  className="mt-4"
                  label="Negative prompt"
                  value={negative}
                  onChange={setNegative}
                  maxLength={2000}
                  minRows={2}
                  enhance={false}
                  placeholder="What to avoid: blur, watermark, extra fingers…"
                  error={allErrors.negative_prompt}
                />
              )}
            </Panel>

            <Panel title="Reference images" icon={<Images />} action={<span className="text-xs text-subtle">{references.items.length} / {maxRefs}</span>}>
              {maxRefs > 0 ? (
                <>
                  <DropzoneMulti upload={references} label="Add reference images" />
                  <p className="mt-3 text-xs text-subtle">Previews stay in your browser and are never uploaded or stored.</p>
                  {allErrors.references && <p role="alert" className="mt-2 text-xs text-danger">{allErrors.references}</p>}
                </>
              ) : (
                <p className="text-xs text-muted">{model?.name ?? "This model"} does not accept reference images.</p>
              )}
            </Panel>

            <Panel title="Preview" icon={<ImageIcon />} action={<span className="text-xs text-subtle">{aspect} · {outputs} image{outputs > 1 ? "s" : ""}</span>}>
              <div className="mx-auto w-full" style={{ aspectRatio: `${rw} / ${rh}`, maxWidth: `min(100%, ${Math.round((rw / rh) * 560)}px)`, minHeight: 280 }}>
                <OutputStage
                  result={result}
                  icon={<ImageIcon />}
                  accent={model?.accent}
                  aspect="h-full"
                  emptyDescription="Generated images will render on this canvas once an image provider is connected."
                />
              </div>
            </Panel>
          </>
        }
        aside={
          <>
            <Panel title="Model" icon={<Layers />}>
              <ModelPicker models={models} value={selectedId} onChange={setSelectedId} />
            </Panel>
            <Panel>
              <div className="space-y-5">
                <Field label="Aspect ratio">
                  <OptionGrid aria-label="Aspect ratio" value={aspect} onChange={setAspect} options={ratioOptions(aspects)} columns={3} />
                </Field>
                <Field label="Resolution">
                  <OptionGrid aria-label="Resolution" value={resolution} onChange={setResolution} columns={2} options={(model?.resolutions ?? []).map((r) => ({ value: r.id, label: r.label, detail: r.detail }))} />
                </Field>
                <Field label="Number of images">
                  <OptionGrid aria-label="Number of images" value={outputs} onChange={setOutputs} columns={4} options={outputCounts.map((n) => ({ value: n, label: n }))} />
                </Field>
                <Collapsible title="Advanced settings" description="Guidance, seed and output">
                  <Field label="Guidance scale" hint="Higher values follow the prompt more strictly." aside={<span className="tabular-nums text-fg">{guidance.toFixed(1)}</span>}>
                    <Slider aria-label="Guidance scale" min={1} max={20} step={0.5} value={[guidance]} onValueChange={([v]) => setGuidance(v ?? guidance)} />
                  </Field>
                  <SeedInput value={seed} onChange={setSeed} error={allErrors.seed} />
                  <Field label="Output format">
                    <Select aria-label="Output format" value={format} onValueChange={setFormat} options={[{ value: "png", label: "PNG" }, { value: "jpeg", label: "JPEG" }, { value: "webp", label: "WebP" }]} />
                  </Field>
                  <ToggleRow label="Safety filter" description="Applied by the provider when connected" control={<Switch checked={safety} onCheckedChange={setSafety} aria-label="Safety filter" />} />
                </Collapsible>
              </div>
            </Panel>
            <div className="card p-5">
              <GenerateBar tokens={tokens} onGenerate={onGenerate} pending={pending} breakdown={model ? `${model.pricing.base_tokens} × resolution × ${outputs}` : undefined} />
            </div>
          </>
        }
      />
      <section className="mt-10">
        <SectionHeading title="Image model catalog" description="Entries come from config/models.json on the API. None are connected yet." />
        <ModelCatalogGrid models={models} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
      </section>
    </>
  );
}
