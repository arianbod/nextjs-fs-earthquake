/**
 * Helper utilities for image analysis with LLM
 * Handles OpenAI Vision API calls with robust error handling
 */

import OpenAI from 'openai';
import {
  parseLLMResponse,
  getImageAnalysisSchema,
  sanitizeLLMResponse,
  extractConfidence,
} from './llmResponseParser';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze building image for structural issues
 * @param {string} imageUrl - URL or base64 image data
 * @param {object} options - Analysis options
 * @returns {Promise<object>} - Analysis result
 */
export async function analyzeBuildingImage(imageUrl, options = {}) {
  const {
    model = 'gpt-4o-mini',
    maxTokens = 1000,
    temperature = 0.7,
    prompt = getDefaultAnalysisPrompt(),
    retryAttempts = 2,
  } = options;

  let lastError = null;

  // Retry logic for transient failures
  for (let attempt = 0; attempt <= retryAttempts; attempt++) {
    try {
      console.log(`Analyzing image (attempt ${attempt + 1}/${retryAttempts + 1})...`);

      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert structural engineer analyzing building images for earthquake safety assessment. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: maxTokens,
        temperature,
        response_format: { type: 'json_object' }, // Request JSON mode
      });

      const rawContent = response.choices[0]?.message?.content;

      if (!rawContent) {
        throw new Error('Empty response from OpenAI Vision API');
      }

      console.log('Raw OpenAI response:', rawContent.substring(0, 200) + '...');

      // Sanitize the response
      const sanitized = sanitizeLLMResponse(rawContent);

      // Parse with validation
      const parseResult = parseLLMResponse(sanitized, {
        expectedSchema: getImageAnalysisSchema(),
        onError: (error) => {
          console.error('Parsing error:', error.message);
        },
      });

      if (!parseResult.success) {
        throw new Error(
          `Failed to parse LLM response: ${parseResult.errors.join(', ')}`
        );
      }

      // Extract confidence
      const confidence = extractConfidence(parseResult.data);

      return {
        success: true,
        analysis: parseResult.data.analysis || parseResult.data,
        confidence,
        issues: parseResult.data.issues || [],
        recommendations: parseResult.data.recommendations || [],
        metadata: {
          model,
          tokensUsed: response.usage?.total_tokens || 0,
          timestamp: new Date().toISOString(),
          attempt: attempt + 1,
        },
        rawResponse: rawContent,
      };

    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt + 1} failed:`, error.message);

      // Don't retry on certain errors
      if (
        error.status === 401 || // Authentication error
        error.status === 403 || // Permission error
        error.code === 'invalid_api_key'
      ) {
        break; // Don't retry auth errors
      }

      // Wait before retry (exponential backoff)
      if (attempt < retryAttempts) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All attempts failed
  return {
    success: false,
    error: lastError?.message || 'Unknown error occurred',
    errorCode: lastError?.code || lastError?.status || 'UNKNOWN',
    metadata: {
      attempts: retryAttempts + 1,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Get default prompt for building analysis
 * @returns {string} - Analysis prompt
 */
function getDefaultAnalysisPrompt() {
  return `Analyze this building image for earthquake safety assessment.

Provide a detailed analysis in the following JSON format:
{
  "analysis": {
    "structural_type": "describe the building type (e.g., reinforced concrete, masonry, wood frame)",
    "visible_issues": ["list any visible structural issues"],
    "condition": "overall condition (excellent/good/fair/poor/critical)",
    "age_estimate": "estimated construction era",
    "stories": number of visible stories,
    "materials": ["primary construction materials visible"]
  },
  "confidence": 0.85,
  "issues": ["list of specific issues found"],
  "recommendations": ["list of recommended actions"]
}

Focus on:
- Visible cracks, damage, or deterioration
- Structural irregularities
- Building materials and construction quality
- Potential earthquake vulnerabilities
- Overall structural integrity

Be specific and provide confidence scores. If the image quality is poor or the view is obstructed, indicate this in your analysis and adjust confidence accordingly.`;
}

/**
 * Validate image data before sending to API
 * @param {string} imageData - Image URL or base64
 * @returns {object} - Validation result
 */
export function validateImageData(imageData) {
  const errors = [];

  if (!imageData || typeof imageData !== 'string') {
    errors.push('Image data must be a non-empty string');
  }

  // Check if it's a URL
  const isURL = imageData.startsWith('http://') || imageData.startsWith('https://');

  // Check if it's base64
  const isBase64 = imageData.startsWith('data:image/');

  if (!isURL && !isBase64) {
    errors.push('Image data must be either a valid URL or base64 data URI');
  }

  // Check file size for base64 (OpenAI has 20MB limit)
  if (isBase64) {
    const base64Data = imageData.split(',')[1] || '';
    const sizeInBytes = (base64Data.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);

    if (sizeInMB > 20) {
      errors.push(`Image size (${sizeInMB.toFixed(2)}MB) exceeds 20MB limit`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    isURL,
    isBase64,
  };
}

/**
 * Format analysis result for consistent API response
 * @param {object} analysisResult - Raw analysis result
 * @returns {object} - Formatted result
 */
export function formatAnalysisResult(analysisResult) {
  if (!analysisResult.success) {
    return {
      success: false,
      error: analysisResult.error || 'Analysis failed',
      errorCode: analysisResult.errorCode,
      metadata: analysisResult.metadata,
    };
  }

  return {
    success: true,
    data: {
      analysis: analysisResult.analysis,
      confidence: analysisResult.confidence,
      issues: analysisResult.issues,
      recommendations: analysisResult.recommendations,
    },
    metadata: analysisResult.metadata,
  };
}

/**
 * Create a fallback response when analysis fails
 * @param {string} reason - Failure reason
 * @returns {object} - Fallback response
 */
export function createFallbackResponse(reason) {
  return {
    success: false,
    error: reason,
    data: {
      analysis: {
        structural_type: 'unknown',
        visible_issues: ['Unable to analyze image'],
        condition: 'unknown',
        age_estimate: 'unknown',
        stories: 0,
        materials: [],
      },
      confidence: 0,
      issues: ['Analysis failed'],
      recommendations: ['Please try uploading a clearer image'],
    },
    metadata: {
      timestamp: new Date().toISOString(),
      fallback: true,
    },
  };
}

export default {
  analyzeBuildingImage,
  validateImageData,
  formatAnalysisResult,
  createFallbackResponse,
  getDefaultAnalysisPrompt,
};
