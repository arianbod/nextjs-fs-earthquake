import { describe, it, expect, beforeEach, vi } from 'vitest';
import SafetyCalculator from '../SafetyCalculator';
import { CALCULATION_CONFIG } from '@/config/earthquakeParameters';

describe('SafetyCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new SafetyCalculator();
    vi.clearAllMocks();
  });

  describe('calculateSafety', () => {
    it('should calculate safety score with valid input', () => {
      const userInput = {
        structuralSystem: 'C1',
        verticalIrregularityHigh: false,
        verticalIrregularityModerate: false,
        planIrregularity: false,
        yearOfConstruction: 2015,
        typeOfSoil: 'ZC',
        typeOfEarthquake: 'Zone 2',
        designRegulation: '2007-2018',
        numberOfStories: 5,
      };

      const result = calculator.calculateSafety(userInput);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('rawScore');
      expect(result).toHaveProperty('normalizedScore');
      expect(result).toHaveProperty('buildingType');
      expect(result).toHaveProperty('interpretation');
      expect(result).toHaveProperty('structuralIntegrity');
      expect(result).toHaveProperty('earthquakeImpact');
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('performanceLevels');
      expect(result).toHaveProperty('maxSafeRichter');
      expect(result).toHaveProperty('buildingClassification');
      expect(result).toHaveProperty('scoreBreakdown');
    });

    it('should use default values for missing inputs', () => {
      const userInput = {};

      const result = calculator.calculateSafety(userInput);

      expect(result).toBeDefined();
      expect(result.buildingType).toBe(CALCULATION_CONFIG.defaults.buildingType);
      expect(parseFloat(result.overallScore)).toBeGreaterThan(0);
    });

    it('should apply penalties for irregularities', () => {
      const regularInput = {
        structuralSystem: 'C1',
        verticalIrregularityHigh: false,
        verticalIrregularityModerate: false,
        planIrregularity: false,
        yearOfConstruction: 2015,
        typeOfSoil: 'ZC',
        typeOfEarthquake: 'Zone 2',
        designRegulation: '2007-2018',
        numberOfStories: 5,
      };

      const irregularInput = {
        ...regularInput,
        verticalIrregularityHigh: true,
        planIrregularity: true,
      };

      const regularResult = calculator.calculateSafety(regularInput);
      const irregularResult = calculator.calculateSafety(irregularInput);

      expect(parseFloat(irregularResult.overallScore)).toBeLessThan(
        parseFloat(regularResult.overallScore)
      );
      expect(irregularResult.scoreBreakdown.irregularityPenalty).toBeLessThan(0);
    });

    it('should calculate higher scores for newer buildings', () => {
      const oldBuilding = {
        structuralSystem: 'C1',
        yearOfConstruction: 1970,
        typeOfSoil: 'ZC',
        typeOfEarthquake: 'Zone 2',
        designRegulation: 'Before 1975',
        numberOfStories: 5,
      };

      const newBuilding = {
        ...oldBuilding,
        yearOfConstruction: 2020,
        designRegulation: 'After 2018 (TBDY)',
      };

      const oldResult = calculator.calculateSafety(oldBuilding);
      const newResult = calculator.calculateSafety(newBuilding);

      expect(parseFloat(newResult.overallScore)).toBeGreaterThan(
        parseFloat(oldResult.overallScore)
      );
    });

    it('should calculate higher scores for better soil types', () => {
      const badSoil = {
        structuralSystem: 'C1',
        yearOfConstruction: 2015,
        typeOfSoil: 'ZE', // Worst soil
        typeOfEarthquake: 'Zone 2',
        designRegulation: '2007-2018',
        numberOfStories: 5,
      };

      const goodSoil = {
        ...badSoil,
        typeOfSoil: 'ZA', // Best soil (rock)
      };

      const badResult = calculator.calculateSafety(badSoil);
      const goodResult = calculator.calculateSafety(goodSoil);

      expect(parseFloat(goodResult.overallScore)).toBeGreaterThan(
        parseFloat(badResult.overallScore)
      );
      expect(goodResult.scoreBreakdown.soilImpact).toBeGreaterThan(
        badResult.scoreBreakdown.soilImpact
      );
    });

    it('should calculate higher scores for lower seismic zones', () => {
      const highRiskZone = {
        structuralSystem: 'C1',
        yearOfConstruction: 2015,
        typeOfSoil: 'ZC',
        typeOfEarthquake: 'Zone 4', // Very high seismic activity
        designRegulation: '2007-2018',
        numberOfStories: 5,
      };

      const lowRiskZone = {
        ...highRiskZone,
        typeOfEarthquake: 'Zone 1', // Low seismic activity
      };

      const highResult = calculator.calculateSafety(highRiskZone);
      const lowResult = calculator.calculateSafety(lowRiskZone);

      expect(parseFloat(lowResult.overallScore)).toBeGreaterThan(
        parseFloat(highResult.overallScore)
      );
    });

    it('should penalize very tall buildings', () => {
      const lowRise = {
        structuralSystem: 'C1',
        yearOfConstruction: 2015,
        typeOfSoil: 'ZC',
        typeOfEarthquake: 'Zone 2',
        designRegulation: '2007-2018',
        numberOfStories: 3,
      };

      const highRise = {
        ...lowRise,
        numberOfStories: 20,
      };

      const lowResult = calculator.calculateSafety(lowRise);
      const highResult = calculator.calculateSafety(highRise);

      expect(parseFloat(lowResult.overallScore)).toBeGreaterThan(
        parseFloat(highResult.overallScore)
      );
      expect(lowResult.scoreBreakdown.storyImpact).toBeGreaterThan(
        highResult.scoreBreakdown.storyImpact
      );
    });

    it('should enforce score bounds (0-100)', () => {
      const extremeBad = {
        structuralSystem: 'URM', // Unreinforced masonry (worst)
        verticalIrregularityHigh: true,
        verticalIrregularityModerate: true,
        planIrregularity: true,
        yearOfConstruction: 1950,
        typeOfSoil: 'ZE',
        typeOfEarthquake: 'Zone 4',
        designRegulation: 'Before 1975',
        numberOfStories: 25,
      };

      const extremeGood = {
        structuralSystem: 'C1', // Best
        verticalIrregularityHigh: false,
        verticalIrregularityModerate: false,
        planIrregularity: false,
        yearOfConstruction: 2023,
        typeOfSoil: 'ZA',
        typeOfEarthquake: 'Zone 1',
        designRegulation: 'After 2018 (TBDY)',
        numberOfStories: 2,
      };

      const badResult = calculator.calculateSafety(extremeBad);
      const goodResult = calculator.calculateSafety(extremeGood);

      expect(parseFloat(badResult.overallScore)).toBeGreaterThanOrEqual(0);
      expect(parseFloat(badResult.overallScore)).toBeLessThanOrEqual(100);
      expect(parseFloat(goodResult.overallScore)).toBeGreaterThanOrEqual(0);
      expect(parseFloat(goodResult.overallScore)).toBeLessThanOrEqual(100);
    });

    it('should include detailed score breakdown', () => {
      const userInput = {
        structuralSystem: 'C1',
        yearOfConstruction: 2015,
        typeOfSoil: 'ZC',
        typeOfEarthquake: 'Zone 2',
        designRegulation: '2007-2018',
        numberOfStories: 5,
      };

      const result = calculator.calculateSafety(userInput);

      expect(result.scoreBreakdown).toBeDefined();
      expect(result.scoreBreakdown).toHaveProperty('baseScore');
      expect(result.scoreBreakdown).toHaveProperty('regulationImpact');
      expect(result.scoreBreakdown).toHaveProperty('soilImpact');
      expect(result.scoreBreakdown).toHaveProperty('zoneImpact');
      expect(result.scoreBreakdown).toHaveProperty('ageImpact');
      expect(result.scoreBreakdown).toHaveProperty('storyImpact');
      expect(result.scoreBreakdown).toHaveProperty('irregularityPenalty');
    });

    it('should calculate structural integrity correctly', () => {
      const userInput = {
        structuralSystem: 'C1',
        yearOfConstruction: 2015,
        typeOfSoil: 'ZC',
        typeOfEarthquake: 'Zone 2',
        designRegulation: '2007-2018',
        numberOfStories: 5,
      };

      const result = calculator.calculateSafety(userInput);

      expect(result.structuralIntegrity).toBeDefined();
      expect(parseFloat(result.structuralIntegrity)).toBeGreaterThanOrEqual(0);
    });

    it('should determine correct performance levels', () => {
      const excellentInput = {
        structuralSystem: 'C1',
        yearOfConstruction: 2023,
        typeOfSoil: 'ZA',
        typeOfEarthquake: 'Zone 1',
        designRegulation: 'After 2018 (TBDY)',
        numberOfStories: 3,
      };

      const result = calculator.calculateSafety(excellentInput);

      expect(result.performanceLevels).toBeDefined();
      expect(['excellent', 'good', 'fair', 'poor', 'critical']).toContain(
        result.performanceLevels
      );
    });

    it('should calculate max safe Richter magnitude', () => {
      const userInput = {
        structuralSystem: 'C1',
        yearOfConstruction: 2015,
        typeOfSoil: 'ZC',
        typeOfEarthquake: 'Zone 2',
        designRegulation: '2007-2018',
        numberOfStories: 5,
      };

      const result = calculator.calculateSafety(userInput);

      expect(result.maxSafeRichter).toBeDefined();
      const richter = parseFloat(result.maxSafeRichter);
      expect(richter).toBeGreaterThanOrEqual(4.0);
      expect(richter).toBeLessThanOrEqual(8.0);
    });

    it('should include building classification', () => {
      const userInput = {
        structuralSystem: 'C1',
        yearOfConstruction: 2015,
        typeOfSoil: 'ZC',
        typeOfEarthquake: 'Zone 2',
        designRegulation: '2007-2018',
        numberOfStories: 5,
      };

      const result = calculator.calculateSafety(userInput);

      expect(result.buildingClassification).toBeDefined();
      expect(result.buildingClassification).toHaveProperty('category');
      expect(result.buildingClassification).toHaveProperty('description');
      expect(result.buildingClassification).toHaveProperty('color');
      expect(result.buildingClassification).toHaveProperty('icon');
    });
  });

  describe('calculateRichterPerformance', () => {
    it('should return performance data for different Richter scales', () => {
      const data = calculator.calculateRichterPerformance();

      expect(data).toBeInstanceOf(Array);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should include all required properties', () => {
      const data = calculator.calculateRichterPerformance();

      data.forEach((item) => {
        expect(item).toHaveProperty('richter');
        expect(item).toHaveProperty('performance');
        expect(item).toHaveProperty('status');
      });
    });

    it('should have decreasing performance for higher magnitudes', () => {
      const data = calculator.calculateRichterPerformance();

      for (let i = 1; i < data.length; i++) {
        expect(data[i].performance).toBeLessThanOrEqual(data[i - 1].performance);
      }
    });

    it('should categorize magnitudes correctly', () => {
      const data = calculator.calculateRichterPerformance();

      data.forEach((item) => {
        const richter = parseFloat(item.richter);

        if (richter < 5.5) {
          expect(item.status).toBe('Safe');
        } else if (richter <= 6.5) {
          expect(item.status).toBe('Caution');
        } else {
          expect(item.status).toBe('Danger');
        }
      });
    });

    it('should cover range from 4.0 to 8.0', () => {
      const data = calculator.calculateRichterPerformance();
      const richterValues = data.map((item) => parseFloat(item.richter));

      expect(Math.min(...richterValues)).toBe(4.0);
      expect(Math.max(...richterValues)).toBe(8.0);
    });

    it('should have performance values between 0 and 100', () => {
      const data = calculator.calculateRichterPerformance();

      data.forEach((item) => {
        expect(item.performance).toBeGreaterThanOrEqual(0);
        expect(item.performance).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('getInterpretation', () => {
    it('should return positive interpretation for high scores', () => {
      const interpretation = calculator.getInterpretation(85);

      expect(interpretation).toContain('good condition');
      expect(interpretation).toContain('low risk');
    });

    it('should return moderate interpretation for medium scores', () => {
      const interpretation = calculator.getInterpretation(65);

      expect(interpretation).toContain('improvements');
      expect(interpretation).toContain('stable');
    });

    it('should return warning interpretation for low scores', () => {
      const interpretation = calculator.getInterpretation(40);

      expect(interpretation).toContain('immediate attention');
      expect(interpretation).toContain('professional assessment');
    });

    it('should handle boundary cases', () => {
      expect(calculator.getInterpretation(80)).toContain('good condition');
      expect(calculator.getInterpretation(60)).toContain('improvements');
      expect(calculator.getInterpretation(59)).toContain('immediate attention');
    });
  });

  describe('interpretEarthquakeImpact', () => {
    it('should return "Low" for high scores', () => {
      expect(calculator.interpretEarthquakeImpact(85)).toBe('Low');
      expect(calculator.interpretEarthquakeImpact(80)).toBe('Low');
    });

    it('should return "Moderate" for medium scores', () => {
      expect(calculator.interpretEarthquakeImpact(70)).toBe('Moderate');
      expect(calculator.interpretEarthquakeImpact(60)).toBe('Moderate');
    });

    it('should return "High" for low scores', () => {
      expect(calculator.interpretEarthquakeImpact(50)).toBe('High');
      expect(calculator.interpretEarthquakeImpact(30)).toBe('High');
    });

    it('should handle boundary cases correctly', () => {
      expect(calculator.interpretEarthquakeImpact(79.9)).toBe('Moderate');
      expect(calculator.interpretEarthquakeImpact(59.9)).toBe('High');
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle string numbers in input', () => {
      const userInput = {
        structuralSystem: 'C1',
        yearOfConstruction: '2015',
        numberOfStories: '5',
        typeOfSoil: 'ZC',
        typeOfEarthquake: 'Zone 2',
        designRegulation: '2007-2018',
      };

      const result = calculator.calculateSafety(userInput);

      expect(result).toBeDefined();
      expect(parseFloat(result.overallScore)).toBeGreaterThan(0);
    });

    it('should handle invalid year of construction', () => {
      const userInput = {
        yearOfConstruction: 'invalid',
        structuralSystem: 'C1',
      };

      const result = calculator.calculateSafety(userInput);

      expect(result).toBeDefined();
      // Should use default year
    });

    it('should handle unknown structural system', () => {
      const userInput = {
        structuralSystem: 'UNKNOWN_TYPE',
        yearOfConstruction: 2015,
      };

      const result = calculator.calculateSafety(userInput);

      expect(result).toBeDefined();
      expect(result.scoreBreakdown.baseScore).toBe(70); // Default score
    });

    it('should handle all irregularities at once', () => {
      const userInput = {
        structuralSystem: 'C1',
        verticalIrregularityHigh: true,
        verticalIrregularityModerate: true,
        planIrregularity: true,
        yearOfConstruction: 2015,
        typeOfSoil: 'ZC',
        typeOfEarthquake: 'Zone 2',
        designRegulation: '2007-2018',
        numberOfStories: 5,
      };

      const result = calculator.calculateSafety(userInput);

      expect(result).toBeDefined();
      expect(result.scoreBreakdown.irregularityPenalty).toBeLessThan(0);
      // Should have all three penalties applied
      const expectedPenalty =
        CALCULATION_CONFIG.irregularityPenalties.verticalHigh +
        CALCULATION_CONFIG.irregularityPenalties.verticalModerate +
        CALCULATION_CONFIG.irregularityPenalties.planIrregularity;
      expect(result.scoreBreakdown.irregularityPenalty).toBe(expectedPenalty);
    });
  });
});
