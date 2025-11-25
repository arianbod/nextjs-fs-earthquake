/**
 * Platform Authentication Service
 * Validates internal service tokens for authentication
 */

import crypto from 'crypto';
import prisma from '@/lib/db/prisma';

/**
 * Hash token for database lookup
 * @param {string} token - The token to hash
 * @returns {string} - SHA-256 hash of the token
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Validates a service token and returns service information
 * @param {string} token - The service token to validate
 * @returns {Promise<{valid: boolean, service?: Object, error?: string}>}
 */
export async function validateServiceToken(token) {
  if (!token) {
    return { valid: false, error: 'No token provided' };
  }

  try {
    // Hash the token to compare with stored hash
    const tokenHash = hashToken(token);

    // Look up service in database by token hash
    const service = await prisma.apiApp.findUnique({
      where: { platformTokenHash: tokenHash }
    });

    if (!service) {
      return { valid: false, error: 'Invalid service token' };
    }

    // Check if service is active
    if (service.status !== 'ACTIVE') {
      return { valid: false, error: `Service is ${service.status.toLowerCase()}` };
    }

    // Update last used timestamp
    await prisma.apiApp.update({
      where: { id: service.id },
      data: { lastUsedAt: new Date() }
    });

    return {
      valid: true,
      service: {
        id: service.id,
        name: service.name,
        tier: service.tier,
        rateLimitPerHour: service.rateLimitPerHour,
        rateLimitPerDay: service.rateLimitPerDay,
        metadata: service.metadata
      }
    };
  } catch (error) {
    console.error('Service token validation error:', error);
    return { valid: false, error: 'Token validation failed' };
  }
}

/**
 * Extracts platform token from request headers
 * @param {Request} request - Next.js request object
 * @returns {string|null} - The token or null if not found
 */
export function extractPlatformToken(request) {
  // Check X-Platform-Token header
  const headerToken = request.headers.get('x-platform-token');
  if (headerToken) {
    return headerToken;
  }

  // Fallback to Authorization header with "Platform" scheme
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Platform ')) {
    return authHeader.substring(9);
  }

  return null;
}

/**
 * Generates a secure random platform token
 * @returns {string} - A 256-bit hex token
 */
export function generatePlatformToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validates service authentication and returns result
 * @param {Request} request - Next.js request object
 * @returns {Promise<{valid: boolean, service?: Object, error?: string}>}
 */
export async function authenticatePlatform(request) {
  const token = extractPlatformToken(request);

  if (!token) {
    return {
      valid: false,
      error: 'Service token not provided. Include X-Platform-Token header.'
    };
  }

  const result = await validateServiceToken(token);

  if (!result.valid) {
    return {
      valid: false,
      error: result.error || 'Invalid service token. Please check your credentials.'
    };
  }

  return {
    valid: true,
    service: result.service
  };
}
