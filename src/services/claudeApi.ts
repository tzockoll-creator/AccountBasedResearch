/**
 * Claude API Service
 *
 * Handles all Anthropic API calls for company research and warm lead finding.
 * Uses centralized config for API settings and retry parameters.
 */

import { API_CONFIG, RETRY_CONFIG } from '../config/appConfig';
import { buildResearchPrompt, buildWarmLeadsPrompt } from '../prompts/researchPrompt';
import type { ProductConfig, CompanyResearchResult, WarmLeadsResult } from '../types';

function getApiKey(): string {
  return import.meta.env.VITE_ANTHROPIC_API_KEY || '';
}

function buildHeaders(): Record<string, string> {
  const apiKey = getApiKey();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'anthropic-version': API_CONFIG.version,
    'anthropic-dangerous-direct-browser-access': 'true'
  };
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  return headers;
}

/**
 * Retry-aware fetch with exponential backoff.
 * Retries on 429 (rate-limit) and 5xx errors.
 * Backoff schedule: 1s, 2s, 4s (configurable via RETRY_CONFIG).
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = RETRY_CONFIG.maxRetries
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);

    if (RETRY_CONFIG.retryableStatuses.includes(response.status) && attempt < maxRetries) {
      // Use Retry-After header if present, otherwise exponential backoff
      const retryAfter = response.headers.get('retry-after');
      const waitMs = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : RETRY_CONFIG.baseDelay * Math.pow(2, attempt); // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, waitMs));
      continue;
    }
    return response;
  }
  // TypeScript: unreachable, but satisfies return type
  throw new Error('Retry loop exited unexpectedly');
}

/**
 * Extract and parse JSON from Claude's response content blocks.
 */
function extractJSON<T>(data: { content: Array<{ type: string; text?: string }> }): T {
  const textContent = data.content
    .filter(item => item.type === 'text')
    .map(item => item.text || '')
    .join('');

  const cleaned = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON found in response');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Research a company and map findings to product capabilities.
 */
export async function researchCompany(
  companyName: string,
  productConfig: ProductConfig,
  { signal }: { signal?: AbortSignal } = {}
): Promise<CompanyResearchResult> {
  const prompt = buildResearchPrompt(companyName, productConfig);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.researchTimeout);

  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetchWithRetry(API_CONFIG.url, {
      method: 'POST',
      headers: buildHeaders(),
      signal: controller.signal,
      body: JSON.stringify({
        model: API_CONFIG.model,
        max_tokens: API_CONFIG.researchMaxTokens,
        tools: [API_CONFIG.webSearchTool],
        messages: [{ role: 'user', content: prompt }]
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || 'API returned an error');
    }

    return extractJSON<CompanyResearchResult>(data);
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out. Try again or use a simpler company name.');
    }
    throw err;
  }
}

/**
 * Find warm leads at a company — people publicly signaling pain points.
 */
export async function findWarmLeads(
  companyName: string,
  productConfig: ProductConfig,
  { signal }: { signal?: AbortSignal } = {}
): Promise<WarmLeadsResult> {
  const prompt = buildWarmLeadsPrompt(companyName, productConfig);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.leadsTimeout);

  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetchWithRetry(API_CONFIG.url, {
      method: 'POST',
      headers: buildHeaders(),
      signal: controller.signal,
      body: JSON.stringify({
        model: API_CONFIG.model,
        max_tokens: API_CONFIG.leadsMaxTokens,
        tools: [API_CONFIG.webSearchTool],
        messages: [{ role: 'user', content: prompt }]
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || 'API returned an error');
    }

    return extractJSON<WarmLeadsResult>(data);
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out. Lead searches can take up to 2 minutes with deep web search.');
    }
    throw err;
  }
}
