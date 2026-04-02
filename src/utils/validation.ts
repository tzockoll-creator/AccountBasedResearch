/**
 * Input validation and environment variable checks.
 */

import { VALIDATION } from '../config/appConfig';

/**
 * Validate company name input.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateCompanyName(input: string): string | null {
  const trimmed = input.trim();

  if (!trimmed) {
    return 'Please enter a company name.';
  }

  if (trimmed.length < VALIDATION.companyNameMin) {
    return `Company name must be at least ${VALIDATION.companyNameMin} characters.`;
  }

  if (trimmed.length > VALIDATION.companyNameMax) {
    return `Company name must be ${VALIDATION.companyNameMax} characters or fewer.`;
  }

  return null;
}

/**
 * Check that required environment variables are present.
 * Call on app startup to fail fast with a clear message.
 */
export function validateEnv(): { valid: boolean; message: string | null } {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return {
      valid: false,
      message:
        'Missing VITE_ANTHROPIC_API_KEY environment variable. ' +
        'Create a .env file with VITE_ANTHROPIC_API_KEY=sk-ant-... and restart the dev server.',
    };
  }

  return { valid: true, message: null };
}
