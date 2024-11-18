// SafetyCalculator.jsx
class SafetyCalculator {
	calculateSafety(userInput) {
		// Add input validation and logging
		console.log('Received userInput:', userInput);

		// Ensure all required fields exist and have valid values
		const validatedInput = {
			structuralSystem: userInput.structuralSystem || 'W1', // Default to W1 if not specified
			verticalIrregularityHigh: Boolean(userInput.verticalIrregularityHigh),
			verticalIrregularityModerate: Boolean(
				userInput.verticalIrregularityModerate
			),
			planIrregularity: Boolean(userInput.planIrregularity),
			yearofconstruction: parseInt(userInput.yearOfConstruction) || 2000,
			typeofsoil: userInput.typeOfSoil || 'D', // Default to soil type D if not specified
			numberOfStories: parseInt(userInput.numberOfStories) || 1,
		};

		console.log('Validated Input:', validatedInput);

		// Calculate basic scores
		const age = new Date().getFullYear() - validatedInput.yearofconstruction;
		const baseScore = 100;

		// Age impact
		let ageImpact = 0;
		if (age < 10) ageImpact = 10;
		else if (age < 30) ageImpact = 0;
		else if (age < 50) ageImpact = -10;
		else ageImpact = -20;

		// Soil type impact
		let soilImpact = 0;
		switch (validatedInput.typeofsoil) {
			case 'ZA':
			case 'ZB':
				soilImpact = 10;
				break;
			case 'ZC':
				soilImpact = 0;
				break;
			case 'ZD':
			case 'ZE':
				soilImpact = -10;
				break;
			default:
				soilImpact = -5;
		}

		// Stories impact
		const storiesImpact = validatedInput.numberOfStories > 5 ? -10 : 0;

		// Calculate final scores
		const structuralIntegrity = Math.max(
			0,
			Math.min(100, baseScore + ageImpact + soilImpact + storiesImpact)
		);
		const overallScore = structuralIntegrity;

		// Determine earthquake impact
		let earthquakeImpact = 'Moderate';
		if (overallScore >= 80) earthquakeImpact = 'Low';
		else if (overallScore < 60) earthquakeImpact = 'High';

		const result = {
			rawScore: ((overallScore / 100) * 4.1).toFixed(2),
			normalizedScore: overallScore.toFixed(2),
			buildingType: validatedInput.structuralSystem,
			interpretation: this.getInterpretation(overallScore),
			structuralIntegrity: structuralIntegrity.toFixed(2),
			earthquakeImpact: earthquakeImpact,
			overallScore: overallScore.toFixed(2),
		};

		console.log('Calculated Result:', result);
		return result;
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
