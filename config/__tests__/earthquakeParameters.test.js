import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CALCULATION_CONFIG, CalculationHelpers } from '../earthquakeParameters';

describe('CALCULATION_CONFIG', () => {
  it('should have all required configuration objects', () => {
    expect(CALCULATION_CONFIG).toHaveProperty('regulationScores');
    expect(CALCULATION_CONFIG).toHaveProperty('soilModifiers');
    expect(CALCULATION_CONFIG).toHaveProperty('zoneFactors');
    expect(CALCULATION_CONFIG).toHaveProperty('buildingTypeScores');
    expect(CALCULATION_CONFIG).toHaveProperty('richterThresholds');
    expect(CALCULATION_CONFIG).toHaveProperty('performanceLevels');
    expect(CALCULATION_CONFIG).toHaveProperty('ageFactors');
    expect(CALCULATION_CONFIG).toHaveProperty('storyImpact');
    expect(CALCULATION_CONFIG).toHaveProperty('irregularityPenalties');
    expect(CALCULATION_CONFIG).toHaveProperty('scoreBounds');
    expect(CALCULATION_CONFIG).toHaveProperty('defaults');
  });

  describe('regulationScores', () => {
    it('should have scores for all regulation periods', () => {
      const { regulationScores } = CALCULATION_CONFIG;

      expect(regulationScores['Before 1975']).toBe(40);
      expect(regulationScores['1975-1998']).toBe(55);
      expect(regulationScores['1998-2007']).toBe(70);
      expect(regulationScores['2007-2018']).toBe(85);
      expect(regulationScores['After 2018 (TBDY)']).toBe(95);
    });

    it('should have increasing scores for newer regulations', () => {
      const { regulationScores } = CALCULATION_CONFIG;
      const scores = Object.values(regulationScores);

      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBeGreaterThan(scores[i - 1]);
      }
    });
  });

  describe('soilModifiers', () => {
    it('should have correct soil type modifiers', () => {
      const { soilModifiers } = CALCULATION_CONFIG;

      expect(soilModifiers.ZA).toBe(15);  // Best soil (rock)
      expect(soilModifiers.ZB).toBe(10);
      expect(soilModifiers.ZC).toBe(5);
      expect(soilModifiers.ZD).toBe(-5);
      expect(soilModifiers.ZE).toBe(-15); // Worst soil
    });

    it('should have decreasing modifiers from ZA to ZE', () => {
      const { soilModifiers } = CALCULATION_CONFIG;
      const modifiers = [
        soilModifiers.ZA,
        soilModifiers.ZB,
        soilModifiers.ZC,
        soilModifiers.ZD,
        soilModifiers.ZE,
      ];

      for (let i = 1; i < modifiers.length; i++) {
        expect(modifiers[i]).toBeLessThan(modifiers[i - 1]);
      }
    });
  });

  describe('zoneFactors', () => {
    it('should have factors for all seismic zones', () => {
      const { zoneFactors } = CALCULATION_CONFIG;

      expect(zoneFactors['Zone 1']).toBe(10);
      expect(zoneFactors['Zone 2']).toBe(5);
      expect(zoneFactors['Zone 3']).toBe(-5);
      expect(zoneFactors['Zone 4']).toBe(-15);
    });

    it('should have decreasing factors for higher risk zones', () => {
      const { zoneFactors } = CALCULATION_CONFIG;

      expect(zoneFactors['Zone 1']).toBeGreaterThan(zoneFactors['Zone 2']);
      expect(zoneFactors['Zone 2']).toBeGreaterThan(zoneFactors['Zone 3']);
      expect(zoneFactors['Zone 3']).toBeGreaterThan(zoneFactors['Zone 4']);
    });
  });

  describe('buildingTypeScores', () => {
    it('should include all major building types', () => {
      const { buildingTypeScores } = CALCULATION_CONFIG;

      expect(buildingTypeScores).toHaveProperty('C1'); // Concrete moment frame
      expect(buildingTypeScores).toHaveProperty('C2'); // Concrete shear walls
      expect(buildingTypeScores).toHaveProperty('S1'); // Steel moment frame
      expect(buildingTypeScores).toHaveProperty('URM'); // Unreinforced masonry
      expect(buildingTypeScores).toHaveProperty('W1'); // Wood frame
    });

    it('should have highest score for concrete moment frame', () => {
      const { buildingTypeScores } = CALCULATION_CONFIG;

      expect(buildingTypeScores.C1).toBe(85);
      expect(buildingTypeScores.C1).toBeGreaterThan(buildingTypeScores.URM);
    });

    it('should have lowest scores for unreinforced masonry and mobile homes', () => {
      const { buildingTypeScores } = CALCULATION_CONFIG;
      const scores = Object.values(buildingTypeScores);
      const minScore = Math.min(...scores);

      expect([buildingTypeScores.URM, buildingTypeScores.MH]).toContain(minScore);
    });
  });

  describe('richterThresholds', () => {
    it('should have correct threshold values', () => {
      const { richterThresholds } = CALCULATION_CONFIG;

      expect(richterThresholds.safe).toBe(5.5);
      expect(richterThresholds.caution).toBe(6.5);
      expect(richterThresholds.danger).toBe(8.0);
    });

    it('should have increasing thresholds', () => {
      const { richterThresholds } = CALCULATION_CONFIG;

      expect(richterThresholds.caution).toBeGreaterThan(richterThresholds.safe);
      expect(richterThresholds.danger).toBeGreaterThan(richterThresholds.caution);
    });
  });

  describe('performanceLevels', () => {
    it('should have all performance level thresholds', () => {
      const { performanceLevels } = CALCULATION_CONFIG;

      expect(performanceLevels.excellent).toBe(90);
      expect(performanceLevels.good).toBe(75);
      expect(performanceLevels.fair).toBe(60);
      expect(performanceLevels.poor).toBe(45);
      expect(performanceLevels.critical).toBe(30);
    });

    it('should have decreasing threshold values', () => {
      const { performanceLevels } = CALCULATION_CONFIG;

      expect(performanceLevels.excellent).toBeGreaterThan(performanceLevels.good);
      expect(performanceLevels.good).toBeGreaterThan(performanceLevels.fair);
      expect(performanceLevels.fair).toBeGreaterThan(performanceLevels.poor);
      expect(performanceLevels.poor).toBeGreaterThan(performanceLevels.critical);
    });
  });

  describe('ageFactors', () => {
    it('should have positive modifiers for new buildings', () => {
      const { ageFactors } = CALCULATION_CONFIG;

      expect(ageFactors['0-10']).toBe(10);
      expect(ageFactors['11-20']).toBe(5);
    });

    it('should have negative modifiers for old buildings', () => {
      const { ageFactors } = CALCULATION_CONFIG;

      expect(ageFactors['31-40']).toBe(-5);
      expect(ageFactors['41-50']).toBe(-10);
      expect(ageFactors['50+']).toBe(-20);
    });
  });

  describe('storyImpact', () => {
    it('should penalize very tall buildings', () => {
      const { storyImpact } = CALCULATION_CONFIG;

      expect(storyImpact['1-3']).toBe(5);   // Low-rise advantage
      expect(storyImpact['4-7']).toBe(0);   // Mid-rise neutral
      expect(storyImpact['8-15']).toBe(-5); // High-rise penalty
      expect(storyImpact['16+']).toBe(-15); // Very high penalty
    });
  });

  describe('irregularityPenalties', () => {
    it('should have penalties for structural irregularities', () => {
      const { irregularityPenalties } = CALCULATION_CONFIG;

      expect(irregularityPenalties.verticalHigh).toBe(-20);
      expect(irregularityPenalties.verticalModerate).toBe(-10);
      expect(irregularityPenalties.planIrregularity).toBe(-15);
      expect(irregularityPenalties.softStory).toBe(-25);
      expect(irregularityPenalties.shortColumn).toBe(-15);
    });

    it('should have highest penalty for soft story', () => {
      const { irregularityPenalties } = CALCULATION_CONFIG;
      const penalties = Object.values(irregularityPenalties);
      const maxPenalty = Math.min(...penalties);

      expect(irregularityPenalties.softStory).toBe(maxPenalty);
    });
  });

  describe('scoreBounds', () => {
    it('should have correct minimum and maximum bounds', () => {
      const { scoreBounds } = CALCULATION_CONFIG;

      expect(scoreBounds.minimum).toBe(0);
      expect(scoreBounds.maximum).toBe(100);
    });
  });

  describe('defaults', () => {
    it('should have all default values defined', () => {
      const { defaults } = CALCULATION_CONFIG;

      expect(defaults).toHaveProperty('buildingType');
      expect(defaults).toHaveProperty('soilType');
      expect(defaults).toHaveProperty('zone');
      expect(defaults).toHaveProperty('regulation');
      expect(defaults).toHaveProperty('stories');
      expect(defaults).toHaveProperty('yearOfConstruction');
    });

    it('should have reasonable default values', () => {
      const { defaults } = CALCULATION_CONFIG;

      expect(defaults.buildingType).toBe('C1');
      expect(defaults.soilType).toBe('ZC');
      expect(defaults.zone).toBe('Zone 2');
      expect(defaults.stories).toBe(3);
      expect(defaults.yearOfConstruction).toBe(2010);
    });
  });
});

describe('CalculationHelpers', () => {
  describe('getAgeCategory', () => {
    beforeEach(() => {
      // Mock Date to ensure consistent testing
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-01'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should categorize new buildings correctly', () => {
      expect(CalculationHelpers.getAgeCategory(2020)).toBe('0-10');
      expect(CalculationHelpers.getAgeCategory(2024)).toBe('0-10');
    });

    it('should categorize relatively new buildings', () => {
      expect(CalculationHelpers.getAgeCategory(2010)).toBe('11-20');
      expect(CalculationHelpers.getAgeCategory(2005)).toBe('11-20');
    });

    it('should categorize mid-age buildings', () => {
      expect(CalculationHelpers.getAgeCategory(2000)).toBe('21-30');
      expect(CalculationHelpers.getAgeCategory(1995)).toBe('21-30');
    });

    it('should categorize aging buildings', () => {
      expect(CalculationHelpers.getAgeCategory(1990)).toBe('31-40');
      expect(CalculationHelpers.getAgeCategory(1985)).toBe('31-40');
    });

    it('should categorize old buildings', () => {
      expect(CalculationHelpers.getAgeCategory(1980)).toBe('41-50');
      expect(CalculationHelpers.getAgeCategory(1975)).toBe('41-50');
    });

    it('should categorize very old buildings', () => {
      expect(CalculationHelpers.getAgeCategory(1970)).toBe('50+');
      expect(CalculationHelpers.getAgeCategory(1950)).toBe('50+');
      expect(CalculationHelpers.getAgeCategory(1900)).toBe('50+');
    });
  });

  describe('getStoryCategory', () => {
    it('should categorize low-rise buildings', () => {
      expect(CalculationHelpers.getStoryCategory(1)).toBe('1-3');
      expect(CalculationHelpers.getStoryCategory(2)).toBe('1-3');
      expect(CalculationHelpers.getStoryCategory(3)).toBe('1-3');
    });

    it('should categorize mid-rise buildings', () => {
      expect(CalculationHelpers.getStoryCategory(4)).toBe('4-7');
      expect(CalculationHelpers.getStoryCategory(5)).toBe('4-7');
      expect(CalculationHelpers.getStoryCategory(7)).toBe('4-7');
    });

    it('should categorize high-rise buildings', () => {
      expect(CalculationHelpers.getStoryCategory(8)).toBe('8-15');
      expect(CalculationHelpers.getStoryCategory(10)).toBe('8-15');
      expect(CalculationHelpers.getStoryCategory(15)).toBe('8-15');
    });

    it('should categorize very high-rise buildings', () => {
      expect(CalculationHelpers.getStoryCategory(16)).toBe('16+');
      expect(CalculationHelpers.getStoryCategory(20)).toBe('16+');
      expect(CalculationHelpers.getStoryCategory(50)).toBe('16+');
    });
  });

  describe('getPerformanceLevel', () => {
    it('should return excellent for high scores', () => {
      expect(CalculationHelpers.getPerformanceLevel(90)).toBe('excellent');
      expect(CalculationHelpers.getPerformanceLevel(95)).toBe('excellent');
      expect(CalculationHelpers.getPerformanceLevel(100)).toBe('excellent');
    });

    it('should return good for scores between 75-89', () => {
      expect(CalculationHelpers.getPerformanceLevel(75)).toBe('good');
      expect(CalculationHelpers.getPerformanceLevel(80)).toBe('good');
      expect(CalculationHelpers.getPerformanceLevel(89)).toBe('good');
    });

    it('should return fair for scores between 60-74', () => {
      expect(CalculationHelpers.getPerformanceLevel(60)).toBe('fair');
      expect(CalculationHelpers.getPerformanceLevel(65)).toBe('fair');
      expect(CalculationHelpers.getPerformanceLevel(74)).toBe('fair');
    });

    it('should return poor for scores between 45-59', () => {
      expect(CalculationHelpers.getPerformanceLevel(45)).toBe('poor');
      expect(CalculationHelpers.getPerformanceLevel(50)).toBe('poor');
      expect(CalculationHelpers.getPerformanceLevel(59)).toBe('poor');
    });

    it('should return critical for scores below 45', () => {
      expect(CalculationHelpers.getPerformanceLevel(30)).toBe('critical');
      expect(CalculationHelpers.getPerformanceLevel(44)).toBe('critical');
      expect(CalculationHelpers.getPerformanceLevel(0)).toBe('critical');
    });
  });

  describe('calculateMaxSafeRichter', () => {
    it('should return higher magnitude for higher scores', () => {
      const score100 = CalculationHelpers.calculateMaxSafeRichter(100);
      const score50 = CalculationHelpers.calculateMaxSafeRichter(50);
      const score0 = CalculationHelpers.calculateMaxSafeRichter(0);

      expect(score100).toBeGreaterThan(score50);
      expect(score50).toBeGreaterThan(score0);
    });

    it('should cap maximum at 8.0', () => {
      const result = CalculationHelpers.calculateMaxSafeRichter(100);
      expect(result).toBeLessThanOrEqual(8.0);
    });

    it('should have minimum of 4.0', () => {
      const result = CalculationHelpers.calculateMaxSafeRichter(0);
      expect(result).toBeGreaterThanOrEqual(4.0);
    });

    it('should return approximately 7.0 for score of 100', () => {
      const result = CalculationHelpers.calculateMaxSafeRichter(100);
      expect(result).toBeCloseTo(7.0, 1);
    });

    it('should return approximately 5.5 for score of 50', () => {
      const result = CalculationHelpers.calculateMaxSafeRichter(50);
      expect(result).toBeCloseTo(5.5, 1);
    });
  });

  describe('getBuildingClassification', () => {
    it('should return correct classification for excellent performance', () => {
      const classification = CalculationHelpers.getBuildingClassification(95);

      expect(classification.category).toBe('High Performance');
      expect(classification.color).toBe('green');
      expect(classification.icon).toBe('shield-check');
      expect(classification.description).toContain('Exceeds');
    });

    it('should return correct classification for good performance', () => {
      const classification = CalculationHelpers.getBuildingClassification(80);

      expect(classification.category).toBe('Good Performance');
      expect(classification.color).toBe('blue');
      expect(classification.icon).toBe('shield');
      expect(classification.description).toContain('Meets');
    });

    it('should return correct classification for fair performance', () => {
      const classification = CalculationHelpers.getBuildingClassification(65);

      expect(classification.category).toBe('Adequate Performance');
      expect(classification.color).toBe('yellow');
      expect(classification.icon).toBe('shield-alert');
    });

    it('should return correct classification for poor performance', () => {
      const classification = CalculationHelpers.getBuildingClassification(50);

      expect(classification.category).toBe('Below Standard');
      expect(classification.color).toBe('orange');
      expect(classification.icon).toBe('alert-triangle');
      expect(classification.description).toContain('Improvements recommended');
    });

    it('should return correct classification for critical performance', () => {
      const classification = CalculationHelpers.getBuildingClassification(30);

      expect(classification.category).toBe('Critical Risk');
      expect(classification.color).toBe('red');
      expect(classification.icon).toBe('alert-octagon');
      expect(classification.description).toContain('Immediate');
    });

    it('should include all required properties', () => {
      const classification = CalculationHelpers.getBuildingClassification(75);

      expect(classification).toHaveProperty('category');
      expect(classification).toHaveProperty('description');
      expect(classification).toHaveProperty('color');
      expect(classification).toHaveProperty('icon');
    });
  });
});
