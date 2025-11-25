/**
 * Image Analysis Utilities for Building Assessment
 * Client-side helpers for AI image analysis
 *
 * Note: Server-side now uses Claude Structured Outputs (beta) which guarantees
 * schema-valid JSON responses. Client-side validation is simplified.
 */

/**
 * Validate response structure from API
 * Simplified since server now guarantees structured output format
 * @param {Object} response - Response object to validate
 * @returns {boolean} Whether the response has valid structure
 */
function validateResponseStructure(response) {
  if (!response || typeof response !== 'object') {
    console.error('Response is not a valid object');
    return false;
  }

  // Must have either success field or error field
  if (!('success' in response) && !('error' in response)) {
    console.error('Response missing success/error indicators');
    return false;
  }

  // If success is true, must have analysis field
  if (response.success === true && !response.analysis) {
    console.error('Success response missing analysis data');
    return false;
  }

  return true;
}

/**
 * Prepare image for upload and analysis
 * @param {File} file - Image file to process
 * @returns {Promise<{file: File, preview: string}>}
 */
export async function prepareImageForAnalysis(file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a valid image file.');
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 10MB.');
  }

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
 * Simplified retry logic - structured outputs guarantees valid JSON
 *
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
          type: imageFile.type,
        });
        formData.append('images', imageFile);
      });
      formData.append('analysisType', analysisType);

      if (additionalContext && Object.keys(additionalContext).length > 0) {
        formData.append('additionalContext', JSON.stringify(additionalContext));
      }

      console.log('Sending request to /api/analyze-image...');
      const startTime = Date.now();

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(60000), // 60 second timeout
      });

      const responseTime = Date.now() - startTime;
      console.log(`Response received in ${responseTime}ms, status: ${response.status}`);

      // Get response text
      const responseText = await response.text();

      if (!responseText) {
        throw new Error(`Server returned empty response (Status: ${response.status})`);
      }

      // Parse JSON
      let result;
      try {
        result = JSON.parse(responseText);

        if (!validateResponseStructure(result)) {
          throw new Error('Response structure validation failed');
        }

        console.log('Response parsed successfully, confidence:', result.confidence);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError.message);
        throw new Error(`Invalid JSON response: ${parseError.message}`);
      }

      // Handle HTTP errors
      if (!response.ok) {
        console.error(`HTTP ${response.status}:`, result.error, result.details);

        // Don't retry for client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(result.error || result.details || `Error: ${response.status}`);
        }

        // Retry for server errors (5xx)
        throw new Error(result.error || result.details || `Server error: ${response.status}`);
      }

      console.log('=== ANALYSIS SUCCESS ===');
      return result;

    } catch (error) {
      console.error(`\n=== ATTEMPT ${attempt + 1} FAILED ===`);
      console.error('Error:', error.message);
      lastError = error;

      // Don't retry for client-side errors
      if (
        error.message.includes('Invalid file type') ||
        error.message.includes('File size too large') ||
        error.message.includes('No images provided') ||
        error.message.includes('Image too large') ||
        error.message.includes('AI could not analyze') ||
        error.message.includes('API configuration')
      ) {
        throw error;
      }

      // Only retry for network/server errors
      const isRetryable =
        error.message.includes('Server error') ||
        error.message.includes('timeout') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('Service temporarily unavailable');

      if (!isRetryable) {
        throw error;
      }

      // Wait before retrying
      if (attempt < maxRetries) {
        const waitTime = (attempt + 1) * 2;
        console.log(`Will retry in ${waitTime} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
      }
    }
  }

  // All retries failed
  console.error('\n=== ALL RETRY ATTEMPTS EXHAUSTED ===');

  // User-friendly error messages
  if (lastError.message.includes('Failed to fetch')) {
    throw new Error('Network error: Could not connect to the server. Please check your connection.');
  } else if (lastError.message.includes('timeout')) {
    throw new Error('Request timeout: The analysis is taking too long. Please try with fewer or smaller images.');
  } else if (lastError.message.includes('API key')) {
    throw new Error('Configuration error: The AI service is not properly configured.');
  }

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
  const hasBasicDimensions =
    analysis.buildingLength > 0 &&
    analysis.buildingWidth > 0;

  const hasStories =
    analysis.numberOfStories > 0 &&
    analysis.numberOfStories <= 100;

  const hasConfidence =
    analysis.confidence &&
    ['low', 'medium', 'high'].includes(analysis.confidence);

  return hasBasicDimensions || hasStories || hasConfidence;
}
