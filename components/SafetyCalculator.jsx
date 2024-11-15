// SafetyCalculator.js
import calculateFemaSafetyScore from './femaSimicSafetyCalculator';
export function assessBuildingSafety(userInput) {
	const score = calculateFemaSafetyScore(userInput.buildingType, {
		verticalIrregularityHigh: userInput.verticalIrregularityHigh,
		verticalIrregularityModerate: userInput.verticalIrregularityModerate,
		planIrregularity: userInput.planIrregularity,
		preCode: userInput.yearOfConstruction < 1990, // Assuming pre-code is before 1990
		postBenchmark: userInput.yearOfConstruction > 2000, // Assuming post-benchmark is after 2000
		soilType: userInput.soilType,
		stories: userInput.numberOfStories,
	});

	const interpretation = interpretScore(score);
	const normalizedScore = (score / 4.1) * 100; // Normalize to 0-100 scale

	return {
		rawScore: score.toFixed(2),
		normalizedScore: normalizedScore.toFixed(2),
		interpretation: interpretation,
		buildingType: BUILDING_TYPES[userInput.buildingType],
	};
}

class SafetyCalculator {
	calculateSafety(userInput) {
		const result = assessBuildingSafety({
			buildingType: userInput.structuralSystem,
			verticalIrregularityHigh: userInput.verticalIrregularityHigh,
			verticalIrregularityModerate: userInput.verticalIrregularityModerate,
			planIrregularity: userInput.planIrregularity,
			yearOfConstruction: parseInt(userInput.yearofconstruction),
			soilType: userInput.typeofsoil,
			numberOfStories: parseInt(userInput.numberOfStories),
		});

		return {
			rawScore: result.rawScore,
			normalizedScore: result.normalizedScore,
			buildingType: result.buildingType,
			interpretation: result.interpretation,
			structuralIntegrity: result.normalizedScore, // Using normalized score as structural integrity
			earthquakeImpact: this.interpretEarthquakeImpact(result.normalizedScore),
			overallScore: result.normalizedScore, // Using normalized score as overall score
		};
	}

	interpretEarthquakeImpact(score) {
		if (score >= 80) return 'Low';
		if (score >= 60) return 'Moderate';
		return 'High';
	}
}

export default SafetyCalculator;
