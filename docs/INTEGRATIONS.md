# Enabling future integrations

Every integration follows the same three steps:

1. **Implement** the abstract class from `apps/api/app/providers/`.
2. **Register** the instance in `build_registry()` in `apps/api/app/providers/registry.py`.
3. **Enable** the feature flag in the API environment.

`GET /api/v1/features` then reports the feature as `active`, and the web app reflects it automatically.

| Feature | Flag | Interface | Registry slot |
|---------|------|-----------|---------------|
| Image generation | `AI_IMAGE_ENABLED` | `AIImageProvider` | `image[<provider key>]` |
| Video generation | `AI_VIDEO_ENABLED` | `AIVideoProvider` | `video[<provider key>]` |
| Character workflows | `AI_CHARACTER_ENABLED` | `AIVideoProvider` | `video[<provider key>]` |
| Image upscaling | `AI_UPSCALE_ENABLED` | `ImageUpscaleProvider` | `upscale[...]` |
| Video enhancement | `AI_VIDEO_ENHANCE_ENABLED` | `VideoEnhanceProvider` | `video_enhance[...]` |
| Authentication | `AUTH_ENABLED` | `AuthenticationProvider` | `auth` |
| Payments | `PAYMENTS_ENABLED` | `PaymentProvider` | `payments` |
| Token wallet | `TOKEN_WALLET_ENABLED` | `TokenWalletService` | `wallet` |
| Database | `DATABASE_ENABLED` | `DatabaseRepository` | `database` |
| File storage | `STORAGE_ENABLED` | `FileStorageProvider` | `storage` |
| Job queue | `QUEUE_ENABLED` | `GenerationQueueProvider` | `queue` |

The provider key is the `provider` field of a model in `config/models.json` (for example `kling`).

## Recommended order

1. **Database + Auth** — users and sessions; add an auth dependency to routers.
2. **Storage** — replace browser-only previews with pre-signed uploads; requests then carry storage keys
   instead of file descriptors.
3. **Queue + first AI adapter** — add `POST /generations` next to `/generations/preview`:
   validate → reserve tokens → enqueue → worker calls the adapter → store outputs → commit tokens.
4. **Wallet + Payments** — webhook credits tokens; `/pricing` starts returning `billing_enabled: true`.
5. **History** — back the History page with `DatabaseRepository.list()`.

## Frontend touch points

- `hooks/use-generation-preview.tsx` — switch to the real endpoint and poll/stream job status.
- `features/studio/output-stage.tsx` — render outputs.
- `features/history/history-view.tsx` — replace the empty item list with an API query.
- `components/layout/header.tsx` — token balance and profile menu.
- `features/pricing/pricing-view.tsx` — replace the notice dialog with checkout when `billing_enabled`.

Secrets (provider keys, DB URLs) belong only in the API environment, never in `NEXT_PUBLIC_*` variables.
