// Turkish Seismic API Service Layer
// This service provides a unified interface for accessing seismic data
// Currently uses mock data but can be easily extended to use real APIs

import { TURKEY_SEISMIC_ZONES, getZoneByCoordinates } from '@/utils/turkeySeismicData';

/**
 * Turkey Seismic Service Class
 * Provides methods for accessing seismic information for Turkish locations
 */
export class TurkeySeismicService {
	constructor(useMockData = true) {
		this.useMockData = useMockData;
		this.apiEndpoint = process.env.NEXT_PUBLIC_SEISMIC_API_ENDPOINT || null;
		this.apiKey = process.env.NEXT_PUBLIC_SEISMIC_API_KEY || null;
		this.retryAttempts = 3;
		this.timeoutMs = 5000;
	}

	/**
	 * Get seismic data for a specific location
	 * @param {number} latitude - Latitude coordinate
	 * @param {number} longitude - Longitude coordinate
	 * @returns {Promise<Object>} Seismic data including zone, risk level, PGA, etc.
	 */
	async getSeismicData(latitude, longitude) {
		try {
			// If using mock data or no API endpoint configured, use local data
			if (this.useMockData || !this.apiEndpoint) {
				return this._getMockSeismicData(latitude, longitude);
			}

			// Try to fetch from real API with fallback to mock data
			try {
				const realData = await this._fetchFromAPI(latitude, longitude);
				return this._processAPIResponse(realData);
			} catch (apiError) {
				console.warn('API fetch failed, falling back to mock data:', apiError);
				return this._getMockSeismicData(latitude, longitude);
			}
		} catch (error) {
			console.error('Error getting seismic data:', error);
			throw new Error('Failed to retrieve seismic information');
		}
	}

	/**
	 * Get seismic data using mock/local data
	 * @param {number} latitude - Latitude coordinate  
	 * @param {number} longitude - Longitude coordinate
	 * @returns {Promise<Object>} Mock seismic data
	 */
	async _getMockSeismicData(latitude, longitude) {
		// Simulate API delay
		await new Promise(resolve => setTimeout(resolve, 200));

		const zoneInfo = getZoneByCoordinates(latitude, longitude);
		
		return {
			success: true,
			data: {
				location: {
					latitude,
					longitude,
					accuracy: 'high'
				},
				seismic: {
					zone: zoneInfo.zone,
					riskLevel: zoneInfo.riskLevel,
					pga: zoneInfo.pga,
					soilClass: zoneInfo.soilType,
					nearestFault: zoneInfo.nearestFaultDistance || 50,
					estimatedMagnitude: this._estimateMaxMagnitude(zoneInfo.zone),
					returnPeriod: this._getReturnPeriod(zoneInfo.zone)
				},
				metadata: {
					source: 'turkey_seismic_zones_mock',
					timestamp: new Date().toISOString(),
					nearestCity: zoneInfo.name || 'Unknown',
					isEstimated: zoneInfo.isEstimated || false
				}
			}
		};
	}

	/**
	 * Fetch data from external API (when available)
	 * @param {number} latitude - Latitude coordinate
	 * @param {number} longitude - Longitude coordinate  
	 * @returns {Promise<Object>} API response
	 */
	async _fetchFromAPI(latitude, longitude) {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

		try {
			const response = await fetch(
				`${this.apiEndpoint}/seismic?lat=${latitude}&lng=${longitude}`,
				{
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${this.apiKey}`,
						'Content-Type': 'application/json'
					},
					signal: controller.signal
				}
			);

			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`API responded with status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			clearTimeout(timeoutId);
			throw error;
		}
	}

	/**
	 * Process and normalize API response
	 * @param {Object} apiResponse - Raw API response
	 * @returns {Object} Normalized seismic data
	 */
	_processAPIResponse(apiResponse) {
		// Transform external API response to our standard format
		return {
			success: true,
			data: {
				location: {
					latitude: apiResponse.coordinates?.lat || 0,
					longitude: apiResponse.coordinates?.lng || 0,
					accuracy: apiResponse.accuracy || 'medium'
				},
				seismic: {
					zone: apiResponse.zone || 'Zone 2',
					riskLevel: apiResponse.risk_level || 'Moderate',
					pga: apiResponse.pga || 0.25,
					soilClass: apiResponse.soil_type || 'ZC',
					nearestFault: apiResponse.nearest_fault_km || 50,
					estimatedMagnitude: apiResponse.max_magnitude || 6.5,
					returnPeriod: apiResponse.return_period || '200-500 years'
				},
				metadata: {
					source: 'external_api',
					timestamp: apiResponse.timestamp || new Date().toISOString(),
					nearestCity: apiResponse.nearest_city || 'Unknown',
					isEstimated: apiResponse.is_estimated || false
				}
			}
		};
	}

	/**
	 * Get all available cities with seismic data
	 * @returns {Promise<Array>} List of cities with seismic information
	 */
	async getAvailableCities() {
		try {
			const cities = Object.entries(TURKEY_SEISMIC_ZONES.cities).map(([name, data]) => ({
				name,
				zone: data.zone,
				riskLevel: data.riskLevel,
				coordinates: data.coordinates,
				pga: data.pga,
				description: data.description
			}));

			return {
				success: true,
				data: cities
			};
		} catch (error) {
			console.error('Error getting cities:', error);
			throw new Error('Failed to retrieve city information');
		}
	}

	/**
	 * Get seismic zone definitions
	 * @returns {Promise<Object>} Zone definitions with descriptions
	 */
	async getZoneDefinitions() {
		try {
			return {
				success: true,
				data: TURKEY_SEISMIC_ZONES.zoneDefinitions
			};
		} catch (error) {
			console.error('Error getting zone definitions:', error);
			throw new Error('Failed to retrieve zone definitions');
		}
	}

	/**
	 * Get major fault information
	 * @returns {Promise<Array>} List of major faults in Turkey
	 */
	async getMajorFaults() {
		try {
			return {
				success: true,
				data: TURKEY_SEISMIC_ZONES.majorFaults
			};
		} catch (error) {
			console.error('Error getting fault information:', error);
			throw new Error('Failed to retrieve fault information');
		}
	}

	/**
	 * Batch process multiple locations
	 * @param {Array<Object>} locations - Array of {latitude, longitude} objects
	 * @returns {Promise<Array>} Array of seismic data for each location
	 */
	async batchGetSeismicData(locations) {
		try {
			const promises = locations.map(location => 
				this.getSeismicData(location.latitude, location.longitude)
			);
			
			const results = await Promise.allSettled(promises);
			
			return results.map((result, index) => ({
				location: locations[index],
				success: result.status === 'fulfilled',
				data: result.status === 'fulfilled' ? result.value : null,
				error: result.status === 'rejected' ? result.reason.message : null
			}));
		} catch (error) {
			console.error('Error in batch processing:', error);
			throw new Error('Failed to process multiple locations');
		}
	}

	/**
	 * Check service health and connectivity
	 * @returns {Promise<Object>} Service status information
	 */
	async checkServiceHealth() {
		try {
			const startTime = Date.now();
			
			// Test with Ankara coordinates
			const testResult = await this.getSeismicData(39.9334, 32.8597);
			const responseTime = Date.now() - startTime;
			
			return {
				success: true,
				data: {
					status: 'healthy',
					responseTime: `${responseTime}ms`,
					usingMockData: this.useMockData,
					timestamp: new Date().toISOString(),
					testLocation: 'Ankara',
					version: '1.0.0'
				}
			};
		} catch (error) {
			return {
				success: false,
				data: {
					status: 'unhealthy',
					error: error.message,
					timestamp: new Date().toISOString()
				}
			};
		}
	}

	// Helper methods

	/**
	 * Estimate maximum earthquake magnitude for a zone
	 * @param {string} zone - Seismic zone identifier
	 * @returns {number} Estimated maximum magnitude
	 */
	_estimateMaxMagnitude(zone) {
		const magnitudes = {
			'Zone 1': 6.0,
			'Zone 2': 6.5,
			'Zone 3': 7.0,
			'Zone 4': 7.5
		};
		return magnitudes[zone] || 6.5;
	}

	/**
	 * Get return period for earthquakes in a zone
	 * @param {string} zone - Seismic zone identifier
	 * @returns {string} Return period description
	 */
	_getReturnPeriod(zone) {
		const periods = {
			'Zone 1': '> 500 years',
			'Zone 2': '200-500 years',
			'Zone 3': '100-200 years',
			'Zone 4': '< 100 years'
		};
		return periods[zone] || '200-500 years';
	}

	/**
	 * Set API configuration
	 * @param {Object} config - API configuration object
	 */
	setAPIConfig(config) {
		if (config.endpoint) this.apiEndpoint = config.endpoint;
		if (config.apiKey) this.apiKey = config.apiKey;
		if (config.timeout) this.timeoutMs = config.timeout;
		if (typeof config.useMockData === 'boolean') this.useMockData = config.useMockData;
	}
}

// Export singleton instance
export const turkeySeismicService = new TurkeySeismicService();

// Export utility functions
export const SeismicUtils = {
	/**
	 * Calculate distance between two coordinates
	 * @param {number} lat1 
	 * @param {number} lng1 
	 * @param {number} lat2 
	 * @param {number} lng2 
	 * @returns {number} Distance in kilometers
	 */
	calculateDistance(lat1, lng1, lat2, lng2) {
		const R = 6371; // Earth's radius in km
		const dLat = (lat2 - lat1) * Math.PI / 180;
		const dLng = (lng2 - lng1) * Math.PI / 180;
		const a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
			Math.sin(dLng/2) * Math.sin(dLng/2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		return R * c;
	},

	/**
	 * Format coordinates for display
	 * @param {number} latitude 
	 * @param {number} longitude 
	 * @returns {string} Formatted coordinate string
	 */
	formatCoordinates(latitude, longitude) {
		const latDir = latitude >= 0 ? 'N' : 'S';
		const lngDir = longitude >= 0 ? 'E' : 'W';
		return `${Math.abs(latitude).toFixed(6)}°${latDir}, ${Math.abs(longitude).toFixed(6)}°${lngDir}`;
	},

	/**
	 * Validate coordinates
	 * @param {number} latitude 
	 * @param {number} longitude 
	 * @returns {boolean} True if coordinates are valid
	 */
	validateCoordinates(latitude, longitude) {
		return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
	}
};

// Export helper function for route compatibility
export function getSeismicDataByCoordinates(latitude, longitude) {
	return turkeySeismicService.getSeismicData(latitude, longitude);
}

export default TurkeySeismicService;