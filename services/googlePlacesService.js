// Google Places Service for Enhanced Building Data Detection
// This service provides automatic building information detection using Google Places API

/**
 * Google Places Service Class
 * Provides methods for fetching building and location data from Google Places API
 */
export class GooglePlacesService {
	constructor() {
		this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
		this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
		this.geocodingUrl = 'https://maps.googleapis.com/maps/api/geocode';
	}

	/**
	 * Get enhanced location data including building information
	 * @param {number} latitude - Latitude coordinate
	 * @param {number} longitude - Longitude coordinate
	 * @returns {Promise<Object>} Enhanced location data
	 */
	async getEnhancedLocationData(latitude, longitude) {
		try {
			const [geocodeData, nearbyPlaces] = await Promise.all([
				this.reverseGeocode(latitude, longitude),
				this.getNearbyBuildings(latitude, longitude)
			]);

			return {
				success: true,
				data: {
					address: this.extractAddressComponents(geocodeData),
					buildingInfo: this.inferBuildingCharacteristics(geocodeData, nearbyPlaces),
					neighborhood: this.extractNeighborhoodData(geocodeData, nearbyPlaces),
					metadata: {
						source: 'google_places_api',
						timestamp: new Date().toISOString(),
						confidence: 'high'
					}
				}
			};
		} catch (error) {
			console.error('Error fetching enhanced location data:', error);
			throw new Error('Failed to fetch enhanced location data');
		}
	}

	/**
	 * Reverse geocode coordinates to get detailed address information
	 * @param {number} latitude - Latitude coordinate
	 * @param {number} longitude - Longitude coordinate
	 * @returns {Promise<Object>} Geocoding results
	 */
	async reverseGeocode(latitude, longitude) {
		const response = await fetch(
			`${this.geocodingUrl}/json?latlng=${latitude},${longitude}&key=${this.apiKey}&language=en`
		);

		if (!response.ok) {
			throw new Error(`Geocoding API error: ${response.status}`);
		}

		const data = await response.json();
		
		if (data.status !== 'OK') {
			throw new Error(`Geocoding failed: ${data.status}`);
		}

		return data.results;
	}

	/**
	 * Get nearby buildings and points of interest
	 * @param {number} latitude - Latitude coordinate
	 * @param {number} longitude - Longitude coordinate
	 * @returns {Promise<Array>} Nearby places
	 */
	async getNearbyBuildings(latitude, longitude) {
		const types = [
			'establishment',
			'point_of_interest', 
			'premise',
			'subpremise',
			'building'
		];

		const promises = types.map(type => 
			this.searchNearbyPlaces(latitude, longitude, type, 100)
		);

		const results = await Promise.allSettled(promises);
		
		return results
			.filter(result => result.status === 'fulfilled')
			.flatMap(result => result.value);
	}

	/**
	 * Search for nearby places of a specific type
	 * @param {number} latitude - Latitude coordinate
	 * @param {number} longitude - Longitude coordinate
	 * @param {string} type - Place type to search for
	 * @param {number} radius - Search radius in meters
	 * @returns {Promise<Array>} Places array
	 */
	async searchNearbyPlaces(latitude, longitude, type, radius = 100) {
		const response = await fetch(
			`${this.baseUrl}/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${this.apiKey}`
		);

		if (!response.ok) {
			throw new Error(`Places API error: ${response.status}`);
		}

		const data = await response.json();
		
		if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
			throw new Error(`Places search failed: ${data.status}`);
		}

		return data.results || [];
	}

	/**
	 * Get detailed place information
	 * @param {string} placeId - Google Place ID
	 * @returns {Promise<Object>} Detailed place data
	 */
	async getPlaceDetails(placeId) {
		const fields = [
			'name',
			'formatted_address',
			'geometry',
			'types',
			'photos',
			'rating',
			'user_ratings_total',
			'opening_hours',
			'business_status'
		].join(',');

		const response = await fetch(
			`${this.baseUrl}/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}`
		);

		if (!response.ok) {
			throw new Error(`Place details API error: ${response.status}`);
		}

		const data = await response.json();
		
		if (data.status !== 'OK') {
			throw new Error(`Place details failed: ${data.status}`);
		}

		return data.result;
	}

	/**
	 * Extract and structure address components
	 * @param {Array} geocodeResults - Geocoding results
	 * @returns {Object} Structured address data
	 */
	extractAddressComponents(geocodeResults) {
		if (!geocodeResults || geocodeResults.length === 0) {
			return null;
		}

		const result = geocodeResults[0];
		const components = {};

		result.address_components.forEach(component => {
			const types = component.types;
			
			if (types.includes('street_number')) {
				components.streetNumber = component.long_name;
			}
			if (types.includes('route')) {
				components.street = component.long_name;
			}
			if (types.includes('sublocality') || types.includes('neighborhood')) {
				components.neighborhood = component.long_name;
			}
			if (types.includes('locality')) {
				components.city = component.long_name;
			}
			if (types.includes('administrative_area_level_1')) {
				components.state = component.long_name;
			}
			if (types.includes('country')) {
				components.country = component.long_name;
			}
			if (types.includes('postal_code')) {
				components.postalCode = component.long_name;
			}
		});

		return {
			formatted: result.formatted_address,
			components,
			placeId: result.place_id,
			accuracy: this.getLocationAccuracy(result.geometry.location_type)
		};
	}

	/**
	 * Infer building characteristics from available data
	 * @param {Array} geocodeResults - Geocoding results
	 * @param {Array} nearbyPlaces - Nearby places data
	 * @returns {Object} Inferred building characteristics
	 */
	inferBuildingCharacteristics(geocodeResults, nearbyPlaces) {
		const buildingTypes = this.analyzeBuildingTypes(nearbyPlaces);
		const neighborhoodDensity = this.calculateNeighborhoodDensity(nearbyPlaces);
		const estimatedAge = this.estimateBuildingAge(geocodeResults, nearbyPlaces);

		return {
			// IMPORTANT: These are ESTIMATES based on neighborhood analysis, not actual building data
			dataSource: 'NEIGHBORHOOD_ANALYSIS_ESTIMATE',
			disclaimer: 'These values are estimated based on neighborhood patterns, not actual building records',
			
			// Inferred building type based on neighborhood analysis
			likelyBuildingType: {
				value: this.inferBuildingType(buildingTypes, neighborhoodDensity),
				isEstimate: true,
				method: 'Inferred from neighborhood density and nearby building types'
			},
			
			// Estimated construction period
			estimatedConstructionPeriod: {
				value: estimatedAge,
				isEstimate: true,
				method: 'Guessed based on area development patterns'
			},
			
			// Neighborhood characteristics that affect seismic risk
			neighborhoodDensity: {
				value: neighborhoodDensity,
				isRealData: true,
				method: 'Actual count of nearby establishments from Google Places'
			},
			
			// Building height estimation based on area characteristics
			estimatedStories: {
				value: this.estimateStoryCount(buildingTypes, neighborhoodDensity),
				isEstimate: true,
				method: 'Statistical guess based on neighborhood density'
			},
			
			// Suggested soil type based on geographic area
			suggestedSoilType: {
				value: this.inferSoilType(geocodeResults),
				isEstimate: true,
				method: 'Geographic pattern analysis - NOT actual geological survey data'
			},
			
			// Confidence metrics
			confidence: {
				buildingType: this.calculateConfidence(buildingTypes, nearbyPlaces),
				neighborhood: neighborhoodDensity > 5 ? 'high' : 'medium',
				overall: 'low',
				note: 'Low confidence - using neighborhood patterns, not building-specific data'
			}
		};
	}

	/**
	 * Extract neighborhood characteristics
	 * @param {Array} geocodeResults - Geocoding results
	 * @param {Array} nearbyPlaces - Nearby places data
	 * @returns {Object} Neighborhood data
	 */
	extractNeighborhoodData(geocodeResults, nearbyPlaces) {
		const businessTypes = this.categorizeBusinessTypes(nearbyPlaces);
		const demographics = this.inferDemographics(businessTypes);

		return {
			businessTypes,
			demographics,
			developmentLevel: this.assessDevelopmentLevel(businessTypes),
			safetyFactors: this.assessSafetyFactors(nearbyPlaces)
		};
	}

	// Helper methods for data analysis

	analyzeBuildingTypes(places) {
		const typeCount = {};
		
		places.forEach(place => {
			place.types.forEach(type => {
				if (this.isBuildingRelatedType(type)) {
					typeCount[type] = (typeCount[type] || 0) + 1;
				}
			});
		});

		return typeCount;
	}

	isBuildingRelatedType(type) {
		const buildingTypes = [
			'lodging', 'real_estate_agency', 'moving_company',
			'home_goods_store', 'furniture_store', 'apartment',
			'condominium', 'housing', 'residential'
		];
		
		return buildingTypes.includes(type) || 
			   type.includes('residential') || 
			   type.includes('commercial') ||
			   type.includes('building');
	}

	calculateNeighborhoodDensity(places) {
		// Calculate density based on number of establishments in 100m radius
		return places.length;
	}

	inferBuildingType(buildingTypes, density) {
		if (density > 20) {
			return 'High-rise apartment/Commercial';
		} else if (density > 10) {
			return 'Mid-rise residential';
		} else if (density > 5) {
			return 'Low-rise residential';
		} else {
			return 'Single family home';
		}
	}

	estimateBuildingAge(geocodeResults, nearbyPlaces) {
		// WARNING: This is a rough guess based on neighborhood landmarks
		// NOT actual construction year data
		const currentYear = new Date().getFullYear();
		
		// This is a very rough heuristic - NOT reliable
		if (nearbyPlaces.some(p => p.types.includes('shopping_mall'))) {
			return '1990-2010 (ESTIMATED)'; // Modern commercial areas
		} else if (nearbyPlaces.some(p => p.types.includes('university'))) {
			return '1970-1990 (ESTIMATED)'; // Educational districts
		} else {
			return '1980-2000 (ESTIMATED)'; // Default guess
		}
	}

	estimateStoryCount(buildingTypes, density) {
		// WARNING: This is a statistical guess based on area density
		// NOT actual building height data
		if (density > 20) return '5-10 floors (ESTIMATED)';
		if (density > 10) return '3-5 floors (ESTIMATED)';
		if (density > 5) return '2-4 floors (ESTIMATED)';
		return '1-3 floors (ESTIMATED)';
	}

	inferSoilType(geocodeResults) {
		// WARNING: This is NOT real geological data!
		// This is a very rough guess based on location names
		// Actual soil analysis requires geological surveys
		if (!geocodeResults || geocodeResults.length === 0) return 'ZC (DEFAULT - No actual data)';

		const address = geocodeResults[0].formatted_address.toLowerCase();
		
		if (address.includes('coast') || address.includes('beach')) {
			return 'ZD (GUESSED - coastal area)'; // Coastal assumption
		} else if (address.includes('hill') || address.includes('mountain')) {
			return 'ZB (GUESSED - hillside area)'; // Hillside assumption
		} else {
			return 'ZC (DEFAULT - no geological data)'; // Default guess
		}
	}

	categorizeBusinessTypes(places) {
		const categories = {
			commercial: 0,
			residential: 0,
			industrial: 0,
			institutional: 0,
			recreational: 0
		};

		places.forEach(place => {
			place.types.forEach(type => {
				if (['store', 'shopping', 'restaurant', 'bank'].some(t => type.includes(t))) {
					categories.commercial++;
				} else if (['lodging', 'real_estate', 'residential'].some(t => type.includes(t))) {
					categories.residential++;
				} else if (['hospital', 'school', 'university', 'government'].some(t => type.includes(t))) {
					categories.institutional++;
				} else if (['park', 'gym', 'entertainment'].some(t => type.includes(t))) {
					categories.recreational++;
				}
			});
		});

		return categories;
	}

	inferDemographics(businessTypes) {
		const total = Object.values(businessTypes).reduce((sum, count) => sum + count, 0);
		
		if (total === 0) return 'mixed';
		
		const percentages = {};
		Object.entries(businessTypes).forEach(([type, count]) => {
			percentages[type] = (count / total) * 100;
		});

		const dominant = Object.entries(percentages)
			.sort(([,a], [,b]) => b - a)[0][0];

		return dominant;
	}

	assessDevelopmentLevel(businessTypes) {
		const total = Object.values(businessTypes).reduce((sum, count) => sum + count, 0);
		
		if (total > 15) return 'high';
		if (total > 8) return 'medium';
		return 'low';
	}

	assessSafetyFactors(places) {
		const safetyFactors = {
			nearHospital: places.some(p => p.types.includes('hospital')),
			nearFireStation: places.some(p => p.types.includes('fire_station')),
			nearPolice: places.some(p => p.types.includes('police')),
			nearSchool: places.some(p => p.types.includes('school')),
			openSpaces: places.some(p => p.types.includes('park'))
		};

		const safetyScore = Object.values(safetyFactors).filter(Boolean).length;
		
		return {
			...safetyFactors,
			score: safetyScore,
			level: safetyScore > 3 ? 'high' : safetyScore > 1 ? 'medium' : 'low'
		};
	}

	calculateConfidence(buildingTypes, places) {
		const dataPoints = Object.keys(buildingTypes).length + places.length;
		
		if (dataPoints > 10) return 'high';
		if (dataPoints > 5) return 'medium';
		return 'low';
	}

	getLocationAccuracy(locationType) {
		const accuracyMap = {
			'ROOFTOP': 'high',
			'RANGE_INTERPOLATED': 'medium',
			'GEOMETRIC_CENTER': 'low',
			'APPROXIMATE': 'low'
		};
		
		return accuracyMap[locationType] || 'medium';
	}
}

// Export singleton instance
export const googlePlacesService = new GooglePlacesService();

export default GooglePlacesService;