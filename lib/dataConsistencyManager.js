// Data Consistency Manager
// Ensures consistent data flow from AI analysis through all steps to final results

/**
 * Data Consistency Manager
 * Single source of truth for building parameters throughout the assessment
 */
export class DataConsistencyManager {
  constructor() {
    this.masterData = {};
    this.dataHistory = [];
    this.inconsistencies = [];
  }

  /**
   * Set master data from AI analysis - this becomes the source of truth
   * @param {Object} aiAnalysisData - Data from AI photo analysis
   * @param {Object} locationData - Data from location analysis
   * @param {Object} environmentalData - Weather and seismic data
   */
  setMasterData(aiAnalysisData, locationData, environmentalData) {
    console.log('Setting master data from AI analysis:', aiAnalysisData);

    this.masterData = {
      // Building dimensions (PRIMARY SOURCE: AI Analysis)
      dimensions: {
        length: aiAnalysisData?.dimensions?.length || null,
        width: aiAnalysisData?.dimensions?.width || null,
        height: aiAnalysisData?.dimensions?.height || null,
        stories: aiAnalysisData?.numberOfStories || null,
        storyHeight: aiAnalysisData?.dimensions?.storyHeight || null,
        source: 'AI_ANALYSIS',
        confidence: aiAnalysisData?.confidence?.dimensions || 0.8,
        timestamp: new Date().toISOString()
      },

      // Building type (PRIMARY SOURCE: AI Analysis)
      buildingType: {
        type: aiAnalysisData?.buildingType || null,
        materialType: aiAnalysisData?.materialType || null,
        structuralSystem: aiAnalysisData?.structuralSystem || null,
        source: 'AI_ANALYSIS',
        confidence: aiAnalysisData?.confidence?.buildingType || 0.8,
        timestamp: new Date().toISOString()
      },

      // Structural characteristics (PRIMARY SOURCE: AI Analysis)
      structural: {
        irregularities: aiAnalysisData?.irregularities || null,
        softStory: aiAnalysisData?.softStory || false,
        shortColumns: aiAnalysisData?.shortColumns || false,
        structuralCondition: aiAnalysisData?.structuralCondition || null,
        source: 'AI_ANALYSIS',
        confidence: aiAnalysisData?.confidence?.structural || 0.7,
        timestamp: new Date().toISOString()
      },

      // Construction details (PRIMARY SOURCE: AI Analysis)
      construction: {
        year: aiAnalysisData?.constructionYear || null,
        period: aiAnalysisData?.constructionPeriod || null,
        designCode: aiAnalysisData?.designRegulation || null,
        source: 'AI_ANALYSIS',
        confidence: aiAnalysisData?.confidence?.construction || 0.6,
        timestamp: new Date().toISOString()
      },

      // Location data (PRIMARY SOURCE: Location Services)
      location: {
        latitude: locationData?.latitude || null,
        longitude: locationData?.longitude || null,
        city: locationData?.city || null,
        earthquakeZone: locationData?.earthquakeZone || null,
        soilType: locationData?.soilType || null,
        source: 'LOCATION_SERVICES',
        confidence: 0.9,
        timestamp: new Date().toISOString()
      },

      // Environmental data (PRIMARY SOURCE: Weather/Seismic Services)
      environmental: environmentalData || null,

      // Data lineage
      dataLineage: {
        createdAt: new Date().toISOString(),
        sources: ['AI_ANALYSIS', 'LOCATION_SERVICES'],
        version: '1.0'
      }
    };

    this.dataHistory.push({
      action: 'MASTER_DATA_SET',
      data: JSON.parse(JSON.stringify(this.masterData)),
      timestamp: new Date().toISOString()
    });

    return this.masterData;
  }

  /**
   * Get consistent data for any step - always returns the same values
   * @param {string} stepName - Name of the current step
   * @returns {Object} Consistent data for the step
   */
  getConsistentData(stepName) {
    const consistentData = {
      // Always use the same building dimensions
      buildingLength: this.masterData.dimensions?.length,
      buildingWidth: this.masterData.dimensions?.width,
      buildingHeight: this.masterData.dimensions?.height,
      numberOfStories: this.masterData.dimensions?.stories,
      storyHeight: this.masterData.dimensions?.storyHeight,

      // Always use the same building type
      buildingType: this.masterData.buildingType?.type,
      materialType: this.masterData.buildingType?.materialType,
      structuralSystem: this.masterData.buildingType?.structuralSystem,

      // Always use the same structural characteristics
      irregularities: this.masterData.structural?.irregularities,
      softStory: this.masterData.structural?.softStory,
      shortColumns: this.masterData.structural?.shortColumns,

      // Always use the same construction details
      yearOfConstruction: this.masterData.construction?.year,
      constructionPeriod: this.masterData.construction?.period,
      designRegulation: this.masterData.construction?.designCode,

      // Always use the same location data
      earthquakeZone: this.masterData.location?.earthquakeZone,
      soilType: this.masterData.location?.soilType,
      latitude: this.masterData.location?.latitude,
      longitude: this.masterData.location?.longitude,
      city: this.masterData.location?.city,

      // Metadata
      dataSource: 'CONSISTENCY_MANAGER',
      retrievedFor: stepName,
      retrievedAt: new Date().toISOString()
    };

    console.log(`Consistent data for ${stepName}:`, consistentData);
    return consistentData;
  }

  /**
   * Update data only if user explicitly changes it
   * @param {string} field - Field being updated
   * @param {any} newValue - New value
   * @param {string} reason - Reason for change (USER_EDIT, CORRECTION, etc.)
   */
  updateData(field, newValue, reason = 'USER_EDIT') {
    const oldValue = this.getNestedValue(this.masterData, field);
    
    if (oldValue !== newValue) {
      // Record the change
      this.dataHistory.push({
        action: 'DATA_UPDATE',
        field,
        oldValue,
        newValue,
        reason,
        timestamp: new Date().toISOString()
      });

      // Update the master data
      this.setNestedValue(this.masterData, field, newValue);
      
      console.log(`Data updated: ${field} changed from ${oldValue} to ${newValue} (${reason})`);
    }
  }

  /**
   * Detect and report data inconsistencies
   * @param {Object} currentFormData - Data from current form
   * @param {string} stepName - Current step name
   */
  detectInconsistencies(currentFormData, stepName) {
    const inconsistencies = [];

    // Check for dimension inconsistencies
    if (currentFormData.buildingLength !== this.masterData.dimensions?.length) {
      inconsistencies.push({
        field: 'buildingLength',
        masterValue: this.masterData.dimensions?.length,
        currentValue: currentFormData.buildingLength,
        step: stepName,
        severity: 'HIGH'
      });
    }

    if (currentFormData.numberOfStories !== this.masterData.dimensions?.stories) {
      inconsistencies.push({
        field: 'numberOfStories',
        masterValue: this.masterData.dimensions?.stories,
        currentValue: currentFormData.numberOfStories,
        step: stepName,
        severity: 'HIGH'
      });
    }

    // Check for building type inconsistencies
    if (currentFormData.buildingType !== this.masterData.buildingType?.type) {
      inconsistencies.push({
        field: 'buildingType',
        masterValue: this.masterData.buildingType?.type,
        currentValue: currentFormData.buildingType,
        step: stepName,
        severity: 'MEDIUM'
      });
    }

    if (inconsistencies.length > 0) {
      console.warn(`Data inconsistencies detected in ${stepName}:`, inconsistencies);
      this.inconsistencies.push({
        step: stepName,
        inconsistencies,
        timestamp: new Date().toISOString()
      });
    }

    return inconsistencies;
  }

  /**
   * Get data confidence scores
   */
  getConfidenceScores() {
    return {
      dimensions: this.masterData.dimensions?.confidence || 0,
      buildingType: this.masterData.buildingType?.confidence || 0,
      structural: this.masterData.structural?.confidence || 0,
      construction: this.masterData.construction?.confidence || 0,
      location: this.masterData.location?.confidence || 0,
      overall: this.calculateOverallConfidence()
    };
  }

  /**
   * Get data audit trail
   */
  getAuditTrail() {
    return {
      dataHistory: this.dataHistory,
      inconsistencies: this.inconsistencies,
      masterData: this.masterData
    };
  }

  /**
   * Generate unified data for final results - ensuring everything matches
   */
  getFinalResultsData() {
    const finalData = {
      // Building dimensions (from AI analysis)
      dimensions: {
        length: this.masterData.dimensions?.length,
        width: this.masterData.dimensions?.width,
        height: this.masterData.dimensions?.height,
        stories: this.masterData.dimensions?.stories,
        storyHeight: this.masterData.dimensions?.storyHeight,
        area: this.masterData.dimensions?.length && this.masterData.dimensions?.width ? 
              this.masterData.dimensions.length * this.masterData.dimensions.width : null
      },

      // Building characteristics (from AI analysis)
      building: {
        type: this.masterData.buildingType?.type,
        materialType: this.masterData.buildingType?.materialType,
        structuralSystem: this.masterData.buildingType?.structuralSystem,
        constructionYear: this.masterData.construction?.year,
        designCode: this.masterData.construction?.designCode
      },

      // Structural assessment (from AI analysis)
      structural: {
        irregularities: this.masterData.structural?.irregularities,
        softStory: this.masterData.structural?.softStory,
        shortColumns: this.masterData.structural?.shortColumns,
        condition: this.masterData.structural?.structuralCondition
      },

      // Location and environmental
      location: {
        coordinates: {
          latitude: this.masterData.location?.latitude,
          longitude: this.masterData.location?.longitude
        },
        city: this.masterData.location?.city,
        earthquakeZone: this.masterData.location?.earthquakeZone,
        soilType: this.masterData.location?.soilType
      },

      // Data quality metrics
      quality: {
        confidence: this.getConfidenceScores(),
        sources: this.getDataSources(),
        lastUpdated: new Date().toISOString()
      }
    };

    console.log('Final unified results data:', finalData);
    return finalData;
  }

  // Helper methods
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => current[key] = current[key] || {}, obj);
    target[lastKey] = value;
  }

  calculateOverallConfidence() {
    const scores = Object.values(this.getConfidenceScores()).filter(score => score > 0);
    return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  }

  getDataSources() {
    const sources = new Set();
    Object.values(this.masterData).forEach(section => {
      if (section?.source) sources.add(section.source);
    });
    return Array.from(sources);
  }

  /**
   * Create warning component data for UI
   */
  createConsistencyWarning(inconsistencies) {
    if (inconsistencies.length === 0) return null;

    return {
      title: 'Data Consistency Alert',
      message: `We detected ${inconsistencies.length} difference(s) between AI analysis and current form values.`,
      inconsistencies: inconsistencies.map(inc => ({
        field: inc.field,
        aiValue: inc.masterValue,
        formValue: inc.currentValue,
        severity: inc.severity,
        recommendation: this.getRecommendation(inc)
      })),
      actions: [
        { label: 'Use AI Values', action: 'USE_AI_VALUES' },
        { label: 'Keep Current', action: 'KEEP_CURRENT' },
        { label: 'Review Both', action: 'REVIEW_BOTH' }
      ]
    };
  }

  getRecommendation(inconsistency) {
    const recommendations = {
      buildingLength: 'AI measured this from your photos. Consider using the AI value for accuracy.',
      buildingWidth: 'AI measured this from your photos. Consider using the AI value for accuracy.',
      numberOfStories: 'AI counted stories from your photos. The AI count is likely more accurate.',
      buildingType: 'AI analyzed your building materials and structure. Consider the AI assessment.'
    };
    
    return recommendations[inconsistency.field] || 'AI analysis provides objective measurements.';
  }
}

// Export singleton instance
export const dataConsistencyManager = new DataConsistencyManager();

export default DataConsistencyManager;