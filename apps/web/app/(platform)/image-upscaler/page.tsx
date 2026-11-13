import type { Metadata } from "next";
import { Suspense } from "react";

import { ImageUpscaler } from "@/features/upscaler/image-upscaler";

export const metadata: Metadata = { title: "Image Upscaler" };

export default function Page() {
  return (
    <Suspense>
      <ImageUpscaler />
    </Suspense>
  );
}
