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

		// ENHANCED: Process comprehensive architectural plan data
		const planData = this.processArchitecturalPlanData(userInput);
		console.log('Processed Plan Data:', planData);

		// Apply architectural plan data impacts to safety calculation
		if (planData.hasData) {
			// Modify base score based on structural analysis
			if (planData.structuralQuality) {
				baseScore += planData.structuralQuality * 0.2;
			}
			
			// Apply reinforcement bar impacts
			if (planData.reinforcementScore) {
				baseScore += planData.reinforcementScore;
			}
		}

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
				irregularityPenalty,
				// Add architectural plan contributions
				...(planData.hasData && {
					architecturalPlanBonus: (planData.structuralQuality * 0.2) + planData.reinforcementScore,
					planDataQuality: planData.analysisQuality
				})
			},
			// Include extracted architectural plan data in results
			...(planData.hasData && {
				architecturalPlanData: planData.extractedData
			})
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

	processArchitecturalPlanData(userInput) {
		// Check if architectural plan analysis data exists
		const planAnalysis = userInput.architecturalPlanAnalysis;
		
		if (!planAnalysis) {
			return { hasData: false };
		}

		let structuralQuality = 0;
		let reinforcementScore = 0;

		// Process reinforcement bar data
		if (planAnalysis.reinforcementDetails) {
			const rebarData = planAnalysis.reinforcementDetails;
			
			// Analyze rebar density and positioning
			if (rebarData.columns && rebarData.columns.length > 0) {
				reinforcementScore += 5; // Bonus for having column reinforcement data
				
				// Check for proper rebar spacing and sizing
				const hasProperRebar = rebarData.columns.some(col => 
					col.includes('Ø') && (col.includes('20mm') || col.includes('16mm') || col.includes('25mm'))
				);
				if (hasProperRebar) reinforcementScore += 3;
			}

			if (rebarData.beams && rebarData.beams.length > 0) {
				reinforcementScore += 3; // Bonus for beam reinforcement data
			}

			if (rebarData.slabs && rebarData.slabs.length > 0) {
				reinforcementScore += 2; // Bonus for slab reinforcement data
			}
		}

		// Process structural elements quality
		if (planAnalysis.structuralElements) {
			const elements = planAnalysis.structuralElements;
			
			// Check for structural grid regularity
			if (elements.gridSystem && elements.gridSystem.regularity === 'regular') {
				structuralQuality += 2;
			}

			// Check for proper column distribution
			if (elements.columns && elements.columns.length > 0) {
				structuralQuality += 1;
			}

			// Check for beam continuity
			if (elements.beams && elements.beams.length > 0) {
				structuralQuality += 1;
			}
		}

		// Process room layout for irregularity assessment
		if (planAnalysis.roomLayout) {
			const rooms = planAnalysis.roomLayout;
			
			// Regular room layout indicates better structural performance
			if (rooms.length > 0) {
				const hasRegularLayout = rooms.some(room => 
					room.shape === 'rectangular' || room.shape === 'square'
				);
				if (hasRegularLayout) structuralQuality += 1;
			}
		}

		// Process MEP systems impact
		if (planAnalysis.mepSystems) {
			const mep = planAnalysis.mepSystems;
			
			// Well-designed MEP systems indicate better overall planning
			if (mep.electrical && mep.electrical.length > 0) structuralQuality += 0.5;
			if (mep.plumbing && mep.plumbing.length > 0) structuralQuality += 0.5;
		}

		// Process technical specifications
		if (planAnalysis.technicalSpecs) {
			const specs = planAnalysis.technicalSpecs;
			
			// Check for seismic design considerations
			if (specs.seismicDesign && specs.seismicDesign.length > 0) {
				reinforcementScore += 5; // Significant bonus for seismic considerations
			}

			// Check for material specifications
			if (specs.materials && specs.materials.length > 0) {
				const hasHighGradeConcrete = specs.materials.some(material =>
					material.includes('C30') || material.includes('C35') || material.includes('C40')
				);
				if (hasHighGradeConcrete) reinforcementScore += 2;
			}
		}

		return {
			hasData: true,
			structuralQuality: Math.min(structuralQuality, 10), // Cap at 10
			reinforcementScore: Math.min(reinforcementScore, 15), // Cap at 15
			analysisQuality: planAnalysis.analysisQuality || 'good',
			extractedData: {
				reinforcementDetails: planAnalysis.reinforcementDetails,
				structuralElements: planAnalysis.structuralElements,
				roomLayout: planAnalysis.roomLayout,
				mepSystems: planAnalysis.mepSystems,
				technicalSpecs: planAnalysis.technicalSpecs
			}
		};
	}
}

// Export singleton instance
const safetyCalculatorInstance = new SafetyCalculator();

// Export helper function for route compatibility
export function calculateSafetyScore(userInput) {
	return safetyCalculatorInstance.calculateSafety(userInput);
}

export default SafetyCalculator;
