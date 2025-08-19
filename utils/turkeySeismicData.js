// Turkish seismic data and location utilities
// Based on Turkey's seismic hazard map and major city locations

export const TURKEY_SEISMIC_ZONES = {
	// Major Turkish cities with their seismic data
	cities: {
		"Antalya": {
			coordinates: { lat: 36.8969, lng: 30.7133 },
			zone: "Zone 2",
			riskLevel: "Moderate",
			pga: 0.25, // Peak Ground Acceleration (g)
			soilType: "ZC", // Typical soil type for the region
			nearestFaultDistance: 15, // km
			description: "Mediterranean coastal city with moderate seismic activity"
		},
		"Istanbul": {
			coordinates: { lat: 41.0082, lng: 28.9784 },
			zone: "Zone 4",
			riskLevel: "Very High",
			pga: 0.40,
			soilType: "ZD",
			nearestFaultDistance: 5,
			description: "Located near North Anatolian Fault, highest seismic risk"
		},
		"Ankara": {
			coordinates: { lat: 39.9334, lng: 32.8597 },
			zone: "Zone 3",
			riskLevel: "High",
			pga: 0.30,
			soilType: "ZC",
			nearestFaultDistance: 25,
			description: "Central Anatolia, significant seismic activity"
		},
		"Izmir": {
			coordinates: { lat: 38.4237, lng: 27.1428 },
			zone: "Zone 4",
			riskLevel: "Very High",
			pga: 0.45,
			soilType: "ZD",
			nearestFaultDistance: 3,
			description: "Aegean coast, very high seismic activity due to multiple faults"
		},
		"Bursa": {
			coordinates: { lat: 40.1826, lng: 29.0669 },
			zone: "Zone 3",
			riskLevel: "High",
			pga: 0.35,
			soilType: "ZC",
			nearestFaultDistance: 10,
			description: "Marmara region, high seismic risk"
		},
		"Adana": {
			coordinates: { lat: 37.0000, lng: 35.3213 },
			zone: "Zone 3",
			riskLevel: "High",
			pga: 0.32,
			soilType: "ZD",
			nearestFaultDistance: 20,
			description: "Southern Turkey, high seismic activity"
		},
		"Gaziantep": {
			coordinates: { lat: 37.0662, lng: 37.3833 },
			zone: "Zone 4",
			riskLevel: "Very High",
			pga: 0.42,
			soilType: "ZC",
			nearestFaultDistance: 8,
			description: "Southeast Anatolia, very high seismic risk"
		},
		"Konya": {
			coordinates: { lat: 37.8746, lng: 32.4932 },
			zone: "Zone 2",
			riskLevel: "Moderate",
			pga: 0.22,
			soilType: "ZB",
			nearestFaultDistance: 35,
			description: "Central Anatolia, moderate seismic activity"
		},
		"Kayseri": {
			coordinates: { lat: 38.7312, lng: 35.4787 },
			zone: "Zone 2",
			riskLevel: "Moderate",
			pga: 0.24,
			soilType: "ZC",
			nearestFaultDistance: 30,
			description: "Central Anatolia, moderate seismic risk"
		},
		"Trabzon": {
			coordinates: { lat: 41.0015, lng: 39.7178 },
			zone: "Zone 2",
			riskLevel: "Moderate",
			pga: 0.26,
			soilType: "ZC",
			nearestFaultDistance: 40,
			description: "Black Sea coast, moderate seismic activity"
		},
		"Diyarbakir": {
			coordinates: { lat: 37.9144, lng: 40.2306 },
			zone: "Zone 3",
			riskLevel: "High",
			pga: 0.33,
			soilType: "ZC",
			nearestFaultDistance: 18,
			description: "Southeast Anatolia, high seismic risk"
		},
		"Eskisehir": {
			coordinates: { lat: 39.7767, lng: 30.5206 },
			zone: "Zone 2",
			riskLevel: "Moderate",
			pga: 0.23,
			soilType: "ZB",
			nearestFaultDistance: 28,
			description: "Central Anatolia, moderate seismic activity"
		}
	},

	// Seismic zone definitions according to Turkish standards
	zoneDefinitions: {
		"Zone 1": {
			description: "Low seismic activity",
			pgaRange: "0.10 - 0.20g",
			expectedMagnitude: "< 6.0",
			returnPeriod: "> 500 years",
			color: "#22c55e" // Green
		},
		"Zone 2": {
			description: "Moderate seismic activity", 
			pgaRange: "0.20 - 0.30g",
			expectedMagnitude: "6.0 - 6.5",
			returnPeriod: "200 - 500 years",
			color: "#eab308" // Yellow
		},
		"Zone 3": {
			description: "High seismic activity",
			pgaRange: "0.30 - 0.40g", 
			expectedMagnitude: "6.5 - 7.0",
			returnPeriod: "100 - 200 years",
			color: "#f97316" // Orange
		},
		"Zone 4": {
			description: "Very high seismic activity",
			pgaRange: "> 0.40g",
			expectedMagnitude: "> 7.0", 
			returnPeriod: "< 100 years",
			color: "#ef4444" // Red
		}
	},

	// Major fault lines in Turkey
	majorFaults: [
		{
			name: "North Anatolian Fault",
			type: "Strike-slip",
			length: 1500, // km
			cities: ["Istanbul", "Bursa", "Ankara"],
			riskLevel: "Very High"
		},
		{
			name: "East Anatolian Fault",
			type: "Strike-slip", 
			length: 650,
			cities: ["Gaziantep", "Diyarbakir"],
			riskLevel: "Very High"
		},
		{
			name: "Aegean Graben System",
			type: "Normal",
			length: 300,
			cities: ["Izmir"],
			riskLevel: "High"
		},
		{
			name: "Gediz Graben",
			type: "Normal",
			length: 140,
			cities: ["Izmir"],
			riskLevel: "High"
		}
	]
};

/**
 * Get seismic zone information based on coordinates
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {object} Seismic zone information
 */
export function getZoneByCoordinates(latitude, longitude) {
	// Find the closest city to the given coordinates
	let closestCity = null;
	let minDistance = Infinity;

	for (const [cityName, cityData] of Object.entries(TURKEY_SEISMIC_ZONES.cities)) {
		const distance = calculateDistance(
			latitude, 
			longitude, 
			cityData.coordinates.lat, 
			cityData.coordinates.lng
		);

		if (distance < minDistance) {
			minDistance = distance;
			closestCity = { name: cityName, ...cityData, distance };
		}
	}

	// If no city is close enough (> 100km), provide a default zone
	if (minDistance > 100) {
		return {
			zone: "Zone 2",
			riskLevel: "Moderate",
			pga: 0.25,
			soilType: "ZC",
			nearestFaultDistance: 50,
			description: "Estimated seismic parameters for this location",
			isEstimated: true,
			nearestCity: closestCity
		};
	}

	return {
		...closestCity,
		isEstimated: false
	};
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 
 * @param {number} lng1 
 * @param {number} lat2 
 * @param {number} lng2 
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
	const R = 6371; // Earth's radius in km
	const dLat = (lat2 - lat1) * Math.PI / 180;
	const dLng = (lng2 - lng1) * Math.PI / 180;
	const a = 
		Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
		Math.sin(dLng/2) * Math.sin(dLng/2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	return R * c;
}

/**
 * Get seismic zone color based on zone
 * @param {string} zone 
 * @returns {string} Hex color code
 */
export function getZoneColor(zone) {
	return TURKEY_SEISMIC_ZONES.zoneDefinitions[zone]?.color || "#6b7280";
}

/**
 * Get detailed information about a seismic zone
 * @param {string} zone 
 * @returns {object} Zone definition
 */
export function getZoneDefinition(zone) {
	return TURKEY_SEISMIC_ZONES.zoneDefinitions[zone] || {
		description: "Unknown zone",
		pgaRange: "N/A",
		expectedMagnitude: "N/A",
		returnPeriod: "N/A",
		color: "#6b7280"
	};
}

/**
 * Get recommended soil investigation depth based on zone and building height
 * @param {string} zone 
 * @param {number} stories 
 * @returns {object} Soil investigation recommendations
 */
export function getSoilInvestigationRecommendations(zone, stories) {
	const baseDepth = stories <= 3 ? 10 : stories <= 7 ? 15 : 20;
	const zoneMultiplier = {
		"Zone 1": 1.0,
		"Zone 2": 1.2,
		"Zone 3": 1.5,
		"Zone 4": 2.0
	};

	const recommendedDepth = baseDepth * (zoneMultiplier[zone] || 1.2);

	return {
		minimumDepth: Math.round(recommendedDepth),
		boreholeCount: Math.max(3, Math.ceil(stories / 2)),
		testingRequired: zone === "Zone 3" || zone === "Zone 4",
		specialStudies: zone === "Zone 4" ? ["Dynamic soil analysis", "Liquefaction assessment"] : []
	};
}

export default TURKEY_SEISMIC_ZONES;