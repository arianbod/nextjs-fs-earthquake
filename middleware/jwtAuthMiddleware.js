/**
 * JWT Authentication Middleware
 * Validates JWT tokens for end-user authentication
 */

import { NextResponse } from 'next/server';
import { authenticateJWT } from '../lib/auth/jwtService';
import { createErrorResponse } from '../lib/api/errorHandler';

/**
 * Middleware to validate JWT authentication
 * Use this after platform auth for user-specific operations
 *
 * @param {Request} request - Next.js request object
 * @param {Function} handler - The actual route handler function
 * @returns {Promise<Response>} - Response or calls next handler with user context
 */
export async function withJWTAuth(request, handler) {
  const auth = await authenticateJWT(request);

  if (!auth.valid) {
    const errorCode = auth.code === 'TOKEN_EXPIRED'
      ? 'JWT_TOKEN_EXPIRED'
      : 'INVALID_JWT_TOKEN';

    return createErrorResponse({
      code: errorCode,
      message: auth.error,
      status: 401,
      details: { code: auth.code }
    });
  }

  // Attach user payload to request for handler to use
  request.userContext = auth.payload;

  // JWT authenticated successfully, proceed to handler
  return await handler(request);
}

/**
 * Higher-order function to wrap API route handlers with JWT auth
 * Requires both platform auth and JWT auth
 *
 * @example
 * export const POST = requireJWTAuth(async (request) => {
 *   const { userId, tier } = request.userContext;
 *   // Your API logic here
 * });
 */
export function requireJWTAuth(handler) {
  return async (request) => {
    return await withJWTAuth(request, handler);
  };
}

/**
 * Combined middleware: requires both platform and JWT auth
 * This is the most common pattern for external API endpoints
 *
 * @param {Function} handler - The actual route handler function
 * @returns {Function} - Wrapped handler with dual authentication
 */
export function requireBothAuth(handler) {
  return async (request) => {
    // First check platform auth
    const { authenticatePlatform } = await import('../lib/auth/platformAuth');
    const platformAuth = authenticatePlatform(request);

    if (!platformAuth.valid) {
      return createErrorResponse({
        code: 'INVALID_PLATFORM_TOKEN',
        message: platformAuth.error,
        status: 401
      });
    }

    // Then check JWT auth
    return await withJWTAuth(request, handler);
  };
}

/**
 * Checks if JWT auth is valid without blocking
 * Useful for optional authentication scenarios
 *
 * @param {Request} request
 * @returns {Promise<Object>} - { authenticated: boolean, payload?: Object, error?: string }
 */
export async function checkJWTAuth(request) {
  const auth = await authenticateJWT(request);
  return {
    authenticated: auth.valid,
    payload: auth.payload,
    error: auth.error
  };
}

/**
 * Extracts user context from request if JWT auth was successful
 * Returns null if not authenticated
 *
 * @param {Request} request
 * @returns {Object|null} - User context or null
 */
export function getUserContext(request) {
  return request.userContext || null;
}
