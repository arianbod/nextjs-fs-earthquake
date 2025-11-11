/**
 * Admin Endpoint: Register Platform App
 * POST /api/admin/register-app
 *
 * Secure endpoint for registering apps in production
 *
 * ⚠️ SECURITY WARNING:
 * - This endpoint should be protected with ADMIN_SECRET
 * - Consider disabling after initial setup
 * - Or add IP whitelist
 * - Monitor for unauthorized access
 */

import { NextResponse } from 'next/server';
import { registerApp } from '@/lib/db/usageTracker';
import { generatePlatformToken } from '@/lib/auth/platformAuth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/errorHandler';

/**
 * POST /api/admin/register-app
 * Registers a new platform application
 *
 * Headers:
 *   X-Admin-Secret: <admin-secret>
 *
 * Body:
 *   {
 *     appId: string,
 *     name: string,
 *     tier: 'free' | 'pro' | 'enterprise'
 *   }
 *
 * Response:
 *   {
 *     success: true,
 *     data: {
 *       appId: string,
 *       name: string,
 *       tier: string,
 *       platformToken: string
 *     }
 *   }
 */
export async function POST(request) {
  try {
    // 1. Check admin authentication
    const adminSecret = request.headers.get('x-admin-secret');
    const expectedSecret = process.env.ADMIN_SECRET;

    if (!expectedSecret) {
      return createErrorResponse({
        code: 'SERVICE_UNAVAILABLE',
        message: 'Admin endpoint not configured. Set ADMIN_SECRET environment variable.',
        status: 503
      });
    }

    if (!adminSecret || adminSecret !== expectedSecret) {
      console.warn('Unauthorized admin access attempt', {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      });

      return createErrorResponse({
        code: 'INVALID_ADMIN_CREDENTIALS',
        message: 'Invalid admin credentials',
        status: 401
      });
    }

    // 2. Parse request body
    const body = await request.json();
    const { appId, name, tier } = body;

    // 3. Validate input
    if (!appId || !name) {
      return createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'appId and name are required',
        status: 400
      });
    }

    const validTiers = ['free', 'pro', 'enterprise'];
    if (tier && !validTiers.includes(tier)) {
      return createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: `tier must be one of: ${validTiers.join(', ')}`,
        status: 400
      });
    }

    // 4. Generate platform token
    const platformToken = generatePlatformToken();

    // 5. Register app in database
    const result = registerApp({
      appId,
      name,
      tier: tier || 'free',
      platformToken
    });

    if (!result.success) {
      return createErrorResponse({
        code: 'DATABASE_ERROR',
        message: result.error || 'Failed to register app',
        status: 500
      });
    }

    // 6. Log successful registration
    console.log('App registered successfully', {
      appId,
      name,
      tier: tier || 'free',
      timestamp: new Date().toISOString()
    });

    // 7. Return success response
    return createSuccessResponse(
      {
        appId,
        name,
        tier: tier || 'free',
        platformToken,
        message: 'App registered successfully. Save the platform token - it will not be shown again!'
      },
      {
        registered: true
      },
      201
    );

  } catch (error) {
    console.error('Admin registration error:', error);

    return createErrorResponse({
      code: 'INTERNAL_ERROR',
      message: 'Failed to register app',
      details: process.env.NODE_ENV === 'development' ? { error: error.message } : {},
      status: 500
    });
  }
}

/**
 * GET /api/admin/register-app
 * Returns usage instructions
 */
export async function GET(request) {
  return NextResponse.json({
    endpoint: '/api/admin/register-app',
    method: 'POST',
    description: 'Register a new platform application',
    authentication: 'X-Admin-Secret header required',
    body: {
      appId: 'string (required) - Unique app identifier',
      name: 'string (required) - App display name',
      tier: 'string (optional) - free | pro | enterprise'
    },
    example: {
      curl: `curl -X POST https://your-app.vercel.app/api/admin/register-app \\
  -H "Content-Type: application/json" \\
  -H "X-Admin-Secret: YOUR_ADMIN_SECRET" \\
  -d '{
    "appId": "my-app",
    "name": "My Application",
    "tier": "pro"
  }'`
    },
    security: {
      warning: 'This endpoint should be disabled or protected after initial setup',
      recommendations: [
        'Use strong ADMIN_SECRET',
        'Monitor access logs',
        'Consider IP whitelist',
        'Disable after registering apps'
      ]
    }
  }, { status: 200 });
}

// OPTIONS handler for CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Secret',
      'Access-Control-Max-Age': '86400'
    }
  });
}
