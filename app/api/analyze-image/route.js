import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Configure runtime for Vercel deployment
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Maximum function duration for Vercel

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper function to validate Claude API response structure
function validateClaudeResponseStructure(response, analysisType) {
  if (!response || typeof response !== 'object') {
    console.error('Claude response is not a valid object');
    return false;
  }

  // Check basic response structure
  if (!response.content || !Array.isArray(response.content)) {
    console.error('Claude response missing content array');
    return false;
  }

  if (response.content.length === 0) {
    console.error('Claude response has empty content array');
    return false;
  }

  // For building analysis with tools, validate tool response
  if (analysisType === 'building') {
    const toolUseBlock = response.content.find(block => block.type === 'tool_use');
    
    if (!toolUseBlock) {
      console.error('Claude response missing tool_use block for building analysis');
      return false;
    }

    if (!toolUseBlock.input || typeof toolUseBlock.input !== 'object') {
      console.error('Claude tool response missing or invalid input data');
      return false;
    }

    // Validate required fields in tool input
    const requiredFields = ['structuralSystem', 'materialCondition', 'irregularities', 'riskFactors', 'confidence'];
    for (const field of requiredFields) {
      if (!(field in toolUseBlock.input)) {
        console.error(`Claude tool response missing required field: ${field}`);
        return false;
      }
    }
  } else {
    // For non-building analysis, validate text response
    const textBlock = response.content.find(block => block.type === 'text');
    
    if (!textBlock || !textBlock.text) {
      console.error('Claude response missing text content for non-building analysis');
      return false;
    }

    if (textBlock.text.length < 20) {
      console.error('Claude response text too short to be valid');
      return false;
    }
  }

  return true;
}

// Helper function for formatting analysis results
function formatAnalysisResult(raw, type) {
  // Ensure raw is an object
  if (!raw || typeof raw !== 'object') {
    raw = { rawAnalysis: raw };
  }
  
  // Format the analysis result based on type
  if (type === 'floorPlan') {
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
      rawData: raw?.rawAnalysis || raw,
    };
  }
  
  if (type === 'satellite') {
    return {
      estimatedLength: raw?.length || raw?.estimatedLength || null,
      estimatedWidth: raw?.width || raw?.estimatedWidth || null,
      estimatedStories: raw?.stories || raw?.estimatedStories || null,
      buildingShape: raw?.shape || raw?.buildingShape || 'Rectangular',
      roofType: raw?.roofType || 'Flat',
      adjacentBuildings: raw?.adjacentBuildings || 'Unknown',
      confidence: raw?.confidence || 'medium',
      rawData: raw?.rawAnalysis || raw,
    };
  }
  
  // Default building photo analysis
  return {
    confidence: raw?.confidence || 'high',
    detectedFeatures: {
      buildingType: raw?.structuralSystem || raw?.buildingType || 'Unknown',
      estimatedStories: raw?.numberOfStories || raw?.stories || 'Unknown',
      constructionPeriod: raw?.constructionPeriod || 'Unknown',
      structuralSystem: raw?.structuralSystem || 'Unknown',
      materialCondition: raw?.materialCondition || 'Unknown',
      irregularities: raw?.irregularities || {
        plan: 'Unknown',
        vertical: 'Unknown',
        mass: 'Unknown',
      },
    },
    dimensions: {
      estimatedLength: raw?.buildingLength || raw?.length || null,
      estimatedWidth: raw?.buildingWidth || raw?.width || null,
      estimatedHeight: raw?.buildingHeight || raw?.height || null,
    },
    riskFactors: raw?.riskFactors || {
      softStory: 'Not detected',
      heavyOverhang: 'Not detected',
      adjacentBuilding: 'Unknown',
      foundation: 'Unknown',
    },
    aiInsights: raw?.specialFeatures || raw?.aiInsights || {},
    recommendations: raw?.recommendations || [],
    rawData: raw?.rawAnalysis || raw,
  };
}

export async function POST(request) {
  console.log('=== IMAGE ANALYSIS API CALLED ===');
  console.log('Request method:', request.method);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    // Check if request has body
    if (!request.body) {
      console.error('ERROR: Request body is empty');
      return NextResponse.json(
        { 
          error: 'Request body is empty', 
          details: 'No data received',
          debug: {
            timestamp: new Date().toISOString(),
            headers: Object.fromEntries(request.headers.entries())
          }
        },
        { status: 400 }
      );
    }

    let formData;
    try {
      console.log('Attempting to parse FormData...');
      formData = await request.formData();
      console.log('FormData parsed successfully');
    } catch (formError) {
      console.error('ERROR: Failed to parse form data:', formError);
      return NextResponse.json(
        { 
          error: 'Invalid form data', 
          details: formError.message,
          debug: {
            errorType: formError.name,
            errorStack: formError.stack
          }
        },
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
        console.log('Additional context provided:', Object.keys(additionalContext));
      } catch (e) {
        console.error('Failed to parse additional context:', e);
      }
    }
    
    console.log('Images received:', images.length);
    console.log('Analysis type:', analysisType);
    console.log('Has additional context:', !!additionalContextString);
    
    // Log image details
    images.forEach((img, idx) => {
      console.log(`Image ${idx + 1}:`, {
        name: img.name,
        size: img.size,
        type: img.type
      });
    });

    if (!images || images.length === 0) {
      console.error('ERROR: No images in formData');
      return NextResponse.json(
        { 
          error: 'No images provided', 
          details: 'Please upload at least one image',
          debug: {
            formDataKeys: Array.from(formData.keys()),
            receivedImages: images.length
          }
        },
        { status: 400 }
      );
    }

    // Validate and convert images to base64
    const imageBase64Array = [];
    const maxImageSize = 10 * 1024 * 1024; // 10MB
    console.log('Starting image validation and conversion...');
    
    for (const [index, image] of images.entries()) {
      console.log(`Processing image ${index + 1}/${images.length}...`);
      // Check file size
      if (image.size > maxImageSize) {
        return NextResponse.json(
          { 
            error: 'Image too large', 
            details: `Image ${index + 1} exceeds 10MB limit` 
          },
          { status: 400 }
        );
      }
      
      // Check file type
      if (!image.type || !image.type.startsWith('image/')) {
        return NextResponse.json(
          { 
            error: 'Invalid file type', 
            details: `File ${index + 1} is not an image` 
          },
          { status: 400 }
        );
      }
      
      try {
        console.log(`Converting image ${index + 1} to base64...`);
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Data = buffer.toString('base64');
        console.log(`Image ${index + 1} base64 length:`, base64Data.length);
        
        imageBase64Array.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: image.type,
            data: base64Data,
          },
        });
        console.log(`Image ${index + 1} converted successfully`);
      } catch (conversionError) {
        console.error(`Error converting image ${index + 1}:`, conversionError);
        return NextResponse.json(
          { 
            error: 'Image processing failed', 
            details: `Could not process image ${index + 1}` 
          },
          { status: 500 }
        );
      }
    }

    // Define tool schema for structured output (latest Claude approach)
    const buildingAnalysisTool = {
      name: "analyze_building",
      description: "Extract and return structured building analysis data",
      input_schema: {
        type: "object",
        properties: {
          buildingLength: { type: ["number", "null"], description: "Estimated length in meters" },
          buildingWidth: { type: ["number", "null"], description: "Estimated width in meters" },
          buildingHeight: { type: ["number", "null"], description: "Estimated height in meters" },
          numberOfStories: { type: ["integer", "null"], description: "Number of floors" },
          structuralSystem: { type: "string", description: "Type of structural system" },
          constructionPeriod: { type: "string", description: "Estimated construction decade" },
          materialCondition: { 
            type: "string", 
            enum: ["excellent", "good", "fair", "poor", "unknown"],
            description: "Overall material condition" 
          },
          irregularities: {
            type: "object",
            properties: {
              plan: { type: "string", enum: ["regular", "irregular", "unknown"] },
              vertical: { type: "string", enum: ["regular", "irregular", "unknown"] },
              mass: { type: "string", enum: ["regular", "irregular", "unknown"] }
            },
            required: ["plan", "vertical", "mass"]
          },
          riskFactors: {
            type: "object",
            properties: {
              softStory: { type: "string", enum: ["detected", "not detected", "unknown"] },
              heavyOverhang: { type: "string", enum: ["detected", "not detected", "unknown"] },
              adjacentBuilding: { type: "string", enum: ["close", "moderate", "far", "none"] },
              foundation: { type: "string", enum: ["visible", "not visible", "unknown"] }
            },
            required: ["softStory", "heavyOverhang", "adjacentBuilding", "foundation"]
          },
          specialFeatures: {
            type: "object",
            properties: {
              balconies: { type: "string", description: "Description of balconies" },
              cantilevers: { type: "string", description: "Description of cantilevers" },
              setbacks: { type: "string", description: "Description of setbacks" }
            }
          },
          confidence: { 
            type: "string", 
            enum: ["high", "medium", "low"],
            description: "Confidence level of analysis" 
          },
          recommendations: {
            type: "array",
            items: { type: "string" },
            description: "List of safety recommendations"
          }
        },
        required: ["structuralSystem", "materialCondition", "irregularities", "riskFactors", "confidence"]
      }
    };

    // Build enhanced prompt with additional context
    const buildContextualPrompt = (basePrompt, context) => {
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
    };
    
    // Simplified prompts when using tool schemas
    const prompts = {
      building: `You are an expert structural engineer analyzing building photos for earthquake safety assessment.
      
Please carefully examine these building photos and extract:
- Building dimensions (estimate in meters)
- Number of stories/floors
- Structural system type (concrete frame, steel frame, masonry, timber, etc.)
- Construction period (estimate decade)
- Material condition
- Structural irregularities (plan, vertical, mass)
- Risk factors (soft story, overhangs, adjacent buildings, foundation)
- Special features (balconies, cantilevers, setbacks)

Use the analyze_building tool to return your analysis.`,
      
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

    const basePrompt = prompts[analysisType] || prompts.building;
    const prompt = buildContextualPrompt(basePrompt, additionalContext);

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ERROR: ANTHROPIC_API_KEY is not set');
      return NextResponse.json(
        { 
          error: 'API configuration error', 
          details: 'Anthropic API key is not configured',
          debug: {
            hasApiKey: false,
            timestamp: new Date().toISOString()
          }
        },
        { status: 500 }
      );
    }
    
    console.log('API key found, length:', process.env.ANTHROPIC_API_KEY.length);
    console.log('Preparing Claude API call...');
    console.log('Prompt length:', prompt.length);
    console.log('Number of images to analyze:', imageBase64Array.length);
    
    // Call Claude Vision API with retry logic for malformed responses
    let response;
    let lastApiError;
    const maxApiRetries = 2;
    
    for (let apiAttempt = 0; apiAttempt <= maxApiRetries; apiAttempt++) {
      try {
        console.log(`Claude API attempt ${apiAttempt + 1}/${maxApiRetries + 1}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        console.log('Calling Claude API with model: claude-3-5-sonnet-20241022');
        const startTime = Date.now();
        
        // Use tool-based approach for structured output (latest Claude best practice)
        response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022', // Use correct model name
          max_tokens: 2000,
          temperature: 0.1, // Lower temperature for more consistent structured output
          tools: analysisType === 'building' ? [buildingAnalysisTool] : undefined,
          tool_choice: analysisType === 'building' ? { type: 'tool', name: 'analyze_building' } : undefined,
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
        
        clearTimeout(timeoutId);
        const endTime = Date.now();
        console.log(`Claude API responded in ${endTime - startTime}ms`);
        console.log('Response received:', {
          id: response.id,
          model: response.model,
          usage: response.usage,
          stop_reason: response.stop_reason
        });
        
        // Validate response structure
        if (!validateClaudeResponseStructure(response, analysisType)) {
          console.error(`Claude API returned malformed response on attempt ${apiAttempt + 1}`);
          throw new Error('Malformed response from Claude API - invalid structure');
        }
        
        // If we got here, the response is valid
        break;
        
      } catch (apiError) {
        console.error(`CLAUDE API ERROR (attempt ${apiAttempt + 1}):`, apiError);
        console.error('Error details:', {
          name: apiError.name,
          message: apiError.message,
          status: apiError.status,
          statusText: apiError.statusText,
          type: apiError.type
        });
        
        lastApiError = apiError;
        
        // Don't retry timeouts or client errors
        if (apiError.message?.includes('abort') || apiError.status < 500) {
          break;
        }
        
        // Retry only for malformed responses or server errors
        if (apiAttempt < maxApiRetries && 
            (apiError.message?.includes('Malformed response') || apiError.status >= 500)) {
          const waitTime = (apiAttempt + 1) * 1000; // 1s, 2s delay
          console.log(`Retrying Claude API in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        break;
      }
    }
    
    // If all retries failed, handle the final error
    if (lastApiError && !response) {
      if (lastApiError.message?.includes('abort')) {
        return NextResponse.json(
          { 
            error: 'Analysis timeout', 
            details: 'The AI analysis took too long. Please try again with fewer or smaller images.' 
          },
          { status: 504 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'AI service error', 
          details: lastApiError.message || 'Failed to analyze images after multiple attempts' 
        },
        { status: 503 }
      );
    }

    // Parse Claude's response based on whether we used tools or not
    let analysisResult;
    
    if (analysisType === 'building' && response.content) {
      // Tool-based response parsing
      console.log('Parsing tool-based response');
      
      // Find tool_use content block
      const toolUseBlock = response.content.find(block => block.type === 'tool_use');
      
      if (toolUseBlock && toolUseBlock.input) {
        console.log('Successfully extracted structured data from tool response');
        analysisResult = toolUseBlock.input;
        console.log('Tool response keys:', Object.keys(analysisResult));
      } else {
        console.error('ERROR: No tool_use block found in response');
        console.error('Response content:', JSON.stringify(response.content, null, 2));
        throw new Error('Invalid tool response from AI service');
      }
    } else {
      // Fallback to text-based parsing for non-building analysis
      if (!response || !response.content || !response.content[0]) {
        console.error('ERROR: Invalid response structure from Claude');
        console.error('Response object:', JSON.stringify(response, null, 2));
        throw new Error('Invalid response from AI service');
      }
      
      const analysisText = response.content[0].text || '';
      console.log('Claude response text length:', analysisText.length);
      console.log('First 500 chars of response:', analysisText.substring(0, 500));
    
      // Try to extract JSON from the response
      try {
        console.log('Attempting to extract JSON from response...');
        // Look for JSON in the response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          console.log('JSON found in response, parsing...');
          analysisResult = JSON.parse(jsonMatch[0]);
          console.log('JSON parsed successfully:', Object.keys(analysisResult));
        } else {
          console.log('No JSON found in response, using raw text');
          console.log('Raw text from Claude:', analysisText.substring(0, 500));
          // If no JSON found, create a default structure with the raw text
          analysisResult = { 
            buildingLength: null,
            buildingWidth: null,
            buildingHeight: null,
            numberOfStories: null,
            structuralSystem: 'Unable to analyze - see raw response',
            constructionPeriod: 'Unable to analyze',
            materialCondition: 'Unable to analyze',
            irregularities: {
              plan: 'Unknown',
              vertical: 'Unknown',
              mass: 'Unknown'
            },
            riskFactors: {
              softStory: 'Not analyzed',
              heavyOverhang: 'Not analyzed',
              adjacentBuilding: 'Unknown',
              foundation: 'Unknown'
            },
            specialFeatures: {},
            confidence: 'low',
            recommendations: ['Manual analysis required - AI could not parse the image properly'],
            rawAnalysis: analysisText,
            needsManualReview: true,
            debug: {
              reason: 'No JSON structure found in Claude response',
              textReceived: true,
              textLength: analysisText.length
            }
          };
        }
      } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.log('Failed JSON string:', jsonMatch ? jsonMatch[0].substring(0, 200) : 'No match');
      analysisResult = { 
        buildingLength: null,
        buildingWidth: null,
        buildingHeight: null,
        numberOfStories: null,
        structuralSystem: 'JSON parse error - see raw response',
        constructionPeriod: 'Unable to analyze',
        materialCondition: 'Unable to analyze',
        irregularities: {
          plan: 'Unknown',
          vertical: 'Unknown',
          mass: 'Unknown'
        },
        riskFactors: {
          softStory: 'Not analyzed',
          heavyOverhang: 'Not analyzed',
          adjacentBuilding: 'Unknown',
          foundation: 'Unknown'
        },
        specialFeatures: {},
        confidence: 'low',
        recommendations: ['JSON parsing failed - check raw response for details'],
        rawAnalysis: analysisText,
        needsManualReview: true,
        debug: {
          parseError: parseError.message,
          textLength: analysisText.length
        }
      };
    }
    }
    
    // Ensure we have an analysis result
    if (!analysisResult) {
      console.error('ERROR: No analysis result obtained');
      throw new Error('Failed to obtain analysis result from AI');
    }

    // Format the response for the application
    console.log('Formatting analysis result for type:', analysisType);
    const formattedResult = formatAnalysisResult(analysisResult, analysisType);
    console.log('Formatted result keys:', Object.keys(formattedResult));
    
    const finalResponse = {
      success: true,
      analysis: formattedResult,
      confidence: formattedResult.confidence || 'high',
      imagesAnalyzed: images.length,
      debug: {
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - Date.parse(request.headers.get('date') || new Date().toISOString()),
        analysisType: analysisType,
        claudeModel: 'claude-3-5-sonnet-20241022',
        rawResponseAvailable: !!formattedResult.rawData,
        jsonExtracted: !(analysisResult && analysisResult.needsManualReview),
        apiKeyPresent: !!process.env.ANTHROPIC_API_KEY
      }
    };
    
    console.log('=== ANALYSIS COMPLETE ===');
    console.log('Final response summary:', {
      success: finalResponse.success,
      confidence: finalResponse.confidence,
      imagesAnalyzed: finalResponse.imagesAnalyzed,
      hasAnalysisData: !!finalResponse.analysis
    });

    return NextResponse.json(finalResponse);

  } catch (error) {
    console.error('=== IMAGE ANALYSIS ERROR ===');
    console.error('Error:', error);
    console.error('Error stack:', error.stack);
    
    // Always return valid JSON
    const errorResponse = {
      error: 'Analysis failed',
      details: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      debug: {
        errorType: error.name,
        errorMessage: error.message,
        hasApiKey: !!process.env.ANTHROPIC_API_KEY,
        stackTrace: error.stack?.split('\n').slice(0, 5)
      }
    };
    
    // Determine appropriate status code
    let statusCode = 500;
    if (error.message?.includes('API key')) {
      statusCode = 401;
    } else if (error.message?.includes('rate limit')) {
      statusCode = 429;
    }
    
    return NextResponse.json(errorResponse, { status: statusCode });
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
  console.log('GET request to analyze-image API');
  return NextResponse.json({
    status: 'API is running',
    message: 'This endpoint only accepts POST requests with image data',
    apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString(),
    runtime: 'nodejs',
    method: 'Use POST to submit images for analysis',
  });
}