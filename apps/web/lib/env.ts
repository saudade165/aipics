/**
 * Public runtime configuration. Only NEXT_PUBLIC_* values are exposed to the
 * browser; never put secrets here.
 */
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  /**
   * Static demo mode: catalogs are read from JSON files exported at build
   * time (public/data) instead of a live API. Used for static hosting.
   */
  staticData: process.env.NEXT_PUBLIC_STATIC_DATA === "true",
} as const;

export const isApiConfigured = env.staticData || env.apiUrl.length > 0;
