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
 * Send images to AI analysis API
 * @param {Array} images - Array of image files
 * @param {string} analysisType - Type of analysis (building, floorPlan, satellite)
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeImagesWithAI(images, analysisType = 'building') {
  const formData = new FormData();
  
  images.forEach((image) => {
    formData.append('images', image.file || image);
  });
  formData.append('analysisType', analysisType);

  try {
    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to analyze images');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error analyzing images:', error);
    throw error;
  }
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