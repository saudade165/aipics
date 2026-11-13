import type { Metadata } from "next";
import { Suspense } from "react";

import { HistoryView } from "@/features/history/history-view";

export const metadata: Metadata = { title: "Generation History" };

export default function Page() {
  return (
    <Suspense>
      <HistoryView />
    </Suspense>
  );
}
