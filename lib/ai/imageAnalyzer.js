/**
 * AI Image Analyzer - Integration Layer
 * Bridges the external API with QuakeWise's existing AI analysis services
 */

/**
 * Analyzes building images using AI
 * This integrates with the existing analyze-image API endpoint
 *
 * @param {Array} images - Array of image objects with data and type
 * @param {Object} context - Location and seismic context
 * @returns {Promise<Object|null>} - Analysis results or null if unavailable
 */
export async function analyzeImages(images, context) {
  if (!images || images.length === 0) {
    return null;
  }

  try {
    // Prepare images for analysis
    const formData = new FormData();

    // Add images
    images.forEach((img, index) => {
      // Convert base64 to blob if needed
      let imageData = img.data;

      if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
        // Extract base64 data
        const base64Data = imageData.split(',')[1];
        const mimeType = imageData.match(/data:(.*?);/)[1];
        const binaryData = Buffer.from(base64Data, 'base64');
        const blob = new Blob([binaryData], { type: mimeType });
        formData.append('images', blob, `image_${index}.jpg`);
      } else if (imageData instanceof Blob || imageData instanceof File) {
        formData.append('images', imageData, `image_${index}.jpg`);
      }
    });

    // Determine analysis type
    const hasFloorPlans = images.some(img => img.type === 'floorPlan');
    const analysisType = hasFloorPlans ? 'floorPlan' : 'building';
    formData.append('analysisType', analysisType);

    // Add context
    if (context) {
      formData.append('additionalContext', JSON.stringify(context));
    }

    // Call the existing analyze-image API internally
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/analyze-image`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      console.error('AI analysis failed:', response.statusText);
      return null;
    }

    const result = await response.json();

    if (!result.success) {
      console.error('AI analysis error:', result.error);
      return null;
    }

    return result.analysis;
  } catch (error) {
    console.error('AI image analysis error:', error);
    return null;
  }
}

/**
 * Analyzes building photos specifically
 * @param {Array} photos - Array of building photo base64 strings or blobs
 * @param {Object} context - Location and seismic context
 * @returns {Promise<Object|null>}
 */
export async function analyzeBuildingPhotos(photos, context) {
  const images = photos.map(photo => ({
    data: photo,
    type: 'buildingPhoto'
  }));

  return await analyzeImages(images, context);
}

/**
 * Analyzes floor plans specifically
 * @param {Array} plans - Array of floor plan base64 strings or blobs
 * @param {Object} context - Location and seismic context
 * @returns {Promise<Object|null>}
 */
export async function analyzeFloorPlans(plans, context) {
  const images = plans.map(plan => ({
    data: plan,
    type: 'floorPlan'
  }));

  return await analyzeImages(images, context);
}

/**
 * Mock analyzer for testing without AI service
 * Returns placeholder data
 */
export async function mockAnalyzeImages(images, context) {
  return {
    confidence: 'medium',
    detectedFeatures: {
      buildingType: 'Concrete Frame Building',
      estimatedStories: 5,
      constructionPeriod: '2000-2010',
      structuralSystem: 'C2',
      materialCondition: 'good'
    },
    dimensions: {
      estimatedLength: 20,
      estimatedWidth: 15,
      estimatedHeight: 18
    },
    irregularities: {
      plan: 'regular',
      vertical: 'regular',
      mass: 'regular'
    },
    riskFactors: {
      softStory: 'not detected',
      heavyOverhang: 'not detected',
      adjacentBuilding: 'moderate',
      foundation: 'not visible'
    },
    recommendations: [
      'Regular structural inspections recommended',
      'Monitor for cracks in concrete elements',
      'Maintain proper drainage around foundation'
    ],
    rawData: {
      mock: true,
      imagesAnalyzed: images.length
    }
  };
}

// Export default analyzer
export default analyzeImages;
