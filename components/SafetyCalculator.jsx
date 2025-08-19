// SafetyCalculator.jsx
import { CALCULATION_CONFIG, CalculationHelpers } from '@/config/earthquakeParameters';

class SafetyCalculator {
	calculateSafety(userInput) {
		// Add input validation and logging
		console.log('Received userInput:', userInput);

		// Ensure all required fields exist and have valid values
		const validatedInput = {
			structuralSystem: userInput.structuralSystem || CALCULATION_CONFIG.defaults.buildingType,
			verticalIrregularityHigh: Boolean(userInput.verticalIrregularityHigh),
			verticalIrregularityModerate: Boolean(userInput.verticalIrregularityModerate),
			planIrregularity: Boolean(userInput.planIrregularity),
			yearOfConstruction: parseInt(userInput.yearOfConstruction) || CALCULATION_CONFIG.defaults.yearOfConstruction,
			typeOfSoil: userInput.typeOfSoil || CALCULATION_CONFIG.defaults.soilType,
			typeOfEarthquake: userInput.typeOfEarthquake || CALCULATION_CONFIG.defaults.zone,
			designRegulation: userInput.designRegulation || CALCULATION_CONFIG.defaults.regulation,
			numberOfStories: parseInt(userInput.numberOfStories) || CALCULATION_CONFIG.defaults.stories,
		};

		console.log('Validated Input:', validatedInput);

		// Start with building type base score
		let baseScore = CALCULATION_CONFIG.buildingTypeScores[validatedInput.structuralSystem] || 70;

		// Add regulation score impact
		const regulationImpact = CALCULATION_CONFIG.regulationScores[validatedInput.designRegulation] || 70;
		
		// Add soil modifier
		const soilImpact = CALCULATION_CONFIG.soilModifiers[validatedInput.typeOfSoil] || 0;
		
		// Add zone factor
		const zoneImpact = CALCULATION_CONFIG.zoneFactors[validatedInput.typeOfEarthquake] || 0;
		
		// Add age factor
		const ageCategory = CalculationHelpers.getAgeCategory(validatedInput.yearOfConstruction);
		const ageImpact = CALCULATION_CONFIG.ageFactors[ageCategory] || 0;
		
		// Add story impact
		const storyCategory = CalculationHelpers.getStoryCategory(validatedInput.numberOfStories);
		const storyImpact = CALCULATION_CONFIG.storyImpact[storyCategory] || 0;

		// Apply irregularity penalties
		let irregularityPenalty = 0;
		if (validatedInput.verticalIrregularityHigh) {
			irregularityPenalty += CALCULATION_CONFIG.irregularityPenalties.verticalHigh;
		}
		if (validatedInput.verticalIrregularityModerate) {
			irregularityPenalty += CALCULATION_CONFIG.irregularityPenalties.verticalModerate;
		}
		if (validatedInput.planIrregularity) {
			irregularityPenalty += CALCULATION_CONFIG.irregularityPenalties.planIrregularity;
		}

		// Calculate weighted score (regulation score is primary, others are modifiers)
		const overallScore = Math.max(
			CALCULATION_CONFIG.scoreBounds.minimum,
			Math.min(
				CALCULATION_CONFIG.scoreBounds.maximum,
				(regulationImpact * 0.4) + // Regulation is 40% of score
				(baseScore * 0.3) + // Building type is 30% of score
				(soilImpact + zoneImpact + ageImpact + storyImpact + irregularityPenalty) // Modifiers are 30%
			)
		);

		// Calculate structural integrity (simplified version)
		const structuralIntegrity = Math.max(0, overallScore + (ageImpact * 0.5));

		// Determine earthquake impact
		const earthquakeImpact = this.interpretEarthquakeImpact(overallScore);

		// Get performance levels and classification
		const performanceLevels = CalculationHelpers.getPerformanceLevel(overallScore);
		const buildingClassification = CalculationHelpers.getBuildingClassification(overallScore);
		const maxSafeRichter = CalculationHelpers.calculateMaxSafeRichter(overallScore);

		const result = {
			rawScore: ((overallScore / 100) * 4.1).toFixed(2),
			normalizedScore: overallScore.toFixed(2),
			buildingType: validatedInput.structuralSystem,
			interpretation: this.getInterpretation(overallScore),
			structuralIntegrity: structuralIntegrity.toFixed(2),
			earthquakeImpact: earthquakeImpact,
			overallScore: overallScore.toFixed(2),
			performanceLevels: performanceLevels,
			maxSafeRichter: maxSafeRichter.toFixed(1),
			buildingClassification: buildingClassification,
			// Add breakdown for transparency
			scoreBreakdown: {
				baseScore,
				regulationImpact,
				soilImpact,
				zoneImpact,
				ageImpact,
				storyImpact,
				irregularityPenalty
			}
		};

		console.log('Calculated Result:', result);
		return result;
	}

	calculateRichterPerformance() {
		// This function returns performance data for different Richter scales
		const data = [];
		for (let richter = 4.0; richter <= 8.0; richter += 0.5) {
			// Calculate expected performance at this magnitude
			// Higher magnitudes reduce performance exponentially
			const basePerformance = 100;
			const degradationFactor = Math.pow((richter - 3.5) / 4.5, 2.5);
			const performance = Math.max(0, basePerformance * (1 - degradationFactor));
			
			data.push({
				richter: richter.toFixed(1),
				performance: Math.round(performance),
				status: richter < 5.5 ? 'Safe' : richter <= 6.5 ? 'Caution' : 'Danger'
			});
		}
		return data;
	}

	getInterpretation(score) {
		if (score >= 80)
			return 'Building appears to be in good condition with low risk';
		if (score >= 60)
			return 'Building may need some improvements but is generally stable';
		return 'Building requires immediate attention and professional assessment';
	}

	interpretEarthquakeImpact(score) {
		if (score >= 80) return 'Low';
		if (score >= 60) return 'Moderate';
		return 'High';
	}
}

export default SafetyCalculator;
