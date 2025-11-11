/**
 * Rate Limiting Middleware for QuakeWise External API
 * Implements tiered rate limiting with usage tracking
 */

import { NextResponse } from 'next/server';
import { checkRateLimit, trackApiUsage } from '../lib/db/usageTracker';
import { getRateLimitCache } from '../lib/cache/rateLimitCache';
import { createErrorResponse } from '../lib/api/errorHandler';

/**
 * Extracts app ID from request (assumes platform auth already validated)
 * In production, this should be set by platform auth middleware
 */
function getAppIdFromRequest(request) {
  // This will be set by platform auth middleware
  return request.appId || 'unknown';
}

/**
 * Middleware to enforce rate limiting
 * Should be applied after platform authentication
 *
 * @param {Request} request - Next.js request object
 * @param {Function} handler - The actual route handler function
 * @returns {Promise<Response>} - Response with rate limit headers
 */
export async function withRateLimit(request, handler) {
  const appId = getAppIdFromRequest(request);

  // Check rate limit
  const rateLimit = checkRateLimit(appId, 'hour');

  if (!rateLimit.allowed) {
    if (rateLimit.error) {
      return createErrorResponse({
        code: 'INVALID_APP',
        message: rateLimit.error,
        status: 403
      });
    }

    return createErrorResponse({
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Rate limit exceeded. Limit: ${rateLimit.limit} requests per hour. Try again after ${rateLimit.resetAt}`,
      status: 429,
      details: {
        limit: rateLimit.limit,
        remaining: 0,
        resetAt: rateLimit.resetAt,
        tier: rateLimit.tier
      }
    });
  }

  // Store rate limit info for response headers
  request.rateLimitInfo = rateLimit;

  // Execute handler
  const startTime = Date.now();
  const response = await handler(request);
  const endTime = Date.now();

  // Add rate limit headers to response
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Limit', rateLimit.limit.toString());
  headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
  headers.set('X-RateLimit-Reset', rateLimit.resetAt);
  headers.set('X-RateLimit-Tier', rateLimit.tier);

  // Track API usage asynchronously (don't wait)
  trackApiUsageAsync({
    appId,
    request,
    response,
    responseTimeMs: endTime - startTime
  });

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}

/**
 * Tracks API usage asynchronously
 */
async function trackApiUsageAsync({ appId, request, response, responseTimeMs }) {
  try {
    const url = new URL(request.url);
    const endpoint = url.pathname;
    const method = request.method;

    // Get user ID from JWT context if available
    const userId = request.userContext?.userId || null;

    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Get error code if error response
    let errorCode = null;
    if (response.status >= 400) {
      const errorHeader = response.headers.get('x-error-code');
      errorCode = errorHeader || 'UNKNOWN_ERROR';
    }

    await trackApiUsage({
      appId,
      userId,
      endpoint,
      method,
      statusCode: response.status,
      responseTimeMs,
      errorCode,
      ipAddress,
      userAgent
    });
  } catch (error) {
    console.error('Failed to track API usage:', error);
    // Don't throw - we don't want tracking failures to affect the response
  }
}

/**
 * Higher-order function to wrap API handlers with rate limiting
 *
 * @example
 * export const POST = withRateLimiting(async (request) => {
 *   // Your API logic here
 * });
 */
export function withRateLimiting(handler) {
  return async (request) => {
    return await withRateLimit(request, handler);
  };
}

/**
 * Combined middleware: platform auth + rate limiting
 * Most common pattern for external API endpoints
 */
export function withPlatformAuthAndRateLimit(handler) {
  return async (request) => {
    // Import platform auth
    const { authenticatePlatform } = await import('../lib/auth/platformAuth');
    const auth = authenticatePlatform(request);

    if (!auth.valid) {
      return createErrorResponse({
        code: 'INVALID_PLATFORM_TOKEN',
        message: auth.error,
        status: 401
      });
    }

    // Extract app ID from platform token (you'll need to implement this)
    // For now, using a simple approach - in production, store app ID mapping
    request.appId = await getAppIdFromPlatformToken(request);

    // Apply rate limiting
    return await withRateLimit(request, handler);
  };
}

/**
 * Gets app ID from platform token
 * TODO: Implement proper token-to-appId mapping
 */
async function getAppIdFromPlatformToken(request) {
  // In production, you should:
  // 1. Extract the platform token
  // 2. Look up the app ID from the database
  // 3. Return the app ID

  // For now, using a simple approach
  // You could also encode the app ID in the token itself
  const token = request.headers.get('x-platform-token') ||
    request.headers.get('authorization')?.replace('Platform ', '');

  // Temporary: Look up app by token hash
  const { getDb } = await import('../lib/db/usageTracker');
  const db = getDb();

  try {
    const crypto = await import('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const stmt = db.prepare('SELECT id FROM api_apps WHERE platform_token_hash = ? AND status = "active"');
    const app = stmt.get(tokenHash);

    return app?.id || 'unknown';
  } catch (error) {
    console.error('Failed to get app ID:', error);
    return 'unknown';
  }
}

/**
 * Checks rate limit without enforcing
 * Useful for showing remaining quota to clients
 */
export function checkRateLimitStatus(appId, windowType = 'hour') {
  const rateLimit = checkRateLimit(appId, windowType);
  return {
    allowed: rateLimit.allowed,
    limit: rateLimit.limit,
    remaining: rateLimit.remaining,
    resetAt: rateLimit.resetAt,
    tier: rateLimit.tier
  };
}

/**
 * Gets rate limit headers as object
 * Can be added to any response
 */
export function getRateLimitHeaders(appId) {
  const rateLimit = checkRateLimit(appId, 'hour');

  if (!rateLimit.allowed && rateLimit.error) {
    return {};
  }

  return {
    'X-RateLimit-Limit': rateLimit.limit.toString(),
    'X-RateLimit-Remaining': Math.max(0, rateLimit.remaining).toString(),
    'X-RateLimit-Reset': rateLimit.resetAt,
    'X-RateLimit-Tier': rateLimit.tier
  };
}
