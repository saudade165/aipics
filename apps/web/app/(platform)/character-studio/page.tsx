import type { Metadata } from "next";
import { Suspense } from "react";

import { CharacterStudio } from "@/features/character-studio/character-studio";

export const metadata: Metadata = { title: "Character Studio" };

export default function Page() {
  return (
    <Suspense>
      <CharacterStudio />
    </Suspense>
  );
}
