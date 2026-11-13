# Architecture

## Overview

```
Browser ──HTTP/JSON──▶ FastAPI (stateless)
  Next.js app            ├─ core/settings.py      env + feature flags
  PlatformProvider       ├─ config/*.json         catalog, pricing, branding
  loads /config,         ├─ services/             validation, cost, feature status
  /features, /models,    └─ providers/            abstract adapters + empty registry
  /pricing once
```

The web app never hardcodes models, prices or feature availability. `PlatformProvider`
(`apps/web/features/platform`) fetches them at startup and exposes `usePlatform`, `useModels`
and `useFeature`. If the API is unreachable a banner is shown and pages degrade gracefully.

## Frontend

- **Design system:** tokens are CSS variables in `styles/globals.css`, mapped into Tailwind in
  `tailwind.config.ts`. Accent palettes switch through `data-accent` on `<html>`.
- **Primitives (`components/ui`):** thin, typed wrappers over Radix following shadcn conventions,
  animated with Framer Motion.
- **Studio building blocks (`features/studio`):** `PromptField`, `ModelPicker`, `OptionGrid`,
  `DropzoneSingle/Multi`, `GenerateBar`, `OutputStage`, `StudioLayout`. Each studio composes these.
- **Validation:** Zod schemas on the client; the server re-validates against the catalog.
- **Motion:** `MotionConfig reducedMotion` honours the OS setting (overridable in Settings) and CSS
  disables transitions under `prefers-reduced-motion`.
- **State:** React memory only. No browser storage.

## Backend

- `create_app()` wires CORS, request-ID/latency logging and a uniform error envelope.
- `CatalogService` loads and validates `models.json` at startup (fail fast on bad config).
- `FeatureService` = flag (`Settings`) × adapter presence (`ProviderRegistry`).
- `GenerationService.validate()` checks a request against the selected model's capabilities;
  `preview()` returns the estimate and a disabled notice. It never executes anything.
- `services/cost.py` is the authoritative token formula; `apps/web/lib/cost.ts` mirrors it for instant UI feedback.

## Scaling path

| Concern | Now | Later |
|---------|-----|-------|
| Persistence | none | PostgreSQL behind `DatabaseRepository` |
| Jobs | none | Redis/managed queue behind `GenerationQueueProvider`; workers call AI adapters |
| Files | browser previews | S3-compatible storage via `FileStorageProvider` (pre-signed uploads) |
| Auth | none | `AuthenticationProvider` + FastAPI dependency; per-user rate limits |
| Billing | static config | `PaymentProvider` webhooks credit `TokenWalletService` |

The API is stateless, so it scales horizontally behind a load balancer as-is.
