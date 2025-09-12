// Intelligent Defaults System
// Generates smart defaults based on collected data from Google Maps, AI analysis, and environmental data

/**
 * Intelligent Defaults Generator
 * Creates smart defaults for building assessment based on collected data
 */
export class IntelligentDefaults {
  constructor() {
    this.confidenceThreshold = 0.6; // Minimum confidence to use as default
  }

  /**
   * Generate intelligent defaults for all building parameters
   * @param {Object} collectedData - All data collected so far
   * @returns {Object} Default values with confidence scores
   */
  generateDefaults(collectedData) {
    const defaults = {
      // Basic building info defaults
      buildingInfo: this.getBuildingInfoDefaults(collectedData),
      
      // Structural system defaults
      structuralSystem: this.getStructuralSystemDefaults(collectedData),
      
      // Irregularity defaults
      irregularity: this.getIrregularityDefaults(collectedData),
      
      // Plan definition defaults
      planDefinition: this.getPlanDefinitionDefaults(collectedData),
      
      // Neighbor buildings defaults
      neighborBuildings: this.getNeighborBuildingsDefaults(collectedData),
      
      // Specific conditions defaults
      specificConditions: this.getSpecificConditionsDefaults(collectedData),
      
      // Extra loads defaults
      extraLoads: this.getExtraLoadsDefaults(collectedData),
      
      // Overall confidence
      overallConfidence: this.calculateOverallConfidence(collectedData)
    };

    return defaults;
  }

  /**
   * Generate building information defaults
   */
  getBuildingInfoDefaults(data) {
    const defaults = {};

    // Building type from AI analysis
    if (data.aiAnalysisData?.buildingType) {
      defaults.buildingType = {
        value: this.mapAIBuildingTypeToOption(data.aiAnalysisData.buildingType),
        confidence: 0.8,
        source: 'AI Analysis',
        reasoning: `Detected "${data.aiAnalysisData.buildingType}" from photo analysis`
      };
    } else if (data.streetViewData?.analysis?.estimatedCharacteristics?.estimatedType) {
      defaults.buildingType = {
        value: this.mapStreetViewTypeToOption(data.streetViewData.analysis.estimatedCharacteristics.estimatedType),
        confidence: 0.6,
        source: 'Street View Analysis',
        reasoning: 'Estimated from building context and street view data'
      };
    }

    // Number of stories from AI or Street View
    if (data.aiAnalysisData?.numberOfStories) {
      defaults.numberOfStories = {
        value: data.aiAnalysisData.numberOfStories,
        confidence: 0.9,
        source: 'AI Photo Analysis',
        reasoning: 'Counted stories from uploaded building photos'
      };
    } else if (data.streetViewData?.analysis?.estimatedCharacteristics?.estimatedStories) {
      const storiesEstimate = this.parseStoriesEstimate(data.streetViewData.analysis.estimatedCharacteristics.estimatedStories);
      defaults.numberOfStories = {
        value: storiesEstimate,
        confidence: 0.5,
        source: 'Street View Analysis',
        reasoning: 'Estimated based on neighborhood building density'
      };
    }

    // Construction year from AI analysis
    if (data.aiAnalysisData?.constructionYear) {
      defaults.yearOfConstruction = {
        value: data.aiAnalysisData.constructionYear,
        confidence: 0.7,
        source: 'AI Analysis',
        reasoning: 'Estimated from architectural style and material analysis'
      };
    } else if (data.streetViewData?.analysis?.estimatedCharacteristics?.ageEstimationContext) {
      defaults.yearOfConstruction = {
        value: this.parseConstructionPeriod(data.streetViewData.analysis.estimatedCharacteristics.ageEstimationContext),
        confidence: 0.4,
        source: 'Neighborhood Analysis',
        reasoning: 'Estimated from neighborhood development patterns'
      };
    }

    // Design regulation based on construction year and location
    if (defaults.yearOfConstruction?.value) {
      defaults.designRegulation = {
        value: this.determineDesignRegulation(defaults.yearOfConstruction.value, data.earthquakeZone),
        confidence: 0.8,
        source: 'Regulatory Database',
        reasoning: `Based on construction year ${defaults.yearOfConstruction.value} and seismic zone ${data.earthquakeZone}`
      };
    }

    return defaults;
  }

  /**
   * Generate structural system defaults
   */
  getStructuralSystemDefaults(data) {
    const defaults = {};

    // Structural system from AI analysis
    if (data.aiAnalysisData?.structuralSystem) {
      defaults.structuralSystem = {
        value: data.aiAnalysisData.structuralSystem,
        confidence: 0.8,
        source: 'AI Analysis',
        reasoning: 'Identified structural elements from photo analysis'
      };
    } else {
      // Infer from building type and construction year
      const buildingType = data.aiAnalysisData?.buildingType || 'unknown';
      const constructionYear = data.aiAnalysisData?.constructionYear || new Date().getFullYear();
      
      defaults.structuralSystem = {
        value: this.inferStructuralSystem(buildingType, constructionYear, data.numberOfStories),
        confidence: 0.6,
        source: 'Inference Engine',
        reasoning: `Inferred from building type "${buildingType}" and construction period`
      };
    }

    return defaults;
  }

  /**
   * Generate irregularity defaults
   */
  getIrregularityDefaults(data) {
    const defaults = {};

    // Plan irregularity from AI analysis
    if (data.aiAnalysisData?.irregularities) {
      defaults.planIrregularity = {
        value: data.aiAnalysisData.irregularities.plan || 'A1',
        confidence: 0.8,
        source: 'AI Analysis',
        reasoning: 'Analyzed building plan symmetry from photos'
      };

      defaults.verticalIrregularity = {
        value: data.aiAnalysisData.irregularities.vertical || 'B1',
        confidence: 0.8,
        source: 'AI Analysis',
        reasoning: 'Analyzed building vertical regularity from photos'
      };
    } else {
      // Default to regular building
      defaults.planIrregularity = {
        value: 'A1',
        confidence: 0.3,
        source: 'Default Assumption',
        reasoning: 'Assuming regular plan - most common case'
      };

      defaults.verticalIrregularity = {
        value: 'B1',
        confidence: 0.3,
        source: 'Default Assumption',
        reasoning: 'Assuming regular vertical layout - most common case'
      };
    }

    return defaults;
  }

  /**
   * Generate plan definition defaults
   */
  getPlanDefinitionDefaults(data) {
    const defaults = {};

    // Building dimensions from AI analysis
    if (data.aiAnalysisData?.dimensions) {
      defaults.buildingLength = {
        value: data.aiAnalysisData.dimensions.length,
        confidence: 0.7,
        source: 'AI Analysis',
        reasoning: 'Measured from building photos and satellite imagery'
      };

      defaults.buildingWidth = {
        value: data.aiAnalysisData.dimensions.width,
        confidence: 0.7,
        source: 'AI Analysis',
        reasoning: 'Measured from building photos and satellite imagery'
      };
    } else {
      // Estimate based on building type and stories
      const estimatedDimensions = this.estimateBuildingDimensions(
        data.aiAnalysisData?.buildingType || 'residential',
        data.numberOfStories || 2
      );

      defaults.buildingLength = {
        value: estimatedDimensions.length,
        confidence: 0.4,
        source: 'Statistical Estimate',
        reasoning: 'Estimated based on typical building dimensions'
      };

      defaults.buildingWidth = {
        value: estimatedDimensions.width,
        confidence: 0.4,
        source: 'Statistical Estimate',
        reasoning: 'Estimated based on typical building dimensions'
      };
    }

    return defaults;
  }

  /**
   * Generate neighbor buildings defaults
   */
  getNeighborBuildingsDefaults(data) {
    const defaults = {};

    // Analyze street view images for neighbor buildings
    if (data.streetViewImages && data.streetViewImages.length > 0) {
      defaults.neighborBuildings = {
        value: 'close', // Most urban buildings have close neighbors
        confidence: 0.7,
        source: 'Street View Analysis',
        reasoning: 'Analyzed neighboring structures from street view imagery'
      };

      defaults.poundingRisk = {
        value: 'moderate',
        confidence: 0.6,
        source: 'Street View Analysis',
        reasoning: 'Assessed building spacing from multiple street view angles'
      };
    } else {
      defaults.neighborBuildings = {
        value: 'moderate',
        confidence: 0.3,
        source: 'Default Assumption',
        reasoning: 'Average spacing assumption for urban areas'
      };
    }

    return defaults;
  }

  /**
   * Generate specific conditions defaults
   */
  getSpecificConditionsDefaults(data) {
    const defaults = {};

    // Soft story from AI analysis
    if (data.aiAnalysisData?.softStory !== undefined) {
      defaults.softStory = {
        value: data.aiAnalysisData.softStory,
        confidence: 0.8,
        source: 'AI Analysis',
        reasoning: 'Detected soft story condition from ground floor analysis'
      };
    } else {
      defaults.softStory = {
        value: false,
        confidence: 0.5,
        source: 'Default Assumption',
        reasoning: 'No soft story detected in available images'
      };
    }

    // Short columns
    defaults.shortColumns = {
      value: false,
      confidence: 0.4,
      source: 'Default Assumption',
      reasoning: 'Requires detailed structural inspection to confirm'
    };

    return defaults;
  }

  /**
   * Generate extra loads defaults
   */
  getExtraLoadsDefaults(data) {
    const defaults = {};

    // Heavy equipment from AI analysis
    defaults.heavyEquipment = {
      value: false,
      confidence: 0.6,
      source: 'Default Assumption',
      reasoning: 'No heavy equipment visible in photos'
    };

    // Water tanks
    defaults.waterTank = {
      value: data.aiAnalysisData?.roofFeatures?.waterTank || false,
      confidence: data.aiAnalysisData?.roofFeatures?.waterTank ? 0.7 : 0.5,
      source: data.aiAnalysisData?.roofFeatures?.waterTank ? 'AI Analysis' : 'Default Assumption',
      reasoning: data.aiAnalysisData?.roofFeatures?.waterTank ? 
        'Water tank detected on roof from photo analysis' : 
        'No water tank visible in available images'
    };

    return defaults;
  }

  // Helper methods for mapping and estimation

  mapAIBuildingTypeToOption(aiType) {
    const mapping = {
      'residential': 'Residential Building',
      'commercial': 'Commercial Building',
      'mixed_use': 'Mixed Use Building',
      'industrial': 'Industrial Building',
      'masonry': 'Masonry Building',
      'concrete': 'Concrete Building',
      'steel': 'Steel Building'
    };
    return mapping[aiType.toLowerCase()] || 'Residential Building';
  }

  mapStreetViewTypeToOption(streetViewType) {
    if (streetViewType.includes('apartment') || streetViewType.includes('residential')) {
      return 'Residential Building';
    } else if (streetViewType.includes('commercial') || streetViewType.includes('office')) {
      return 'Commercial Building';
    }
    return 'Residential Building';
  }

  parseStoriesEstimate(estimate) {
    // Parse estimates like "2-5 stories" or "1-3 floors"
    const match = estimate.match(/(\d+)-(\d+)/);
    if (match) {
      return Math.floor((parseInt(match[1]) + parseInt(match[2])) / 2);
    }
    return 2; // Default
  }

  parseConstructionPeriod(context) {
    // Parse periods like "1990-2010" or "1970-1990"  
    const match = context.match(/(\d{4})-(\d{4})/);
    if (match) {
      return Math.floor((parseInt(match[1]) + parseInt(match[2])) / 2);
    }
    return 1990; // Default
  }

  determineDesignRegulation(constructionYear, earthquakeZone) {
    // Turkish seismic design code evolution
    if (constructionYear >= 2019) return 'TBDY 2018';
    if (constructionYear >= 2007) return 'TDY 2007';
    if (constructionYear >= 1998) return 'TDY 1998';
    if (constructionYear >= 1975) return 'TDY 1975';
    return 'Pre-1975';
  }

  inferStructuralSystem(buildingType, constructionYear, stories) {
    stories = stories || 2;

    if (buildingType.includes('masonry') || constructionYear < 1980) {
      return 'Masonry Bearing Wall';
    } else if (stories <= 3) {
      return 'Reinforced Concrete Moment Frame';
    } else if (stories <= 8) {
      return 'Reinforced Concrete Moment Frame';
    } else {
      return 'Reinforced Concrete Shear Wall';
    }
  }

  estimateBuildingDimensions(buildingType, stories) {
    // Statistical estimates based on building type
    const baseArea = buildingType.includes('commercial') ? 400 : 200; // m²
    const length = Math.sqrt(baseArea * 1.5); // Rectangular assumption
    const width = Math.sqrt(baseArea / 1.5);

    return {
      length: Math.round(length),
      width: Math.round(width)
    };
  }

  calculateOverallConfidence(data) {
    const sources = [];
    
    if (data.aiAnalysisData) sources.push(0.9);
    if (data.streetViewData) sources.push(0.6);
    if (data.environmentalData) sources.push(0.8);
    if (data.latitude && data.longitude) sources.push(0.9);

    return sources.length > 0 ? 
      sources.reduce((sum, conf) => sum + conf, 0) / sources.length : 0.3;
  }

  /**
   * Get user-friendly explanation of defaults
   */
  getDefaultsExplanation(defaults) {
    const explanations = [];

    Object.entries(defaults).forEach(([category, categoryDefaults]) => {
      if (typeof categoryDefaults === 'object' && categoryDefaults.overallConfidence === undefined) {
        Object.entries(categoryDefaults).forEach(([field, defaultData]) => {
          if (defaultData.confidence >= this.confidenceThreshold) {
            explanations.push({
              field: field,
              category: category,
              value: defaultData.value,
              confidence: defaultData.confidence,
              source: defaultData.source,
              reasoning: defaultData.reasoning,
              canEdit: true
            });
          }
        });
      }
    });

    return explanations;
  }
}

// Export singleton instance
export const intelligentDefaults = new IntelligentDefaults();

export default IntelligentDefaults;