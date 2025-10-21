/**
 * Utility functions for parsing and validating LLM responses
 * Handles common issues like markdown-wrapped JSON, malformed responses, etc.
 */

/**
 * Extract JSON from a string that might contain markdown code blocks
 * @param {string} text - The text that might contain JSON
 * @returns {string} - Extracted JSON string
 */
export function extractJSON(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid input: text must be a non-empty string');
  }

  // Remove leading/trailing whitespace
  text = text.trim();

  // Try to extract JSON from markdown code blocks
  // Matches: ```json\n{...}\n``` or ```\n{...}\n```
  const codeBlockRegex = /```(?:json)?\s*\n?([\s\S]*?)\n?```/;
  const codeBlockMatch = text.match(codeBlockRegex);

  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Try to extract JSON between backticks
  // Matches: `{...}`
  const backtickRegex = /`([\s\S]*?)`/;
  const backtickMatch = text.match(backtickRegex);

  if (backtickMatch) {
    return backtickMatch[1].trim();
  }

  // Look for JSON object or array boundaries
  const jsonObjectRegex = /(\{[\s\S]*\})/;
  const jsonArrayRegex = /(\[[\s\S]*\])/;

  const objectMatch = text.match(jsonObjectRegex);
  if (objectMatch) {
    return objectMatch[1].trim();
  }

  const arrayMatch = text.match(jsonArrayRegex);
  if (arrayMatch) {
    return arrayMatch[1].trim();
  }

  // If no patterns match, return the original text
  return text;
}

/**
 * Safely parse JSON with multiple fallback strategies
 * @param {string} text - The text to parse as JSON
 * @param {object} options - Parsing options
 * @param {any} options.fallback - Value to return if parsing fails
 * @param {boolean} options.throwOnError - Whether to throw errors (default: false)
 * @returns {any} - Parsed JSON or fallback value
 */
export function safeJSONParse(text, options = {}) {
  const { fallback = null, throwOnError = false } = options;

  if (!text) {
    if (throwOnError) {
      throw new Error('Empty text provided for JSON parsing');
    }
    return fallback;
  }

  try {
    // First, try to extract JSON from the text
    const extractedJSON = extractJSON(text);

    // Attempt to parse
    return JSON.parse(extractedJSON);
  } catch (firstError) {
    // Try fixing common JSON issues
    try {
      const fixedJSON = fixCommonJSONIssues(text);
      return JSON.parse(fixedJSON);
    } catch (secondError) {
      if (throwOnError) {
        throw new Error(
          `Failed to parse JSON: ${firstError.message}. ` +
          `Original text: ${text.substring(0, 200)}...`
        );
      }
      return fallback;
    }
  }
}

/**
 * Fix common JSON formatting issues
 * @param {string} text - Potentially malformed JSON string
 * @returns {string} - Fixed JSON string
 */
export function fixCommonJSONIssues(text) {
  let fixed = extractJSON(text);

  // Remove trailing commas before closing braces/brackets
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

  // Fix single quotes to double quotes (be careful with apostrophes)
  // This is a simple approach - may need refinement for complex cases
  fixed = fixed.replace(/:\s*'([^']*)'/g, ': "$1"');
  fixed = fixed.replace(/{\s*'([^']*)'\s*:/g, '{"$1":');

  // Remove comments (both // and /* */)
  fixed = fixed.replace(/\/\/.*$/gm, '');
  fixed = fixed.replace(/\/\*[\s\S]*?\*\//g, '');

  // Fix unquoted keys
  fixed = fixed.replace(/(\{|,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');

  return fixed.trim();
}

/**
 * Validate that parsed JSON matches expected structure
 * @param {any} data - Parsed JSON data
 * @param {object} schema - Expected schema with required fields
 * @returns {object} - Validation result { valid: boolean, errors: string[] }
 */
export function validateJSONStructure(data, schema) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: ['Data must be an object'],
    };
  }

  // Check required fields
  if (schema.required && Array.isArray(schema.required)) {
    for (const field of schema.required) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }

  // Check field types
  if (schema.properties) {
    for (const [field, expectedType] of Object.entries(schema.properties)) {
      if (field in data) {
        const actualType = Array.isArray(data[field]) ? 'array' : typeof data[field];

        if (expectedType !== actualType) {
          errors.push(
            `Field "${field}" has incorrect type. Expected ${expectedType}, got ${actualType}`
          );
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Parse LLM response with comprehensive error handling
 * Specifically designed for image analysis responses
 * @param {string} llmResponse - Raw LLM response text
 * @param {object} options - Parsing options
 * @returns {object} - Parsed and validated response
 */
export function parseLLMResponse(llmResponse, options = {}) {
  const {
    expectedSchema = null,
    maxRetries = 0,
    onError = null,
  } = options;

  const result = {
    success: false,
    data: null,
    errors: [],
    rawResponse: llmResponse,
  };

  try {
    // Step 1: Parse JSON
    const parsed = safeJSONParse(llmResponse, { throwOnError: true });
    result.data = parsed;

    // Step 2: Validate structure if schema provided
    if (expectedSchema) {
      const validation = validateJSONStructure(parsed, expectedSchema);

      if (!validation.valid) {
        result.errors = validation.errors;
        result.success = false;

        if (onError) {
          onError(new Error(`Validation failed: ${validation.errors.join(', ')}`));
        }

        return result;
      }
    }

    result.success = true;
    return result;

  } catch (error) {
    result.errors.push(error.message);
    result.success = false;

    if (onError) {
      onError(error);
    }

    return result;
  }
}

/**
 * Create a schema validator for image analysis responses
 * @returns {object} - Schema definition for image analysis
 */
export function getImageAnalysisSchema() {
  return {
    required: ['analysis'],
    properties: {
      analysis: 'object',
      confidence: 'number',
      issues: 'array',
      recommendations: 'array',
    },
  };
}

/**
 * Sanitize LLM response by removing unsafe content
 * @param {string} text - Raw LLM response
 * @returns {string} - Sanitized text
 */
export function sanitizeLLMResponse(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let sanitized = text;

  // Remove potential script tags or HTML
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<[^>]+>/g, '');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Normalize whitespace but preserve structure
  sanitized = sanitized.replace(/\r\n/g, '\n');
  sanitized = sanitized.replace(/\r/g, '\n');

  return sanitized.trim();
}

/**
 * Extract confidence score from LLM response
 * Handles various formats: percentage, decimal, or text
 * @param {any} response - Parsed LLM response
 * @returns {number} - Confidence score (0-1)
 */
export function extractConfidence(response) {
  if (typeof response === 'number') {
    // If it's already a number
    // Values > 1 but < 2 are treated as out-of-range, clamp to 1
    // Values >= 2 are assumed to be percentages
    if (response >= 2) {
      // Probably a percentage
      return Math.min(response / 100, 1);
    }
    // Clamp to 0-1 range
    return Math.min(Math.max(response, 0), 1);
  }

  if (response && typeof response === 'object') {
    // Look for common confidence field names
    const confidenceFields = ['confidence', 'certainty', 'probability', 'score'];

    for (const field of confidenceFields) {
      if (field in response && typeof response[field] === 'number') {
        const value = response[field];
        // Same logic as above
        if (value >= 2) {
          return Math.min(value / 100, 1);
        }
        return Math.min(Math.max(value, 0), 1);
      }
    }
  }

  // Default to 0.5 if no confidence found
  return 0.5;
}

/**
 * Retry parsing with different strategies
 * @param {string} text - Text to parse
 * @param {number} maxAttempts - Maximum retry attempts
 * @returns {Promise<any>} - Parsed result
 * @throws {Error} - If all strategies fail
 */
export async function retryParse(text, maxAttempts = 3) {
  const strategies = [
    // Strategy 1: Direct parse
    (t) => JSON.parse(t),

    // Strategy 2: Extract and parse
    (t) => JSON.parse(extractJSON(t)),

    // Strategy 3: Fix issues and parse
    (t) => JSON.parse(fixCommonJSONIssues(t)),

    // Strategy 4: Safe parse
    (t) => safeJSONParse(t, { throwOnError: true }),
  ];

  let lastError = null;

  for (let i = 0; i < Math.min(maxAttempts, strategies.length); i++) {
    try {
      return strategies[i](text);
    } catch (error) {
      lastError = error;
      // Continue to next strategy if available
      if (i === Math.min(maxAttempts, strategies.length) - 1) {
        // This was the last attempt, throw the error
        throw new Error(
          `Failed to parse JSON after ${i + 1} attempts. Last error: ${error.message}`
        );
      }
    }
  }

  // This should never be reached, but just in case
  throw new Error(`Failed to parse JSON. Original text: ${text.substring(0, 100)}...`);
}

export default {
  extractJSON,
  safeJSONParse,
  fixCommonJSONIssues,
  validateJSONStructure,
  parseLLMResponse,
  getImageAnalysisSchema,
  sanitizeLLMResponse,
  extractConfidence,
  retryParse,
};
