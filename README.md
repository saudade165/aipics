# Aether Studio

A multi-studio AI generation platform foundation: a Next.js web app and a stateless FastAPI backend.

**Current release:** every interface is built and interactive, and the backend serves configuration,
catalogs and validation. AI execution, accounts, payments, storage and the database are intentionally
**disabled** behind feature flags. Clicking *Generate* validates the configuration on the server and
reports `AI integrations are not connected yet.` — nothing is generated or faked.

> The visual direction is inspired by modern AI studio products such as nhub.one. It is an original
> implementation and does not reproduce any third-party source code or assets.

## Stack

| Layer    | Technology |
|----------|------------|
| Web      | Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS, Radix primitives (shadcn-style components), Framer Motion, Lucide, React Hook Form + Zod |
| API      | Python 3.10+, FastAPI, Pydantic v2, pydantic-settings, OpenAPI/Swagger |
| Tests    | pytest + FastAPI TestClient |

No database, ORM, Redis, object storage, auth provider, payment provider or AI API key is required.

## Requirements

- Node.js 20+ (22 recommended) and npm
- Python 3.10+

## Setup

```bash
npm run setup                          # installs web deps + creates apps/api/.venv
cp .env.example apps/api/.env          # optional: API defaults work without it
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > apps/web/.env.local
```

## Run (two terminals)

```bash
npm run dev:api     # http://localhost:8000  (Swagger: /docs, ReDoc: /redoc)
npm run dev:web     # http://localhost:3000
```

## Other commands

```bash
npm run build       # production build of the web app
npm run start:web   # serve the production build
npm run start:api   # run the API without reload
npm run test:api    # backend tests
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
docker compose up --build   # optional containerised run
```

## Static demo on GitHub Pages

Every push to `main` runs `.github/workflows/pages.yml`: it tests the API, exports the read-only
endpoints to JSON (`apps/api/scripts/export_static.py`) and builds the web app as a static site
(`STATIC_EXPORT=true`, `NEXT_PUBLIC_STATIC_DATA=true`). The result is published to GitHub Pages.

One-time setup: repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The static demo has no live backend: catalogs come from the build-time snapshot and *Generate*
shows the "not connected" notice without server-side validation.

## Project structure

```
apps/
  web/                       Next.js application
    app/(platform)/          Routes: dashboard, studios, history, pricing, settings
    components/ui/           Design-system primitives (button, dialog, select, toast…)
    components/layout/       App shell: sidebar, header, command palette, mobile nav
    features/                One folder per product area + shared studio building blocks
    hooks/                   Upload previews, model selection, generation preview
    lib/                     API client, types, cost mirror, file validation, navigation
    styles/globals.css       Design tokens (CSS variables) and component classes
  api/                       FastAPI application
    app/api/v1/              Routers and endpoints
    app/core/                Settings (feature flags), errors, logging, middleware
    app/config/              models.json, pricing.json, branding.json, features.py
    app/schemas/             Pydantic request/response models
    app/services/            Catalog, features, pricing, cost, generation validation
    app/providers/           Abstract integration points + provider registry
    tests/
docs/                        Architecture and integration guide
```

## API

| Method | Path                           | Purpose |
|--------|--------------------------------|---------|
| GET    | `/api/v1/health`               | Status, name, version |
| GET    | `/api/v1/config`               | Branding, enabled/disabled features, UI config |
| GET    | `/api/v1/features`             | Per-feature flag, provider and availability status |
| GET    | `/api/v1/models[?category=]`   | Static model catalog |
| GET    | `/api/v1/models/{id}`          | Single model |
| GET    | `/api/v1/pricing`              | Subscription plans and comparison table |
| POST   | `/api/v1/generations/preview`  | Validate a generation config; always `executed: false` |

Errors use one envelope: `{"error": {"code", "message", "details": [{"field", "message"}]}}`.

## Changing content without touching the UI

- **Models:** edit `apps/api/app/config/models.json`. Studios, pickers, the dashboard and search update automatically.
- **Plans, prices, tokens:** edit `apps/api/app/config/pricing.json`.
- **Branding, languages, upload limits, announcements:** edit `apps/api/app/config/branding.json`.

## Disabled integrations and how to enable them

See [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md). In short: implement the matching abstract class in
`apps/api/app/providers/`, register it in `providers/registry.py`, then set the feature flag.
A flag alone never activates a feature — `/features` reports `provider_not_configured` until an adapter exists.

## Data handling in this release

- Uploaded files are browser-only object URLs; they are validated (type, extension, size, magic bytes),
  previewed, and revoked. Only file *metadata* is sent to the API for validation.
- Preferences live in React memory and reset on reload. No localStorage, IndexedDB or cookies are used.
- The API is stateless and writes nothing to disk.
