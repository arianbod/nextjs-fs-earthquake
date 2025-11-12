/**
 * AI Image Analysis Endpoint
 * POST /api/v1/ai/analyze-image
 * Analyzes building images using Claude AI
 */

import { NextResponse } from 'next/server';
import { withErrorHandler, createErrorResponse } from '@/lib/api/errorHandler';
import { requireBothAuth } from '@/middleware/jwtAuthMiddleware';
import { withRateLimiting } from '@/middleware/rateLimitMiddleware';

/**
 * POST /api/v1/ai/analyze-image
 * Analyzes building images using AI
 *
 * Headers:
 *   X-Platform-Token: <platform-token>
 *   Authorization: Bearer <jwt-token>
 *
 * Body: FormData
 *   images: File[] - Image files (max 10MB each)
 *   analysisType: 'building' | 'floorPlan' | 'architecturalPlan' | 'satellite'
 *   additionalContext: JSON string (optional)
 *
 * Response:
 *   {
 *     success: true,
 *     analysis: { ... },
 *     imagesAnalyzed: number,
 *     metadata: { ... }
 *   }
 */
async function analyzeImageHandler(request) {
  try {
    // Forward to internal API
    const formData = await request.formData();

    // Call the existing internal API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/analyze-image`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('AI analysis error:', error);
    throw error;
  }
}

// Apply middleware chain
export const POST = withErrorHandler(
  requireBothAuth(
    withRateLimiting(analyzeImageHandler)
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
