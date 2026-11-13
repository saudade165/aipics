// Mirrors the FastAPI response schemas in apps/api/app/schemas.

export type ModelCategory = "image" | "video" | "character" | "upscale" | "video_enhance";

export interface ResolutionOption {
  id: string;
  label: string;
  detail?: string | null;
  multiplier: number;
}

export interface ModelPricing {
  unit: "per_output" | "per_second" | "per_job";
  base_tokens: number;
  audio_tokens_per_second: number;
  scale_multipliers: Record<string, number>;
  fps_multipliers: Record<string, number>;
}

export interface ModelDefinition {
  id: string;
  name: string;
  vendor: string;
  category: ModelCategory;
  provider: string;
  tagline: string;
  description: string;
  badges: string[];
  accent: [string, string];
  capabilities: string[];
  workflows: string[];
  aspect_ratios: string[];
  resolutions: ResolutionOption[];
  durations: number[];
  scales: number[];
  fps_options: number[];
  max_outputs: number;
  max_reference_images: number;
  supports_negative_prompt: boolean;
  supports_audio: boolean;
  supports_last_frame: boolean;
  pricing: ModelPricing;
  status: "connected" | "not_connected";
}

export interface ModelCatalog {
  categories: { id: ModelCategory; label: string }[];
  models: ModelDefinition[];
  total: number;
}

export interface HealthResponse {
  status: "ok";
  name: string;
  version: string;
  environment: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  tag: string;
  date: string;
}

export interface UploadRule {
  max_mb: number;
  mime_types: string[];
}

export interface PlatformConfig {
  app_version: string;
  environment: string;
  branding: { name: string; short_name: string; tagline: string; support_email: string | null };
  features: { enabled: string[]; disabled: string[] };
  ui: {
    default_language: string;
    languages: { code: string; label: string }[];
    accents: { id: string; label: string }[];
    uploads: Record<"image" | "video", UploadRule>;
    announcements: Announcement[];
  };
}

export type FeatureStatus = "active" | "disabled" | "provider_not_configured";

export interface FeatureInfo {
  key: string;
  name: string;
  description: string;
  category: "generation" | "account" | "infrastructure";
  env_var: string;
  flag_enabled: boolean;
  provider_configured: boolean;
  available: boolean;
  status: FeatureStatus;
  message: string;
}

export interface FeaturesResponse {
  features: FeatureInfo[];
  available_count: number;
  total: number;
}

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthly_price: number;
  annual_monthly_price: number;
  monthly_tokens: number;
  highlight: boolean;
  cta: string;
  model_access: string;
  limits: { concurrent_jobs: number; max_video_seconds: number; max_resolution: string; history_days: number };
  features: string[];
}

export interface PricingResponse {
  currency: string;
  annual_discount_percent: number;
  billing_enabled: boolean;
  billing_enabled_note: string;
  plans: Plan[];
  comparison: { group: string; rows: { label: string; values: Record<string, string | boolean> }[] }[];
}

export interface FileDescriptor {
  name: string;
  size_bytes: number;
  mime_type: string;
  width?: number;
  height?: number;
  duration_seconds?: number;
}

export type GenerationKind = "image" | "video" | "character" | "upscale" | "video_enhance";

export type GenerationRequest = { kind: GenerationKind; model_id: string } & Record<string, unknown>;

export interface GenerationPreviewResponse {
  status: "integration_disabled";
  executed: false;
  validated: boolean;
  message: string;
  feature: string;
  feature_status: FeatureStatus;
  model_id: string;
  model_name: string;
  estimated_cost: { tokens: number; breakdown: string[]; note: string };
  next_steps: string[];
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: { field: string; message: string }[] | null };
}
