"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { usePlatform } from "@/features/platform/platform-provider";
import { DEFAULT_UPLOAD_RULES, readMediaMetadata, validateMediaFile, type LocalMedia, type MediaKind } from "@/lib/files";

/**
 * Manages temporary, in-memory media previews. Files never leave the browser:
 * each one becomes an object URL that is revoked on removal or unmount.
 */
export function useMediaUpload(kind: MediaKind, { max = 1 }: { max?: number } = {}) {
  const { config } = usePlatform();
  const rule = config?.ui.uploads[kind] ?? DEFAULT_UPLOAD_RULES[kind];
  const [items, setItems] = useState<LocalMedia[]>([]);
  const [error, setError] = useState<string | null>(null);
  const urls = useRef(new Set<string>());

  useEffect(() => {
    const tracked = urls.current;
    return () => {
      tracked.forEach((url) => URL.revokeObjectURL(url));
      tracked.clear();
    };
  }, []);

  const add = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const incoming = Array.from(files);
      const room = max === 1 ? 1 : max - items.length;
      if (room <= 0) {
        setError(`You can add up to ${max} files.`);
        return;
      }
      const accepted: LocalMedia[] = [];
      for (const file of incoming.slice(0, room)) {
        const result = await validateMediaFile(file, kind, rule);
        if (!result.ok) {
          setError(`${file.name}: ${result.error}`);
          continue;
        }
        const url = URL.createObjectURL(file);
        urls.current.add(url);
        const meta = await readMediaMetadata(url, kind);
        accepted.push({ id: `${file.name}-${file.size}-${crypto.randomUUID()}`, file, kind, url, ...meta });
      }
      if (incoming.length > room) setError(`Only ${max} file${max > 1 ? "s" : ""} allowed; extra files were skipped.`);
      if (!accepted.length) return;
      setItems((prev) => {
        if (max === 1) {
          prev.forEach((item) => {
            URL.revokeObjectURL(item.url);
            urls.current.delete(item.url);
          });
          return accepted.slice(0, 1);
        }
        return [...prev, ...accepted].slice(0, max);
      });
    },
    [items.length, kind, max, rule],
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
        urls.current.delete(target.url);
      }
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const clear = useCallback(() => {
    setItems((prev) => {
      prev.forEach((item) => {
        URL.revokeObjectURL(item.url);
        urls.current.delete(item.url);
      });
      return [];
    });
    setError(null);
  }, []);

  return { items, first: items[0], add, remove, clear, error, rule, max };
}

export type MediaUpload = ReturnType<typeof useMediaUpload>;
