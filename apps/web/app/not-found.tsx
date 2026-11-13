import { AppShell } from "@/components/layout/app-shell";

import PlatformNotFound from "./(platform)/not-found";

export default function NotFound() {
  return (
    <AppShell>
      <PlatformNotFound />
    </AppShell>
  );
}
