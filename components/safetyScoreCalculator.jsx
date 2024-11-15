const calculateSafetyScore = (userInput) => {
	let structuralIntegrity = 80; // Base score
	let earthquakeImpact = 'Moderate';
	let overallScore = 80;

	// Adjust based on building age
	const currentYear = new Date().getFullYear();
	const buildingAge = currentYear - parseInt(userInput.yearOfConstruction);
	if (!isNaN(buildingAge)) {
		if (buildingAge < 10) structuralIntegrity += 10;
		else if (buildingAge < 30) structuralIntegrity += 5;
		else if (buildingAge > 50) structuralIntegrity -= 10;
	}

	// Adjust based on design regulation
	if (userInput.designRegulation === 'After 2018') {
		structuralIntegrity += 10;
		earthquakeImpact = 'Low';
	} else if (userInput.designRegulation === 'Before 1975') {
		structuralIntegrity -= 10;
		earthquakeImpact = 'High';
	}

	// Adjust based on soil type
	if (userInput.typeOfSoil === 'ZA' || userInput.typeOfSoil === 'ZB') {
		structuralIntegrity += 5;
	} else if (userInput.typeOfSoil === 'ZD' || userInput.typeOfSoil === 'ZE') {
		structuralIntegrity -= 5;
		if (earthquakeImpact === 'Moderate') earthquakeImpact = 'High';
	}

	// Adjust based on structural system
	if (
		userInput.structuralSystem === 'Steel Structure' ||
		userInput.structuralSystem === 'Concrete Structure'
	) {
		structuralIntegrity += 5;
	} else if (userInput.structuralSystem === 'Masonry Structure') {
		structuralIntegrity -= 5;
	}

	// Adjust based on number of stories
	const stories = parseInt(userInput.numberOfStories);
	if (!isNaN(stories)) {
		if (stories > 10) structuralIntegrity -= 5;
		else if (stories <= 3) structuralIntegrity += 5;
	}

	// Calculate overall score
	overallScore = Math.round(
		(structuralIntegrity +
			(earthquakeImpact === 'Low'
				? 100
				: earthquakeImpact === 'Moderate'
				? 85
				: 70)) /
			2
	);

	return {
		structuralIntegrity: Math.min(100, Math.max(0, structuralIntegrity)),
		earthquakeImpact,
		overallScore: Math.min(100, Math.max(0, overallScore)),
	};
};

export default calculateSafetyScore;
