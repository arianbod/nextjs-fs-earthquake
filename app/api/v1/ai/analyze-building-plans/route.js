/**
 * Building Plans Analysis Endpoint
 * POST /api/v1/ai/analyze-building-plans
 * Analyzes architectural/structural plan documents
 */

import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api/errorHandler';
import { requireBothAuth } from '@/middleware/jwtAuthMiddleware';
import { withRateLimiting } from '@/middleware/rateLimitMiddleware';

/**
 * POST /api/v1/ai/analyze-building-plans
 * Analyzes architectural or structural plans
 *
 * Headers:
 *   X-Platform-Token: <platform-token>
 *   Authorization: Bearer <jwt-token>
 *
 * Body:
 *   {
 *     images: [{data: base64string, type: 'image/jpeg'}],
 *     location: {city: string}
 *   }
 *
 * Response:
 *   {
 *     success: true,
 *     analysis: { dimensions, structural, building, construction, quality, ... },
 *     metadata: { ... }
 *   }
 */
async function analyzeBuildingPlansHandler(request) {
  try {
    const body = await request.json();

    // Forward to internal API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/analyze-building-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Building plans analysis error:', error);
    throw error;
  }
}

// Apply middleware chain
export const POST = withErrorHandler(
  requireBothAuth(
    withRateLimiting(analyzeBuildingPlansHandler)
  )
);

// OPTIONS handler for CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Platform-Token, Authorization',
      'Access-Control-Allow-Age': '86400'
    }
  });
}
