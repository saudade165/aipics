import type { Metadata } from "next";
import { Suspense } from "react";

import { PricingView } from "@/features/pricing/pricing-view";

export const metadata: Metadata = { title: "Pricing" };

export default function Page() {
  return (
    <Suspense>
      <PricingView />
    </Suspense>
  );
}
