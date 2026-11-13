import type { Metadata } from "next";
import { Suspense } from "react";

import { VideoEnhancer } from "@/features/video-enhancer/video-enhancer";

export const metadata: Metadata = { title: "Video Enhancer" };

export default function Page() {
  return (
    <Suspense>
      <VideoEnhancer />
    </Suspense>
  );
}
