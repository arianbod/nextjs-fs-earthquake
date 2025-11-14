/**
 * Rate Limiting Middleware for QuakeWise Internal API
 * Implements tiered rate limiting with usage tracking for internal services
 */

import { NextResponse } from 'next/server';
import { checkRateLimit, trackApiUsage } from '../lib/db/usageTracker';
import { getRateLimitCache } from '../lib/cache/rateLimitCache';
import { createErrorResponse } from '../lib/api/errorHandler';

/**
 * Extracts service ID from request (assumes service auth already validated)
 * Service info is set by platform auth middleware
 */
function getServiceIdFromRequest(request) {
  // This is set by platform auth middleware
  return request.service?.id || 'unknown';
}

/**
 * Middleware to enforce rate limiting
 * Should be applied after service authentication
 *
 * @param {Request} request - Next.js request object
 * @param {Function} handler - The actual route handler function
 * @returns {Promise<Response>} - Response with rate limit headers
 */
export async function withRateLimit(request, handler) {
  const serviceId = getServiceIdFromRequest(request);

  // Check rate limit
  const rateLimit = await checkRateLimit(serviceId, 'HOUR');

  if (!rateLimit.allowed) {
    if (rateLimit.error) {
      return createErrorResponse({
        code: 'INVALID_SERVICE',
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
    serviceId,
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
async function trackApiUsageAsync({ serviceId, request, response, responseTimeMs }) {
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
      appId: serviceId,
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
 * Combined middleware: service auth + rate limiting
 * Most common pattern for internal API endpoints
 */
export function withPlatformAuthAndRateLimit(handler) {
  return async (request) => {
    // Import service auth
    const { authenticatePlatform } = await import('../lib/auth/platformAuth');
    const auth = await authenticatePlatform(request);

    if (!auth.valid) {
      return createErrorResponse({
        code: 'INVALID_SERVICE_TOKEN',
        message: auth.error,
        status: 401
      });
    }

    // Set service info on request (for rate limiting and tracking)
    request.service = auth.service;

    // Apply rate limiting
    return await withRateLimit(request, handler);
  };
}

/**
 * Checks rate limit without enforcing
 * Useful for showing remaining quota to internal services
 */
export async function checkRateLimitStatus(serviceId, windowType = 'HOUR') {
  const rateLimit = await checkRateLimit(serviceId, windowType);
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
export async function getRateLimitHeaders(serviceId) {
  const rateLimit = await checkRateLimit(serviceId, 'HOUR');

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
