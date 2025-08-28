import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const images = formData.getAll('images');
    const analysisType = formData.get('analysisType') || 'building';

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    // Convert images to base64
    const imageBase64Array = await Promise.all(
      images.map(async (image) => {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        return {
          type: 'image',
          source: {
            type: 'base64',
            media_type: image.type,
            data: buffer.toString('base64'),
          },
        };
      })
    );

    // Prepare the prompt based on analysis type
    const prompts = {
      building: `Analyze these building photos and provide detailed structural information. Extract:
        1. Building dimensions (estimate length, width, height in meters)
        2. Number of stories/floors
        3. Structural system type (concrete frame, steel frame, masonry, timber, etc.)
        4. Construction period estimate (decade)
        5. Material condition (excellent/good/fair/poor)
        6. Structural irregularities:
           - Plan irregularity (regular/irregular)
           - Vertical irregularity (regular/irregular)
           - Mass irregularity (regular/irregular)
        7. Risk factors:
           - Soft story presence
           - Heavy overhangs
           - Foundation visibility and condition
        8. Special features (balconies, cantilevers, setbacks, etc.)
        
        Return as JSON with confidence levels for each assessment.`,
      
      floorPlan: `Analyze this architectural floor plan/drawing and extract precise measurements and structural details:
        1. Building dimensions (length x width in meters - look for dimension lines and measurements)
        2. Number of floors indicated
        3. Column/pillar spacing if visible
        4. Room layout and counts
        5. Structural system indicated (frame type, load-bearing walls, etc.)
        6. Wall thicknesses if marked
        7. Foundation type if shown
        8. Any structural notes or specifications visible
        
        Be very precise with numbers visible on the plan. Return as JSON.`,
      
      satellite: `Analyze this satellite/aerial view of a building and extract:
        1. Building footprint dimensions (approximate length x width in meters)
        2. Roof type and condition
        3. Building shape (rectangular, L-shaped, irregular, etc.)
        4. Estimated number of stories (based on shadows and context)
        5. Adjacent buildings proximity
        6. Site conditions and surroundings
        
        Return as JSON with confidence levels.`
    };

    const prompt = prompts[analysisType] || prompts.building;

    // Call Claude Vision API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            ...imageBase64Array,
          ],
        },
      ],
    });

    // Parse Claude's response
    const analysisText = response.content[0].text;
    
    // Try to extract JSON from the response
    let analysisResult;
    try {
      // Look for JSON in the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, structure the text response
        analysisResult = { 
          rawAnalysis: analysisText,
          confidence: 'medium',
          needsManualReview: true 
        };
      }
    } catch (parseError) {
      analysisResult = { 
        rawAnalysis: analysisText,
        confidence: 'low',
        needsManualReview: true 
      };
    }

    // Format the response for the application
    const formattedResult = formatAnalysisResult(analysisResult, analysisType);

    return NextResponse.json({
      success: true,
      analysis: formattedResult,
      confidence: formattedResult.confidence || 'high',
      imagesAnalyzed: images.length,
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze images',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

function formatAnalysisResult(raw, type) {
  // Format the analysis result based on type
  if (type === 'floorPlan') {
    return {
      buildingLength: raw.buildingLength || raw.length || null,
      buildingWidth: raw.buildingWidth || raw.width || null,
      numberOfStories: raw.numberOfStories || raw.floors || null,
      columnSpacing: raw.columnSpacing || null,
      structuralSystem: raw.structuralSystem || 'Unknown',
      foundationType: raw.foundationType || 'Unknown',
      wallThickness: raw.wallThickness || null,
      confidence: raw.confidence || 'medium',
      extractedElements: raw.extractedElements || [],
      rawData: raw.rawAnalysis || raw,
    };
  }
  
  if (type === 'satellite') {
    return {
      estimatedLength: raw.length || raw.estimatedLength || null,
      estimatedWidth: raw.width || raw.estimatedWidth || null,
      estimatedStories: raw.stories || raw.estimatedStories || null,
      buildingShape: raw.shape || raw.buildingShape || 'Rectangular',
      roofType: raw.roofType || 'Flat',
      adjacentBuildings: raw.adjacentBuildings || 'Unknown',
      confidence: raw.confidence || 'medium',
      rawData: raw.rawAnalysis || raw,
    };
  }
  
  // Default building photo analysis
  return {
    confidence: raw.confidence || 'high',
    detectedFeatures: {
      buildingType: raw.structuralSystem || raw.buildingType || 'Unknown',
      estimatedStories: raw.numberOfStories || raw.stories || 'Unknown',
      constructionPeriod: raw.constructionPeriod || 'Unknown',
      structuralSystem: raw.structuralSystem || 'Unknown',
      materialCondition: raw.materialCondition || 'Unknown',
      irregularities: raw.irregularities || {
        plan: 'Unknown',
        vertical: 'Unknown',
        mass: 'Unknown',
      },
    },
    dimensions: {
      estimatedLength: raw.buildingLength || raw.length || null,
      estimatedWidth: raw.buildingWidth || raw.width || null,
      estimatedHeight: raw.buildingHeight || raw.height || null,
    },
    riskFactors: raw.riskFactors || {
      softStory: 'Not detected',
      heavyOverhang: 'Not detected',
      adjacentBuilding: 'Unknown',
      foundation: 'Unknown',
    },
    aiInsights: raw.specialFeatures || raw.aiInsights || {},
    recommendations: raw.recommendations || [],
    rawData: raw.rawAnalysis || raw,
  };
}