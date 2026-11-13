"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Film, ImagePlus, Plus, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

import type { MediaUpload } from "@/hooks/use-media-upload";
import type { LocalMedia } from "@/lib/files";
import { cn, formatBytes, formatDuration } from "@/lib/utils";

function useDrop(onFiles: (files: FileList) => void) {
  const [over, setOver] = useState(false);
  return {
    over,
    props: {
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        setOver(true);
      },
      onDragLeave: () => setOver(false),
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        setOver(false);
        if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
      },
    },
  };
}

function HiddenInput({ upload, inputRef }: { upload: MediaUpload; inputRef: React.RefObject<HTMLInputElement | null> }) {
  return (
    <input
      ref={inputRef}
      type="file"
      hidden
      multiple={upload.max > 1}
      accept={upload.rule.mime_types.join(",")}
      onChange={(e) => {
        if (e.target.files?.length) void upload.add(e.target.files);
        e.target.value = "";
      }}
    />
  );
}

function MediaPreview({ media, className, controls }: { media: LocalMedia; className?: string; controls?: boolean }) {
  return media.kind === "image" ? (
    // Object URLs from local files cannot go through next/image optimisation.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={media.url} alt={media.file.name} className={cn("h-full w-full object-cover", className)} />
  ) : (
    <video src={media.url} className={cn("h-full w-full object-cover", className)} muted playsInline loop controls={controls} autoPlay={!controls} />
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="focus-ring absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-lg bg-black/60 text-white/80 backdrop-blur transition-colors hover:bg-black/80 hover:text-white"
    >
      <X className="size-3.5" />
    </button>
  );
}

function rulesHint(upload: MediaUpload) {
  const types = upload.rule.mime_types.map((m) => m.split("/")[1]?.replace("quicktime", "mov").replace("jpeg", "jpg").toUpperCase()).join(", ");
  return `${types} up to ${upload.rule.max_mb} MB`;
}

/** Single-file dropzone that turns into a preview once a file is chosen. */
export function DropzoneSingle({
  upload,
  label,
  description,
  aspect = "aspect-video",
  className,
  compact,
}: {
  upload: MediaUpload;
  label: string;
  description?: string;
  aspect?: string;
  className?: string;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { over, props } = useDrop((files) => void upload.add(files));
  const media = upload.first;
  const Icon = upload.rule.mime_types[0]?.startsWith("video") ? Film : ImagePlus;

  return (
    <div className={className}>
      <HiddenInput upload={upload} inputRef={inputRef} />
      <AnimatePresence mode="wait" initial={false}>
        {media ? (
          <motion.div key={media.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className={cn("group relative overflow-hidden rounded-xl border border-white/[0.08] bg-black", aspect)}>
            <MediaPreview media={media} className="object-contain" controls={media.kind === "video"} />
            <RemoveButton onClick={() => upload.remove(media.id)} label={`Remove ${media.file.name}`} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 text-2xs text-white/80">
              <span className="truncate">{media.file.name}</span>
              <span className="shrink-0 tabular-nums">
                {media.width && media.height ? `${media.width}×${media.height} · ` : ""}
                {media.duration ? `${formatDuration(media.duration)} · ` : ""}
                {formatBytes(media.file.size)}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="empty"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => inputRef.current?.click()}
            {...props}
            className={cn(
              "focus-ring group relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed px-4 text-center transition-colors duration-200",
              aspect,
              over ? "border-accent/60 bg-accent/[0.06]" : "border-white/[0.1] bg-white/[0.015] hover:border-white/[0.18] hover:bg-white/[0.03]",
            )}
          >
            <span className="pointer-events-none absolute inset-0 bg-grid opacity-40 mask-radial" />
            <span className={cn("relative grid place-items-center rounded-xl border border-white/[0.08] bg-surface-3 text-muted transition-transform duration-300 group-hover:-translate-y-0.5", compact ? "size-9" : "size-11")}>
              <Icon className="size-[18px]" />
            </span>
            <span className="relative text-[13px] font-medium text-fg/90">{label}</span>
            {!compact && <span className="relative text-xs text-subtle">{description ?? "Click to upload or drag and drop"}</span>}
            <span className="relative text-2xs text-subtle">{rulesHint(upload)}</span>
          </motion.button>
        )}
      </AnimatePresence>
      {upload.error && <p role="alert" className="mt-2 text-xs text-danger">{upload.error}</p>}
    </div>
  );
}

/** Multi-file grid for reference images. */
export function DropzoneMulti({ upload, label = "Add images", className }: { upload: MediaUpload; label?: string; className?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { over, props } = useDrop((files) => void upload.add(files));
  const canAdd = upload.items.length < upload.max;

  return (
    <div className={className}>
      <HiddenInput upload={upload} inputRef={inputRef} />
      {upload.items.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          {...props}
          className={cn(
            "focus-ring flex w-full items-center gap-3 rounded-xl border border-dashed p-4 text-left transition-colors",
            over ? "border-accent/60 bg-accent/[0.06]" : "border-white/[0.1] bg-white/[0.015] hover:border-white/[0.18] hover:bg-white/[0.03]",
          )}
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-surface-3 text-muted">
            <Upload className="size-4" />
          </span>
          <span>
            <span className="block text-[13px] font-medium text-fg/90">{label}</span>
            <span className="block text-2xs text-subtle">Up to {upload.max} · {rulesHint(upload)}</span>
          </span>
        </button>
      ) : (
        <div className="grid grid-cols-4 gap-2" {...props}>
          <AnimatePresence initial={false}>
            {upload.items.map((media) => (
              <motion.div
                key={media.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative aspect-square overflow-hidden rounded-lg border border-white/[0.08] bg-black"
              >
                <MediaPreview media={media} />
                <RemoveButton onClick={() => upload.remove(media.id)} label={`Remove ${media.file.name}`} />
              </motion.div>
            ))}
          </AnimatePresence>
          {canAdd && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(
                "focus-ring grid aspect-square place-items-center rounded-lg border border-dashed text-subtle transition-colors hover:border-white/[0.2] hover:text-fg",
                over ? "border-accent/60 bg-accent/[0.06]" : "border-white/[0.12]",
              )}
              aria-label={label}
            >
              <Plus className="size-5" />
            </button>
          )}
        </div>
      )}
      {upload.error && <p role="alert" className="mt-2 text-xs text-danger">{upload.error}</p>}
    </div>
  );
}
