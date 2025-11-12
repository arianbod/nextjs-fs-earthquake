/**
 * Building Photos Analysis Endpoint
 * POST /api/v1/ai/analyze-building-photos
 * Analyzes exterior building photos with plan cross-reference
 */

import { NextResponse } from 'next/server';
import { withErrorHandler, createSuccessResponse } from '@/lib/api/errorHandler';
import { requireBothAuth } from '@/middleware/jwtAuthMiddleware';
import { withRateLimiting } from '@/middleware/rateLimitMiddleware';

/**
 * POST /api/v1/ai/analyze-building-photos
 * Analyzes building exterior photos
 *
 * Headers:
 *   X-Platform-Token: <platform-token>
 *   Authorization: Bearer <jwt-token>
 *
 * Body:
 *   {
 *     images: [{data: base64string, type: 'image/jpeg'}],
 *     planAnalysis?: object,
 *     location: {city: string, earthquakeZone: string}
 *   }
 *
 * Response:
 *   {
 *     success: true,
 *     analysis: { visual, structural, construction, seismic, ... },
 *     metadata: { ... }
 *   }
 */
async function analyzeBuildingPhotosHandler(request) {
  try {
    const body = await request.json();

    // Forward to internal API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/analyze-building-photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Building photos analysis error:', error);
    throw error;
  }
}

// Apply middleware chain
export const POST = withErrorHandler(
  requireBothAuth(
    withRateLimiting(analyzeBuildingPhotosHandler)
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
      'Access-Control-Max-Age': '86400'
    }
  });
}
