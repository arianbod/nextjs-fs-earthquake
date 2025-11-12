/**
 * Image Proxy Endpoint
 * GET /api/v1/utils/proxy-image
 * CORS proxy for Google Maps images
 */

import { NextResponse } from 'next/server';
import { withErrorHandler, createErrorResponse } from '@/lib/api/errorHandler';
import { requireBothAuth } from '@/middleware/jwtAuthMiddleware';
import { withRateLimiting } from '@/middleware/rateLimitMiddleware';

/**
 * GET /api/v1/utils/proxy-image?url={encoded_url}
 * Proxies images from Google Maps to avoid CORS issues
 *
 * Headers:
 *   X-Platform-Token: <platform-token>
 *   Authorization: Bearer <jwt-token>
 *
 * Query Parameters:
 *   url: string - Encoded Google Maps image URL
 *
 * Response:
 *   Image binary with proper headers
 */
async function proxyImageHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'url parameter is required',
        status: 400
      });
    }

    // Forward to internal proxy
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/proxy-image?url=${encodeURIComponent(imageUrl)}`);

    if (!response.ok) {
      return createErrorResponse({
        code: 'SERVICE_ERROR',
        message: 'Failed to fetch image',
        status: response.status
      });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    throw error;
  }
}

// Apply middleware chain
export const GET = withErrorHandler(
  requireBothAuth(
    withRateLimiting(proxyImageHandler)
  )
);

// OPTIONS handler for CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Platform-Token, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}
