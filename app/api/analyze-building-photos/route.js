import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { images, planAnalysis, location } = await request.json();

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No building photos provided' }, { status: 400 });
    }

    // Prepare images for AI analysis
    const imageContents = images.map(img => ({
      type: 'image',
      source: {
        type: 'base64',
        media_type: img.type || 'image/jpeg',
        data: img.data
      }
    }));

    const prompt = `
You are an expert structural engineer analyzing building exterior photographs. 

${planAnalysis ? `
PREVIOUS PLAN ANALYSIS CONTEXT:
Based on architectural plans, the following information was extracted:
- Building dimensions: ${planAnalysis.dimensions?.length}m x ${planAnalysis.dimensions?.width}m
- Stories: ${planAnalysis.dimensions?.stories}
- Structural system: ${planAnalysis.structural?.system}
- Building type: ${planAnalysis.building?.type}
- Material type: ${planAnalysis.structural?.materialType}

Please cross-reference this information with the photos and identify any discrepancies.
` : ''}

Please analyze these building exterior photographs and provide:

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

Please provide your analysis in the following JSON format:
{
  "visual": {
    "dimensions": {
      "length": number,
      "width": number,
      "height": number,
      "stories": number
    },
    "condition": "excellent/good/fair/poor",
    "ageEstimate": number,
    "maintenanceLevel": "excellent/good/fair/poor"
  },
  "structural": {
    "system": "string",
    "materialType": "string",
    "structuralCondition": "string",
    "visibleDamage": ["array"],
    "irregularities": {
      "plan": "regular/irregular",
      "vertical": "regular/irregular",
      "softStory": boolean,
      "description": "string"
    }
  },
  "construction": {
    "wallMaterial": "string",
    "roofType": "string",
    "windowType": "string",
    "foundationVisible": boolean
  },
  "seismic": {
    "vulnerabilities": ["array"],
    "riskFactors": ["array"],
    "recommendations": ["array"]
  },
  "integration": {
    "planPhotoConsistency": "high/medium/low",
    "discrepancies": ["array"],
    "combinedConfidence": {
      "dimensions": number,
      "structural": number,
      "materials": number,
      "overall": number
    }
  },
  "combined": {
    "finalDimensions": {
      "length": number,
      "width": number,
      "height": number,
      "stories": number,
      "area": number
    },
    "finalStructuralSystem": "string",
    "finalBuildingType": "string",
    "finalMaterialType": "string",
    "seismicRiskLevel": "low/medium/high/very_high"
  },
  "quality": {
    "photoQuality": "excellent/good/fair/poor",
    "analysisCompleteness": number,
    "confidence": {
      "visual": number,
      "structural": number,
      "integration": number,
      "overall": number
    }
  },
  "analysis": {
    "keyFindings": ["array"],
    "criticalIssues": ["array"],
    "recommendations": ["array"]
  }
}

Be thorough in your analysis and provide confidence scores (0-1) for all assessments.
`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            ...imageContents
          ]
        }
      ]
    });

    // Parse AI response
    const content = message.content[0].text;
    
    // Extract JSON from response
    let analysisData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json({ error: 'Failed to parse analysis results' }, { status: 500 });
    }

    // Add metadata
    analysisData.metadata = {
      analysisDate: new Date().toISOString(),
      imagesAnalyzed: images.length,
      analysisType: 'building_photos',
      location: location,
      hasPlanContext: !!planAnalysis
    };

    return NextResponse.json({
      success: true,
      analysis: analysisData,
      rawResponse: content
    });

  } catch (error) {
    console.error('Building photo analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze building photos' },
      { status: 500 }
    );
  }
}