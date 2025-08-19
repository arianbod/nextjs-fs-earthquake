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
			// Inferred building type based on neighborhood analysis
			likelyBuildingType: this.inferBuildingType(buildingTypes, neighborhoodDensity),
			
			// Estimated construction period
			estimatedConstructionPeriod: estimatedAge,
			
			// Neighborhood characteristics that affect seismic risk
			neighborhoodDensity: neighborhoodDensity,
			
			// Building height estimation based on area characteristics
			estimatedStories: this.estimateStoryCount(buildingTypes, neighborhoodDensity),
			
			// Suggested soil type based on geographic area
			suggestedSoilType: this.inferSoilType(geocodeResults),
			
			// Confidence metrics
			confidence: {
				buildingType: this.calculateConfidence(buildingTypes, nearbyPlaces),
				neighborhood: neighborhoodDensity > 5 ? 'high' : 'medium',
				overall: 'medium'
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
		// Basic estimation based on neighborhood development patterns
		const currentYear = new Date().getFullYear();
		
		// Simplified logic - can be enhanced with more sophisticated analysis
		if (nearbyPlaces.some(p => p.types.includes('shopping_mall'))) {
			return '1990-2010'; // Modern commercial areas
		} else if (nearbyPlaces.some(p => p.types.includes('university'))) {
			return '1970-1990'; // Educational districts
		} else {
			return '1980-2000'; // General estimation
		}
	}

	estimateStoryCount(buildingTypes, density) {
		if (density > 20) return '5-10';
		if (density > 10) return '3-5';
		if (density > 5) return '2-4';
		return '1-3';
	}

	inferSoilType(geocodeResults) {
		// Basic soil type inference based on geographic patterns
		// This is a simplified approach - real implementation would use geological data
		if (!geocodeResults || geocodeResults.length === 0) return 'ZC';

		const address = geocodeResults[0].formatted_address.toLowerCase();
		
		if (address.includes('coast') || address.includes('beach')) {
			return 'ZD'; // Coastal areas often have softer soils
		} else if (address.includes('hill') || address.includes('mountain')) {
			return 'ZB'; // Hilly areas often have firmer soils
		} else {
			return 'ZC'; // Default for most urban areas
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