/**
 * Platform Authentication Middleware
 * Validates platform token before allowing API access
 */

import { NextResponse } from 'next/server';
import { authenticatePlatform } from '../lib/auth/platformAuth';
import { createErrorResponse } from '../lib/api/errorHandler';

/**
 * Middleware to validate platform authentication
 * Use this for all external API routes that require platform-level auth
 *
 * @param {Request} request - Next.js request object
 * @param {Function} handler - The actual route handler function
 * @returns {Promise<Response>} - Response or calls next handler
 */
export async function withPlatformAuth(request, handler) {
  const auth = authenticatePlatform(request);

  if (!auth.valid) {
    return createErrorResponse({
      code: 'INVALID_PLATFORM_TOKEN',
      message: auth.error,
      status: 401
    });
  }

  // Platform authenticated successfully, proceed to handler
  return await handler(request);
}

/**
 * Higher-order function to wrap API route handlers with platform auth
 *
 * @example
 * export const POST = requirePlatformAuth(async (request) => {
 *   // Your API logic here
 * });
 */
export function requirePlatformAuth(handler) {
  return async (request) => {
    return await withPlatformAuth(request, handler);
  };
}

/**
 * Checks if platform auth is valid without blocking
 * Useful for optional authentication scenarios
 *
 * @param {Request} request
 * @returns {Object} - { authenticated: boolean, error?: string }
 */
export function checkPlatformAuth(request) {
  const auth = authenticatePlatform(request);
  return {
    authenticated: auth.valid,
    error: auth.error
  };
}
