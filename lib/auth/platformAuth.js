/**
 * Platform Authentication Service
 * Validates static platform tokens for external app authentication
 */

import crypto from 'crypto';

/**
 * Validates a platform token against the configured secret
 * @param {string} token - The token to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function validatePlatformToken(token) {
  if (!token) {
    return false;
  }

  const platformSecret = process.env.API_PLATFORM_SECRET;

  if (!platformSecret) {
    console.error('API_PLATFORM_SECRET not configured');
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  try {
    const tokenBuffer = Buffer.from(token);
    const secretBuffer = Buffer.from(platformSecret);

    if (tokenBuffer.length !== secretBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(tokenBuffer, secretBuffer);
  } catch (error) {
    console.error('Platform token validation error:', error);
    return false;
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
 * Validates platform authentication and returns result
 * @param {Request} request - Next.js request object
 * @returns {Object} - { valid: boolean, error?: string }
 */
export function authenticatePlatform(request) {
  const token = extractPlatformToken(request);

  if (!token) {
    return {
      valid: false,
      error: 'Platform token not provided. Include X-Platform-Token header or Authorization: Platform <token> header.'
    };
  }

  const isValid = validatePlatformToken(token);

  if (!isValid) {
    return {
      valid: false,
      error: 'Invalid platform token. Please check your credentials.'
    };
  }

  return { valid: true };
}
