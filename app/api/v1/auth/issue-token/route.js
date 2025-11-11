/**
 * JWT Token Issuance Endpoint
 * POST /api/v1/auth/issue-token
 * Issues JWT tokens for end users authenticated by external apps
 */

import { NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth/jwtService';
import { withErrorHandler, createSuccessResponse } from '@/lib/api/errorHandler';
import { withValidation, IssueTokenSchema } from '@/lib/api/validators';
import { withPlatformAuthAndRateLimit } from '@/middleware/rateLimitMiddleware';

/**
 * POST /api/v1/auth/issue-token
 * Issues a new JWT token for a user
 *
 * Request Headers:
 *   X-Platform-Token: <platform-token>
 *
 * Request Body:
 *   {
 *     userId: string,         // Required: User identifier from external app
 *     appId: string,          // Required: Platform app identifier
 *     tier: string,           // Optional: 'free' | 'pro' | 'enterprise' (default: 'free')
 *     metadata: object,       // Optional: Additional user metadata
 *     expiresIn: string       // Optional: Token expiry (e.g., '7d', '24h') (default: '7d')
 *   }
 *
 * Response:
 *   {
 *     success: true,
 *     data: {
 *       token: string,
 *       expiresAt: ISO8601,
 *       expiresIn: number     // Seconds
 *     },
 *     metadata: { ... }
 *   }
 */
async function issueTokenHandler(request) {
  const { userId, appId, tier, metadata, expiresIn } = request.validatedData;

  try {
    // Generate JWT token
    const tokenData = await generateToken(
      {
        userId,
        appId,
        tier: tier || 'free',
        metadata: metadata || {}
      },
      expiresIn
    );

    return createSuccessResponse(
      {
        token: tokenData.token,
        expiresAt: tokenData.expiresAt,
        expiresIn: tokenData.expiresIn
      },
      {
        tokenType: 'JWT',
        algorithm: 'HS256'
      },
      201
    );
  } catch (error) {
    console.error('Token issuance error:', error);
    throw error;
  }
}

// Apply middleware chain: error handling -> validation -> platform auth + rate limit
export const POST = withErrorHandler(
  withValidation(
    IssueTokenSchema,
    withPlatformAuthAndRateLimit(issueTokenHandler)
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
