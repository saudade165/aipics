"use client";

import { Clapperboard, Film, ImagePlay, Images, Layers, Type, Volume2 } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";

import { SectionHeading } from "@/components/ui/section-heading";
import { Segmented } from "@/components/ui/segmented";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip } from "@/components/ui/tooltip";
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
import { DropzoneMulti, DropzoneSingle } from "@/features/studio/upload";
import { useGenerationPreview } from "@/hooks/use-generation-preview";
import { useMediaUpload } from "@/hooks/use-media-upload";
import { useConstrained, useModelSelection } from "@/hooks/use-model-selection";
import { estimateTokens } from "@/lib/cost";
import { toDescriptor } from "@/lib/files";

type Mode = "text_to_video" | "image_to_video" | "reference_to_video";

const MODES = [
  { value: "text_to_video" as const, label: "Text to video", icon: <Type /> },
  { value: "image_to_video" as const, label: "Image to video", icon: <ImagePlay /> },
  { value: "reference_to_video" as const, label: "Reference to video", icon: <Images /> },
];

const SAMPLES = [
  "Slow aerial push-in over a misty pine forest at sunrise, volumetric light, cinematic",
  "A barista pours latte art in slow motion, macro shot, warm cafe lighting",
  "Tracking shot following a red vintage car along a coastal road, golden hour",
  "Time-lapse of clouds rolling over a glass skyscraper, reflections shifting",
];

const formSchema = z.object({ prompt: promptSchema, negative_prompt: negativePromptSchema, seed: seedSchema });

export function VideoStudio() {
  const { preferences } = usePreferences();
  const { models, model, selectedId, setSelectedId } = useModelSelection("video", preferences.defaults.videoModel);
  const firstFrame = useMediaUpload("image");
  const lastFrame = useMediaUpload("image");
  const referenceVideo = useMediaUpload("video");
  const references = useMediaUpload("image", { max: model?.max_reference_images || 8 });
  const { submit, pending, result, fieldErrors } = useGenerationPreview();

  const [mode, setMode] = useState<Mode>("text_to_video");
  const [prompt, setPrompt] = useState("");
  const [negative, setNegative] = useState("");
  const [aspect, setAspect] = useState("16:9");
  const [resolution, setResolution] = useState("");
  const [duration, setDuration] = useState(5);
  const [audio, setAudio] = useState(false);
  const [motion, setMotion] = useState(0.5);
  const [cameraFixed, setCameraFixed] = useState(false);
  const [seed, setSeed] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const aspects = useMemo(() => model?.aspect_ratios ?? [], [model]);
  const resolutions = useMemo(() => model?.resolutions.map((r) => r.id) ?? [], [model]);
  const durations = useMemo(() => model?.durations ?? [], [model]);
  useConstrained(aspect, aspects, setAspect);
  useConstrained(resolution, resolutions, setResolution);
  useConstrained(duration, durations, setDuration);

  const audioOn = audio && Boolean(model?.supports_audio);
  const maxRefs = model?.max_reference_images ?? 0;
  const tokens = estimateTokens(model, { kind: "video", resolution, duration, audio: audioOn });
  const allErrors = { ...fieldErrors, ...errors };

  const onGenerate = () => {
    const parsed = validate(formSchema, { prompt, negative_prompt: negative, seed });
    const next: FieldErrors = parsed.ok ? {} : parsed.errors;
    if (model && !model.capabilities.includes(mode)) next.mode = `${model.name} does not support this mode. Pick another model.`;
    if (mode === "image_to_video" && !firstFrame.first) next.first_frame = "Add a first frame for image-to-video.";
    if (mode === "reference_to_video" && !referenceVideo.first && references.items.length === 0) next.references = "Add a reference video or at least one reference image.";
    if (mode === "reference_to_video" && references.items.length > maxRefs) next.references = `${model?.name} accepts up to ${maxRefs} reference image(s).`;
    setErrors(next);
    if (Object.keys(next).length || !model) return;
    const withFrames = mode === "image_to_video";
    const withRefs = mode === "reference_to_video";
    void submit({
      kind: "video",
      mode,
      model_id: model.id,
      prompt: prompt.trim(),
      negative_prompt: model.supports_negative_prompt && negative.trim() ? negative.trim() : undefined,
      aspect_ratio: aspect,
      resolution,
      duration,
      audio: audioOn,
      motion_strength: motion,
      seed: parseSeed(seed),
      first_frame: withFrames && firstFrame.first ? toDescriptor(firstFrame.first) : undefined,
      last_frame: withFrames && lastFrame.first && model.supports_last_frame ? toDescriptor(lastFrame.first) : undefined,
      reference_video: withRefs && referenceVideo.first ? toDescriptor(referenceVideo.first) : undefined,
      references: withRefs ? references.items.map(toDescriptor) : [],
    });
  };

  return (
    <>
      <StudioIntro title="Video Studio" description="Direct a shot from text, animate a still between two frames, or guide motion with references." feature="ai_video" />
      <StudioLayout
        main={
          <>
            <div className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold"><Clapperboard className="size-4 text-muted" /> Stage</h2>
                <div className="flex items-center gap-2 text-xs text-subtle">
                  <span className="rounded-md bg-white/[0.04] px-2 py-1">{aspect}</span>
                  <span className="rounded-md bg-white/[0.04] px-2 py-1">{model?.resolutions.find((r) => r.id === resolution)?.label ?? "—"}</span>
                  <span className="rounded-md bg-white/[0.04] px-2 py-1">{duration}s</span>
                  {audioOn && <span className="flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-1"><Volume2 className="size-3" /> Audio</span>}
                </div>
              </div>
              <div className="bg-black/30 p-4 sm:p-5">
                <OutputStage result={result} icon={<Film />} accent={model?.accent} aspect="aspect-video" emptyTitle="Your video will play here" emptyDescription="The player activates once a video provider is connected. Until then, settings are validated only." />
                <div className="mt-4 flex items-center gap-3" aria-hidden>
                  <span className="text-2xs tabular-nums text-subtle">0:00</span>
                  <div className="relative h-8 flex-1 overflow-hidden rounded-md border border-white/[0.06] bg-white/[0.02]">
                    <div className="absolute inset-0 flex">
                      {Array.from({ length: duration }).map((_, i) => (
                        <div key={i} className="flex-1 border-r border-white/[0.05] last:border-0" />
                      ))}
                    </div>
                    <div className="absolute inset-y-0 left-0 w-0.5 bg-accent-3" />
                  </div>
                  <span className="text-2xs tabular-nums text-subtle">0:{String(duration).padStart(2, "0")}</span>
                </div>
              </div>
            </div>

            <Panel>
              <div className="mb-5 overflow-x-auto no-scrollbar">
                <Segmented aria-label="Generation mode" value={mode} onChange={setMode} options={MODES} />
              </div>
              {allErrors.mode && <p role="alert" className="mb-4 rounded-lg border border-danger/20 bg-danger/[0.06] px-3 py-2 text-xs text-danger">{allErrors.mode}</p>}

              {mode === "image_to_video" && (
                <div className="mb-5 grid gap-4 sm:grid-cols-2">
                  <Field label="First frame">
                    <DropzoneSingle upload={firstFrame} label="Upload first frame" compact />
                    {allErrors.first_frame && <p role="alert" className="text-xs text-danger">{allErrors.first_frame}</p>}
                  </Field>
                  <Field label="Last frame" aside={model?.supports_last_frame ? "Optional" : "Not supported"}>
                    {model?.supports_last_frame ? (
                      <DropzoneSingle upload={lastFrame} label="Upload last frame" compact />
                    ) : (
                      <div className="grid aspect-video place-items-center rounded-xl border border-dashed border-white/[0.07] px-4 text-center text-xs text-subtle">
                        {model?.name ?? "This model"} does not support last-frame conditioning.
                      </div>
                    )}
                  </Field>
                </div>
              )}

              {mode === "reference_to_video" && (
                <div className="mb-5 grid gap-4 sm:grid-cols-2">
                  <Field label="Reference video" aside="Optional">
                    <DropzoneSingle upload={referenceVideo} label="Upload reference video" compact />
                  </Field>
                  <Field label="Reference images" aside={`${references.items.length} / ${maxRefs}`}>
                    <DropzoneMulti upload={references} label="Add reference images" />
                    {allErrors.references && <p role="alert" className="text-xs text-danger">{allErrors.references}</p>}
                  </Field>
                </div>
              )}

              <PromptField value={prompt} onChange={setPrompt} placeholder="Describe the shot: subject, action, camera movement, lighting…" samples={SAMPLES} error={allErrors.prompt} minRows={4} />
              {model?.supports_negative_prompt && (
                <PromptField className="mt-4" label="Negative prompt" value={negative} onChange={setNegative} maxLength={2000} minRows={2} enhance={false} placeholder="What to avoid: flicker, warping, text overlays…" error={allErrors.negative_prompt} />
              )}
              {mode !== "text_to_video" && <p className="mt-3 text-xs text-subtle">Uploads are temporary browser previews. Nothing is sent to a server or stored.</p>}
            </Panel>
          </>
        }
        aside={
          <>
            <Panel title="Model" icon={<Layers />}>
              <ModelPicker models={models} value={selectedId} onChange={setSelectedId} isDisabled={(m) => (m.capabilities.includes(mode) ? false : "Not available in this mode")} />
            </Panel>
            <Panel>
              <div className="space-y-5">
                <Field label="Resolution">
                  <OptionGrid aria-label="Resolution" value={resolution} onChange={setResolution} columns={3} options={(model?.resolutions ?? []).map((r) => ({ value: r.id, label: r.label, detail: r.detail }))} />
                </Field>
                <Field label="Aspect ratio">
                  <OptionGrid aria-label="Aspect ratio" value={aspect} onChange={setAspect} columns={3} options={ratioOptions(aspects)} />
                </Field>
                <Field label="Duration">
                  <OptionGrid aria-label="Duration" value={duration} onChange={setDuration} columns={durations.length > 1 ? 2 : 2} options={durations.map((d) => ({ value: d, label: `${d} seconds` }))} />
                </Field>
                <ToggleRow
                  label="Generate audio"
                  description={model?.supports_audio ? "Native sound effects and ambience" : `Not supported by ${model?.name ?? "this model"}`}
                  control={
                    <Tooltip content={model?.supports_audio ? "Adds audio tokens to the estimate" : "Choose a model with audio support"}>
                      <span><Switch checked={audioOn} onCheckedChange={setAudio} disabled={!model?.supports_audio} aria-label="Generate audio" /></span>
                    </Tooltip>
                  }
                />
                <Collapsible title="Advanced settings" description="Motion, camera and seed">
                  <Field label="Motion strength" hint="How much movement the model should introduce." aside={<span className="tabular-nums text-fg">{Math.round(motion * 100)}%</span>}>
                    <Slider aria-label="Motion strength" min={0} max={1} step={0.05} value={[motion]} onValueChange={([v]) => setMotion(v ?? motion)} />
                  </Field>
                  <ToggleRow label="Lock camera" description="Keep the camera static" control={<Switch checked={cameraFixed} onCheckedChange={setCameraFixed} aria-label="Lock camera" />} />
                  <SeedInput value={seed} onChange={setSeed} error={allErrors.seed} />
                </Collapsible>
              </div>
            </Panel>
            <div className="card p-5">
              <GenerateBar tokens={tokens} label="Generate video" onGenerate={onGenerate} pending={pending} breakdown={model ? `${model.pricing.base_tokens} tokens/s × resolution × ${duration}s${audioOn ? " + audio" : ""}` : undefined} />
            </div>
          </>
        }
      />
      <section className="mt-10">
        <SectionHeading title="Video model catalog" description="Configuration-driven. Add entries on the API to extend this list." />
        <ModelCatalogGrid models={models} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
      </section>
    </>
  );
}
