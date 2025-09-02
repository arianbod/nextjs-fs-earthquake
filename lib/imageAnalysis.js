// Image Analysis Utilities for Building Assessment

/**
 * Prepare image for upload and analysis
 * @param {File} file - Image file to process
 * @returns {Promise<{file: File, preview: string}>}
 */
export async function prepareImageForAnalysis(file) {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a valid image file.');
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 10MB.');
  }

  // Create preview URL
  const preview = URL.createObjectURL(file);

  return {
    file,
    preview,
    name: file.name,
    size: file.size,
    type: file.type,
  };
}

/**
 * Send images to AI analysis API with retry logic
 * @param {Array} images - Array of image files
 * @param {string} analysisType - Type of analysis (building, floorPlan, satellite)
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {Object} additionalContext - Additional context data (weather, location, etc.)
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeImagesWithAI(images, analysisType = 'building', maxRetries = 2, additionalContext = {}) {
  console.log('=== CLIENT: Starting image analysis ===');
  console.log('Number of images:', images.length);
  console.log('Analysis type:', analysisType);
  console.log('Max retries:', maxRetries);
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`\nAttempt ${attempt + 1}/${maxRetries + 1}`);
      const formData = new FormData();
      
      images.forEach((image, index) => {
        const imageFile = image.file || image;
        console.log(`Adding image ${index + 1}:`, {
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type
        });
        formData.append('images', imageFile);
      });
      formData.append('analysisType', analysisType);
      
      // Add additional context if provided
      if (additionalContext && Object.keys(additionalContext).length > 0) {
        console.log('Adding additional context:', Object.keys(additionalContext));
        formData.append('additionalContext', JSON.stringify(additionalContext));
      }
      
      // Log FormData contents
      console.log('FormData prepared with keys:', Array.from(formData.keys()));

      console.log('Sending request to /api/analyze-image...');
      const startTime = Date.now();
      
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
        // Add timeout using AbortController
        signal: AbortSignal.timeout(60000), // 60 second timeout
      });
      
      const responseTime = Date.now() - startTime;
      console.log(`Response received in ${responseTime}ms`);
      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Get response text first to check if it's valid
      console.log('Reading response body...');
      const responseText = await response.text();
      console.log('Response text length:', responseText.length);
      console.log('First 200 chars of response:', responseText.substring(0, 200));
      
      // Check if response is empty
      if (!responseText) {
        console.error('ERROR: Empty response body');
        throw new Error(`Server returned empty response (Status: ${response.status})`);
      }

      // Try to parse JSON
      let result;
      try {
        console.log('Parsing JSON response...');
        result = JSON.parse(responseText);
        console.log('JSON parsed successfully');
        console.log('Result keys:', Object.keys(result));
        console.log('Has success:', result.success);
        console.log('Has error:', result.error);
        console.log('Has analysis:', !!result.analysis);
        console.log('Images analyzed:', result.imagesAnalyzed);
        console.log('Confidence:', result.confidence);
        
        // Log debug info if present
        if (result.debug) {
          console.log('Debug info from server:', result.debug);
        }
      } catch (parseError) {
        console.error('Failed to parse JSON response');
        console.error('Parse error:', parseError);
        console.error('Response text that failed to parse:', responseText);
        throw new Error(`Invalid JSON response from server: ${parseError.message}`);
      }

      // Check if response indicates an error
      if (!response.ok) {
        console.error(`ERROR: HTTP ${response.status} - ${response.statusText}`);
        console.error('Error details:', result.error, result.details);
        if (result.debug) {
          console.error('Debug info:', result.debug);
        }
        
        // Don't retry for client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          const errorMsg = result.error || result.details || `Client error: ${response.status}`;
          console.log('Client error - not retrying:', errorMsg);
          throw new Error(errorMsg);
        }
        // Retry for server errors (5xx)
        const errorMsg = result.error || result.details || `Server error: ${response.status}`;
        console.log('Server error - will retry if attempts remain:', errorMsg);
        throw new Error(errorMsg);
      }
      
      // Success!
      console.log('=== ANALYSIS SUCCESS ===');
      console.log('Analysis completed with confidence:', result.confidence);
      if (result.analysis) {
        console.log('Analysis data received:', {
          hasDetectedFeatures: !!result.analysis.detectedFeatures,
          hasDimensions: !!result.analysis.dimensions,
          hasRiskFactors: !!result.analysis.riskFactors,
          hasRawData: !!result.analysis.rawData
        });
      }

      return result;
      
    } catch (error) {
      console.error(`\n=== ATTEMPT ${attempt + 1} FAILED ===`);
      console.error('Error:', error.message);
      console.error('Error type:', error.name);
      console.error('Stack trace:', error.stack);
      lastError = error;
      
      // Don't retry for certain errors
      if (
        error.message.includes('Client error') ||
        error.message.includes('No images provided') ||
        error.message.includes('Image too large') ||
        error.message.includes('Invalid file type')
      ) {
        throw error;
      }
      
      // If we have retries left, wait before retrying
      if (attempt < maxRetries) {
        const waitTime = (attempt + 1) * 2;
        console.log(`Will retry in ${waitTime} seconds...`);
        console.log('Remaining attempts:', maxRetries - attempt);
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
      } else {
        console.log('No more retries remaining');
      }
    }
  }
  
  // All retries failed
  console.error('\n=== ALL RETRY ATTEMPTS EXHAUSTED ===');
  console.error('Final error:', lastError.message);
  
  // Provide user-friendly error messages
  if (lastError.message.includes('Failed to fetch')) {
    const networkError = new Error('Network error: Could not connect to the server. Please check your connection.');
    console.error('Throwing network error:', networkError.message);
    throw networkError;
  } else if (lastError.message.includes('timeout')) {
    const timeoutError = new Error('Request timeout: The analysis is taking too long. Please try with fewer or smaller images.');
    console.error('Throwing timeout error:', timeoutError.message);
    throw timeoutError;
  } else if (lastError.message.includes('API key')) {
    const apiError = new Error('Configuration error: The AI service is not properly configured. Please contact support.');
    console.error('Throwing API configuration error:', apiError.message);
    throw apiError;
  }
  
  console.error('Throwing original error:', lastError.message);
  throw lastError;
}

/**
 * Process floor plan analysis results
 * @param {Object} analysisResult - Raw analysis result from AI
 * @returns {Object} Formatted data for form fields
 */
export function processFloorPlanAnalysis(analysisResult) {
  const { analysis } = analysisResult;
  
  return {
    buildingLength: analysis.buildingLength || null,
    buildingWidth: analysis.buildingWidth || null,
    numberOfStories: analysis.numberOfStories || null,
    columnSpacing: analysis.columnSpacing || null,
    structuralSystem: analysis.structuralSystem || '',
    foundationType: analysis.foundationType || '',
    wallThickness: analysis.wallThickness || null,
    confidence: analysis.confidence || 'low',
    dataSource: 'ai-floorplan-analysis',
    metadata: {
      analyzedAt: new Date().toISOString(),
      imagesAnalyzed: analysisResult.imagesAnalyzed,
      rawData: analysis.rawData,
    },
  };
}

/**
 * Process building photo analysis results
 * @param {Object} analysisResult - Raw analysis result from AI
 * @returns {Object} Formatted assessment data
 */
export function processBuildingPhotoAnalysis(analysisResult) {
  const { analysis } = analysisResult;
  
  return {
    buildingCharacteristics: {
      type: analysis.detectedFeatures?.buildingType || 'Unknown',
      stories: analysis.detectedFeatures?.estimatedStories || 'Unknown',
      constructionPeriod: analysis.detectedFeatures?.constructionPeriod || 'Unknown',
      structuralSystem: analysis.detectedFeatures?.structuralSystem || 'Unknown',
      materialCondition: analysis.detectedFeatures?.materialCondition || 'Unknown',
    },
    dimensions: {
      length: analysis.dimensions?.estimatedLength || null,
      width: analysis.dimensions?.estimatedWidth || null,
      height: analysis.dimensions?.estimatedHeight || null,
    },
    structuralIrregularities: analysis.detectedFeatures?.irregularities || {
      plan: 'Unknown',
      vertical: 'Unknown',
      mass: 'Unknown',
    },
    riskFactors: analysis.riskFactors || {},
    aiInsights: analysis.aiInsights || {},
    recommendations: analysis.recommendations || [],
    confidence: analysis.confidence || 'low',
    dataSource: 'ai-photo-analysis',
    metadata: {
      analyzedAt: new Date().toISOString(),
      imagesAnalyzed: analysisResult.imagesAnalyzed,
    },
  };
}

/**
 * Process satellite image analysis results
 * @param {Object} analysisResult - Raw analysis result from AI
 * @returns {Object} Formatted location data
 */
export function processSatelliteAnalysis(analysisResult) {
  const { analysis } = analysisResult;
  
  return {
    estimatedLength: analysis.estimatedLength || null,
    estimatedWidth: analysis.estimatedWidth || null,
    estimatedStories: analysis.estimatedStories || null,
    buildingShape: analysis.buildingShape || 'Unknown',
    roofType: analysis.roofType || 'Unknown',
    adjacentBuildings: analysis.adjacentBuildings || 'Unknown',
    confidence: analysis.confidence || 'low',
    dataSource: 'ai-satellite-analysis',
    metadata: {
      analyzedAt: new Date().toISOString(),
      rawData: analysis.rawData,
    },
  };
}

/**
 * Combine multiple analysis sources for comprehensive assessment
 * @param {Object} photoAnalysis - Building photo analysis results
 * @param {Object} planAnalysis - Floor plan analysis results
 * @param {Object} satelliteAnalysis - Satellite analysis results
 * @returns {Object} Combined assessment data
 */
export function combineAnalysisResults(photoAnalysis, planAnalysis, satelliteAnalysis) {
  // Prioritize floor plan data for dimensions (most accurate)
  // Use photo analysis for condition assessment
  // Use satellite for site context
  
  const combined = {
    // Dimensions - prioritize floor plan, then photos, then satellite
    buildingLength: 
      planAnalysis?.buildingLength || 
      photoAnalysis?.dimensions?.length || 
      satelliteAnalysis?.estimatedLength || 
      null,
    
    buildingWidth: 
      planAnalysis?.buildingWidth || 
      photoAnalysis?.dimensions?.width || 
      satelliteAnalysis?.estimatedWidth || 
      null,
    
    numberOfStories: 
      planAnalysis?.numberOfStories || 
      photoAnalysis?.buildingCharacteristics?.stories || 
      satelliteAnalysis?.estimatedStories || 
      null,
    
    // Structural information
    structuralSystem: 
      planAnalysis?.structuralSystem || 
      photoAnalysis?.buildingCharacteristics?.structuralSystem || 
      'Unknown',
    
    materialCondition: 
      photoAnalysis?.buildingCharacteristics?.materialCondition || 
      'Unknown',
    
    // Irregularities from photo analysis
    irregularities: photoAnalysis?.structuralIrregularities || {},
    
    // Risk factors
    riskFactors: {
      ...photoAnalysis?.riskFactors,
      adjacentBuildings: satelliteAnalysis?.adjacentBuildings || 'Unknown',
    },
    
    // Aggregate confidence
    overallConfidence: calculateOverallConfidence([
      planAnalysis?.confidence,
      photoAnalysis?.confidence,
      satelliteAnalysis?.confidence,
    ]),
    
    // Track data sources
    dataSources: {
      floorPlan: !!planAnalysis,
      photos: !!photoAnalysis,
      satellite: !!satelliteAnalysis,
    },
    
    // All recommendations
    recommendations: [
      ...(photoAnalysis?.recommendations || []),
      ...(planAnalysis?.recommendations || []),
    ],
  };
  
  return combined;
}

/**
 * Calculate overall confidence from multiple sources
 * @param {Array<string>} confidenceLevels - Array of confidence levels
 * @returns {string} Overall confidence level
 */
function calculateOverallConfidence(confidenceLevels) {
  const validLevels = confidenceLevels.filter(Boolean);
  if (validLevels.length === 0) return 'low';
  
  const scores = {
    'high': 3,
    'medium': 2,
    'low': 1,
  };
  
  const totalScore = validLevels.reduce((sum, level) => sum + (scores[level] || 1), 0);
  const avgScore = totalScore / validLevels.length;
  
  if (avgScore >= 2.5) return 'high';
  if (avgScore >= 1.5) return 'medium';
  return 'low';
}

/**
 * Validate analysis results before using in forms
 * @param {Object} analysis - Analysis results to validate
 * @returns {boolean} Whether the results are valid
 */
export function validateAnalysisResults(analysis) {
  // Check if we have minimum required data
  const hasBasicDimensions = 
    analysis.buildingLength > 0 && 
    analysis.buildingWidth > 0;
    
  const hasStories = 
    analysis.numberOfStories > 0 && 
    analysis.numberOfStories <= 100; // Reasonable max
    
  const hasConfidence = 
    analysis.confidence && 
    ['low', 'medium', 'high'].includes(analysis.confidence);
    
  return hasBasicDimensions || hasStories || hasConfidence;
}