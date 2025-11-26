/**
 * Claude Structured Outputs Helper
 * Uses the new beta feature for guaranteed JSON schema compliance
 *
 * @see https://platform.claude.com/docs/en/build-with-claude/structured-outputs
 */

import Anthropic from '@anthropic-ai/sdk';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Structured outputs beta identifier
export const STRUCTURED_OUTPUTS_BETA = 'structured-outputs-2025-11-13';

// Default model that supports structured outputs
export const DEFAULT_MODEL = 'claude-sonnet-4-5-20250514';

/**
 * Create Anthropic client
 */
function createClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

/**
 * Convert Zod schema to JSON Schema format
 * @param {import('zod').ZodSchema} schema - Zod schema
 * @returns {object} JSON Schema
 */
function zodToSchema(schema) {
  const jsonSchema = zodToJsonSchema(schema, {
    target: 'jsonSchema7',
    $refStrategy: 'none', // Avoid $ref since structured outputs doesn't support external refs
  });

  // Remove $schema and definitions if present (not needed for structured outputs)
  delete jsonSchema.$schema;
  delete jsonSchema.definitions;

  return jsonSchema;
}

/**
 * Call Claude with structured outputs for guaranteed JSON schema compliance
 *
 * @param {object} options
 * @param {string} options.systemPrompt - System prompt for the model
 * @param {Array} options.messages - Messages array for the conversation
 * @param {import('zod').ZodSchema} options.schema - Zod schema for response validation
 * @param {number} [options.maxTokens=4000] - Maximum tokens for response
 * @param {string} [options.model] - Model to use (defaults to claude-sonnet-4-5)
 * @returns {Promise<object>} Parsed and validated response data
 */
export async function callClaudeStructured({
  systemPrompt,
  messages,
  schema,
  maxTokens = 4000,
  model = DEFAULT_MODEL,
}) {
  const client = createClient();

  // Convert Zod schema to JSON Schema
  const jsonSchema = zodToSchema(schema);

  console.log('[StructuredOutputs] Calling Claude with structured output');
  console.log('[StructuredOutputs] Model:', model);
  console.log('[StructuredOutputs] Beta:', STRUCTURED_OUTPUTS_BETA);

  const startTime = Date.now();

  try {
    // Use the beta messages endpoint with structured outputs
    // Note: API expects only 'type' and 'schema' in output_format (no 'name' field)
    const response = await client.beta.messages.create({
      model,
      max_tokens: maxTokens,
      betas: [STRUCTURED_OUTPUTS_BETA],
      system: systemPrompt,
      messages,
      output_format: {
        type: 'json_schema',
        schema: jsonSchema,
      },
    });

    const elapsed = Date.now() - startTime;
    console.log(`[StructuredOutputs] Response received in ${elapsed}ms`);
    console.log('[StructuredOutputs] Stop reason:', response.stop_reason);
    console.log('[StructuredOutputs] Usage:', response.usage);

    // Handle refusal
    if (response.stop_reason === 'refusal') {
      console.error('[StructuredOutputs] AI refused to analyze content');
      throw new Error('AI refused to analyze the provided content');
    }

    // Handle truncation
    if (response.stop_reason === 'max_tokens') {
      console.error('[StructuredOutputs] Response truncated due to max_tokens');
      throw new Error('Response truncated - content too long for analysis');
    }

    // Extract text content
    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || !textContent.text) {
      throw new Error('No text content in response');
    }

    // Parse JSON (guaranteed valid by structured outputs)
    const parsed = JSON.parse(textContent.text);

    // Validate with Zod for runtime type safety (should always pass)
    const validated = schema.parse(parsed);

    console.log('[StructuredOutputs] Successfully parsed and validated response');

    return validated;

  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[StructuredOutputs] Error after ${elapsed}ms:`, error.message);

    // Re-throw with more context
    if (error.status === 400) {
      throw new Error(`Schema validation error: ${error.message}`);
    }
    if (error.status === 401) {
      throw new Error('Invalid API key');
    }
    if (error.status === 429) {
      throw new Error('Rate limit exceeded');
    }
    if (error.status >= 500) {
      throw new Error('Claude API server error - please try again');
    }

    throw error;
  }
}

/**
 * Call Claude with structured outputs and images
 * Convenience wrapper for image analysis tasks
 *
 * @param {object} options
 * @param {string} options.systemPrompt - System prompt for the model
 * @param {string} options.userPrompt - Text prompt for the user message
 * @param {Array<{type: string, source: {type: string, media_type: string, data: string}}>} options.images - Array of image objects
 * @param {import('zod').ZodSchema} options.schema - Zod schema for response validation
 * @param {number} [options.maxTokens=4000] - Maximum tokens for response
 * @param {string} [options.model] - Model to use
 * @returns {Promise<object>} Parsed and validated response data
 */
export async function analyzeImagesStructured({
  systemPrompt,
  userPrompt,
  images,
  schema,
  maxTokens = 4000,
  model = DEFAULT_MODEL,
}) {
  // Build message with text and images
  const content = [
    { type: 'text', text: userPrompt },
    ...images,
  ];

  return callClaudeStructured({
    systemPrompt,
    messages: [{ role: 'user', content }],
    schema,
    maxTokens,
    model,
  });
}

/**
 * Helper to create image content object from base64 data
 *
 * @param {string} base64Data - Base64 encoded image data
 * @param {string} mediaType - MIME type (e.g., 'image/jpeg')
 * @returns {object} Image content object for Claude API
 */
export function createImageContent(base64Data, mediaType) {
  return {
    type: 'image',
    source: {
      type: 'base64',
      media_type: mediaType,
      data: base64Data,
    },
  };
}

export default {
  callClaudeStructured,
  analyzeImagesStructured,
  createImageContent,
  STRUCTURED_OUTPUTS_BETA,
  DEFAULT_MODEL,
};
