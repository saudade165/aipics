import type { Metadata } from "next";
import { Suspense } from "react";

import { ImageStudio } from "@/features/image-studio/image-studio";

export const metadata: Metadata = { title: "Image Studio" };

export default function Page() {
  return (
    <Suspense>
      <ImageStudio />
    </Suspense>
  );
}
