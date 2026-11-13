import { env, isApiConfigured } from "@/lib/env";
import type {
  ApiErrorBody,
  FeaturesResponse,
  GenerationPreviewResponse,
  GenerationRequest,
  HealthResponse,
  ModelCatalog,
  PlatformConfig,
  PricingResponse,
} from "./types";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly details: { field: string; message: string }[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** True when the backend could not be reached at all. */
  get isNetwork() {
    return this.status === 0;
  }
}

const DEFAULT_TIMEOUT_MS = 10_000;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!isApiConfigured) {
    throw new ApiError("NEXT_PUBLIC_API_URL is not configured.", 0, "not_configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  let response: Response;
  try {
    // Static demo mode reads build-time JSON snapshots; it has no write endpoints.
    if (env.staticData && init.method && init.method !== "GET") {
      throw new ApiError("This is a static demo without a live API.", 0, "static_demo");
    }
    const url = env.staticData ? `${env.basePath}/data${path}.json` : `${env.apiUrl}${path}`;
    response = await fetch(url, {
      ...init,
      signal: init.signal ?? controller.signal,
      headers: { Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
    });
  } catch (cause) {
    if (cause instanceof ApiError) throw cause;
    const aborted = cause instanceof DOMException && cause.name === "AbortError";
    throw new ApiError(aborted ? "The API request timed out." : "The API is unreachable.", 0, aborted ? "timeout" : "network_error");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    let body: ApiErrorBody | null = null;
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      // Non-JSON error body; fall through to a generic message.
    }
    throw new ApiError(
      body?.error.message ?? `Request failed with status ${response.status}.`,
      response.status,
      body?.error.code ?? "http_error",
      body?.error.details ?? [],
    );
  }

  return (await response.json()) as T;
}

export const api = {
  health: () => request<HealthResponse>("/health"),
  config: () => request<PlatformConfig>("/config"),
  features: () => request<FeaturesResponse>("/features"),
  models: () => request<ModelCatalog>("/models"),
  pricing: () => request<PricingResponse>("/pricing"),
  previewGeneration: (payload: GenerationRequest) =>
    request<GenerationPreviewResponse>("/generations/preview", { method: "POST", body: JSON.stringify(payload) }),
};
