/**
 * Complete Building Assessment Endpoint
 * POST /api/v1/assessment/complete
 * Comprehensive earthquake safety assessment combining AI analysis, geospatial data, and safety calculations
 */

import { NextResponse } from 'next/server';
import { withErrorHandler, createSuccessResponse, ServiceError } from '@/lib/api/errorHandler';
import { withValidation, CompleteAssessmentSchema } from '@/lib/api/validators';
import { requireBothAuth } from '@/middleware/jwtAuthMiddleware';
import { withRateLimiting } from '@/middleware/rateLimitMiddleware';
import { calculateSafetyScore } from '@/components/SafetyCalculator';
import { getEnhancedLocationData } from '@/services/googlePlacesService';
import { getSeismicDataByCoordinates } from '@/services/turkeySeismicAPI';
import { getWeatherAnalysis } from '@/services/weatherService';

/**
 * POST /api/v1/assessment/complete
 * Performs a complete building safety assessment
 *
 * Request Headers:
 *   X-Platform-Token: <platform-token>
 *   Authorization: Bearer <jwt-token>
 *
 * Request Body:
 *   {
 *     location: {
 *       latitude: number,
 *       longitude: number
 *     },
 *     building: {
 *       structuralSystem: string,
 *       numberOfStories: number,
 *       yearOfConstruction: number,
 *       designRegulation: string,
 *       typeOfSoil?: string,
 *       typeOfEarthquake?: string,
 *       verticalIrregularityHigh?: boolean,
 *       verticalIrregularityModerate?: boolean,
 *       planIrregularity?: boolean,
 *       buildingLength?: number,
 *       buildingWidth?: number,
 *       storyHeight?: number
 *     },
 *     images?: {
 *       buildingPhotos?: [base64-string],
 *       floorPlans?: [base64-string],
 *       satelliteImages?: [base64-string]
 *     },
 *     options?: {
 *       includeAiAnalysis: boolean,
 *       includeLocationIntelligence: boolean,
 *       includeWeatherRisk: boolean,
 *       includeStreetView: boolean
 *     }
 *   }
 *
 * Response:
 *   {
 *     success: true,
 *     data: {
 *       assessmentId: string,
 *       safetyScore: { ... },
 *       aiAnalysis?: { ... },
 *       locationData?: { ... },
 *       seismicData: { ... },
 *       weatherRisk?: { ... },
 *       recommendations: [ ... ]
 *     },
 *     metadata: {
 *       processingTime: number,
 *       timestamp: ISO8601,
 *       version: string,
 *       services: { ... }
 *     }
 *   }
 */
async function completeAssessmentHandler(request) {
  const startTime = Date.now();
  const { location, building, images, options } = request.validatedData;
  const userContext = request.userContext;

  // Default options
  const opts = {
    includeAiAnalysis: options?.includeAiAnalysis ?? true,
    includeLocationIntelligence: options?.includeLocationIntelligence ?? true,
    includeWeatherRisk: options?.includeWeatherRisk ?? true,
    includeStreetView: options?.includeStreetView ?? false
  };

  // Generate assessment ID
  const assessmentId = generateAssessmentId(userContext.userId);

  try {
    // Parallel data gathering
    const dataPromises = [];

    // 1. Seismic data (always included)
    dataPromises.push(
      getSeismicDataByCoordinates(location.latitude, location.longitude)
        .catch(err => {
          console.error('Seismic data error:', err);
          return { success: false, error: err.message };
        })
    );

    // 2. Location intelligence (optional)
    if (opts.includeLocationIntelligence) {
      dataPromises.push(
        getEnhancedLocationData(location.latitude, location.longitude)
          .catch(err => {
            console.error('Location data error:', err);
            return { success: false, error: err.message };
          })
      );
    } else {
      dataPromises.push(Promise.resolve(null));
    }

    // 3. Weather risk (optional)
    if (opts.includeWeatherRisk) {
      dataPromises.push(
        getWeatherAnalysis(location.latitude, location.longitude)
          .catch(err => {
            console.error('Weather data error:', err);
            return { success: false, error: err.message };
          })
      );
    } else {
      dataPromises.push(Promise.resolve(null));
    }

    // Wait for all environmental data
    const [seismicResult, locationResult, weatherResult] = await Promise.all(dataPromises);

    // Extract seismic data
    const seismicData = seismicResult?.success ? seismicResult.data : null;

    // 4. AI Analysis (optional, if images provided)
    let aiAnalysis = null;
    if (opts.includeAiAnalysis && images && (images.buildingPhotos?.length || images.floorPlans?.length)) {
      try {
        aiAnalysis = await performAiAnalysis(images, location, seismicData);
      } catch (error) {
        console.error('AI analysis error:', error);
        // Continue without AI analysis
      }
    }

    // 5. Calculate Safety Score
    const safetyInput = prepareSafetyCalculationInput(
      building,
      seismicData,
      aiAnalysis
    );

    const safetyScore = calculateSafetyScore(safetyInput);

    // 6. Generate recommendations
    const recommendations = generateRecommendations(
      safetyScore,
      seismicData,
      aiAnalysis,
      weatherResult
    );

    // Calculate processing time
    const processingTime = Date.now() - startTime;

    // Build response
    const responseData = {
      assessmentId,
      safetyScore: {
        overall: safetyScore.overallScore,
        rawScore: safetyScore.rawScore,
        normalizedScore: safetyScore.normalizedScore,
        interpretation: safetyScore.interpretation,
        structuralIntegrity: safetyScore.structuralIntegrity,
        earthquakeImpact: safetyScore.earthquakeImpact,
        performanceLevels: safetyScore.performanceLevels,
        maxSafeRichter: safetyScore.maxSafeRichter,
        buildingClassification: safetyScore.buildingClassification,
        scoreBreakdown: safetyScore.scoreBreakdown
      },
      seismicData: seismicData ? {
        zone: seismicData.zone,
        riskLevel: seismicData.riskLevel,
        pga: seismicData.pga,
        soilType: seismicData.soilType,
        description: seismicData.description
      } : null,
      recommendations
    };

    // Add optional data
    if (aiAnalysis) {
      responseData.aiAnalysis = aiAnalysis;
    }

    if (locationResult?.success) {
      responseData.locationData = {
        address: locationResult.data.address,
        neighborhood: locationResult.data.neighborhood,
        buildingInfo: locationResult.data.buildingInfo
      };
    }

    if (weatherResult?.success) {
      responseData.weatherRisk = {
        soilSaturationRisk: weatherResult.soilSaturationRisk,
        analysis: weatherResult.analysis,
        current: weatherResult.current
      };
    }

    return createSuccessResponse(
      responseData,
      {
        processingTime,
        version: 'v1.0.0',
        services: {
          safetyCalculation: true,
          seismicData: !!seismicData,
          aiAnalysis: !!aiAnalysis,
          locationIntelligence: !!locationResult?.success,
          weatherRisk: !!weatherResult?.success
        }
      }
    );
  } catch (error) {
    console.error('Assessment error:', error);
    throw new ServiceError('Assessment processing failed', { error: error.message });
  }
}

/**
 * Performs AI analysis on building images
 */
async function performAiAnalysis(images, location, seismicData) {
  // Prepare images for AI analysis
  const imagesToAnalyze = [];

  if (images.buildingPhotos) {
    imagesToAnalyze.push(...images.buildingPhotos.map(img => ({
      data: img,
      type: 'buildingPhoto'
    })));
  }

  if (images.floorPlans) {
    imagesToAnalyze.push(...images.floorPlans.map(img => ({
      data: img,
      type: 'floorPlan'
    })));
  }

  // Call AI analysis API (internal)
  const analysisContext = {
    location: {
      latitude: location.latitude,
      longitude: location.longitude
    },
    seismic: seismicData ? {
      zone: seismicData.zone,
      soilType: seismicData.soilType,
      zoneDescription: seismicData.description
    } : null
  };

  // Import the AI analysis function
  const { analyzeImages } = await import('@/lib/ai/imageAnalyzer');

  try {
    const analysis = await analyzeImages(imagesToAnalyze, analysisContext);
    return analysis;
  } catch (error) {
    console.error('AI image analysis failed:', error);
    return null;
  }
}

/**
 * Prepares input for safety calculation
 */
function prepareSafetyCalculationInput(building, seismicData, aiAnalysis) {
  return {
    structuralSystem: building.structuralSystem,
    numberOfStories: building.numberOfStories,
    yearOfConstruction: building.yearOfConstruction,
    designRegulation: building.designRegulation,
    typeOfSoil: building.typeOfSoil || seismicData?.soilType || 'ZC',
    typeOfEarthquake: building.typeOfEarthquake || seismicData?.zone || 'Zone 3',
    verticalIrregularityHigh: building.verticalIrregularityHigh || false,
    verticalIrregularityModerate: building.verticalIrregularityModerate || false,
    planIrregularity: building.planIrregularity || false,
    buildingLength: building.buildingLength,
    buildingWidth: building.buildingWidth,
    storyHeight: building.storyHeight,
    architecturalPlanData: aiAnalysis?.planAnalysis || null
  };
}

/**
 * Generates recommendations based on assessment results
 */
function generateRecommendations(safetyScore, seismicData, aiAnalysis, weatherData) {
  const recommendations = [];

  // Score-based recommendations
  const score = parseFloat(safetyScore.normalizedScore);

  if (score < 40) {
    recommendations.push({
      priority: 'critical',
      category: 'structural',
      message: 'Building requires immediate structural evaluation by a licensed engineer',
      action: 'Schedule professional inspection within 30 days'
    });
    recommendations.push({
      priority: 'critical',
      category: 'safety',
      message: 'Consider evacuation plan and emergency preparedness',
      action: 'Develop and practice earthquake evacuation procedures'
    });
  } else if (score < 60) {
    recommendations.push({
      priority: 'high',
      category: 'structural',
      message: 'Structural retrofit may be necessary to improve seismic safety',
      action: 'Consult with structural engineer for retrofit assessment'
    });
  } else if (score < 75) {
    recommendations.push({
      priority: 'medium',
      category: 'maintenance',
      message: 'Regular structural inspections recommended',
      action: 'Schedule annual inspection by qualified professional'
    });
  }

  // Seismic zone recommendations
  if (seismicData) {
    if (seismicData.riskLevel === 'Very High' || seismicData.riskLevel === 'High') {
      recommendations.push({
        priority: 'high',
        category: 'seismic',
        message: `Building is located in ${seismicData.riskLevel.toLowerCase()} seismic risk zone (${seismicData.zone})`,
        action: 'Ensure earthquake insurance coverage and emergency supplies'
      });
    }
  }

  // AI analysis recommendations
  if (aiAnalysis?.riskFactors) {
    const risks = aiAnalysis.riskFactors;

    if (risks.softStory === 'detected') {
      recommendations.push({
        priority: 'critical',
        category: 'structural',
        message: 'Soft story condition detected - major vulnerability',
        action: 'Immediate structural engineer consultation required'
      });
    }

    if (risks.heavyOverhang === 'detected') {
      recommendations.push({
        priority: 'high',
        category: 'structural',
        message: 'Heavy overhangs detected - potential mass irregularity',
        action: 'Evaluate load distribution and consider reinforcement'
      });
    }
  }

  // Weather-based recommendations
  if (weatherData?.success && weatherData.soilSaturationRisk !== 'low') {
    recommendations.push({
      priority: 'medium',
      category: 'environmental',
      message: `${weatherData.soilSaturationRisk} soil saturation risk detected`,
      action: 'Monitor foundation condition, especially after heavy rainfall'
    });
  }

  // General recommendations
  recommendations.push({
    priority: 'low',
    category: 'preparedness',
    message: 'Maintain emergency supplies and earthquake preparedness kit',
    action: 'Stock water, food, flashlight, first aid kit, and battery-powered radio'
  });

  return recommendations;
}

/**
 * Generates unique assessment ID
 */
function generateAssessmentId(userId) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  const userHash = userId.substring(0, 8);
  return `asm_${timestamp}_${userHash}_${random}`;
}

// Apply middleware chain
export const POST = withErrorHandler(
  withValidation(
    CompleteAssessmentSchema,
    requireBothAuth(
      withRateLimiting(completeAssessmentHandler)
    )
  )
);

// OPTIONS handler for CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Platform-Token, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}
