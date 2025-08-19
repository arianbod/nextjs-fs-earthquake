// Earthquake calculation configuration parameters
export const CALCULATION_CONFIG = {
	// Regulation scores based on construction period
	regulationScores: {
		"Before 1975": 40,
		"1975-1998": 55,
		"1998-2007": 70,
		"2007-2018": 85,
		"After 2018 (TBDY)": 95
	},

	// Soil type modifiers
	soilModifiers: {
		"ZA": 15,  // Rock - highest modifier
		"ZB": 10,  // Very dense sand/gravel, dense clay
		"ZC": 5,   // Dense sand/gravel, medium dense clay
		"ZD": -5,  // Medium dense sand/gravel, soft clay
		"ZE": -15  // Soft sand/clay with high plasticity - lowest modifier
	},

	// Seismic zone factors (Turkey-specific)
	zoneFactors: {
		"Zone 1": 10,  // Low seismic activity
		"Zone 2": 5,   // Moderate seismic activity
		"Zone 3": -5,  // High seismic activity
		"Zone 4": -15  // Very high seismic activity
	},

	// Building type base scores
	buildingTypeScores: {
		"W1": 75,  // Light frame wood
		"W2": 70,  // Commercial and industrial
		"S1": 80,  // Steel moment frame
		"S2": 75,  // Steel braced frame
		"S3": 70,  // Steel light frame
		"S4": 65,  // Steel frame with cast-in-place concrete shear walls
		"S5": 60,  // Steel frame with unreinforced masonry infill walls
		"C1": 85,  // Concrete moment frame
		"C2": 80,  // Concrete shear walls
		"C3": 75,  // Concrete frame with unreinforced masonry infill walls
		"PC1": 70, // Precast concrete tilt-up walls
		"PC2": 65, // Precast concrete frames with concrete shear walls
		"RM1": 60, // Reinforced masonry bearing walls with wood or metal deck diaphragms
		"RM2": 55, // Reinforced masonry bearing walls with precast concrete diaphragms
		"URM": 35, // Unreinforced masonry bearing walls
		"MH": 40   // Mobile homes
	},

	// Richter scale thresholds for safety assessment
	richterThresholds: {
		safe: 5.5,      // Green zone - building considered safe
		caution: 6.5,   // Yellow zone - caution required
		danger: 8.0     // Red zone - dangerous conditions
	},

	// Performance level thresholds
	performanceLevels: {
		excellent: 90,
		good: 75,
		fair: 60,
		poor: 45,
		critical: 30
	},

	// Age factors
	ageFactors: {
		"0-10": 10,    // New construction bonus
		"11-20": 5,    // Relatively new
		"21-30": 0,    // Neutral
		"31-40": -5,   // Aging concerns
		"41-50": -10,  // Significant aging
		"50+": -20     // Old construction penalty
	},

	// Story height impact
	storyImpact: {
		"1-3": 5,      // Low-rise advantage
		"4-7": 0,      // Mid-rise neutral
		"8-15": -5,    // High-rise penalty
		"16+": -15     // Very high-rise significant penalty
	},

	// Irregularity penalties
	irregularityPenalties: {
		verticalHigh: -20,
		verticalModerate: -10,
		planIrregularity: -15,
		softStory: -25,
		shortColumn: -15
	},

	// Minimum and maximum score bounds
	scoreBounds: {
		minimum: 0,
		maximum: 100
	},

	// Default values for missing inputs
	defaults: {
		buildingType: "C1",
		soilType: "ZC",
		zone: "Zone 2",
		regulation: "2007-2018",
		stories: 3,
		yearOfConstruction: 2010
	}
};

// Helper functions for calculations
export const CalculationHelpers = {
	/**
	 * Calculate age category from construction year
	 * @param {number} yearOfConstruction 
	 * @returns {string} Age category key
	 */
	getAgeCategory(yearOfConstruction) {
		const currentYear = new Date().getFullYear();
		const age = currentYear - yearOfConstruction;
		
		if (age <= 10) return "0-10";
		if (age <= 20) return "11-20";
		if (age <= 30) return "21-30";
		if (age <= 40) return "31-40";
		if (age <= 50) return "41-50";
		return "50+";
	},

	/**
	 * Calculate story impact category
	 * @param {number} numberOfStories 
	 * @returns {string} Story category key
	 */
	getStoryCategory(numberOfStories) {
		if (numberOfStories <= 3) return "1-3";
		if (numberOfStories <= 7) return "4-7";
		if (numberOfStories <= 15) return "8-15";
		return "16+";
	},

	/**
	 * Determine performance level based on score
	 * @param {number} score 
	 * @returns {string} Performance level
	 */
	getPerformanceLevel(score) {
		const { performanceLevels } = CALCULATION_CONFIG;
		
		if (score >= performanceLevels.excellent) return "excellent";
		if (score >= performanceLevels.good) return "good";
		if (score >= performanceLevels.fair) return "fair";
		if (score >= performanceLevels.poor) return "poor";
		return "critical";
	},

	/**
	 * Calculate maximum safe Richter magnitude for building
	 * @param {number} overallScore 
	 * @returns {number} Maximum safe Richter scale
	 */
	calculateMaxSafeRichter(overallScore) {
		// Base safe magnitude starts at 4.0
		const baseMagnitude = 4.0;
		
		// Scale factor: higher scores allow for higher magnitudes
		// Score of 100 should handle up to ~7.0, score of 50 should handle ~5.5
		const scaleFactor = (overallScore / 100) * 3.0;
		
		const maxSafe = baseMagnitude + scaleFactor;
		
		// Cap at reasonable limits
		return Math.min(Math.max(maxSafe, 4.0), 8.0);
	},

	/**
	 * Get building classification based on score
	 * @param {number} score 
	 * @returns {object} Classification details
	 */
	getBuildingClassification(score) {
		const performanceLevel = this.getPerformanceLevel(score);
		
		const classifications = {
			excellent: {
				category: "High Performance",
				description: "Exceeds seismic safety standards",
				color: "green",
				icon: "shield-check"
			},
			good: {
				category: "Good Performance", 
				description: "Meets seismic safety standards",
				color: "blue",
				icon: "shield"
			},
			fair: {
				category: "Adequate Performance",
				description: "Basic seismic safety requirements met",
				color: "yellow",
				icon: "shield-alert"
			},
			poor: {
				category: "Below Standard",
				description: "Improvements recommended for safety",
				color: "orange", 
				icon: "alert-triangle"
			},
			critical: {
				category: "Critical Risk",
				description: "Immediate structural assessment required",
				color: "red",
				icon: "alert-octagon"
			}
		};

		return classifications[performanceLevel];
	}
};

export default CALCULATION_CONFIG;