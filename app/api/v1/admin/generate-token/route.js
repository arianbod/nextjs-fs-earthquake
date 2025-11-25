/**
 * Admin Token Generation Endpoint
 * POST /api/v1/admin/generate-token
 * Generates service tokens for developers (Admin only)
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/config/team-members';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/errorHandler';
import prisma from '@/lib/db/prisma';

/**
 * POST /api/v1/admin/generate-token
 * Generate a new service token
 *
 * Request Body:
 *   {
 *     serviceId: string (unique identifier, e.g., 'dev-john-doe')
 *     name: string (developer name)
 *     email: string (developer email)
 *     tier: 'WEB_APP' | 'BATCH_JOB' | 'DEV_TESTING'
 *   }
 *
 * Response:
 *   {
 *     success: true,
 *     data: {
 *       serviceId: string,
 *       name: string,
 *       email: string,
 *       tier: string,
 *       token: string (256-bit hex),
 *       envVar: string (e.g., 'SERVICE_TOKEN_DEV_JOHN_DOE'),
 *       createdAt: ISO8601,
 *       createdBy: string
 *     }
 *   }
 */
export async function POST(request) {
  try {
    // Check authentication
    const user = await currentUser();

    if (!user) {
      return createErrorResponse({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        status: 401
      });
    }

    const userEmail = user.emailAddresses?.[0]?.emailAddress;

    // Check admin access
    if (!isAdmin(userEmail)) {
      return createErrorResponse({
        code: 'FORBIDDEN',
        message: 'Admin access required',
        status: 403
      });
    }

    // Parse request body
    const body = await request.json();
    const { serviceId, name, email, tier } = body;

    // Validate required fields
    if (!serviceId || !name || !email || !tier) {
      return createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Missing required fields: serviceId, name, email, tier',
        status: 400
      });
    }

    // Validate serviceId format (lowercase, hyphens, no spaces)
    if (!/^[a-z0-9-]+$/.test(serviceId)) {
      return createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Service ID must be lowercase with hyphens only (e.g., dev-john-doe)',
        status: 400
      });
    }

    // Validate tier
    const validTiers = ['WEB_APP', 'BATCH_JOB', 'DEV_TESTING'];
    if (!validTiers.includes(tier)) {
      return createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: `Invalid tier. Must be one of: ${validTiers.join(', ')}`,
        status: 400
      });
    }

    // Generate 256-bit token
    const token = crypto.randomBytes(32).toString('hex');

    // Hash token for database storage (never store plain tokens!)
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Generate environment variable name
    const envVar = `SERVICE_TOKEN_${serviceId.toUpperCase().replace(/-/g, '_')}`;

    // Determine rate limits based on tier
    const rateLimits = {
      WEB_APP: { perHour: 10000, perDay: 100000 },
      BATCH_JOB: { perHour: 1000, perDay: 50000 },
      DEV_TESTING: { perHour: 500, perDay: 5000 }
    };

    const limits = rateLimits[tier];

    // Save to database
    const apiApp = await prisma.apiApp.create({
      data: {
        appId: serviceId,
        name: name,
        tier: tier,
        platformTokenHash: tokenHash,
        rateLimitPerHour: limits.perHour,
        rateLimitPerDay: limits.perDay,
        status: 'ACTIVE',
        metadata: {
          email: email,
          envVar: envVar,
          createdBy: userEmail,
          createdAt: new Date().toISOString()
        }
      }
    });

    // Prepare response (include plain token ONLY in response, never store it)
    const tokenData = {
      serviceId,
      name,
      email,
      tier,
      token, // Plain token - shown once, never stored
      envVar,
      rateLimits: {
        perHour: limits.perHour,
        perDay: limits.perDay
      },
      createdAt: apiApp.createdAt.toISOString(),
      createdBy: userEmail
    };

    // Log for audit trail
    console.log(`[ADMIN] Token generated and saved by ${userEmail} for ${serviceId} (${email})`);

    return createSuccessResponse(tokenData, {
      generated: true,
      saved: true,
      note: 'Token saved to database (hashed). Plain token shown once - save it securely!'
    });

  } catch (error) {
    console.error('Token generation error:', error);
    return createErrorResponse({
      code: 'INTERNAL_ERROR',
      message: 'Failed to generate token',
      status: 500
    });
  }
}
