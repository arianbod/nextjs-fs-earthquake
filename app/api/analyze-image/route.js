/**
 * Image Analysis API
 * Uses Claude Structured Outputs for guaranteed schema compliance
 *
 * Supports multiple analysis types:
 * - building: General building photos
 * - floorPlan: Floor plan/architectural drawings
 * - architecturalPlan: Detailed structural plans
 * - satellite: Aerial/satellite imagery
 */

import { NextResponse } from 'next/server';
import { analyzeImagesStructured } from '@/lib/ai/structuredOutputs';
import {
  BuildingAnalysisSchema,
  FloorPlanAnalysisSchema,
  SatelliteAnalysisSchema,
} from '@/lib/schemas/aiAnalysisSchemas';

// Configure runtime for Vercel deployment
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Detect actual image type from binary data
 */
function detectImageType(buffer) {
  if (!buffer || buffer.length < 12) {
    return null;
  }

  const first4Bytes = buffer.slice(0, 4);
  const first8Bytes = buffer.slice(0, 8);
  const first12Bytes = buffer.slice(0, 12);

  // JPEG
  if (first4Bytes[0] === 0xFF && first4Bytes[1] === 0xD8) {
    return 'image/jpeg';
  }

  // PNG
  if (first8Bytes[0] === 0x89 && first8Bytes[1] === 0x50 &&
      first8Bytes[2] === 0x4E && first8Bytes[3] === 0x47 &&
      first8Bytes[4] === 0x0D && first8Bytes[5] === 0x0A &&
      first8Bytes[6] === 0x1A && first8Bytes[7] === 0x0A) {
    return 'image/png';
  }

  // GIF
  if (first4Bytes[0] === 0x47 && first4Bytes[1] === 0x49 &&
      first4Bytes[2] === 0x46 && (first4Bytes[3] === 0x38 || first4Bytes[3] === 0x39)) {
    return 'image/gif';
  }

  // WebP
  if (first4Bytes[0] === 0x52 && first4Bytes[1] === 0x49 &&
      first4Bytes[2] === 0x46 && first4Bytes[3] === 0x46 &&
      buffer.length >= 12 &&
      first12Bytes[8] === 0x57 && first12Bytes[9] === 0x45 &&
      first12Bytes[10] === 0x42 && first12Bytes[11] === 0x50) {
    return 'image/webp';
  }

  return null;
}

/**
 * Format analysis result for backward compatibility with existing UI
 */
function formatAnalysisResult(raw, type) {
  if (!raw || typeof raw !== 'object') {
    raw = { rawAnalysis: raw };
  }

  if (type === 'floorPlan' || type === 'architecturalPlan') {
    return {
      buildingLength: raw?.buildingLength || raw?.length || null,
      buildingWidth: raw?.buildingWidth || raw?.width || null,
      numberOfStories: raw?.numberOfStories || raw?.floors || null,
      columnSpacing: raw?.columnSpacing || null,
      structuralSystem: raw?.structuralSystem || 'Unknown',
      foundationType: raw?.foundationType || 'Unknown',
      wallThickness: raw?.wallThickness || null,
      confidence: raw?.confidence || 'medium',
      extractedElements: raw?.extractedElements || [],
      rawData: raw,
    };
  }

  if (type === 'satellite') {
    return {
      estimatedLength: raw?.estimatedLength || null,
      estimatedWidth: raw?.estimatedWidth || null,
      estimatedStories: raw?.estimatedStories || null,
      buildingShape: raw?.buildingShape || 'rectangular',
      roofType: raw?.roofType || 'Flat',
      adjacentBuildings: raw?.adjacentBuildings || 'unknown',
      confidence: raw?.confidence || 'medium',
      rawData: raw,
    };
  }

  // Default building analysis
  return {
    confidence: raw?.confidence || 'high',
    detectedFeatures: {
      buildingType: raw?.structuralSystem || raw?.buildingType || 'Unknown',
      estimatedStories: raw?.numberOfStories || raw?.stories || 'Unknown',
      constructionPeriod: raw?.constructionPeriod || 'Unknown',
      structuralSystem: raw?.structuralSystem || 'Unknown',
      materialCondition: raw?.materialCondition || 'unknown',
      irregularities: raw?.irregularities || {
        plan: 'unknown',
        vertical: 'unknown',
        mass: 'unknown',
      },
    },
    dimensions: {
      estimatedLength: raw?.buildingLength || null,
      estimatedWidth: raw?.buildingWidth || null,
      estimatedHeight: raw?.buildingHeight || null,
    },
    riskFactors: raw?.riskFactors || {
      softStory: 'not detected',
      heavyOverhang: 'not detected',
      adjacentBuilding: 'none',
      foundation: 'unknown',
    },
    aiInsights: raw?.specialFeatures || {},
    recommendations: raw?.recommendations || [],
    rawData: raw,
  };
}

/**
 * Build contextual prompt with additional information
 */
function buildContextualPrompt(basePrompt, context) {
  if (!context || Object.keys(context).length === 0) return basePrompt;

  let enhancedPrompt = basePrompt;

  if (context.enhancedPrompt) {
    enhancedPrompt = context.enhancedPrompt + '\n\n' + basePrompt;
  }

  if (context.location) {
    enhancedPrompt += `\n\nLocation Context:
- City: ${context.location.city || 'Unknown'}
- Coordinates: ${context.location.latitude}, ${context.location.longitude}
- Address: ${context.location.address || 'Not provided'}`;
  }

  if (context.seismic) {
    enhancedPrompt += `\n\nSeismic Context:
- Zone: ${context.seismic.zone || 'Unknown'}
- Soil Type: ${context.seismic.soilType || 'Unknown'}
- Zone Description: ${context.seismic.zoneDescription || 'Not provided'}`;
  }

  if (context.weather) {
    enhancedPrompt += `\n\nEnvironmental Context:
- Climate: ${context.weather.current?.condition || 'Unknown'}
- Average Temperature: ${context.weather.historical?.avgTemperature || 'Unknown'}°C
- Annual Rainfall: ${context.weather.historical?.avgRainfall || 'Unknown'}mm`;
  }

  return enhancedPrompt;
}

// ============================================================================
// System Prompts by Analysis Type
// ============================================================================

const SYSTEM_PROMPTS = {
  building: `You are an expert structural engineer analyzing building photos for earthquake safety assessment.
Analyze the provided images carefully and extract all relevant structural information.
Be precise with your estimates and provide honest confidence levels.`,

  floorPlan: `You are an expert structural engineer analyzing architectural floor plans.
Extract precise measurements and structural details from the plans.
Look for dimension lines, structural annotations, and material specifications.`,

  architecturalPlan: `You are an expert structural engineer analyzing architectural plans, blueprints, and technical drawings.
Conduct a comprehensive analysis for earthquake safety assessment.
Extract ALL possible structural details including dimensions, materials, reinforcement patterns, and irregularities.`,

  satellite: `You are an expert analyst examining satellite/aerial imagery of buildings.
Estimate building dimensions, footprint shape, and surrounding conditions from the aerial view.`,
};

// ============================================================================
// User Prompts by Analysis Type
// ============================================================================

const USER_PROMPTS = {
  building: `Analyze these building photos for earthquake safety assessment and extract:
- Building dimensions (estimate in meters)
- Number of stories/floors
- Structural system type (concrete frame, steel frame, masonry, timber, etc.)
- Construction period (estimate decade)
- Material condition
- Structural irregularities (plan, vertical, mass)
- Risk factors (soft story, overhangs, adjacent buildings, foundation)
- Special features (balconies, cantilevers, setbacks)
- Safety recommendations`,

  floorPlan: `Analyze this architectural floor plan and extract:
1. Building dimensions (length x width in meters - look for dimension lines)
2. Number of floors indicated
3. Column/pillar spacing if visible
4. Room layout and counts
5. Structural system indicated (frame type, load-bearing walls, etc.)
6. Wall thicknesses if marked
7. Foundation type if shown
8. Any structural notes or specifications visible`,

  architecturalPlan: `Analyze these architectural plans and extract:
1. Building dimensions (length, width in meters)
2. Number of stories
3. Structural system type
4. Column spacing and grid layout
5. Foundation type
6. Wall thicknesses
7. Room counts and layout
8. Structural irregularities (plan and vertical)
9. Any structural notes or specifications
10. Quality assessment and confidence levels`,

  satellite: `Analyze this satellite/aerial view and extract:
1. Building footprint dimensions (approximate length x width in meters)
2. Roof type and condition
3. Building shape (rectangular, L-shaped, irregular, etc.)
4. Estimated number of stories (based on shadows and context)
5. Adjacent buildings proximity
6. Site conditions and surroundings`,
};

// ============================================================================
// Schema Mapping
// ============================================================================

const SCHEMA_MAP = {
  building: BuildingAnalysisSchema,
  floorPlan: FloorPlanAnalysisSchema,
  architecturalPlan: FloorPlanAnalysisSchema,
  satellite: SatelliteAnalysisSchema,
};

// ============================================================================
// Main API Handler
// ============================================================================

export async function POST(request) {
  console.log('=== IMAGE ANALYSIS API CALLED ===');

  try {
    // Parse form data
    if (!request.body) {
      return NextResponse.json(
        { error: 'Request body is empty', details: 'No data received' },
        { status: 400 }
      );
    }

    let formData;
    try {
      formData = await request.formData();
    } catch (formError) {
      console.error('Failed to parse form data:', formError);
      return NextResponse.json(
        { error: 'Invalid form data', details: formError.message },
        { status: 400 }
      );
    }

    const images = formData.getAll('images');
    const analysisType = formData.get('analysisType') || 'building';
    const additionalContextString = formData.get('additionalContext');

    let additionalContext = {};
    if (additionalContextString) {
      try {
        additionalContext = JSON.parse(additionalContextString);
      } catch (e) {
        console.error('Failed to parse additional context:', e);
      }
    }

    console.log('Images received:', images.length);
    console.log('Analysis type:', analysisType);

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided', details: 'Please upload at least one image' },
        { status: 400 }
      );
    }

    // Validate and convert images to base64
    const imageBase64Array = [];
    const maxImageSize = 10 * 1024 * 1024; // 10MB

    for (const [index, image] of images.entries()) {
      // Check file size
      if (image.size > maxImageSize) {
        return NextResponse.json(
          { error: 'Image too large', details: `Image ${index + 1} exceeds 10MB limit` },
          { status: 400 }
        );
      }

      // Check file type
      if (!image.type || !image.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Invalid file type', details: `File ${index + 1} is not an image` },
          { status: 400 }
        );
      }

      try {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Data = buffer.toString('base64');

        // Detect actual image format
        const actualMediaType = detectImageType(buffer);
        let finalMediaType = actualMediaType || image.type;

        if (!finalMediaType || !finalMediaType.startsWith('image/')) {
          finalMediaType = 'image/jpeg';
        }

        imageBase64Array.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: finalMediaType,
            data: base64Data,
          },
        });
      } catch (conversionError) {
        console.error(`Error converting image ${index + 1}:`, conversionError);
        return NextResponse.json(
          { error: 'Image processing failed', details: `Could not process image ${index + 1}` },
          { status: 500 }
        );
      }
    }

    // Get schema and prompts for this analysis type
    const schema = SCHEMA_MAP[analysisType] || BuildingAnalysisSchema;
    const systemPrompt = SYSTEM_PROMPTS[analysisType] || SYSTEM_PROMPTS.building;
    const baseUserPrompt = USER_PROMPTS[analysisType] || USER_PROMPTS.building;
    const userPrompt = buildContextualPrompt(baseUserPrompt, additionalContext);

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API configuration error', details: 'Anthropic API key is not configured' },
        { status: 500 }
      );
    }

    console.log('Calling Claude with structured outputs...');
    const startTime = Date.now();

    // Call Claude with structured outputs - guaranteed schema compliance
    const analysisResult = await analyzeImagesStructured({
      systemPrompt,
      userPrompt,
      images: imageBase64Array,
      schema,
      maxTokens: 4000,
    });

    const elapsed = Date.now() - startTime;
    console.log(`Analysis completed in ${elapsed}ms`);

    // Format result for backward compatibility
    const formattedResult = formatAnalysisResult(analysisResult, analysisType);

    const finalResponse = {
      success: true,
      analysis: formattedResult,
      confidence: formattedResult.confidence || analysisResult.confidence || 'high',
      imagesAnalyzed: images.length,
      debug: {
        timestamp: new Date().toISOString(),
        processingTime: elapsed,
        analysisType: analysisType,
        claudeModel: 'claude-sonnet-4-5',
        structuredOutputs: true,
      },
    };

    console.log('=== ANALYSIS COMPLETE ===');
    return NextResponse.json(finalResponse);

  } catch (error) {
    console.error('=== IMAGE ANALYSIS ERROR ===');
    console.error('Error:', error.message);

    // Determine appropriate status code
    let statusCode = 500;
    let errorMessage = 'Analysis failed';

    if (error.message?.includes('refused')) {
      statusCode = 422;
      errorMessage = 'AI could not analyze the provided images';
    } else if (error.message?.includes('Rate limit')) {
      statusCode = 429;
      errorMessage = 'Service temporarily unavailable';
    } else if (error.message?.includes('API key')) {
      statusCode = 401;
      errorMessage = 'API configuration error';
    } else if (error.message?.includes('truncated')) {
      statusCode = 413;
      errorMessage = 'Content too complex for analysis';
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Handle GET requests for debugging
export async function GET(request) {
  return NextResponse.json({
    status: 'API is running',
    message: 'This endpoint only accepts POST requests with image data',
    apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString(),
    runtime: 'nodejs',
    structuredOutputs: true,
    supportedTypes: ['building', 'floorPlan', 'architecturalPlan', 'satellite'],
  });
}
