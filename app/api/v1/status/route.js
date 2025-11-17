/**
 * API Status Endpoint
 * GET /api/v1/status
 * Returns API health status, version, and system information
 */

import { NextResponse } from 'next/server';
import { createSuccessResponse } from '@/lib/api/errorHandler';
import { requirePlatformAuth } from '@/middleware/platformAuthMiddleware';

/**
 * GET /api/v1/status
 * Protected endpoint - requires platform authentication
 *
 * Response:
 *   {
 *     success: true,
 *     data: {
 *       status: 'healthy',
 *       version: 'v1.0.0',
 *       uptime: number,
 *       services: {
 *         database: 'healthy',
 *         ai: 'healthy',
 *         geospatial: 'healthy'
 *       },
 *       timestamp: ISO8601
 *     }
 *   }
 */
export const GET = requirePlatformAuth(async function(request) {
  const startTime = process.hrtime.bigint();

  try {
    // Check service health
    const serviceHealth = await checkServiceHealth();

    const endTime = process.hrtime.bigint();
    const responseTime = Number(endTime - startTime) / 1000000; // Convert to ms

    return createSuccessResponse(
      {
        status: 'healthy',
        version: 'v1.0.0',
        uptime: process.uptime(),
        responseTime: Math.round(responseTime),
        services: serviceHealth,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      },
      {
        checked: true
      }
    );
  } catch (error) {
    console.error('Status check error:', error);

    return NextResponse.json(
      {
        success: false,
        data: {
          status: 'unhealthy',
          version: 'v1.0.0',
          error: error.message,
          timestamp: new Date().toISOString()
        }
      },
      { status: 503 }
    );
  }
});

/**
 * Checks health of all services
 */
async function checkServiceHealth() {
  const health = {
    database: 'unknown',
    ai: 'unknown',
    geospatial: 'unknown',
    authentication: 'unknown'
  };

  // Check database
  try {
    const { getDb } = await import('@/lib/db/usageTracker');
    const db = getDb();
    db.prepare('SELECT 1').get();
    health.database = 'healthy';
  } catch (error) {
    console.error('Database health check failed:', error);
    health.database = 'unhealthy';
  }

  // Check AI service (Anthropic API)
  try {
    if (process.env.ANTHROPIC_API_KEY) {
      health.ai = 'configured';
    } else {
      health.ai = 'not_configured';
    }
  } catch (error) {
    health.ai = 'unhealthy';
  }

  // Check Google Maps API
  try {
    if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      health.geospatial = 'configured';
    } else {
      health.geospatial = 'not_configured';
    }
  } catch (error) {
    health.geospatial = 'unhealthy';
  }

  // Check authentication
  try {
    if (process.env.JWT_SECRET && process.env.API_PLATFORM_SECRET) {
      health.authentication = 'configured';
    } else {
      health.authentication = 'not_configured';
    }
  } catch (error) {
    health.authentication = 'unhealthy';
  }

  return health;
}

// OPTIONS handler for CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}
