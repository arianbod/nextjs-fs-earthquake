import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { images, location } = await request.json();

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No building plan images provided' }, { status: 400 });
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
You are an expert structural engineer and architect analyzing building architectural plans. 

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

Please provide your analysis in the following JSON format:
{
  "dimensions": {
    "length": number,
    "width": number,
    "height": number,
    "stories": number,
    "totalArea": number,
    "floorArea": number
  },
  "structural": {
    "system": "string",
    "materialType": "string",
    "wallThickness": number,
    "foundationType": "string",
    "irregularities": {
      "plan": "regular/irregular",
      "planDescription": "string",
      "vertical": "regular/irregular"
    }
  },
  "building": {
    "type": "string",
    "function": "string",
    "units": number,
    "rooms": number,
    "layout": "string"
  },
  "construction": {
    "year": number,
    "designCode": "string",
    "specialFeatures": ["array"]
  },
  "quality": {
    "planQuality": "excellent/good/fair/poor",
    "completeness": number,
    "confidence": {
      "dimensions": number,
      "structural": number,
      "materials": number,
      "overall": number
    }
  },
  "analysis": {
    "keyFindings": ["array"],
    "assumptions": ["array"],
    "recommendations": ["array"]
  }
}

Be precise with measurements and provide confidence scores (0-1) for your analysis.
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
      analysisType: 'building_plans',
      location: location
    };

    return NextResponse.json({
      success: true,
      analysis: analysisData,
      rawResponse: content
    });

  } catch (error) {
    console.error('Building plan analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze building plans' },
      { status: 500 }
    );
  }
}