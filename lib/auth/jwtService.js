/**
 * JWT Token Service
 * Handles JWT token generation, validation, and verification for end users
 */

import { SignJWT, jwtVerify } from 'jose';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
const JWT_ISSUER = process.env.JWT_ISSUER || 'quakewise-api';

/**
 * Gets the JWT secret as a Uint8Array for jose library
 * @returns {Uint8Array}
 * @throws {Error} if JWT_SECRET is not configured
 */
function getJWTSecret() {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable not configured');
  }
  return new TextEncoder().encode(JWT_SECRET);
}

/**
 * Parses expiry duration string to seconds
 * @param {string} expiry - Duration string like '7d', '24h', '60m'
 * @returns {number} - Expiry in seconds
 */
function parseExpiry(expiry) {
  const value = parseInt(expiry);
  const unit = expiry.slice(-1);

  switch (unit) {
    case 'd': return value * 24 * 60 * 60;
    case 'h': return value * 60 * 60;
    case 'm': return value * 60;
    case 's': return value;
    default: return 7 * 24 * 60 * 60; // Default 7 days
  }
}

/**
 * Generates a JWT token for a user
 * @param {Object} payload - Token payload
 * @param {string} payload.userId - User identifier
 * @param {string} payload.appId - Platform app identifier
 * @param {string} [payload.tier='free'] - Usage tier (free, pro, enterprise)
 * @param {Object} [payload.metadata={}] - Additional metadata
 * @param {string} [expiresIn] - Custom expiry duration
 * @returns {Promise<Object>} - { token: string, expiresAt: Date }
 */
export async function generateToken({ userId, appId, tier = 'free', metadata = {} }, expiresIn = JWT_EXPIRY) {
  try {
    const secret = getJWTSecret();
    const expirySeconds = parseExpiry(expiresIn);
    const now = Math.floor(Date.now() / 1000);
    const exp = now + expirySeconds;

    const token = await new SignJWT({
      sub: userId,
      app_id: appId,
      tier: tier,
      metadata: metadata
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt(now)
      .setIssuer(JWT_ISSUER)
      .setExpirationTime(exp)
      .setJti(crypto.randomUUID()) // Unique token ID
      .sign(secret);

    return {
      token,
      expiresAt: new Date(exp * 1000).toISOString(),
      expiresIn: expirySeconds
    };
  } catch (error) {
    console.error('JWT generation error:', error);
    throw new Error('Failed to generate JWT token');
  }
}

/**
 * Verifies and decodes a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {Promise<Object>} - { valid: boolean, payload?: Object, error?: string }
 */
export async function verifyToken(token) {
  if (!token) {
    return {
      valid: false,
      error: 'No token provided'
    };
  }

  try {
    const secret = getJWTSecret();
    const { payload } = await jwtVerify(token, secret, {
      issuer: JWT_ISSUER
    });

    return {
      valid: true,
      payload: {
        userId: payload.sub,
        appId: payload.app_id,
        tier: payload.tier,
        metadata: payload.metadata,
        issuedAt: new Date(payload.iat * 1000).toISOString(),
        expiresAt: new Date(payload.exp * 1000).toISOString(),
        tokenId: payload.jti
      }
    };
  } catch (error) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      return {
        valid: false,
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      };
    }

    if (error.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
      return {
        valid: false,
        error: 'Invalid token signature',
        code: 'INVALID_SIGNATURE'
      };
    }

    return {
      valid: false,
      error: 'Token verification failed',
      code: 'VERIFICATION_FAILED',
      details: error.message
    };
  }
}

/**
 * Extracts JWT token from request headers
 * @param {Request} request - Next.js request object
 * @returns {string|null} - The token or null if not found
 */
export function extractJWTToken(request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return null;
  }

  // Support "Bearer <token>" format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Support bare token
  return authHeader;
}

/**
 * Middleware helper to authenticate JWT token from request
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object>} - { valid: boolean, payload?: Object, error?: string }
 */
export async function authenticateJWT(request) {
  const token = extractJWTToken(request);

  if (!token) {
    return {
      valid: false,
      error: 'JWT token not provided. Include Authorization: Bearer <token> header.',
      code: 'TOKEN_MISSING'
    };
  }

  return await verifyToken(token);
}

/**
 * Refreshes a token (generates new token with same payload)
 * @param {string} oldToken - The current token to refresh
 * @returns {Promise<Object>} - { token: string, expiresAt: Date } or { valid: false, error: string }
 */
export async function refreshToken(oldToken) {
  const verification = await verifyToken(oldToken);

  if (!verification.valid) {
    return {
      valid: false,
      error: 'Cannot refresh invalid token'
    };
  }

  const { payload } = verification;

  return await generateToken({
    userId: payload.userId,
    appId: payload.appId,
    tier: payload.tier,
    metadata: payload.metadata
  });
}
