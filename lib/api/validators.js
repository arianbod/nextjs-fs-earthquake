/**
 * Request Validation Utilities for QuakeWise External API
 * Uses Zod for schema validation
 */

import { z } from 'zod';
import { ValidationError } from './errorHandler';

/**
 * Coordinates validation schema
 */
export const CoordinatesSchema = z.object({
  latitude: z.number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
});

/**
 * Building information validation schema
 */
export const BuildingSchema = z.object({
  structuralSystem: z.string()
    .min(1, 'Structural system is required')
    .max(50, 'Structural system too long'),
  numberOfStories: z.number()
    .int('Number of stories must be an integer')
    .min(1, 'Building must have at least 1 story')
    .max(200, 'Number of stories seems unrealistic'),
  yearOfConstruction: z.number()
    .int('Year must be an integer')
    .min(1800, 'Construction year must be after 1800')
    .max(new Date().getFullYear(), 'Construction year cannot be in the future'),
  designRegulation: z.enum([
    'Before 1975',
    '1975-1998',
    '1998-2007',
    '2007-2018',
    'After 2018 (TBDY)'
  ], {
    errorMap: () => ({ message: 'Invalid design regulation period' })
  }),
  typeOfSoil: z.enum(['ZA', 'ZB', 'ZC', 'ZD', 'ZE'], {
    errorMap: () => ({ message: 'Invalid soil type. Must be ZA, ZB, ZC, ZD, or ZE' })
  }).optional(),
  typeOfEarthquake: z.enum(['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'], {
    errorMap: () => ({ message: 'Invalid earthquake zone. Must be Zone 1, 2, 3, or 4' })
  }).optional(),
  verticalIrregularityHigh: z.boolean().optional(),
  verticalIrregularityModerate: z.boolean().optional(),
  planIrregularity: z.boolean().optional(),
  buildingLength: z.number().min(0).optional(),
  buildingWidth: z.number().min(0).optional(),
  storyHeight: z.number().min(0).optional()
});

/**
 * Image data validation schema
 */
export const ImageSchema = z.string()
  .refine((val) => {
    // Check if it's a valid base64 string
    const base64Regex = /^data:image\/(jpeg|jpg|png|webp|heic);base64,/;
    return base64Regex.test(val) || /^[A-Za-z0-9+/=]+$/.test(val);
  }, 'Invalid base64 image format');

/**
 * Images array validation schema
 */
export const ImagesSchema = z.object({
  buildingPhotos: z.array(ImageSchema).optional(),
  floorPlans: z.array(ImageSchema).optional(),
  satelliteImages: z.array(ImageSchema).optional()
}).refine((data) => {
  const totalImages = (data.buildingPhotos?.length || 0) +
    (data.floorPlans?.length || 0) +
    (data.satelliteImages?.length || 0);
  return totalImages <= 20;
}, 'Maximum 20 images allowed in total');

/**
 * Assessment options validation schema
 */
export const AssessmentOptionsSchema = z.object({
  includeAiAnalysis: z.boolean().default(true),
  includeLocationIntelligence: z.boolean().default(true),
  includeWeatherRisk: z.boolean().default(true),
  includeStreetView: z.boolean().default(false)
}).optional();

/**
 * Complete assessment request validation schema
 */
export const CompleteAssessmentSchema = z.object({
  location: CoordinatesSchema,
  building: BuildingSchema,
  images: ImagesSchema.optional(),
  options: AssessmentOptionsSchema
});

/**
 * Token issuance request validation schema
 */
export const IssueTokenSchema = z.object({
  userId: z.string()
    .min(1, 'User ID is required')
    .max(255, 'User ID too long'),
  appId: z.string()
    .min(1, 'App ID is required')
    .max(255, 'App ID too long'),
  tier: z.enum(['free', 'pro', 'enterprise']).default('free'),
  metadata: z.record(z.any()).optional(),
  expiresIn: z.string().regex(/^\d+[dhms]$/, 'Invalid expiry format (e.g., 7d, 24h)').optional()
});

/**
 * Token verification request validation schema
 */
export const VerifyTokenSchema = z.object({
  token: z.string().min(1, 'Token is required')
});

/**
 * Validates request body against a schema
 *
 * @param {Object} data - Data to validate
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Object} - Validated and parsed data
 * @throws {ValidationError} - If validation fails
 */
export function validateRequest(data, schema) {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));

      throw new ValidationError('Request validation failed', { errors });
    }
    throw error;
  }
}

/**
 * Middleware wrapper for route handlers with validation
 *
 * @param {z.ZodSchema} schema - Zod schema to validate request body
 * @param {Function} handler - Route handler function
 * @returns {Function} - Wrapped handler with validation
 */
export function withValidation(schema, handler) {
  return async (request) => {
    try {
      const body = await request.json();
      const validatedData = validateRequest(body, schema);

      // Attach validated data to request
      request.validatedData = validatedData;

      return await handler(request);
    } catch (error) {
      if (error instanceof ValidationError) {
        const { createValidationErrorResponse } = await import('./errorHandler');
        return createValidationErrorResponse(error.details.errors);
      }
      throw error;
    }
  };
}

/**
 * Validates coordinates are within valid ranges
 *
 * @param {number} latitude - Latitude value
 * @param {number} longitude - Longitude value
 * @returns {boolean} - True if valid
 * @throws {ValidationError} - If invalid
 */
export function validateCoordinates(latitude, longitude) {
  try {
    CoordinatesSchema.parse({ latitude, longitude });
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid coordinates', {
        errors: error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
      });
    }
    throw error;
  }
}

/**
 * Validates building structural system code
 *
 * @param {string} code - Structural system code (e.g., C1, S1, W1)
 * @returns {boolean} - True if valid
 */
export function isValidStructuralSystem(code) {
  const validCodes = [
    'W1', 'W1A', 'W2',
    'S1', 'S1M', 'S1H', 'S2', 'S2M', 'S2H', 'S3', 'S4', 'S4M', 'S4H', 'S5', 'S5M', 'S5H',
    'C1', 'C1M', 'C1H', 'C2', 'C2M', 'C2H', 'C3', 'C3M', 'C3H',
    'PC1', 'PC2', 'PC2M', 'PC2H',
    'RM1', 'RM1M', 'RM2', 'RM2M', 'RM2H',
    'URM', 'URMM',
    'MH'
  ];
  return validCodes.includes(code.toUpperCase());
}

/**
 * Sanitizes user input to prevent injection attacks
 *
 * @param {string} input - User input string
 * @returns {string} - Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim()
    .substring(0, 10000); // Limit length
}

/**
 * Validates image base64 size
 *
 * @param {string} base64String - Base64 encoded image
 * @param {number} maxSizeMB - Maximum size in MB (default 10)
 * @returns {boolean} - True if valid size
 */
export function validateImageSize(base64String, maxSizeMB = 10) {
  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');

  // Calculate approximate size in bytes
  const sizeInBytes = (base64Data.length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);

  return sizeInMB <= maxSizeMB;
}
