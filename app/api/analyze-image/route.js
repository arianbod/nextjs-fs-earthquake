import { NextResponse } from 'next/server';
import {
  analyzeBuildingImage,
  validateImageData,
  formatAnalysisResult,
  createFallbackResponse,
} from '@/utils/imageAnalysisHelper';

/**
 * POST /api/analyze-image
 * Analyzes building images for earthquake safety assessment
 *
 * Request body:
 * {
 *   imageUrl?: string,        // Image URL
 *   imageData?: string,       // Base64 image data
 *   options?: {
 *     model?: string,
 *     maxTokens?: number,
 *     temperature?: number
 *   }
 * }
 */
export async function POST(req) {
  try {
    console.log('=== IMAGE ANALYSIS REQUEST ===');

    // Parse request body
    let payload;
    try {
      payload = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          details: parseError.message,
        },
        { status: 400 }
      );
    }

    const { imageUrl, imageData, options = {} } = payload;

    // Determine which image data to use
    const imageToAnalyze = imageUrl || imageData;

    if (!imageToAnalyze) {
      console.error('No image data provided');
      return NextResponse.json(
        {
          success: false,
          error: 'No image data provided. Include either imageUrl or imageData in request body.',
        },
        { status: 400 }
      );
    }

    // Validate image data
    const validation = validateImageData(imageToAnalyze);
    if (!validation.valid) {
      console.error('Image validation failed:', validation.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid image data',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    console.log('Image validation passed:', {
      isURL: validation.isURL,
      isBase64: validation.isBase64,
    });

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        createFallbackResponse('OpenAI API key not configured'),
        { status: 500 }
      );
    }

    // Perform analysis with retry logic and error handling
    console.log('Starting image analysis...');
    const analysisResult = await analyzeBuildingImage(imageToAnalyze, {
      model: options.model || 'gpt-4o-mini',
      maxTokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
      retryAttempts: 2,
    });

    // Format and return result
    const formattedResult = formatAnalysisResult(analysisResult);

    if (!formattedResult.success) {
      console.error('Analysis failed:', formattedResult.error);

      // Return 500 for server errors, but still include formatted data
      return NextResponse.json(formattedResult, {
        status: formattedResult.errorCode === 'UNAUTHORIZED' ? 401 : 500,
      });
    }

    console.log('Analysis completed successfully');
    console.log('Confidence:', formattedResult.data.confidence);
    console.log('Issues found:', formattedResult.data.issues.length);

    return NextResponse.json(formattedResult);

  } catch (error) {
    // Catch-all error handler
    console.error('=== UNEXPECTED ERROR IN IMAGE ANALYSIS ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during image analysis',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: {
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analyze-image
 * Returns API information and usage
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/analyze-image',
    method: 'POST',
    description: 'Analyzes building images for earthquake safety assessment using OpenAI Vision API',
    requestFormat: {
      imageUrl: 'string (optional) - URL to image',
      imageData: 'string (optional) - Base64 encoded image data',
      options: {
        model: 'string (optional) - OpenAI model to use (default: gpt-4o-mini)',
        maxTokens: 'number (optional) - Maximum tokens in response (default: 1000)',
        temperature: 'number (optional) - Temperature for generation (default: 0.7)',
      },
    },
    responseFormat: {
      success: 'boolean',
      data: {
        analysis: 'object - Detailed structural analysis',
        confidence: 'number - Confidence score (0-1)',
        issues: 'array - List of identified issues',
        recommendations: 'array - List of recommendations',
      },
      metadata: 'object - Analysis metadata',
    },
    supportedImageFormats: ['JPEG', 'PNG', 'GIF', 'WebP'],
    maxImageSize: '20MB',
    version: '1.0.0',
  });
}
