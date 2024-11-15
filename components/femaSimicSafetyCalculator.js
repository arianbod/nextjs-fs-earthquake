// Building Types
const BUILDING_TYPES = {
    W1: 'Wood Light Frame',
    W1A: 'Multi-Story, Multi-Unit Residential Wood',
    W2: 'Wood Frame Commercial and Industrial',
    S1: 'Steel Moment-Resisting Frame',
    S2: 'Steel Braced Frame',
    S3: 'Steel Light Metal Frame',
    S4: 'Steel Frame with Concrete Shear Walls',
    S5: 'Steel Frame with Unreinforced Masonry Infill',
    C1: 'Concrete Moment-Resisting Frame',
    C2: 'Concrete Shear Wall',
    C3: 'Concrete Frame with Unreinforced Masonry Infill',
    PC1: 'Precast Concrete Tilt-Up',
    PC2: 'Precast Concrete Frame',
    RM1: 'Reinforced Masonry with Flexible Diaphragm',
    RM2: 'Reinforced Masonry with Rigid Diaphragm',
    URM: 'Unreinforced Masonry',
    MH: 'Mobile Homes'
};

// Initial Scores
const INITIAL_SCORES = {
    W1: 4.1, W1A: 3.7, W2: 3.2, S1: 2.3, S2: 2.2, S3: 2.9, S4: 2.2, S5: 2.1,
    C1: 1.7, C2: 2.1, C3: 1.4, PC1: 1.8, PC2: 1.5, RM1: 1.8, RM2: 1.8, URM: 1.2, MH: 2.2
};

// Modifiers
const MODIFIERS = {
    verticalIrregularityHigh: {
        W1: -1.3, W1A: -1.3, W2: -1.3, S1: -1.1, S2: -1, S3: -1.2, S4: -1, S5: -0.9,
        C1: -1, C2: -1.1, C3: -0.8, PC1: -1, PC2: -0.9, RM1: -1, RM2: -1, URM: -0.8, MH: 0
    },
    verticalIrregularityModerate: {
        W1: -0.8, W1A: -0.8, W2: -0.8, S1: -0.7, S2: -0.6, S3: -0.8, S4: -0.6, S5: -0.6,
        C1: -0.6, C2: -0.6, C3: -0.5, PC1: -0.6, PC2: -0.6, RM1: -0.6, RM2: -0.6, URM: -0.5, MH: 0
    },
    planIrregularity: {
        W1: -1.3, W1A: -1.2, W2: -1.1, S1: -0.9, S2: -0.8, S3: -1, S4: -0.8, S5: -0.7,
        C1: -0.7, C2: -0.9, C3: -0.6, PC1: -0.8, PC2: -0.7, RM1: -0.7, RM2: -0.7, URM: -0.5, MH: 0
    },
    preCode: {
        W1: -0.8, W1A: -0.9, W2: -0.9, S1: -0.5, S2: -0.5, S3: -0.7, S4: -0.6, S5: -0.2,
        C1: -0.4, C2: -0.7, C3: -0.1, PC1: -0.4, PC2: -0.3, RM1: -0.5, RM2: -0.5, URM: -0.1, MH: -0.3
    },
    postBenchmark: {
        W1: 1.5, W1A: 1.9, W2: 2.3, S1: 1.4, S2: 1.4, S3: 1.0, S4: 1.9, S5: 0,
        C1: 1.9, C2: 2.1, C3: 0, PC1: 2.1, PC2: 2.4, RM1: 2.1, RM2: 2.1, URM: 0, MH: 1.2
    },
    soilTypeC: {
        W1: 0.3, W1A: 0.6, W2: 0.9, S1: 0.6, S2: 0.9, S3: 0.3, S4: 0.9, S5: 0.9,
        C1: 0.6, C2: 0.8, C3: 0.7, PC1: 0.9, PC2: 0.7, RM1: 0.8, RM2: 0.8, URM: 0.6, MH: 0.9
    },
    soilTypeD: {
        W1: 0, W1A: 0, W2: 0, S1: 0, S2: 0, S3: 0, S4: 0, S5: 0,
        C1: 0, C2: 0, C3: 0, PC1: 0, PC2: 0, RM1: 0, RM2: 0, URM: 0, MH: 0
    },
    soilTypeE_1to3Stories: {
        W1: 0, W1A: -0.1, W2: -0.3, S1: -0.4, S2: -0.5, S3: 0, S4: -0.4, S5: -0.5,
        C1: -0.2, C2: -0.2, C3: -0.4, PC1: -0.5, PC2: -0.3, RM1: -0.4, RM2: -0.4, URM: -0.3, MH: -0.5
    },
    soilTypeE_4PlusStories: {
        W1: -0.5, W1A: -0.8, W2: -1.2, S1: -0.7, S2: -0.7, S3: 0, S4: -0.7, S5: -0.6,
        C1: -0.6, C2: -0.8, C3: -0.4, PC1: 0, PC2: -0.5, RM1: -0.6, RM2: -0.7, URM: -0.3, MH: 0
    }
};

// Minimum Scores
const MIN_SCORES = {
    W1: 1.6, W1A: 1.2, W2: 0.8, S1: 0.5, S2: 0.5, S3: 0.9, S4: 0.5, S5: 0.5,
    C1: 0.3, C2: 0.3, C3: 0.3, PC1: 0.3, PC2: 0.2, RM1: 0.3, RM2: 0.3, URM: 0.2, MH: 1.4
};

function calculateFemaSafetyScore(buildingType, params) {
    let score = INITIAL_SCORES[buildingType];

    if (params.verticalIrregularityHigh) score += MODIFIERS.verticalIrregularityHigh[buildingType];
    if (params.verticalIrregularityModerate) score += MODIFIERS.verticalIrregularityModerate[buildingType];
    if (params.planIrregularity) score += MODIFIERS.planIrregularity[buildingType];
    if (params.preCode) score += MODIFIERS.preCode[buildingType];
    if (params.postBenchmark) score += MODIFIERS.postBenchmark[buildingType];

    if (params.soilType === 'C') score += MODIFIERS.soilTypeC[buildingType];
    else if (params.soilType === 'D') score += MODIFIERS.soilTypeD[buildingType];
    else if (params.soilType === 'E') {
        if (params.stories <= 3) score += MODIFIERS.soilTypeE_1to3Stories[buildingType];
        else score += MODIFIERS.soilTypeE_4PlusStories[buildingType];
    }

    // Ensure the score doesn't fall below the minimum
    score = Math.max(score, MIN_SCORES[buildingType]);

    return score;
}

function interpretScore(score) {
    if (score < 0.3) return "High probability of Grade 5 damage; Very High probability of Grade 4 damage";
    if (score < 0.7) return "High probability of Grade 4 damage; Very High probability of Grade 3 damage";
    if (score < 2.0) return "High probability of Grade 3 damage; Very High probability of Grade 2 damage";
    if (score < 2.5) return "High probability of Grade 2 damage; Very High probability of Grade 1 damage";
    return "Probability of Grade 1 damage";
}

export function assessBuildingSafety(userInput) {
    const score = calculateFemaSafetyScore(userInput.buildingType, {
        verticalIrregularityHigh: userInput.verticalIrregularityHigh,
        verticalIrregularityModerate: userInput.verticalIrregularityModerate,
        planIrregularity: userInput.planIrregularity,
        preCode: userInput.yearOfConstruction < 1990, // Assuming pre-code is before 1990
        postBenchmark: userInput.yearOfConstruction > 2000, // Assuming post-benchmark is after 2000
        soilType: userInput.soilType,
        stories: userInput.numberOfStories
    });

    const interpretation = interpretScore(score);
    const normalizedScore = (score / 4.1) * 100; // Normalize to 0-100 scale

    return {
        rawScore: score.toFixed(2),
        normalizedScore: normalizedScore.toFixed(2),
        interpretation: interpretation,
        buildingType: BUILDING_TYPES[userInput.buildingType]
    };
}