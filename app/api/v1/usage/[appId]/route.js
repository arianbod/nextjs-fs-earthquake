/**
 * App Usage Statistics Endpoint
 * GET /api/v1/usage/:appId
 * Returns usage statistics for a specific app
 */

import { NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/errorHandler';
import { requirePlatformAuth } from '@/middleware/platformAuthMiddleware';
import { getAppUsageStats, getEndpointUsage } from '@/lib/db/usageTracker';

/**
 * GET /api/v1/usage/:appId?days=7
 * Returns usage statistics for the specified app
 *
 * Request Headers:
 *   X-Platform-Token: <platform-token>
 *
 * Query Parameters:
 *   days: number (optional, default: 7) - Number of days to retrieve
 *
 * Response:
 *   {
 *     success: true,
 *     data: {
 *       appId: string,
 *       period: { days: number, from: ISO8601, to: ISO8601 },
 *       summary: {
 *         totalRequests: number,
 *         successfulRequests: number,
 *         failedRequests: number,
 *         avgResponseTime: number
 *       },
 *       dailyStats: [ ... ],
 *       endpointBreakdown: [ ... ]
 *     }
 *   }
 */
async function getUsageHandler(request, { params }) {
  const appId = params.appId;
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get('days') || '7');

  try {
    // Get usage statistics
    const statsResult = getAppUsageStats(appId, days);

    if (!statsResult.success) {
      return createErrorResponse({
        code: 'DATABASE_ERROR',
        message: 'Failed to retrieve usage statistics',
        details: { error: statsResult.error }
      });
    }

    // Get endpoint breakdown
    const endpointsResult = getEndpointUsage(appId, days);

    if (!endpointsResult.success) {
      return createErrorResponse({
        code: 'DATABASE_ERROR',
        message: 'Failed to retrieve endpoint usage',
        details: { error: endpointsResult.error }
      });
    }

    // Calculate summary
    const summary = calculateSummary(statsResult.stats);

    // Calculate period
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    return createSuccessResponse(
      {
        appId,
        period: {
          days,
          from: fromDate.toISOString(),
          to: toDate.toISOString()
        },
        summary,
        dailyStats: statsResult.stats,
        endpointBreakdown: endpointsResult.endpoints
      },
      {
        cached: false
      }
    );
  } catch (error) {
    console.error('Usage retrieval error:', error);
    throw error;
  }
}

/**
 * Calculates summary statistics
 */
function calculateSummary(dailyStats) {
  const summary = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    avgResponseTime: 0
  };

  if (!dailyStats || dailyStats.length === 0) {
    return summary;
  }

  let totalResponseTime = 0;
  let daysWithData = 0;

  dailyStats.forEach(day => {
    summary.totalRequests += day.total_requests || 0;
    summary.successfulRequests += day.successful_requests || 0;
    summary.failedRequests += day.failed_requests || 0;

    if (day.avg_response_time) {
      totalResponseTime += day.avg_response_time;
      daysWithData++;
    }
  });

  if (daysWithData > 0) {
    summary.avgResponseTime = Math.round(totalResponseTime / daysWithData);
  }

  return summary;
}

// Apply middleware
export const GET = requirePlatformAuth(getUsageHandler);

// OPTIONS handler for CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Platform-Token',
      'Access-Control-Max-Age': '86400'
    }
  });
}
