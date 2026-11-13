import type { Metadata } from "next";
import { Suspense } from "react";

import { VideoStudio } from "@/features/video-studio/video-studio";

export const metadata: Metadata = { title: "Video Studio" };

export default function Page() {
  return (
    <Suspense>
      <VideoStudio />
    </Suspense>
  );
}
