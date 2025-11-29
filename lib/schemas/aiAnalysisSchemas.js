/**
 * Zod Schemas for AI Analysis Responses
 * Used with Claude Structured Outputs for guaranteed schema compliance
 */

import { z } from 'zod';

// ============================================================================
// Shared Enum Schemas
// ============================================================================

export const ConditionEnum = z.enum(['excellent', 'good', 'fair', 'poor', 'unknown']);
export const ConfidenceEnum = z.enum(['high', 'medium', 'low']);
export const RegularityEnum = z.enum(['regular', 'irregular', 'unknown']);
export const DetectionEnum = z.enum(['detected', 'not detected', 'unknown']);
export const ProximityEnum = z.enum(['close', 'moderate', 'far', 'none']);
export const VisibilityEnum = z.enum(['visible', 'not visible', 'unknown']);

// ============================================================================
// Building Analysis Schema (for analyze-image building type)
// ============================================================================

export const BuildingAnalysisSchema = z.object({
  // AI-generated title and description for the assessment
  suggestedTitle: z.string().describe('A concise, descriptive title for this building assessment (e.g., "3-Story RC Residential in Antalya" or "Historic Masonry Office Building")'),
  suggestedDescription: z.string().describe('A brief 1-2 sentence description summarizing the building type and key characteristics'),

  buildingLength: z.number().nullable().describe('Estimated length in meters'),
  buildingWidth: z.number().nullable().describe('Estimated width in meters'),
  buildingHeight: z.number().nullable().describe('Estimated height in meters'),
  numberOfStories: z.number().int().nullable().describe('Number of floors'),
  structuralSystem: z.string().describe('Type of structural system (RC frame, steel, masonry, etc.)'),
  constructionPeriod: z.string().describe('Estimated construction decade'),
  materialCondition: ConditionEnum.describe('Overall material condition'),
  irregularities: z.object({
    plan: RegularityEnum.describe('Plan regularity'),
    vertical: RegularityEnum.describe('Vertical regularity'),
    mass: RegularityEnum.describe('Mass regularity'),
  }),
  riskFactors: z.object({
    softStory: DetectionEnum.describe('Soft story detection'),
    heavyOverhang: DetectionEnum.describe('Heavy overhang detection'),
    adjacentBuilding: ProximityEnum.describe('Adjacent building proximity'),
    foundation: VisibilityEnum.describe('Foundation visibility'),
  }),
  specialFeatures: z.object({
    balconies: z.string().optional().describe('Description of balconies'),
    cantilevers: z.string().optional().describe('Description of cantilevers'),
    setbacks: z.string().optional().describe('Description of setbacks'),
  }).optional(),
  confidence: ConfidenceEnum.describe('Overall analysis confidence'),
  recommendations: z.array(z.string()).describe('Safety recommendations'),
});

// ============================================================================
// Floor Plan Analysis Schema
// ============================================================================

export const FloorPlanAnalysisSchema = z.object({
  buildingLength: z.number().nullable().describe('Building length in meters'),
  buildingWidth: z.number().nullable().describe('Building width in meters'),
  numberOfStories: z.number().int().nullable().describe('Number of floors'),
  columnSpacing: z.number().nullable().describe('Typical column spacing in meters'),
  structuralSystem: z.string().describe('Type of structural system'),
  foundationType: z.string().describe('Foundation type'),
  wallThickness: z.number().nullable().describe('Wall thickness in cm'),
  roomCount: z.number().int().nullable().describe('Number of rooms'),
  roomLayout: z.string().describe('Room layout description'),
  confidence: ConfidenceEnum.describe('Analysis confidence'),
  extractedElements: z.array(z.string()).describe('List of extracted structural elements'),
  structuralNotes: z.array(z.string()).optional().describe('Additional structural notes'),
});

// ============================================================================
// Satellite View Analysis Schema
// ============================================================================

export const SatelliteAnalysisSchema = z.object({
  estimatedLength: z.number().nullable().describe('Estimated building length'),
  estimatedWidth: z.number().nullable().describe('Estimated building width'),
  estimatedStories: z.number().int().nullable().describe('Estimated number of stories'),
  buildingShape: z.enum(['rectangular', 'L-shaped', 'U-shaped', 'irregular', 'complex']).describe('Building footprint shape'),
  roofType: z.string().describe('Roof type description'),
  roofCondition: ConditionEnum.optional().describe('Roof condition'),
  adjacentBuildings: ProximityEnum.describe('Adjacent buildings proximity'),
  siteConditions: z.string().describe('Site conditions description'),
  footprintArea: z.number().nullable().describe('Building footprint area in sq meters'),
  confidence: ConfidenceEnum.describe('Analysis confidence'),
});

// ============================================================================
// Building Photos Analysis Schema (comprehensive)
// ============================================================================

export const BuildingPhotosAnalysisSchema = z.object({
  // AI-generated title and description for the assessment
  suggestedTitle: z.string().describe('A concise, descriptive title for this building assessment (e.g., "3-Story RC Residential in Antalya" or "Historic Masonry Office Building")'),
  suggestedDescription: z.string().describe('A brief 1-2 sentence description summarizing the building and key findings'),

  visual: z.object({
    dimensions: z.object({
      length: z.number().nullable().describe('Estimated length in meters'),
      width: z.number().nullable().describe('Estimated width in meters'),
      height: z.number().nullable().describe('Estimated height in meters'),
      stories: z.number().int().nullable().describe('Number of stories'),
    }),
    condition: ConditionEnum.describe('Overall visual condition'),
    ageEstimate: z.number().nullable().describe('Estimated building age in years'),
    maintenanceLevel: ConditionEnum.describe('Maintenance level'),
  }),
  structural: z.object({
    system: z.string().describe('Structural system type'),
    materialType: z.string().describe('Primary material type'),
    structuralCondition: z.string().describe('Structural condition description'),
    visibleDamage: z.array(z.string()).describe('List of visible damage'),
    irregularities: z.object({
      plan: RegularityEnum.describe('Plan regularity'),
      vertical: RegularityEnum.describe('Vertical regularity'),
      softStory: z.boolean().describe('Soft story present'),
      description: z.string().describe('Irregularity description'),
    }),
  }),
  construction: z.object({
    wallMaterial: z.string().describe('Wall material'),
    roofType: z.string().describe('Roof type'),
    windowType: z.string().describe('Window type'),
    foundationVisible: z.boolean().describe('Foundation visibility'),
  }),
  seismic: z.object({
    vulnerabilities: z.array(z.string()).describe('Seismic vulnerabilities'),
    riskFactors: z.array(z.string()).describe('Risk factors'),
    recommendations: z.array(z.string()).describe('Seismic recommendations'),
  }),
  integration: z.object({
    planPhotoConsistency: ConfidenceEnum.describe('Consistency with plan analysis'),
    discrepancies: z.array(z.string()).describe('Discrepancies found'),
    combinedConfidence: z.object({
      dimensions: z.number().min(0).max(1).describe('Dimensions confidence'),
      structural: z.number().min(0).max(1).describe('Structural confidence'),
      materials: z.number().min(0).max(1).describe('Materials confidence'),
      overall: z.number().min(0).max(1).describe('Overall confidence'),
    }),
  }),
  combined: z.object({
    finalDimensions: z.object({
      length: z.number().nullable(),
      width: z.number().nullable(),
      height: z.number().nullable(),
      stories: z.number().int().nullable(),
      area: z.number().nullable(),
    }),
    finalStructuralSystem: z.string(),
    finalBuildingType: z.string(),
    finalMaterialType: z.string(),
    seismicRiskLevel: z.enum(['low', 'medium', 'high', 'very_high']),
  }),
  quality: z.object({
    photoQuality: ConditionEnum.describe('Photo quality'),
    analysisCompleteness: z.number().min(0).max(100).describe('Analysis completeness percentage'),
    confidence: z.object({
      visual: z.number().min(0).max(1),
      structural: z.number().min(0).max(1),
      integration: z.number().min(0).max(1),
      overall: z.number().min(0).max(1),
    }),
  }),
  analysis: z.object({
    keyFindings: z.array(z.string()).describe('Key findings'),
    criticalIssues: z.array(z.string()).describe('Critical issues'),
    recommendations: z.array(z.string()).describe('Recommendations'),
  }),
});

// ============================================================================
// Building Plans Analysis Schema
// ============================================================================

export const BuildingPlansAnalysisSchema = z.object({
  dimensions: z.object({
    length: z.number().nullable().describe('Building length in meters'),
    width: z.number().nullable().describe('Building width in meters'),
    height: z.number().nullable().describe('Building height in meters'),
    stories: z.number().int().nullable().describe('Number of stories'),
    totalArea: z.number().nullable().describe('Total building area'),
    floorArea: z.number().nullable().describe('Floor area per level'),
  }),
  structural: z.object({
    system: z.string().describe('Structural system type'),
    materialType: z.string().describe('Primary material type'),
    wallThickness: z.number().nullable().describe('Wall thickness in cm'),
    foundationType: z.string().describe('Foundation type'),
    irregularities: z.object({
      plan: RegularityEnum.describe('Plan regularity'),
      planDescription: z.string().describe('Plan irregularity description'),
      vertical: RegularityEnum.describe('Vertical regularity'),
    }),
  }),
  building: z.object({
    type: z.string().describe('Building type'),
    function: z.string().describe('Building function'),
    units: z.number().int().nullable().describe('Number of units'),
    rooms: z.number().int().nullable().describe('Number of rooms'),
    layout: z.string().describe('Layout description'),
  }),
  construction: z.object({
    year: z.number().nullable().describe('Construction year'),
    designCode: z.string().describe('Design code reference'),
    specialFeatures: z.array(z.string()).describe('Special features'),
  }),
  quality: z.object({
    planQuality: ConditionEnum.describe('Plan quality'),
    completeness: z.number().min(0).max(100).describe('Completeness percentage'),
    confidence: z.object({
      dimensions: z.number().min(0).max(1).describe('Dimensions confidence'),
      structural: z.number().min(0).max(1).describe('Structural confidence'),
      materials: z.number().min(0).max(1).describe('Materials confidence'),
      overall: z.number().min(0).max(1).describe('Overall confidence'),
    }),
  }),
  analysis: z.object({
    keyFindings: z.array(z.string()).describe('Key findings'),
    assumptions: z.array(z.string()).describe('Assumptions made'),
    recommendations: z.array(z.string()).describe('Recommendations'),
  }),
});

// ============================================================================
// Schema Map for easy lookup
// ============================================================================

export const analysisSchemas = {
  building: BuildingAnalysisSchema,
  floorPlan: FloorPlanAnalysisSchema,
  architecturalPlan: FloorPlanAnalysisSchema, // Same schema as floorPlan
  satellite: SatelliteAnalysisSchema,
  buildingPhotos: BuildingPhotosAnalysisSchema,
  buildingPlans: BuildingPlansAnalysisSchema,
};
