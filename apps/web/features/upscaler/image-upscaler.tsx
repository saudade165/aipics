"use client";

import { Layers, ScanSearch, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { Segmented } from "@/components/ui/segmented";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Field, Panel, ToggleRow } from "@/features/studio/field";
import { GenerateBar } from "@/features/studio/generate-bar";
import { StudioIntro } from "@/features/studio/integration-notice";
import { ModelPicker } from "@/features/studio/model-picker";
import { OptionGrid } from "@/features/studio/option-grid";
import { OutputStage } from "@/features/studio/output-stage";
import { StudioLayout } from "@/features/studio/studio-layout";
import { DropzoneSingle } from "@/features/studio/upload";
import { useGenerationPreview } from "@/hooks/use-generation-preview";
import { useMediaUpload } from "@/hooks/use-media-upload";
import { useConstrained, useModelSelection } from "@/hooks/use-model-selection";
import { estimateTokens } from "@/lib/cost";
import { toDescriptor } from "@/lib/files";

type Mode = "faithful" | "balanced" | "creative";

export function ImageUpscaler() {
  const { models, model, selectedId, setSelectedId } = useModelSelection("upscale");
  const image = useMediaUpload("image");
  const { submit, pending, result, fieldErrors } = useGenerationPreview();

  const [scale, setScale] = useState(2);
  const [mode, setMode] = useState<Mode>("balanced");
  const [denoise, setDenoise] = useState(0.3);
  const [sharpen, setSharpen] = useState(0.2);
  const [faceEnhance, setFaceEnhance] = useState(false);
  const [format, setFormat] = useState("png");
  const [error, setError] = useState<string | null>(null);

  const scales = useMemo(() => model?.scales ?? [], [model]);
  useConstrained(scale, scales, setScale);

  const source = image.first;
  const tokens = estimateTokens(model, { kind: "upscale", scale });
  const target = source?.width && source.height ? `${source.width * scale}×${source.height * scale}` : null;

  const onEnhance = () => {
    if (!source) return setError("Upload an image to enhance.");
    setError(null);
    if (!model) return;
    void submit({ kind: "upscale", model_id: model.id, image: toDescriptor(source), scale, mode, denoise, sharpen, face_enhance: faceEnhance, output_format: format });
  };

  return (
    <>
      <StudioIntro title="Image Upscaler" description="Enlarge images and recover detail. Compare the original with the enhanced result side by side." feature="ai_upscale" />
      <StudioLayout
        main={
          <Panel title="Comparison" icon={<ScanSearch />} action={target && <span className="text-xs text-subtle">{source?.width}×{source?.height} → <span className="text-fg">{target}</span></span>}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="label-eyebrow mb-2">Original</p>
                <DropzoneSingle upload={image} label="Upload an image" aspect="aspect-square" />
                {(error ?? fieldErrors.image) && <p role="alert" className="mt-2 text-xs text-danger">{error ?? fieldErrors.image}</p>}
              </div>
              <div>
                <p className="label-eyebrow mb-2">Enhanced</p>
                <OutputStage result={result} icon={<Sparkles />} accent={model?.accent} aspect="aspect-square" emptyTitle="Enhanced preview" emptyDescription={target ? `Output would be ${target} px. Rendering starts once an upscale provider is connected.` : "Upload an image to see the target size. Enhancement is not connected yet."} />
              </div>
            </div>
            <p className="mt-4 text-xs text-subtle">Your image is previewed locally and never leaves the browser.</p>
          </Panel>
        }
        aside={
          <>
            <Panel title="Model" icon={<Layers />}>
              <ModelPicker models={models} value={selectedId} onChange={setSelectedId} />
            </Panel>
            <Panel>
              <div className="space-y-5">
                <Field label="Scale">
                  <OptionGrid aria-label="Scale" value={scale} onChange={setScale} columns={3} options={scales.map((s) => ({ value: s, label: `${s}×` }))} />
                </Field>
                <Field label="Enhancement mode" hint="Faithful keeps the original content; creative re-imagines fine detail.">
                  <Segmented aria-label="Enhancement mode" stretch size="sm" value={mode} onChange={setMode} options={[{ value: "faithful", label: "Faithful" }, { value: "balanced", label: "Balanced" }, { value: "creative", label: "Creative" }]} />
                </Field>
                <Field label="Denoise" aside={<span className="tabular-nums text-fg">{Math.round(denoise * 100)}%</span>}>
                  <Slider aria-label="Denoise" min={0} max={1} step={0.05} value={[denoise]} onValueChange={([v]) => setDenoise(v ?? denoise)} />
                </Field>
                <Field label="Sharpen" aside={<span className="tabular-nums text-fg">{Math.round(sharpen * 100)}%</span>}>
                  <Slider aria-label="Sharpen" min={0} max={1} step={0.05} value={[sharpen]} onValueChange={([v]) => setSharpen(v ?? sharpen)} />
                </Field>
                <ToggleRow label="Face enhancement" description="Restore facial detail" control={<Switch checked={faceEnhance} onCheckedChange={setFaceEnhance} aria-label="Face enhancement" />} />
                <Field label="Output format">
                  <Select aria-label="Output format" value={format} onValueChange={setFormat} options={[{ value: "png", label: "PNG", hint: "Lossless" }, { value: "jpeg", label: "JPEG" }, { value: "webp", label: "WebP" }]} />
                </Field>
              </div>
            </Panel>
            <div className="card p-5">
              <GenerateBar tokens={tokens} label="Enhance image" onGenerate={onEnhance} pending={pending} breakdown={model ? `${model.pricing.base_tokens} tokens × ${scale}× scale multiplier` : undefined} />
            </div>
          </>
        }
      />
    </>
  );
}
