/**
 * Service Authentication Middleware
 * Validates internal service tokens before allowing API access
 */

import { NextResponse } from 'next/server';
import { authenticatePlatform } from '../lib/auth/platformAuth';
import { createErrorResponse } from '../lib/api/errorHandler';

/**
 * Middleware to validate service authentication
 * Use this for all internal API routes that require service-level auth
 *
 * @param {Request} request - Next.js request object
 * @param {Function} handler - The actual route handler function
 * @returns {Promise<Response>} - Response or calls next handler
 */
export async function withPlatformAuth(request, handler) {
  const auth = await authenticatePlatform(request);

  if (!auth.valid) {
    return createErrorResponse({
      code: 'INVALID_SERVICE_TOKEN',
      message: auth.error,
      status: 401
    });
  }

  // Service authenticated successfully, add service info to request
  // Make service info available to handler
  request.service = auth.service;

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
 * Checks if service auth is valid without blocking
 * Useful for optional authentication scenarios
 *
 * @param {Request} request
 * @returns {Promise<{authenticated: boolean, service?: Object, error?: string}>}
 */
export async function checkPlatformAuth(request) {
  const auth = await authenticatePlatform(request);
  return {
    authenticated: auth.valid,
    service: auth.service,
    error: auth.error
  };
}
