/**
 * Assessment Service
 * Client-side service for assessment persistence operations
 */

/**
 * Save assessment to database
 * @param {Object} assessmentData - Complete assessment data
 * @returns {Promise<Object>} Saved assessment with ID
 */
export async function saveAssessment(assessmentData) {
  try {
    const response = await fetch('/api/assessment/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assessmentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to save assessment');
    }

    return data;
  } catch (error) {
    console.error('Error saving assessment:', error);
    throw error;
  }
}

/**
 * Get user's assessment history
 * @param {Number} limit - Number of assessments to fetch
 * @param {Number} offset - Offset for pagination
 * @returns {Promise<Object>} Assessment history with pagination
 */
export async function getAssessmentHistory(limit = 10, offset = 0) {
  try {
    const response = await fetch(
      `/api/assessment/history?limit=${limit}&offset=${offset}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch assessment history');
    }

    return data;
  } catch (error) {
    console.error('Error fetching assessment history:', error);
    throw error;
  }
}

/**
 * Get specific assessment by ID
 * @param {String} assessmentId - Assessment ID
 * @returns {Promise<Object>} Complete assessment data
 */
export async function getAssessment(assessmentId) {
  try {
    const response = await fetch(`/api/assessment/${assessmentId}`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch assessment');
    }

    return data;
  } catch (error) {
    console.error('Error fetching assessment:', error);
    throw error;
  }
}

/**
 * Delete assessment
 * @param {String} assessmentId - Assessment ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export async function deleteAssessment(assessmentId) {
  try {
    const response = await fetch(`/api/assessment/${assessmentId}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete assessment');
    }

    return data;
  } catch (error) {
    console.error('Error deleting assessment:', error);
    throw error;
  }
}

/**
 * Format assessment data from context/localStorage for saving
 * @param {Object} context - UserInputContext data
 * @param {Object} results - Safety calculation results
 * @param {Object} images - Image storage data
 * @returns {Object} Formatted assessment data for API
 */
export function formatAssessmentForSaving(context, results, images) {
  return {
    assessmentType: 'complete',
    version: '1.0',

    // Location data
    location: context.location ? {
      latitude: context.location.latitude,
      longitude: context.location.longitude,
      accuracy: context.location.accuracy,
      fullAddress: context.location.address || context.location.fullAddress,
      city: context.location.city,
      district: context.location.district,
      neighborhood: context.location.neighborhood,
      country: context.location.country || 'Turkey',
      postalCode: context.location.postalCode,
      placeId: context.location.placeId,
      placeName: context.location.placeName,
      weatherCondition: context.weather?.condition,
      temperature: context.weather?.temperature,
      earthquakeZone: context.location.earthquakeZone || results?.earthquakeZone,
      seismicActivity: context.location.seismicActivity || results?.seismicActivity,
    } : null,

    // Building information
    buildingInfo: {
      buildingName: context.buildingName,
      buildingType: context.buildingType || 'Residential',
      numberOfFloors: parseInt(context.numberOfFloors) || 0,
      floorArea: parseFloat(context.floorArea),
      buildingAge: parseInt(context.buildingAge),
      constructionYear: context.constructionYear ? parseInt(context.constructionYear) : null,
      structuralSystem: context.structuralSystem,
      frameType: context.frameType,
      foundationType: context.foundationType,
      buildingCode: context.buildingCode,
      codeCompliance: context.codeCompliance,
      hasRetrofit: context.hasRetrofit === true || context.hasRetrofit === 'yes',
      retrofitYear: context.retrofitYear ? parseInt(context.retrofitYear) : null,
      hasVerticalIrregularity: context.hasVerticalIrregularity === true,
      hasPlanIrregularity: context.hasPlanIrregularity === true,
      hasShortColumn: context.hasShortColumn === true,
      hasSoftStory: context.hasSoftStory === true,
      hasHeavyOverhang: context.hasHeavyOverhang === true,
      soilType: context.soilType,
      slopeCondition: context.slopeCondition,
      liquefactionRisk: context.liquefactionRisk,
      hasSwimmingPool: context.hasSwimmingPool === true,
      hasWaterTank: context.hasWaterTank === true,
      hasHeavyEquipment: context.hasHeavyEquipment === true,
      hasAdjacentBuildings: context.hasAdjacentBuildings === true,
      poundingRisk: context.poundingRisk,
      materialCondition: context.materialCondition,
      visibleDamage: context.visibleDamage === true,
      damageDescription: context.damageDescription,
    },

    // Safety results
    safetyResult: results ? {
      overallScore: results.overallScore || results.safetyScore || 0,
      riskLevel: results.riskLevel || getRiskLevel(results.overallScore),
      safetyRating: results.safetyRating || getSafetyRating(results.overallScore),
      structuralScore: results.structuralScore,
      foundationScore: results.foundationScore,
      materialScore: results.materialScore,
      irregularityScore: results.irregularityScore,
      siteScore: results.siteScore,
      femaScore: results.femaScore,
      tbdyScore: results.tbdyScore,
      vulnerabilityIndex: results.vulnerabilityIndex,
      mainRiskFactors: results.mainRiskFactors || results.riskFactors,
      criticalIssues: results.criticalIssues,
      immediateActions: results.immediateActions || results.recommendations?.immediate,
      shortTermActions: results.shortTermActions || results.recommendations?.shortTerm,
      longTermActions: results.longTermActions || results.recommendations?.longTerm,
      estimatedRetrofitCost: results.estimatedRetrofitCost,
      priorityLevel: results.priorityLevel,
      aiAnalysis: results.aiAnalysis,
      aiConfidence: results.aiConfidence,
      calculationMethod: results.calculationMethod || 'TBDY-2018',
    } : null,

    // Images
    images: formatImagesForSaving(images),
  };
}

/**
 * Format images for database storage
 * @param {Object} images - Image storage data
 * @returns {Array} Formatted image array
 */
function formatImagesForSaving(images) {
  if (!images) return [];

  const formattedImages = [];

  // Street View images
  if (images.google?.streetView) {
    images.google.streetView.forEach(img => {
      formattedImages.push({
        imageType: 'STREET_VIEW',
        fileName: img.name || `streetview_${img.angle || 0}.jpg`,
        mimeType: img.mimeType || 'image/jpeg',
        fileSize: img.size,
        imageData: img.base64,
        thumbnailData: img.thumbnail || img.base64,
        capturedAt: img.convertedAt,
        description: img.description,
        angle: img.angle,
        aiAnalysis: img.aiAnalysis,
      });
    });
  }

  // Satellite image
  if (images.google?.satellite) {
    const img = images.google.satellite;
    formattedImages.push({
      imageType: 'SATELLITE',
      fileName: img.name || 'satellite.jpg',
      mimeType: img.mimeType || 'image/jpeg',
      fileSize: img.size,
      imageData: img.base64,
      thumbnailData: img.thumbnail || img.base64,
      capturedAt: img.convertedAt,
      description: 'Satellite View',
      aiAnalysis: img.aiAnalysis,
    });
  }

  // User uploaded images
  if (images.user) {
    images.user.forEach(img => {
      formattedImages.push({
        imageType: 'USER_UPLOAD',
        fileName: img.name,
        mimeType: img.mimeType || 'image/jpeg',
        fileSize: img.size,
        imageData: img.base64,
        thumbnailData: img.thumbnail || img.base64,
        capturedAt: img.convertedAt,
        description: img.description || 'User Photo',
        aiAnalysis: img.aiAnalysis,
      });
    });
  }

  return formattedImages;
}

/**
 * Determine risk level from score
 * @param {Number} score - Overall safety score (0-100)
 * @returns {String} Risk level
 */
function getRiskLevel(score) {
  if (score >= 80) return 'Low';
  if (score >= 60) return 'Moderate';
  if (score >= 40) return 'High';
  return 'Very High';
}

/**
 * Determine safety rating from score
 * @param {Number} score - Overall safety score (0-100)
 * @returns {String} Safety rating (A-E)
 */
function getSafetyRating(score) {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'E';
}
