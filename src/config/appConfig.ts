/**
 * Centralized application configuration.
 * All API settings, timeouts, and retry parameters in one place.
 */

export const API_CONFIG = {
  /** Anthropic messages endpoint */
  url: 'https://api.anthropic.com/v1/messages',

  /** Model used for all research calls */
  model: 'claude-haiku-4-5-20251001',

  /** API version header */
  version: '2023-06-01',

  /** Max tokens for company research response */
  researchMaxTokens: 4096,

  /** Max tokens for warm leads response */
  leadsMaxTokens: 8192,

  /** Timeout for company research calls (ms) */
  researchTimeout: 120_000,

  /** Timeout for warm lead finding calls (ms) */
  leadsTimeout: 150_000,

  /** Timeout for competitive detection calls (ms) */
  competitiveTimeout: 90_000,

  /** Web search tool definition */
  webSearchTool: { type: 'web_search_20250305' as const, name: 'web_search' as const },
} as const;

export const RETRY_CONFIG = {
  /** Maximum number of retry attempts */
  maxRetries: 3,

  /** Base delay between retries (ms) — doubles each attempt: 1s, 2s, 4s */
  baseDelay: 1000,

  /** HTTP status codes that trigger a retry */
  retryableStatuses: [429, 500, 502, 503, 529] as readonly number[],
} as const;

export const VALIDATION = {
  /** Minimum company name length */
  companyNameMin: 2,

  /** Maximum company name length */
  companyNameMax: 100,
} as const;

export const STORAGE_KEYS = {
  productConfig: 'warmlead-ai-product-config',
  history: 'warmlead-ai-history',
  darkMode: 'warmlead-ai-dark-mode',
} as const;

export const HISTORY_CONFIG = {
  maxEntries: 10,
} as const;
