"use client";

import { Film, Layers } from "lucide-react";
import { useMemo, useState } from "react";

import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Field, Panel, ToggleRow } from "@/features/studio/field";
import { GenerateBar } from "@/features/studio/generate-bar";
import { StudioIntro } from "@/features/studio/integration-notice";
import { ModelPicker } from "@/features/studio/model-picker";
import { OptionGrid } from "@/features/studio/option-grid";
import { StudioLayout } from "@/features/studio/studio-layout";
import { DropzoneSingle } from "@/features/studio/upload";
import { useGenerationPreview } from "@/hooks/use-generation-preview";
import { useMediaUpload } from "@/hooks/use-media-upload";
import { useConstrained, useModelSelection } from "@/hooks/use-model-selection";
import { estimateTokens } from "@/lib/cost";
import { toDescriptor } from "@/lib/files";
import { formatBytes, formatDuration } from "@/lib/utils";

export function VideoEnhancer() {
  const { models, model, selectedId, setSelectedId } = useModelSelection("video_enhance");
  const video = useMediaUpload("video");
  const { submit, pending, result, fieldErrors } = useGenerationPreview();

  const [resolution, setResolution] = useState("");
  const [fps, setFps] = useState(30);
  const [denoise, setDenoise] = useState(0.3);
  const [stabilization, setStabilization] = useState(false);
  const [interpolation, setInterpolation] = useState(false);
  const [format, setFormat] = useState("mp4");
  const [error, setError] = useState<string | null>(null);

  const resolutions = useMemo(() => model?.resolutions.map((r) => r.id) ?? [], [model]);
  const fpsOptions = useMemo(() => model?.fps_options ?? [], [model]);
  useConstrained(resolution, resolutions, setResolution);
  useConstrained(fps, fpsOptions, setFps);

  const source = video.first;
  const seconds = source?.duration ?? 0;
  const tokens = estimateTokens(model, { kind: "video_enhance", resolution, fps, seconds });
  const targetLabel = model?.resolutions.find((r) => r.id === resolution)?.label ?? "—";

  const onEnhance = () => {
    if (!source) return setError("Upload a video to enhance.");
    setError(null);
    if (!model) return;
    void submit({ kind: "video_enhance", model_id: model.id, video: toDescriptor(source), target_resolution: resolution, target_fps: fps, denoise, stabilization, frame_interpolation: interpolation, output_format: format });
  };

  const stats: [string, string][] = [
    ["Source", source?.width && source.height ? `${source.width}×${source.height}` : "—"],
    ["Duration", source?.duration ? formatDuration(source.duration) : "—"],
    ["Size", source ? formatBytes(source.file.size) : "—"],
    ["Target", `${targetLabel} · ${fps} fps`],
  ];

  return (
    <>
      <StudioIntro title="Video Enhancer" description="Upscale footage, raise the frame rate and clean up noise. Upload a clip to configure the enhancement." feature="ai_video_enhance" />
      <StudioLayout
        main={
          <>
            <Panel title="Source video" icon={<Film />}>
              <DropzoneSingle upload={video} label="Upload a video" description="Click to upload or drag and drop a clip" />
              {(error ?? fieldErrors.video) && <p role="alert" className="mt-2 text-xs text-danger">{error ?? fieldErrors.video}</p>}
              <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {stats.map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                    <dt className="text-2xs text-subtle">{k}</dt>
                    <dd className="mt-0.5 truncate text-sm font-medium tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs text-subtle">The clip plays from your device. It is not uploaded, processed or stored.</p>
            </Panel>
            {result && (
              <div className="card flex items-start gap-3 border-warning/20 bg-warning/[0.04] p-4 text-sm">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-warning" />
                <div>
                  <p className="font-medium">{result.message}</p>
                  <p className="mt-1 text-xs text-muted">Settings validated for {result.model_name}. Estimated {result.estimated_cost.tokens} tokens — nothing was processed or charged.</p>
                </div>
              </div>
            )}
          </>
        }
        aside={
          <>
            <Panel title="Model" icon={<Layers />}>
              <ModelPicker models={models} value={selectedId} onChange={setSelectedId} />
            </Panel>
            <Panel>
              <div className="space-y-5">
                <Field label="Target resolution">
                  <OptionGrid aria-label="Target resolution" value={resolution} onChange={setResolution} columns={3} options={(model?.resolutions ?? []).map((r) => ({ value: r.id, label: r.label, detail: r.detail }))} />
                </Field>
                <Field label="Frame rate">
                  <OptionGrid aria-label="Frame rate" value={fps} onChange={setFps} columns={3} options={fpsOptions.map((f) => ({ value: f, label: `${f} fps` }))} />
                </Field>
                <Field label="Denoise" aside={<span className="tabular-nums text-fg">{Math.round(denoise * 100)}%</span>}>
                  <Slider aria-label="Denoise" min={0} max={1} step={0.05} value={[denoise]} onValueChange={([v]) => setDenoise(v ?? denoise)} />
                </Field>
                <ToggleRow label="Stabilization" description="Reduce camera shake" control={<Switch checked={stabilization} onCheckedChange={setStabilization} aria-label="Stabilization" />} />
                <ToggleRow label="Frame interpolation" description="Synthesize in-between frames" control={<Switch checked={interpolation} onCheckedChange={setInterpolation} aria-label="Frame interpolation" />} />
                <Field label="Output format">
                  <Select aria-label="Output format" value={format} onValueChange={setFormat} options={[{ value: "mp4", label: "MP4", hint: "H.264" }, { value: "mov", label: "MOV", hint: "ProRes" }, { value: "webm", label: "WebM", hint: "VP9" }]} />
                </Field>
              </div>
            </Panel>
            <div className="card p-5">
              <GenerateBar tokens={tokens} label="Enhance video" onGenerate={onEnhance} pending={pending} breakdown={model ? `${model.pricing.base_tokens} tokens/s × ${Math.max(1, Math.round(seconds))}s × resolution × fps` : undefined} />
            </div>
          </>
        }
      />
    </>
  );
}
