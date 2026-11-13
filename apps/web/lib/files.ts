import type { FileDescriptor, UploadRule } from "@/lib/api/types";

export type MediaKind = "image" | "video";

export const DEFAULT_UPLOAD_RULES: Record<MediaKind, UploadRule> = {
  image: { max_mb: 10, mime_types: ["image/png", "image/jpeg", "image/webp"] },
  video: { max_mb: 200, mime_types: ["video/mp4", "video/webm", "video/quicktime"] },
};

const EXTENSIONS: Record<string, string[]> = {
  "image/png": ["png"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/webp": ["webp"],
  "video/mp4": ["mp4", "m4v"],
  "video/webm": ["webm"],
  "video/quicktime": ["mov"],
};

/** Checks the leading bytes so a renamed file cannot pass as an image or video. */
async function matchesSignature(file: File, mime: string): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  switch (mime) {
    case "image/png":
      return bytes[0] === 0x89 && ascii(1, 4) === "PNG";
    case "image/jpeg":
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "image/webp":
      return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
    case "video/mp4":
    case "video/quicktime":
      return ascii(4, 8) === "ftyp" || ascii(4, 8) === "moov" || ascii(4, 8) === "wide";
    case "video/webm":
      return bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
    default:
      return false;
  }
}

export type ValidationResult = { ok: true } | { ok: false; error: string };

export async function validateMediaFile(file: File, kind: MediaKind, rule: UploadRule = DEFAULT_UPLOAD_RULES[kind]): Promise<ValidationResult> {
  if (!rule.mime_types.includes(file.type)) {
    const allowed = rule.mime_types.flatMap((m) => EXTENSIONS[m] ?? []).map((e) => e.toUpperCase());
    return { ok: false, error: `Unsupported file type. Use ${allowed.join(", ")}.` };
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!(EXTENSIONS[file.type] ?? []).includes(ext)) {
    return { ok: false, error: "File extension does not match its type." };
  }
  if (file.size > rule.max_mb * 1024 * 1024) {
    return { ok: false, error: `File is larger than ${rule.max_mb} MB.` };
  }
  if (file.size === 0 || !(await matchesSignature(file, file.type))) {
    return { ok: false, error: "File content does not look like a valid " + kind + "." };
  }
  return { ok: true };
}

export interface LocalMedia {
  id: string;
  file: File;
  kind: MediaKind;
  /** Temporary object URL; revoked when the item is removed or unmounted. */
  url: string;
  width?: number;
  height?: number;
  duration?: number;
}

export function readMediaMetadata(url: string, kind: MediaKind): Promise<Pick<LocalMedia, "width" | "height" | "duration">> {
  return new Promise((resolve) => {
    if (kind === "image") {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({});
      img.src = url;
    } else {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () =>
        resolve({ width: video.videoWidth, height: video.videoHeight, duration: Number.isFinite(video.duration) ? video.duration : undefined });
      video.onerror = () => resolve({});
      video.src = url;
    }
  });
}

export function toDescriptor(media: LocalMedia): FileDescriptor {
  return {
    name: media.file.name,
    size_bytes: media.file.size,
    mime_type: media.file.type,
    ...(media.width ? { width: media.width } : {}),
    ...(media.height ? { height: media.height } : {}),
    ...(media.duration ? { duration_seconds: Number(media.duration.toFixed(2)) } : {}),
  };
}
