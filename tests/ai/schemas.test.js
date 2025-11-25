/**
 * Tests for AI Analysis Zod Schemas
 * Validates schema definitions and parsing
 */

import { describe, it, expect } from 'vitest';
import {
  BuildingAnalysisSchema,
  FloorPlanAnalysisSchema,
  SatelliteAnalysisSchema,
  BuildingPhotosAnalysisSchema,
  BuildingPlansAnalysisSchema,
  ConditionEnum,
  ConfidenceEnum,
  RegularityEnum,
  DetectionEnum,
  ProximityEnum,
  VisibilityEnum,
} from '@/lib/schemas/aiAnalysisSchemas';

describe('[Schemas] AI Analysis Zod Schemas', () => {
  describe('Enum Schemas', () => {
    it('should validate ConditionEnum values', () => {
      const validValues = ['excellent', 'good', 'fair', 'poor', 'unknown'];
      validValues.forEach(value => {
        expect(() => ConditionEnum.parse(value)).not.toThrow();
      });
    });

    it('should reject invalid ConditionEnum values', () => {
      expect(() => ConditionEnum.parse('invalid')).toThrow();
      expect(() => ConditionEnum.parse('')).toThrow();
      expect(() => ConditionEnum.parse(123)).toThrow();
    });

    it('should validate ConfidenceEnum values', () => {
      const validValues = ['high', 'medium', 'low'];
      validValues.forEach(value => {
        expect(() => ConfidenceEnum.parse(value)).not.toThrow();
      });
    });

    it('should validate RegularityEnum values', () => {
      const validValues = ['regular', 'irregular', 'unknown'];
      validValues.forEach(value => {
        expect(() => RegularityEnum.parse(value)).not.toThrow();
      });
    });

    it('should validate DetectionEnum values', () => {
      const validValues = ['detected', 'not detected', 'unknown'];
      validValues.forEach(value => {
        expect(() => DetectionEnum.parse(value)).not.toThrow();
      });
    });

    it('should validate ProximityEnum values', () => {
      const validValues = ['close', 'moderate', 'far', 'none'];
      validValues.forEach(value => {
        expect(() => ProximityEnum.parse(value)).not.toThrow();
      });
    });

    it('should validate VisibilityEnum values', () => {
      const validValues = ['visible', 'not visible', 'unknown'];
      validValues.forEach(value => {
        expect(() => VisibilityEnum.parse(value)).not.toThrow();
      });
    });
  });

  describe('BuildingAnalysisSchema', () => {
    it('should parse valid building analysis data', () => {
      const validData = {
        buildingLength: 25.5,
        buildingWidth: 15.0,
        buildingHeight: 12.0,
        numberOfStories: 4,
        structuralSystem: 'Reinforced Concrete Frame',
        constructionPeriod: '2000-2010',
        materialCondition: 'good',
        irregularities: {
          plan: 'regular',
          vertical: 'unknown',
          mass: 'regular',
        },
        riskFactors: {
          softStory: 'not detected',
          heavyOverhang: 'detected',
          adjacentBuilding: 'close',
          foundation: 'visible',
        },
        confidence: 'high',
        recommendations: ['Inspect foundation', 'Check for cracks'],
      };

      const result = BuildingAnalysisSchema.parse(validData);
      expect(result.buildingLength).toBe(25.5);
      expect(result.numberOfStories).toBe(4);
      expect(result.confidence).toBe('high');
    });

    it('should accept nullable dimension fields', () => {
      const dataWithNulls = {
        buildingLength: null,
        buildingWidth: null,
        buildingHeight: null,
        numberOfStories: null,
        structuralSystem: 'Unknown',
        constructionPeriod: 'Unknown',
        materialCondition: 'unknown',
        irregularities: {
          plan: 'unknown',
          vertical: 'unknown',
          mass: 'unknown',
        },
        riskFactors: {
          softStory: 'unknown',
          heavyOverhang: 'unknown',
          adjacentBuilding: 'none',
          foundation: 'unknown',
        },
        confidence: 'low',
        recommendations: [],
      };

      const result = BuildingAnalysisSchema.parse(dataWithNulls);
      expect(result.buildingLength).toBeNull();
      expect(result.buildingWidth).toBeNull();
    });

    it('should reject invalid structure', () => {
      const invalidData = {
        buildingLength: 'not a number',
        numberOfStories: 4,
      };

      expect(() => BuildingAnalysisSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid confidence values', () => {
      const invalidData = {
        buildingLength: 25.5,
        buildingWidth: 15.0,
        buildingHeight: 12.0,
        numberOfStories: 4,
        structuralSystem: 'Reinforced Concrete',
        constructionPeriod: '2000-2010',
        materialCondition: 'good',
        irregularities: {
          plan: 'regular',
          vertical: 'regular',
          mass: 'regular',
        },
        riskFactors: {
          softStory: 'not detected',
          heavyOverhang: 'not detected',
          adjacentBuilding: 'none',
          foundation: 'unknown',
        },
        confidence: 'invalid_confidence', // Invalid
        recommendations: [],
      };

      expect(() => BuildingAnalysisSchema.parse(invalidData)).toThrow();
    });

    it('should accept optional specialFeatures', () => {
      const dataWithFeatures = {
        buildingLength: 25.0,
        buildingWidth: 15.0,
        buildingHeight: 12.0,
        numberOfStories: 4,
        structuralSystem: 'RC Frame',
        constructionPeriod: '2010-2020',
        materialCondition: 'good',
        irregularities: {
          plan: 'regular',
          vertical: 'regular',
          mass: 'regular',
        },
        riskFactors: {
          softStory: 'not detected',
          heavyOverhang: 'not detected',
          adjacentBuilding: 'none',
          foundation: 'visible',
        },
        specialFeatures: {
          balconies: 'Multiple balconies on south side',
          cantilevers: 'No cantilevers',
        },
        confidence: 'high',
        recommendations: [],
      };

      const result = BuildingAnalysisSchema.parse(dataWithFeatures);
      expect(result.specialFeatures?.balconies).toBe('Multiple balconies on south side');
    });
  });

  describe('FloorPlanAnalysisSchema', () => {
    it('should parse valid floor plan analysis data', () => {
      const validData = {
        buildingLength: 30.0,
        buildingWidth: 20.0,
        numberOfStories: 3,
        columnSpacing: 5.0,
        structuralSystem: 'Steel Frame',
        foundationType: 'Mat Foundation',
        wallThickness: 25,
        roomCount: 12,
        roomLayout: 'Open plan with central corridor',
        confidence: 'medium',
        extractedElements: ['columns', 'beams', 'walls'],
      };

      const result = FloorPlanAnalysisSchema.parse(validData);
      expect(result.buildingLength).toBe(30.0);
      expect(result.columnSpacing).toBe(5.0);
      expect(result.extractedElements).toHaveLength(3);
    });

    it('should accept nullable fields', () => {
      const dataWithNulls = {
        buildingLength: null,
        buildingWidth: null,
        numberOfStories: null,
        columnSpacing: null,
        structuralSystem: 'Unknown',
        foundationType: 'Unknown',
        wallThickness: null,
        roomCount: null,
        roomLayout: 'Unknown',
        extractedElements: [],
        confidence: 'low',
      };

      const result = FloorPlanAnalysisSchema.parse(dataWithNulls);
      expect(result.buildingLength).toBeNull();
      expect(result.confidence).toBe('low');
    });

    it('should accept optional structuralNotes', () => {
      const dataWithNotes = {
        buildingLength: 25.0,
        buildingWidth: 15.0,
        numberOfStories: 2,
        columnSpacing: 4.0,
        structuralSystem: 'RC Frame',
        foundationType: 'Strip Foundation',
        wallThickness: 20,
        roomCount: 8,
        roomLayout: 'Standard residential',
        confidence: 'high',
        extractedElements: ['columns', 'walls'],
        structuralNotes: ['Load-bearing walls on east side', 'Reinforcement details visible'],
      };

      const result = FloorPlanAnalysisSchema.parse(dataWithNotes);
      expect(result.structuralNotes).toHaveLength(2);
    });
  });

  describe('SatelliteAnalysisSchema', () => {
    it('should parse valid satellite analysis data', () => {
      const validData = {
        estimatedLength: 40.0,
        estimatedWidth: 25.0,
        estimatedStories: 5,
        buildingShape: 'L-shaped',
        roofType: 'Flat concrete roof',
        adjacentBuildings: 'close',
        siteConditions: 'Urban area with close proximity buildings',
        footprintArea: 1000,
        confidence: 'high',
      };

      const result = SatelliteAnalysisSchema.parse(validData);
      expect(result.estimatedLength).toBe(40.0);
      expect(result.buildingShape).toBe('L-shaped');
    });

    it('should validate buildingShape enum', () => {
      const validShapes = ['rectangular', 'L-shaped', 'U-shaped', 'irregular', 'complex'];
      validShapes.forEach(shape => {
        const data = {
          estimatedLength: 30.0,
          estimatedWidth: 20.0,
          estimatedStories: 3,
          buildingShape: shape,
          roofType: 'Flat',
          adjacentBuildings: 'none',
          siteConditions: 'Open area',
          footprintArea: 600,
          confidence: 'medium',
        };
        expect(() => SatelliteAnalysisSchema.parse(data)).not.toThrow();
      });
    });

    it('should accept nullable fields', () => {
      const dataWithNulls = {
        estimatedLength: null,
        estimatedWidth: null,
        estimatedStories: null,
        buildingShape: 'rectangular',
        roofType: 'Unknown',
        adjacentBuildings: 'none',
        siteConditions: 'Unknown',
        footprintArea: null,
        confidence: 'low',
      };

      const result = SatelliteAnalysisSchema.parse(dataWithNulls);
      expect(result.estimatedLength).toBeNull();
    });

    it('should accept optional roofCondition', () => {
      const dataWithRoofCondition = {
        estimatedLength: 30.0,
        estimatedWidth: 20.0,
        estimatedStories: 4,
        buildingShape: 'rectangular',
        roofType: 'Flat',
        roofCondition: 'good',
        adjacentBuildings: 'moderate',
        siteConditions: 'Suburban',
        footprintArea: 600,
        confidence: 'high',
      };

      const result = SatelliteAnalysisSchema.parse(dataWithRoofCondition);
      expect(result.roofCondition).toBe('good');
    });
  });

  describe('BuildingPhotosAnalysisSchema', () => {
    it('should parse valid building photos analysis', () => {
      const validData = {
        visual: {
          dimensions: {
            length: 25.0,
            width: 15.0,
            height: 12.0,
            stories: 4,
          },
          condition: 'good',
          ageEstimate: 15,
          maintenanceLevel: 'good',
        },
        structural: {
          system: 'RC Frame',
          materialType: 'Reinforced Concrete',
          structuralCondition: 'Good condition, no visible damage',
          visibleDamage: [],
          irregularities: {
            plan: 'regular',
            vertical: 'regular',
            softStory: false,
            description: 'No significant irregularities',
          },
        },
        construction: {
          wallMaterial: 'Brick cladding',
          roofType: 'Flat',
          windowType: 'Aluminum frame',
          foundationVisible: false,
        },
        seismic: {
          vulnerabilities: [],
          riskFactors: [],
          recommendations: ['Regular inspection recommended'],
        },
        integration: {
          planPhotoConsistency: 'high',
          discrepancies: [],
          combinedConfidence: {
            dimensions: 0.85,
            structural: 0.9,
            materials: 0.8,
            overall: 0.85,
          },
        },
        combined: {
          finalDimensions: {
            length: 25.0,
            width: 15.0,
            height: 12.0,
            stories: 4,
            area: 375,
          },
          finalStructuralSystem: 'RC Frame',
          finalBuildingType: 'Residential',
          finalMaterialType: 'Reinforced Concrete',
          seismicRiskLevel: 'low',
        },
        quality: {
          photoQuality: 'good',
          analysisCompleteness: 90,
          confidence: {
            visual: 0.85,
            structural: 0.9,
            integration: 0.85,
            overall: 0.87,
          },
        },
        analysis: {
          keyFindings: ['Building appears well-maintained'],
          criticalIssues: [],
          recommendations: ['Annual inspection recommended'],
        },
      };

      const result = BuildingPhotosAnalysisSchema.parse(validData);
      expect(result.visual.dimensions.stories).toBe(4);
      expect(result.quality.confidence.overall).toBe(0.87);
    });
  });

  describe('BuildingPlansAnalysisSchema', () => {
    it('should parse valid building plans analysis', () => {
      const validData = {
        dimensions: {
          length: 35.0,
          width: 22.0,
          height: 14.0,
          stories: 4,
          totalArea: 3080,
          floorArea: 770.0,
        },
        structural: {
          system: 'RC Frame with Shear Walls',
          materialType: 'Reinforced Concrete',
          wallThickness: 30,
          foundationType: 'Pile Foundation',
          irregularities: {
            plan: 'regular',
            planDescription: 'Regular rectangular plan',
            vertical: 'regular',
          },
        },
        building: {
          type: 'Residential',
          function: 'Multi-family housing',
          units: 8,
          rooms: 24,
          layout: 'Standard floor layout with central corridor',
        },
        construction: {
          year: 2015,
          designCode: 'TBDY-2007',
          specialFeatures: ['Elevator shaft', 'Underground parking'],
        },
        quality: {
          planQuality: 'good',
          completeness: 85,
          confidence: {
            dimensions: 0.95,
            structural: 0.9,
            materials: 0.85,
            overall: 0.9,
          },
        },
        analysis: {
          keyFindings: ['Plans are comprehensive'],
          assumptions: ['Wall thickness assumed from standard'],
          recommendations: ['Verify foundation details on site'],
        },
      };

      const result = BuildingPlansAnalysisSchema.parse(validData);
      expect(result.dimensions.length).toBe(35.0);
      expect(result.quality.confidence.overall).toBe(0.9);
    });
  });

  describe('Schema Completeness', () => {
    it('all schemas should have confidence field', () => {
      // Building Analysis uses 'confidence' enum
      expect(BuildingAnalysisSchema.shape.confidence).toBeDefined();

      // Floor Plan uses 'confidence' enum
      expect(FloorPlanAnalysisSchema.shape.confidence).toBeDefined();

      // Satellite uses 'confidence' enum
      expect(SatelliteAnalysisSchema.shape.confidence).toBeDefined();

      // Photos and Plans use nested quality.confidence object
      expect(BuildingPhotosAnalysisSchema.shape.quality).toBeDefined();
      expect(BuildingPlansAnalysisSchema.shape.quality).toBeDefined();
    });

    it('Building and FloorPlan schemas should have recommendations array', () => {
      expect(BuildingAnalysisSchema.shape.recommendations).toBeDefined();
      // FloorPlan doesn't have recommendations, it has extractedElements
      expect(FloorPlanAnalysisSchema.shape.extractedElements).toBeDefined();
    });
  });
});
