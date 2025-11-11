/**
 * JWT Token Verification Endpoint
 * POST /api/v1/auth/verify-token
 * Verifies JWT tokens issued by the platform
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwtService';
import { withErrorHandler, createSuccessResponse, createErrorResponse } from '@/lib/api/errorHandler';
import { withValidation, VerifyTokenSchema } from '@/lib/api/validators';
import { withPlatformAuthAndRateLimit } from '@/middleware/rateLimitMiddleware';

/**
 * POST /api/v1/auth/verify-token
 * Verifies a JWT token and returns its payload
 *
 * Request Headers:
 *   X-Platform-Token: <platform-token>
 *
 * Request Body:
 *   {
 *     token: string    // Required: JWT token to verify
 *   }
 *
 * Response (Success):
 *   {
 *     success: true,
 *     data: {
 *       valid: true,
 *       payload: {
 *         userId: string,
 *         appId: string,
 *         tier: string,
 *         metadata: object,
 *         issuedAt: ISO8601,
 *         expiresAt: ISO8601,
 *         tokenId: string
 *       }
 *     },
 *     metadata: { ... }
 *   }
 *
 * Response (Invalid Token):
 *   {
 *     success: true,
 *     data: {
 *       valid: false,
 *       error: string,
 *       code: string
 *     },
 *     metadata: { ... }
 *   }
 */
async function verifyTokenHandler(request) {
  const { token } = request.validatedData;

  try {
    // Verify the token
    const result = await verifyToken(token);

    if (!result.valid) {
      // Token is invalid, but this is not an error - return structured response
      return createSuccessResponse(
        {
          valid: false,
          error: result.error,
          code: result.code
        },
        {
          verification: 'failed'
        }
      );
    }

    // Token is valid - return payload
    return createSuccessResponse(
      {
        valid: true,
        payload: result.payload
      },
      {
        verification: 'successful'
      }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    throw error;
  }
}

// Apply middleware chain
export const POST = withErrorHandler(
  withValidation(
    VerifyTokenSchema,
    withPlatformAuthAndRateLimit(verifyTokenHandler)
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
