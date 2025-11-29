/**
 * Building Photos Analysis API
 * Uses Claude Structured Outputs for guaranteed schema compliance
 */

import { NextResponse } from 'next/server';
import { analyzeImagesStructured, createImageContent } from '@/lib/ai/structuredOutputs';
import { BuildingPhotosAnalysisSchema } from '@/lib/schemas/aiAnalysisSchemas';

export async function POST(request) {
  try {
    const { images, planAnalysis, location } = await request.json();

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No building photos provided' }, { status: 400 });
    }

    // Prepare images for AI analysis
    const imageContents = images.map(img =>
      createImageContent(img.data, img.type || 'image/jpeg')
    );

    const systemPrompt = `You are an expert structural engineer analyzing building exterior photographs.
You must analyze the provided building photographs and extract detailed structural and safety information.
Be thorough in your assessment and provide confidence scores (0-1) for all assessments.`;

    // Build context from plan analysis if available
    let planContext = '';
    if (planAnalysis) {
      planContext = `
PREVIOUS PLAN ANALYSIS CONTEXT:
Based on architectural plans, the following information was extracted:
- Building dimensions: ${planAnalysis.dimensions?.length}m x ${planAnalysis.dimensions?.width}m
- Stories: ${planAnalysis.dimensions?.stories}
- Structural system: ${planAnalysis.structural?.system}
- Building type: ${planAnalysis.building?.type}
- Material type: ${planAnalysis.structural?.materialType}

Please cross-reference this information with the photos and identify any discrepancies.
`;
    }

    const userPrompt = `
${planContext}

Please analyze these building exterior photographs and provide:

ASSESSMENT TITLE & DESCRIPTION:
- Generate a concise, descriptive title for this assessment (e.g., "4-Story RC Apartment in Antalya" or "Modern Steel Commercial Building")
- Write a brief 1-2 sentence description summarizing the building type and key characteristics

VISUAL VERIFICATION:
- Actual building dimensions from photos
- Number of stories visible
- Building height estimation
- Structural system confirmation

BUILDING CONDITION:
- Overall structural condition
- Visible damage or deterioration
- Maintenance level
- Age indicators

CONSTRUCTION DETAILS:
- Exterior wall materials
- Window and door systems
- Roof type and condition
- Foundation visibility

STRUCTURAL ASSESSMENT:
- Visible structural elements
- Column and beam details
- Any structural irregularities
- Soft story conditions

SEISMIC VULNERABILITY INDICATORS:
- Plan irregularities visible
- Vertical irregularities
- Heavy overhangs or setbacks
- Non-structural elements that could fall

NEIGHBORHOOD CONTEXT:
- Surrounding buildings
- Site conditions
- Access and egress
- Environmental factors

DATA INTEGRATION:
- How photo analysis compares to plan analysis
- Confidence level for combined assessment
- Any conflicting information
- Final recommendations

Context: This building is located in ${location?.city || 'Turkey'}, earthquake zone ${location?.earthquakeZone || 'unknown'}.

Analyze thoroughly and provide your response.`;

    // Call Claude with structured outputs - guaranteed schema compliance
    const analysisData = await analyzeImagesStructured({
      systemPrompt,
      userPrompt,
      images: imageContents,
      schema: BuildingPhotosAnalysisSchema,
      maxTokens: 4000,
    });

    // Add metadata
    analysisData.metadata = {
      analysisDate: new Date().toISOString(),
      imagesAnalyzed: images.length,
      analysisType: 'building_photos',
      location: location,
      hasPlanContext: !!planAnalysis,
    };

    return NextResponse.json({
      success: true,
      analysis: analysisData,
    });

  } catch (error) {
    console.error('Building photo analysis error:', error);

    // Handle specific error types
    if (error.message.includes('refused')) {
      return NextResponse.json(
        { error: 'AI could not analyze the provided photos', details: error.message },
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
      { error: 'Failed to analyze building photos', details: error.message },
      { status: 500 }
    );
  }
}
