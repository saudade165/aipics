"use client";

import { ArrowRight, Fingerprint, Images, Layers, PersonStanding, Replace, ScanFace, UserRound, Video, Workflow } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { FieldError, Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useFeature } from "@/features/platform/platform-provider";
import { Collapsible, Field, Panel, ToggleRow } from "@/features/studio/field";
import { GenerateBar } from "@/features/studio/generate-bar";
import { StudioIntro } from "@/features/studio/integration-notice";
import { ModelPicker } from "@/features/studio/model-picker";
import { OptionGrid, ratioOptions } from "@/features/studio/option-grid";
import { OutputStage } from "@/features/studio/output-stage";
import { PromptField } from "@/features/studio/prompt-field";
import { parseSeed, seedSchema, validate, type FieldErrors } from "@/features/studio/schemas";
import { SeedInput } from "@/features/studio/seed-input";
import { StudioLayout } from "@/features/studio/studio-layout";
import { DropzoneMulti, DropzoneSingle } from "@/features/studio/upload";
import { useGenerationPreview } from "@/hooks/use-generation-preview";
import { useMediaUpload } from "@/hooks/use-media-upload";
import { useConstrained, useModelSelection } from "@/hooks/use-model-selection";
import { estimateTokens } from "@/lib/cost";
import { toDescriptor } from "@/lib/files";
import { cn } from "@/lib/utils";

type WorkflowId = "motion_transfer" | "character_replacement" | "reference_to_video" | "multi_image_conditioning";

const WORKFLOWS: { id: WorkflowId; title: string; description: string; icon: React.ReactNode; needsVideo: boolean }[] = [
  { id: "motion_transfer", title: "Motion transfer", description: "Drive your character with the movement from a source video.", icon: <PersonStanding />, needsVideo: true },
  { id: "character_replacement", title: "Character replacement", description: "Swap the performer in a clip while keeping the scene.", icon: <Replace />, needsVideo: true },
  { id: "reference_to_video", title: "Reference to video", description: "Generate a new shot starring your character from a prompt.", icon: <Video />, needsVideo: false },
  { id: "multi_image_conditioning", title: "Multi-image conditioning", description: "Combine several angles for stronger identity consistency.", icon: <Images />, needsVideo: false },
];

const formSchema = z.object({
  character_name: z.string().trim().min(1, "Give your character a name.").max(80, "Name is too long."),
  prompt: z.string().max(4000, "Prompt is too long."),
  seed: seedSchema,
});

export function CharacterStudio() {
  const { models, model, selectedId, setSelectedId } = useModelSelection("character");
  const references = useMediaUpload("image", { max: model?.max_reference_images || 8 });
  const sourceVideo = useMediaUpload("video");
  const { submit, pending, result, fieldErrors } = useGenerationPreview();
  const feature = useFeature("ai_character");

  const [workflow, setWorkflow] = useState<WorkflowId>("motion_transfer");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState("9:16");
  const [resolution, setResolution] = useState("");
  const [duration, setDuration] = useState(5);
  const [identity, setIdentity] = useState(0.8);
  const [motion, setMotion] = useState(0.7);
  const [faceConsistency, setFaceConsistency] = useState(true);
  const [preserveBackground, setPreserveBackground] = useState(true);
  const [lipSync, setLipSync] = useState(false);
  const [seed, setSeed] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const aspects = useMemo(() => model?.aspect_ratios ?? [], [model]);
  const resolutions = useMemo(() => model?.resolutions.map((r) => r.id) ?? [], [model]);
  const durations = useMemo(() => model?.durations ?? [], [model]);
  useConstrained(aspect, aspects, setAspect);
  useConstrained(resolution, resolutions, setResolution);
  useConstrained(duration, durations, setDuration);

  const active = WORKFLOWS.find((w) => w.id === workflow)!;
  const maxRefs = model?.max_reference_images ?? 0;
  const tokens = estimateTokens(model, { kind: "video", resolution, duration });
  const allErrors = { ...fieldErrors, ...errors };

  const selectWorkflow = (id: WorkflowId) => {
    setWorkflow(id);
    const compatible = models.find((m) => m.workflows.includes(id));
    if (compatible && !model?.workflows.includes(id)) setSelectedId(compatible.id);
  };

  const onGenerate = () => {
    const parsed = validate(formSchema, { character_name: name, prompt, seed });
    const next: FieldErrors = parsed.ok ? {} : parsed.errors;
    if (references.items.length === 0) next.references = "Add at least one character reference image.";
    else if (references.items.length > maxRefs) next.references = `${model?.name} accepts up to ${maxRefs} reference image(s).`;
    if (active.needsVideo && !sourceVideo.first) next.reference_video = "This workflow needs a source video.";
    if (model && !model.workflows.includes(workflow)) next.workflow = `${model.name} does not support this workflow.`;
    setErrors(next);
    if (Object.keys(next).length || !model) return;
    void submit({
      kind: "character",
      workflow,
      model_id: model.id,
      character_name: name.trim(),
      prompt: prompt.trim().length >= 3 ? prompt.trim() : undefined,
      aspect_ratio: aspect,
      resolution,
      duration,
      identity_strength: identity,
      motion_strength: motion,
      face_consistency: faceConsistency,
      preserve_background: preserveBackground,
      seed: parseSeed(seed),
      references: references.items.map(toDescriptor),
      reference_video: sourceVideo.first ? toDescriptor(sourceVideo.first) : undefined,
    });
  };

  return (
    <>
      <StudioIntro title="Character Studio" description="Build a reusable character from reference images, then transfer motion, replace performers or generate new shots." feature="ai_character" />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="radiogroup" aria-label="Workflow">
        {WORKFLOWS.map((w) => {
          const selected = w.id === workflow;
          const supported = models.some((m) => m.workflows.includes(w.id));
          return (
            <button
              key={w.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => selectWorkflow(w.id)}
              className={cn(
                "card card-hover focus-ring relative overflow-hidden p-4 text-left",
                selected && "border-accent/45 bg-accent/[0.06] shadow-glow hover:border-accent/45 hover:bg-accent/[0.06]",
              )}
            >
              <div className="flex items-start justify-between">
                <span className={cn("grid size-9 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] [&_svg]:size-[18px]", selected ? "text-accent-3" : "text-muted")}>{w.icon}</span>
                {!supported && <Badge>No model</Badge>}
              </div>
              <p className="mt-3 text-sm font-semibold">{w.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{w.description}</p>
            </button>
          );
        })}
      </div>
      {allErrors.workflow && <p role="alert" className="mb-4 text-xs text-danger">{allErrors.workflow}</p>}

      <StudioLayout
        main={
          <>
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold"><Workflow className="size-4 text-muted" /> Pipeline</h2>
                <span className="text-xs text-subtle">{active.title}</span>
              </div>
              <div className="grid items-stretch gap-4 p-5 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
                <div>
                  <p className="label-eyebrow mb-2">Source video</p>
                  {active.needsVideo ? (
                    <>
                      <DropzoneSingle upload={sourceVideo} label="Upload driving video" compact aspect="aspect-[4/5]" />
                      <FieldError message={allErrors.reference_video} />
                    </>
                  ) : (
                    <div className="grid aspect-[4/5] place-items-center rounded-xl border border-dashed border-white/[0.07] p-4 text-center text-xs text-subtle">
                      Not used in this workflow. Motion comes from your prompt.
                    </div>
                  )}
                </div>
                <PipelineArrow />
                <div>
                  <p className="label-eyebrow mb-2">Target character</p>
                  <div className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-xl border border-white/[0.08] bg-black">
                    {references.first ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={references.first.url} alt="Primary character reference" className="h-full w-full object-cover" />
                    ) : (
                      <div className="p-4 text-center">
                        <ScanFace className="mx-auto size-7 text-subtle" />
                        <p className="mt-2 text-xs text-subtle">Add reference images below to preview your character.</p>
                      </div>
                    )}
                    {references.first && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 pt-8">
                        <p className="truncate text-sm font-medium text-white">{name || "Unnamed character"}</p>
                        <p className="text-2xs text-white/60">{references.items.length} reference{references.items.length > 1 ? "s" : ""}</p>
                      </div>
                    )}
                  </div>
                </div>
                <PipelineArrow />
                <div>
                  <p className="label-eyebrow mb-2">Output</p>
                  <OutputStage result={result} icon={<UserRound />} accent={model?.accent} aspect="aspect-[4/5]" emptyTitle="Result preview" emptyDescription="Renders here after providers are connected." />
                </div>
              </div>
            </div>

            <Panel title="Character identity" icon={<Fingerprint />} action={<span className="text-xs text-subtle">{references.items.length} / {maxRefs} images</span>}>
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-4">
                  <Field label="Character name" htmlFor="character-name">
                    <Input id="character-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nova" maxLength={80} aria-invalid={Boolean(allErrors.character_name)} />
                    <FieldError message={allErrors.character_name} />
                  </Field>
                  <Field label="Identity notes" aside="Optional" htmlFor="character-notes">
                    <Input id="character-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Distinctive features, outfit, style…" maxLength={200} />
                  </Field>
                </div>
                <Field label="Reference images" hint="Use clear, well-lit images from several angles for the best identity consistency.">
                  <DropzoneMulti upload={references} label="Add character references" />
                  <FieldError message={allErrors.references} />
                </Field>
              </div>
              <p className="mt-4 text-xs text-subtle">Characters are not saved. Images stay in this browser tab until you leave the page.</p>
            </Panel>

            <Panel title="Scene direction" icon={<Video />}>
              <PromptField value={prompt} onChange={setPrompt} label={active.needsVideo ? "Prompt (optional)" : "Prompt"} placeholder="Describe the scene, action and mood for your character…" minRows={3} error={allErrors.prompt} />
            </Panel>

            <Panel title="Planned integrations">
              <ul className="grid gap-2 sm:grid-cols-2">
                {["Face and identity consistency", "Character replacement", "Motion transfer", "Reference-to-video", "Multi-image character conditioning"].map((item) => (
                  <li key={item} className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.015] px-3 py-2.5 text-[13px]">
                    {item}
                    <Badge tone="warning">{feature?.status === "active" ? "Ready" : "Not connected"}</Badge>
                  </li>
                ))}
              </ul>
            </Panel>
          </>
        }
        aside={
          <>
            <Panel title="Model" icon={<Layers />}>
              <ModelPicker models={models} value={selectedId} onChange={setSelectedId} isDisabled={(m) => (m.workflows.includes(workflow) ? false : "Not available for this workflow")} />
            </Panel>
            <Panel>
              <div className="space-y-5">
                <Field label="Identity strength" hint="How closely the output should match the reference identity." aside={<span className="tabular-nums text-fg">{Math.round(identity * 100)}%</span>}>
                  <Slider aria-label="Identity strength" min={0} max={1} step={0.05} value={[identity]} onValueChange={([v]) => setIdentity(v ?? identity)} />
                </Field>
                <Field label="Motion strength" hint="How strongly source motion is applied." aside={<span className="tabular-nums text-fg">{Math.round(motion * 100)}%</span>}>
                  <Slider aria-label="Motion strength" min={0} max={1} step={0.05} value={[motion]} onValueChange={([v]) => setMotion(v ?? motion)} />
                </Field>
                <Field label="Resolution">
                  <OptionGrid aria-label="Resolution" value={resolution} onChange={setResolution} columns={2} options={(model?.resolutions ?? []).map((r) => ({ value: r.id, label: r.label, detail: r.detail }))} />
                </Field>
                <Field label="Aspect ratio">
                  <OptionGrid aria-label="Aspect ratio" value={aspect} onChange={setAspect} columns={3} options={ratioOptions(aspects)} />
                </Field>
                <Field label="Duration">
                  <OptionGrid aria-label="Duration" value={duration} onChange={setDuration} columns={2} options={durations.map((d) => ({ value: d, label: `${d} seconds` }))} />
                </Field>
                <Collapsible title="Workflow settings" description="Consistency and compositing" defaultOpen>
                  <ToggleRow label="Face consistency" description="Lock facial identity across frames" control={<Switch checked={faceConsistency} onCheckedChange={setFaceConsistency} aria-label="Face consistency" />} />
                  <ToggleRow label="Preserve background" description="Keep the source scene intact" control={<Switch checked={preserveBackground} onCheckedChange={setPreserveBackground} aria-label="Preserve background" />} />
                  <ToggleRow label="Lip sync" description="Match mouth movement to source audio" control={<Switch checked={lipSync} onCheckedChange={setLipSync} aria-label="Lip sync" />} />
                  <SeedInput value={seed} onChange={setSeed} error={allErrors.seed} />
                </Collapsible>
              </div>
            </Panel>
            <div className="card p-5">
              <GenerateBar tokens={tokens} label="Run workflow" onGenerate={onGenerate} pending={pending} breakdown={model ? `${model.pricing.base_tokens} tokens/s × resolution × ${duration}s` : undefined} />
            </div>
          </>
        }
      />
    </>
  );
}

function PipelineArrow() {
  return (
    <div className="hidden items-center justify-center lg:flex" aria-hidden>
      <span className="grid size-8 place-items-center rounded-full border border-white/[0.08] bg-surface-3 text-subtle">
        <ArrowRight className="size-4" />
      </span>
    </div>
  );
}
