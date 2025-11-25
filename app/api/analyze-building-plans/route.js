/**
 * Building Plans Analysis API
 * Uses Claude Structured Outputs for guaranteed schema compliance
 */

import { NextResponse } from 'next/server';
import { analyzeImagesStructured, createImageContent } from '@/lib/ai/structuredOutputs';
import { BuildingPlansAnalysisSchema } from '@/lib/schemas/aiAnalysisSchemas';

export async function POST(request) {
  try {
    const { images, location } = await request.json();

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No building plan images provided' }, { status: 400 });
    }

    // Prepare images for AI analysis
    const imageContents = images.map(img =>
      createImageContent(img.data, img.type || 'image/jpeg')
    );

    const systemPrompt = `You are an expert structural engineer and architect analyzing building architectural plans.
You must analyze the provided building plan images and extract precise structural and dimensional information.
Be thorough and provide confidence scores (0-1) for your analysis.`;

    const userPrompt = `
Please analyze these building plan images and extract the following information:

BUILDING DIMENSIONS:
- Overall building length (meters)
- Overall building width (meters)
- Building height/number of stories
- Floor area calculations
- Room dimensions if visible

STRUCTURAL INFORMATION:
- Structural system type (RC frame, masonry, steel, wood, etc.)
- Wall thickness and materials
- Column and beam locations/sizes
- Foundation type if shown
- Load-bearing vs non-load-bearing walls

ARCHITECTURAL DETAILS:
- Building type/function (residential, commercial, etc.)
- Number of units/rooms
- Floor plan layout and organization
- Stair and elevator locations
- Irregular shapes or plan irregularities

CONSTRUCTION DETAILS:
- Material specifications from plans
- Construction details visible
- Structural connections
- Any special structural elements

PLAN QUALITY & CONFIDENCE:
- Quality of the provided plans
- Completeness of information
- Areas where assumptions were made
- Confidence level for each measurement

Context: This building is located in ${location?.city || 'Turkey'} and may be subject to seismic design requirements.

Analyze thoroughly and provide your response.`;

    // Call Claude with structured outputs - guaranteed schema compliance
    const analysisData = await analyzeImagesStructured({
      systemPrompt,
      userPrompt,
      images: imageContents,
      schema: BuildingPlansAnalysisSchema,
      maxTokens: 4000,
    });

    // Add metadata
    analysisData.metadata = {
      analysisDate: new Date().toISOString(),
      imagesAnalyzed: images.length,
      analysisType: 'building_plans',
      location: location,
    };

    return NextResponse.json({
      success: true,
      analysis: analysisData,
    });

  } catch (error) {
    console.error('Building plan analysis error:', error);

    // Handle specific error types
    if (error.message.includes('refused')) {
      return NextResponse.json(
        { error: 'AI could not analyze the provided plans', details: error.message },
        { status: 422 }
      );
    }

    if (error.message.includes('Rate limit')) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable', details: 'Please try again in a moment' },
        { status: 429 }
      );
    }

    if (error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to analyze building plans', details: error.message },
      { status: 500 }
    );
  }
}
