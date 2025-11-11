/**
 * Centralized Error Handling for QuakeWise External API
 * Provides standardized error responses across all API endpoints
 */

import { NextResponse } from 'next/server';

/**
 * Standard error codes for the API
 */
export const ErrorCodes = {
  // Authentication errors (401)
  INVALID_PLATFORM_TOKEN: {
    status: 401,
    message: 'Invalid or missing platform authentication token'
  },
  INVALID_JWT_TOKEN: {
    status: 401,
    message: 'Invalid or missing JWT token'
  },
  JWT_TOKEN_EXPIRED: {
    status: 401,
    message: 'JWT token has expired'
  },

  // Authorization errors (403)
  INSUFFICIENT_PERMISSIONS: {
    status: 403,
    message: 'Insufficient permissions for this operation'
  },
  RATE_LIMIT_EXCEEDED: {
    status: 429,
    message: 'Rate limit exceeded for your tier'
  },

  // Validation errors (400)
  INVALID_REQUEST: {
    status: 400,
    message: 'Invalid request parameters'
  },
  VALIDATION_ERROR: {
    status: 400,
    message: 'Request validation failed'
  },
  MISSING_REQUIRED_FIELD: {
    status: 400,
    message: 'Required field is missing'
  },
  INVALID_COORDINATES: {
    status: 400,
    message: 'Invalid latitude or longitude coordinates'
  },
  INVALID_IMAGE_FORMAT: {
    status: 400,
    message: 'Invalid image format or size'
  },

  // Resource errors (404)
  RESOURCE_NOT_FOUND: {
    status: 404,
    message: 'Requested resource not found'
  },
  APP_NOT_FOUND: {
    status: 404,
    message: 'Platform app not found'
  },

  // Service errors (500)
  INTERNAL_ERROR: {
    status: 500,
    message: 'Internal server error occurred'
  },
  SERVICE_ERROR: {
    status: 500,
    message: 'External service error'
  },
  AI_SERVICE_ERROR: {
    status: 500,
    message: 'AI analysis service temporarily unavailable'
  },
  DATABASE_ERROR: {
    status: 500,
    message: 'Database operation failed'
  },

  // Service unavailable (503)
  SERVICE_UNAVAILABLE: {
    status: 503,
    message: 'Service temporarily unavailable'
  }
};

/**
 * Creates a standardized error response
 *
 * @param {Object} options - Error options
 * @param {string} options.code - Error code (from ErrorCodes)
 * @param {string} [options.message] - Custom error message (overrides default)
 * @param {Object} [options.details] - Additional error details
 * @param {number} [options.status] - HTTP status code (overrides default)
 * @param {string} [options.requestId] - Optional request ID for tracking
 * @returns {NextResponse} - Formatted error response
 */
export function createErrorResponse({ code, message, details = {}, status, requestId }) {
  const errorConfig = ErrorCodes[code] || ErrorCodes.INTERNAL_ERROR;

  const errorResponse = {
    error: {
      code: code,
      message: message || errorConfig.message,
      details: details,
      timestamp: new Date().toISOString(),
      requestId: requestId || generateRequestId()
    }
  };

  const statusCode = status || errorConfig.status || 500;

  return NextResponse.json(errorResponse, {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Error-Code': code,
      'X-Request-Id': errorResponse.error.requestId
    }
  });
}

/**
 * Generates a unique request ID for tracking
 * @returns {string} - Request ID in format: req_<timestamp>_<random>
 */
function generateRequestId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `req_${timestamp}_${random}`;
}

/**
 * Creates a success response with standard format
 *
 * @param {Object} data - Response data
 * @param {Object} [metadata] - Optional metadata
 * @param {number} [status=200] - HTTP status code
 * @returns {NextResponse} - Formatted success response
 */
export function createSuccessResponse(data, metadata = {}, status = 200) {
  const response = {
    success: true,
    data: data,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      ...metadata
    }
  };

  return NextResponse.json(response, {
    status: status,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': response.metadata.requestId
    }
  });
}

/**
 * Wraps an API handler with comprehensive error handling
 * Catches all errors and returns standardized error responses
 *
 * @param {Function} handler - Async API route handler
 * @returns {Function} - Wrapped handler with error handling
 */
export function withErrorHandler(handler) {
  return async (request) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error('API Error:', error);

      // Handle specific error types
      if (error.name === 'ValidationError') {
        return createErrorResponse({
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: error.details || {}
        });
      }

      if (error.name === 'DatabaseError') {
        return createErrorResponse({
          code: 'DATABASE_ERROR',
          message: 'A database error occurred',
          details: process.env.NODE_ENV === 'development' ? { error: error.message } : {}
        });
      }

      // Generic internal error
      return createErrorResponse({
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'development'
          ? error.message
          : 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development'
          ? { stack: error.stack }
          : {}
      });
    }
  };
}

/**
 * Creates a validation error response
 *
 * @param {Array} errors - Array of validation error objects
 * @param {string} [message] - Custom error message
 * @returns {NextResponse} - Formatted validation error response
 */
export function createValidationErrorResponse(errors, message) {
  return createErrorResponse({
    code: 'VALIDATION_ERROR',
    message: message || 'Request validation failed',
    details: { errors }
  });
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

/**
 * Custom error class for database errors
 */
export class DatabaseError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'DatabaseError';
    this.details = details;
  }
}

/**
 * Custom error class for service errors
 */
export class ServiceError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ServiceError';
    this.details = details;
  }
}
