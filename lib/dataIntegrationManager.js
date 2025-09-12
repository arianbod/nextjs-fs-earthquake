/**
 * Data Integration Manager
 * Combines building plan analysis and photo analysis data into unified building assessment
 * Manages data consistency and confidence scoring between different AI analysis sources
 */

class DataIntegrationManager {
  constructor() {
    this.planAnalysis = null;
    this.photoAnalysis = null;
    this.integratedData = null;
    this.confidenceThresholds = {
      high: 0.8,
      medium: 0.6,
      low: 0.4
    };
  }

  /**
   * Set building plan analysis data
   */
  setPlanAnalysis(planData) {
    this.planAnalysis = planData;
    console.log('Plan analysis data set:', planData);
    this._updateIntegratedData();
  }

  /**
   * Set building photo analysis data
   */
  setPhotoAnalysis(photoData) {
    this.photoAnalysis = photoData;
    console.log('Photo analysis data set:', photoData);
    this._updateIntegratedData();
  }

  /**
   * Get current plan analysis
   */
  getPlanAnalysis() {
    return this.planAnalysis;
  }

  /**
   * Get current photo analysis
   */
  getPhotoAnalysis() {
    return this.photoAnalysis;
  }

  /**
   * Get integrated building assessment data
   */
  getIntegratedData() {
    if (!this.integratedData) {
      this._updateIntegratedData();
    }
    return this.integratedData;
  }

  /**
   * Update integrated data when new analysis is available
   */
  _updateIntegratedData() {
    if (!this.planAnalysis && !this.photoAnalysis) {
      this.integratedData = null;
      return;
    }

    // If only plan analysis is available
    if (this.planAnalysis && !this.photoAnalysis) {
      this.integratedData = this._createPlanOnlyIntegration();
      return;
    }

    // If both analyses are available
    if (this.planAnalysis && this.photoAnalysis) {
      this.integratedData = this._createFullIntegration();
      return;
    }

    // If only photo analysis (shouldn't happen in normal flow)
    if (!this.planAnalysis && this.photoAnalysis) {
      this.integratedData = this._createPhotoOnlyIntegration();
      return;
    }
  }

  /**
   * Create integration with only plan analysis
   */
  _createPlanOnlyIntegration() {
    const plan = this.planAnalysis;
    
    return {
      dimensions: {
        length: plan.dimensions?.length || null,
        width: plan.dimensions?.width || null,
        height: plan.dimensions?.height || null,
        stories: plan.dimensions?.stories || null,
        area: plan.dimensions?.totalArea || null,
        confidence: plan.quality?.confidence?.dimensions || 0.7
      },
      building: {
        type: plan.building?.type || null,
        function: plan.building?.function || null,
        materialType: plan.structural?.materialType || null,
        confidence: plan.quality?.confidence?.structural || 0.7
      },
      structural: {
        system: plan.structural?.system || null,
        irregularities: plan.structural?.irregularities || {},
        condition: 'unknown', // Can't assess from plans
        confidence: plan.quality?.confidence?.structural || 0.7
      },
      construction: {
        year: plan.construction?.year || null,
        designCode: plan.construction?.designCode || null,
        confidence: plan.quality?.confidence?.overall || 0.7
      },
      quality: {
        sources: ['building_plans'],
        completeness: 0.6, // Plan-only is incomplete
        confidence: {
          dimensions: plan.quality?.confidence?.dimensions || 0.7,
          structural: plan.quality?.confidence?.structural || 0.7,
          materials: plan.quality?.confidence?.materials || 0.6,
          overall: plan.quality?.confidence?.overall || 0.65
        },
        lastUpdated: new Date().toISOString()
      },
      integration: {
        status: 'plan_only',
        hasPhotoVerification: false,
        nextStep: 'photo_analysis_required'
      }
    };
  }

  /**
   * Create full integration with both plan and photo analysis
   */
  _createFullIntegration() {
    const plan = this.planAnalysis;
    const photo = this.photoAnalysis;

    // Resolve dimensional conflicts
    const resolvedDimensions = this._resolveDimensionalData(plan, photo);
    
    // Resolve structural system conflicts
    const resolvedStructural = this._resolveStructuralData(plan, photo);
    
    // Resolve building type and materials
    const resolvedBuilding = this._resolveBuildingData(plan, photo);

    // Calculate overall confidence based on agreement between sources
    const consistency = this._calculateConsistency(plan, photo);
    const overallConfidence = this._calculateOverallConfidence(plan, photo, consistency);

    return {
      dimensions: {
        length: resolvedDimensions.length,
        width: resolvedDimensions.width,
        height: resolvedDimensions.height,
        stories: resolvedDimensions.stories,
        area: resolvedDimensions.area,
        confidence: resolvedDimensions.confidence
      },
      building: {
        type: resolvedBuilding.type,
        function: resolvedBuilding.function,
        materialType: resolvedBuilding.materialType,
        condition: photo.visual?.condition || 'good',
        ageEstimate: photo.visual?.ageEstimate || plan.construction?.year,
        confidence: resolvedBuilding.confidence
      },
      structural: {
        system: resolvedStructural.system,
        irregularities: resolvedStructural.irregularities,
        condition: photo.structural?.structuralCondition || 'good',
        vulnerabilities: photo.seismic?.vulnerabilities || [],
        confidence: resolvedStructural.confidence
      },
      construction: {
        year: photo.visual?.ageEstimate || plan.construction?.year,
        designCode: plan.construction?.designCode,
        wallMaterial: photo.construction?.wallMaterial || plan.structural?.materialType,
        roofType: photo.construction?.roofType,
        confidence: Math.max(
          plan.quality?.confidence?.overall || 0,
          photo.quality?.confidence?.overall || 0
        )
      },
      seismic: {
        riskLevel: photo.combined?.seismicRiskLevel || 'medium',
        vulnerabilities: photo.seismic?.vulnerabilities || [],
        riskFactors: photo.seismic?.riskFactors || [],
        recommendations: [
          ...(plan.analysis?.recommendations || []),
          ...(photo.analysis?.recommendations || [])
        ]
      },
      quality: {
        sources: ['building_plans', 'building_photos'],
        completeness: 0.95, // Both sources provide comprehensive data
        consistency: consistency,
        confidence: overallConfidence,
        lastUpdated: new Date().toISOString()
      },
      integration: {
        status: 'fully_integrated',
        hasPhotoVerification: true,
        planPhotoAgreement: photo.integration?.planPhotoConsistency || 'medium',
        discrepancies: photo.integration?.discrepancies || [],
        keyFindings: [
          ...(plan.analysis?.keyFindings || []),
          ...(photo.analysis?.keyFindings || [])
        ],
        criticalIssues: photo.analysis?.criticalIssues || []
      },
      metadata: {
        planAnalysisDate: plan.metadata?.analysisDate,
        photoAnalysisDate: photo.metadata?.analysisDate,
        integrationDate: new Date().toISOString()
      }
    };
  }

  /**
   * Create integration with only photo analysis (fallback)
   */
  _createPhotoOnlyIntegration() {
    const photo = this.photoAnalysis;
    
    return {
      dimensions: {
        length: photo.visual?.dimensions?.length || photo.combined?.finalDimensions?.length,
        width: photo.visual?.dimensions?.width || photo.combined?.finalDimensions?.width,
        height: photo.visual?.dimensions?.height || photo.combined?.finalDimensions?.height,
        stories: photo.visual?.dimensions?.stories || photo.combined?.finalDimensions?.stories,
        area: photo.combined?.finalDimensions?.area,
        confidence: photo.quality?.confidence?.visual || 0.6
      },
      building: {
        type: photo.combined?.finalBuildingType,
        materialType: photo.combined?.finalMaterialType,
        condition: photo.visual?.condition,
        confidence: photo.quality?.confidence?.overall || 0.6
      },
      structural: {
        system: photo.combined?.finalStructuralSystem,
        irregularities: photo.structural?.irregularities || {},
        condition: photo.structural?.structuralCondition,
        confidence: photo.quality?.confidence?.structural || 0.6
      },
      quality: {
        sources: ['building_photos'],
        completeness: 0.7, // Photo-only is less complete than plan+photo
        confidence: {
          dimensions: photo.quality?.confidence?.visual || 0.6,
          structural: photo.quality?.confidence?.structural || 0.6,
          materials: photo.quality?.confidence?.integration || 0.6,
          overall: photo.quality?.confidence?.overall || 0.6
        },
        lastUpdated: new Date().toISOString()
      },
      integration: {
        status: 'photo_only',
        hasPhotoVerification: true,
        nextStep: 'plan_analysis_recommended'
      }
    };
  }

  /**
   * Resolve dimensional conflicts between plan and photo
   */
  _resolveDimensionalData(plan, photo) {
    const planDim = plan.dimensions || {};
    const photoDim = photo.combined?.finalDimensions || photo.visual?.dimensions || {};
    const planConf = plan.quality?.confidence?.dimensions || 0;
    const photoConf = photo.quality?.confidence?.visual || 0;

    // Use higher confidence source, or plan as fallback for precise measurements
    return {
      length: this._selectBestValue(planDim.length, photoDim.length, planConf, photoConf, planDim.length),
      width: this._selectBestValue(planDim.width, photoDim.width, planConf, photoConf, planDim.width),
      height: this._selectBestValue(planDim.height, photoDim.height, planConf, photoConf, photoDim.height),
      stories: this._selectBestValue(planDim.stories, photoDim.stories, planConf, photoConf, photoDim.stories),
      area: planDim.totalArea || photoDim.area || (planDim.length * planDim.width),
      confidence: Math.max(planConf, photoConf)
    };
  }

  /**
   * Resolve structural system conflicts
   */
  _resolveStructuralData(plan, photo) {
    const planStruct = plan.structural || {};
    const photoStruct = photo.structural || {};
    const planConf = plan.quality?.confidence?.structural || 0;
    const photoConf = photo.quality?.confidence?.structural || 0;

    return {
      system: this._selectBestValue(
        planStruct.system, 
        photo.combined?.finalStructuralSystem, 
        planConf, 
        photoConf, 
        planStruct.system
      ),
      irregularities: {
        ...planStruct.irregularities,
        ...photoStruct.irregularities // Photo can add visual irregularities
      },
      confidence: Math.max(planConf, photoConf)
    };
  }

  /**
   * Resolve building type and material conflicts
   */
  _resolveBuildingData(plan, photo) {
    const planBuild = plan.building || {};
    const planConf = plan.quality?.confidence?.overall || 0;
    const photoConf = photo.quality?.confidence?.overall || 0;

    return {
      type: this._selectBestValue(
        planBuild.type, 
        photo.combined?.finalBuildingType, 
        planConf, 
        photoConf, 
        planBuild.type
      ),
      function: planBuild.function, // Plans typically better for this
      materialType: this._selectBestValue(
        plan.structural?.materialType, 
        photo.combined?.finalMaterialType, 
        planConf, 
        photoConf, 
        photo.combined?.finalMaterialType // Photos better for materials
      ),
      confidence: Math.max(planConf, photoConf)
    };
  }

  /**
   * Select best value based on confidence scores
   */
  _selectBestValue(planValue, photoValue, planConf, photoConf, fallback) {
    if (!planValue && !photoValue) return fallback;
    if (!planValue) return photoValue;
    if (!photoValue) return planValue;
    
    // If confidence scores are close, prefer plan for dimensions, photo for materials/condition
    if (Math.abs(planConf - photoConf) < 0.1) {
      return fallback || planValue;
    }
    
    return planConf > photoConf ? planValue : photoValue;
  }

  /**
   * Calculate consistency between plan and photo analysis
   */
  _calculateConsistency(plan, photo) {
    let matches = 0;
    let total = 0;

    // Check dimensional consistency
    const planDim = plan.dimensions || {};
    const photoDim = photo.combined?.finalDimensions || {};
    
    if (planDim.stories && photoDim.stories) {
      total++;
      if (planDim.stories === photoDim.stories) matches++;
    }

    // Check structural system consistency
    if (plan.structural?.system && photo.combined?.finalStructuralSystem) {
      total++;
      if (plan.structural.system === photo.combined.finalStructuralSystem) matches++;
    }

    // Check building type consistency
    if (plan.building?.type && photo.combined?.finalBuildingType) {
      total++;
      if (plan.building.type === photo.combined.finalBuildingType) matches++;
    }

    return total > 0 ? matches / total : 0.5; // Default to medium consistency if no comparable data
  }

  /**
   * Calculate overall confidence based on source quality and consistency
   */
  _calculateOverallConfidence(plan, photo, consistency) {
    const planConf = plan.quality?.confidence?.overall || 0;
    const photoConf = photo.quality?.confidence?.overall || 0;
    
    // Base confidence is average of sources
    const baseConfidence = (planConf + photoConf) / 2;
    
    // Boost confidence if sources agree, reduce if they conflict
    const consistencyBoost = (consistency - 0.5) * 0.2; // +/- 0.1 max
    
    const finalConfidence = Math.max(0.1, Math.min(1.0, baseConfidence + consistencyBoost));
    
    return {
      dimensions: Math.max(planConf, photoConf * 0.8), // Plans better for dimensions
      structural: Math.max(planConf, photoConf), // Both contribute equally
      materials: Math.max(planConf * 0.8, photoConf), // Photos better for materials
      overall: finalConfidence
    };
  }

  /**
   * Check if integration is complete
   */
  isIntegrationComplete() {
    return this.planAnalysis && this.photoAnalysis;
  }

  /**
   * Get integration status
   */
  getIntegrationStatus() {
    if (this.planAnalysis && this.photoAnalysis) {
      return {
        status: 'complete',
        hasPlans: true,
        hasPhotos: true,
        completeness: 0.95
      };
    } else if (this.planAnalysis) {
      return {
        status: 'partial',
        hasPlans: true,
        hasPhotos: false,
        completeness: 0.6,
        nextStep: 'photo_analysis_required'
      };
    } else if (this.photoAnalysis) {
      return {
        status: 'partial',
        hasPlans: false,
        hasPhotos: true,
        completeness: 0.7,
        nextStep: 'plan_analysis_recommended'
      };
    } else {
      return {
        status: 'empty',
        hasPlans: false,
        hasPhotos: false,
        completeness: 0
      };
    }
  }

  /**
   * Reset all data
   */
  reset() {
    this.planAnalysis = null;
    this.photoAnalysis = null;
    this.integratedData = null;
  }
}

// Export singleton instance
export const dataIntegrationManager = new DataIntegrationManager();
export default DataIntegrationManager;