/**
 * Usage Tracking Service for QuakeWise External API
 * Handles database operations for API usage tracking and analytics
 * Uses Prisma with PostgreSQL (Neon)
 */

import prisma from './prisma.js';
import crypto from 'crypto';

/**
 * Tracks an API request
 */
export async function trackApiUsage({
  appId,
  userId = null,
  endpoint,
  method,
  statusCode,
  responseTimeMs,
  errorCode = null,
  ipAddress = null,
  userAgent = null,
  requestSizeBytes = 0,
  responseSizeBytes = 0
}) {
  try {
    // Create usage record
    await prisma.apiUsage.create({
      data: {
        appId,
        userId,
        endpoint,
        method,
        statusCode,
        responseTimeMs,
        errorCode,
        ipAddress,
        userAgent,
        requestSizeBytes,
        responseSizeBytes
      }
    });

    // Update last_used_at for app
    await prisma.apiApp.update({
      where: { id: appId },
      data: { lastUsedAt: new Date() }
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to track API usage:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Records an API error
 */
export async function trackApiError({
  appId,
  userId = null,
  endpoint,
  errorCode,
  errorMessage,
  stackTrace = null,
  requestBody = null
}) {
  try {
    await prisma.apiError.create({
      data: {
        appId,
        userId,
        endpoint,
        errorCode,
        errorMessage,
        stackTrace,
        requestBody: requestBody || undefined
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to track API error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Checks and updates rate limit for an app
 * @returns {Object} - { allowed: boolean, remaining: number, resetAt: Date }
 */
export async function checkRateLimit(appId, windowType = 'HOUR') {
  try {
    // Get app's rate limit
    const app = await prisma.apiApp.findUnique({
      where: { id: appId, status: 'ACTIVE' },
      select: { tier: true, rateLimitPerHour: true, rateLimitPerDay: true }
    });

    if (!app) {
      return { allowed: false, error: 'App not found or inactive' };
    }

    const limit = windowType === 'HOUR' ? app.rateLimitPerHour : app.rateLimitPerDay;

    // Calculate window start time
    const now = new Date();
    let windowStart;
    if (windowType === 'HOUR') {
      windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
    } else {
      windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Get or create rate limit record
    const record = await prisma.rateLimit.findUnique({
      where: {
        appId_windowStart_windowType: {
          appId,
          windowStart,
          windowType
        }
      }
    });

    const currentCount = record ? record.requestCount : 0;

    if (currentCount >= limit) {
      const resetAt = new Date(windowStart);
      resetAt.setHours(resetAt.getHours() + (windowType === 'HOUR' ? 1 : 24));

      return {
        allowed: false,
        remaining: 0,
        limit: limit,
        resetAt: resetAt.toISOString(),
        tier: app.tier
      };
    }

    // Increment counter using upsert
    await prisma.rateLimit.upsert({
      where: {
        appId_windowStart_windowType: {
          appId,
          windowStart,
          windowType
        }
      },
      update: {
        requestCount: { increment: 1 }
      },
      create: {
        appId,
        windowStart,
        windowType,
        requestCount: 1
      }
    });

    const resetAt = new Date(windowStart);
    resetAt.setHours(resetAt.getHours() + (windowType === 'HOUR' ? 1 : 24));

    return {
      allowed: true,
      remaining: limit - currentCount - 1,
      limit: limit,
      resetAt: resetAt.toISOString(),
      tier: app.tier
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: false, error: error.message };
  }
}

/**
 * Gets usage statistics for an app
 */
export async function getAppUsageStats(appId, days = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await prisma.$queryRaw`
      SELECT
        DATE(timestamp) as date,
        COUNT(*) as total_requests,
        SUM(CASE WHEN status_code < 400 THEN 1 ELSE 0 END) as successful_requests,
        SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as failed_requests,
        AVG(response_time_ms) as avg_response_time,
        MAX(response_time_ms) as max_response_time
      FROM api_usage
      WHERE app_id = ${appId}
        AND timestamp >= ${startDate}
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `;

    return { success: true, stats };
  } catch (error) {
    console.error('Failed to get usage stats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Gets endpoint usage breakdown for an app
 */
export async function getEndpointUsage(appId, days = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const endpoints = await prisma.$queryRaw`
      SELECT
        endpoint,
        COUNT(*) as request_count,
        AVG(response_time_ms) as avg_response_time,
        SUM(CASE WHEN status_code < 400 THEN 1 ELSE 0 END) as success_count,
        SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error_count
      FROM api_usage
      WHERE app_id = ${appId}
        AND timestamp >= ${startDate}
      GROUP BY endpoint
      ORDER BY request_count DESC
    `;

    return { success: true, endpoints };
  } catch (error) {
    console.error('Failed to get endpoint usage:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Registers a new platform app
 */
export async function registerApp({ appId, name, tier = 'FREE', platformToken }) {
  try {
    // Hash the platform token
    const tokenHash = crypto.createHash('sha256').update(platformToken).digest('hex');

    // Map tier limits
    const tierLimits = {
      FREE: { hour: 100, day: 1000 },
      PRO: { hour: 1000, day: 10000 },
      ENTERPRISE: { hour: 10000, day: 100000 }
    };

    const limits = tierLimits[tier] || tierLimits.FREE;

    await prisma.apiApp.create({
      data: {
        id: appId,
        name,
        tier,
        platformTokenHash: tokenHash,
        rateLimitPerHour: limits.hour,
        rateLimitPerDay: limits.day
      }
    });

    return { success: true, appId };
  } catch (error) {
    console.error('Failed to register app:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Gets app details by ID
 */
export async function getApp(appId) {
  try {
    const app = await prisma.apiApp.findUnique({
      where: { id: appId },
      select: {
        id: true,
        name: true,
        tier: true,
        rateLimitPerHour: true,
        rateLimitPerDay: true,
        status: true,
        createdAt: true,
        lastUsedAt: true
      }
    });

    if (!app) {
      return { success: false, error: 'App not found' };
    }

    return { success: true, app };
  } catch (error) {
    console.error('Failed to get app:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Updates app tier and rate limits
 */
export async function updateAppTier(appId, tier) {
  const tierLimits = {
    FREE: { hour: 100, day: 1000 },
    PRO: { hour: 1000, day: 10000 },
    ENTERPRISE: { hour: 10000, day: 100000 }
  };

  const limits = tierLimits[tier] || tierLimits.FREE;

  try {
    await prisma.apiApp.update({
      where: { id: appId },
      data: {
        tier,
        rateLimitPerHour: limits.hour,
        rateLimitPerDay: limits.day
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to update app tier:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Cleans up old rate limit records (run periodically)
 */
export async function cleanupOldRateLimits(daysOld = 7) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.rateLimit.deleteMany({
      where: {
        windowStart: {
          lt: cutoffDate
        }
      }
    });

    console.log(`Cleaned up ${result.count} old rate limit records`);
    return { success: true, deleted: result.count };
  } catch (error) {
    console.error('Failed to cleanup rate limits:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Closes database connection
 */
export async function closeDb() {
  await prisma.$disconnect();
}

// Export Prisma instance for direct queries if needed
export { prisma };
