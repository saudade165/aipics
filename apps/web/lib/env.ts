/**
 * Public runtime configuration. Only NEXT_PUBLIC_* values are exposed to the
 * browser; never put secrets here.
 */
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "",
} as const;

export const isApiConfigured = env.apiUrl.length > 0;
