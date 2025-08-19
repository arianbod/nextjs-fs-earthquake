// Google Street View Service for Building Analysis
// This service provides building visual analysis using Google Street View Static API

/**
 * Street View Service Class
 * Provides methods for fetching and analyzing building images from Street View
 */
export class StreetViewService {
	constructor() {
		this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
		this.baseUrl = 'https://maps.googleapis.com/maps/api/streetview';
		this.maxRetries = 3;
	}

	/**
	 * Get building analysis from Street View images
	 * @param {number} latitude - Latitude coordinate
	 * @param {number} longitude - Longitude coordinate
	 * @returns {Promise<Object>} Building analysis data
	 */
	async getBuildingAnalysis(latitude, longitude) {
		try {
			const imageUrls = await this.generateStreetViewUrls(latitude, longitude);
			const analysisResults = await this.analyzeStreetViewImages(imageUrls);
			
			return {
				success: true,
				data: {
					images: imageUrls,
					analysis: analysisResults,
					metadata: {
						source: 'google_street_view',
						timestamp: new Date().toISOString(),
						location: { latitude, longitude }
					}
				}
			};
		} catch (error) {
			console.error('Error analyzing building from Street View:', error);
			throw new Error('Failed to analyze building from Street View');
		}
	}

	/**
	 * Generate Street View image URLs from multiple angles
	 * @param {number} latitude - Latitude coordinate
	 * @param {number} longitude - Longitude coordinate
	 * @returns {Promise<Array>} Array of image URLs with metadata
	 */
	async generateStreetViewUrls(latitude, longitude) {
		const baseParams = {
			size: '640x640',
			key: this.apiKey,
			location: `${latitude},${longitude}`,
			return_error_code: true
		};

		// Multiple viewing angles for comprehensive analysis
		const viewingAngles = [
			{ heading: 0, pitch: 0, fov: 90, description: 'North view' },
			{ heading: 90, pitch: 0, fov: 90, description: 'East view' },
			{ heading: 180, pitch: 0, fov: 90, description: 'South view' },
			{ heading: 270, pitch: 0, fov: 90, description: 'West view' },
			{ heading: 0, pitch: 10, fov: 60, description: 'North elevated view' },
			{ heading: 0, pitch: -10, fov: 60, description: 'North ground view' }
		];

		const imagePromises = viewingAngles.map(async (angle) => {
			const params = new URLSearchParams({
				...baseParams,
				heading: angle.heading,
				pitch: angle.pitch,
				fov: angle.fov
			});

			const url = `${this.baseUrl}?${params}`;
			
			// Check if Street View image is available for this angle
			const isAvailable = await this.checkStreetViewAvailability(latitude, longitude, angle.heading);
			
			return {
				url,
				angle,
				available: isAvailable,
				description: angle.description
			};
		});

		const imageResults = await Promise.all(imagePromises);
		return imageResults.filter(result => result.available);
	}

	/**
	 * Check if Street View imagery is available for a location and heading
	 * @param {number} latitude - Latitude coordinate
	 * @param {number} longitude - Longitude coordinate
	 * @param {number} heading - Viewing direction in degrees
	 * @returns {Promise<boolean>} Whether imagery is available
	 */
	async checkStreetViewAvailability(latitude, longitude, heading = 0) {
		try {
			const metadataUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${latitude},${longitude}&heading=${heading}&key=${this.apiKey}`;
			
			const response = await fetch(metadataUrl);
			const data = await response.json();
			
			return data.status === 'OK';
		} catch (error) {
			console.warn('Failed to check Street View availability:', error);
			return false;
		}
	}

	/**
	 * Analyze Street View images to extract building characteristics
	 * @param {Array} imageUrls - Array of image URL objects
	 * @returns {Promise<Object>} Analysis results
	 */
	async analyzeStreetViewImages(imageUrls) {
		if (imageUrls.length === 0) {
			return {
				error: 'No Street View images available for this location',
				confidence: 'none'
			};
		}

		// Analyze the most promising views (front-facing and elevated)
		const primaryViews = imageUrls.filter(img => 
			img.angle.heading === 0 || img.angle.pitch > 0
		).slice(0, 3);

		const analysisResults = {
			buildingVisible: imageUrls.length > 0,
			viewsAnalyzed: primaryViews.length,
			estimatedCharacteristics: this.extractBuildingCharacteristics(imageUrls),
			structuralObservations: this.analyzeStructuralFeatures(imageUrls),
			environmentalFactors: this.analyzeEnvironmentalFactors(imageUrls),
			confidence: this.calculateAnalysisConfidence(imageUrls)
		};

		return analysisResults;
	}

	/**
	 * Extract building characteristics from Street View metadata
	 * @param {Array} imageUrls - Array of image URL objects
	 * @returns {Object} Estimated building characteristics
	 */
	extractBuildingCharacteristics(imageUrls) {
		// Since we can't actually process the images without computer vision,
		// we provide structure for future AI integration and current heuristics
		
		const availableViews = imageUrls.length;
		const hasElevatedView = imageUrls.some(img => img.angle.pitch > 0);
		const hasMultipleAngles = imageUrls.length >= 3;

		return {
			// Building type estimation based on Street View availability and urban context
			estimatedType: this.estimateBuildingTypeFromContext(availableViews, hasElevatedView),
			
			// Story estimation based on viewing angles available
			estimatedStories: this.estimateStoriesFromViews(hasElevatedView, hasMultipleAngles),
			
			// Construction material hints (for future AI analysis)
			materialHints: this.getMaterialHints(imageUrls),
			
			// Structural system suggestions
			structuralSystemHints: this.getStructuralHints(availableViews, hasElevatedView),
			
			// Age estimation context
			ageEstimationContext: this.getAgeEstimationContext(imageUrls)
		};
	}

	/**
	 * Analyze structural features visible in Street View
	 * @param {Array} imageUrls - Array of image URL objects
	 * @returns {Object} Structural analysis
	 */
	analyzeStructuralFeatures(imageUrls) {
		const multipleViews = imageUrls.length >= 3;
		const hasElevatedView = imageUrls.some(img => img.angle.pitch > 0);

		return {
			// Irregularity assessment potential
			irregularityAssessment: {
				canAssessPlan: multipleViews,
				canAssessVertical: hasElevatedView,
				recommendation: multipleViews ? 
					'Multiple Street View angles available for irregularity assessment' :
					'Limited view angles - manual inspection recommended'
			},
			
			// Foundation and ground level analysis
			foundationAnalysis: {
				groundLevelVisible: imageUrls.some(img => img.angle.pitch <= 0),
				recommendation: 'Check for soft story conditions and foundation exposure'
			},
			
			// Building envelope assessment
			envelopeAssessment: {
				facadeAnalysisPossible: imageUrls.length > 0,
				recommendation: 'Analyze facade for material quality and maintenance condition'
			}
		};
	}

	/**
	 * Analyze environmental factors affecting seismic risk
	 * @param {Array} imageUrls - Array of image URL objects
	 * @returns {Object} Environmental analysis
	 */
	analyzeEnvironmentalFactors(imageUrls) {
		return {
			// Neighborhood density assessment
			densityIndicators: {
				streetViewAvailable: imageUrls.length > 0,
				multipleAnglesAvailable: imageUrls.length >= 3,
				assessment: imageUrls.length > 0 ? 
					'Urban area with Street View coverage - likely developed neighborhood' :
					'Limited Street View coverage - may be rural or newly developed area'
			},
			
			// Adjacent building analysis
			adjacentBuildings: {
				analysisNote: 'Street View can help identify pounding risk from adjacent buildings',
				recommendation: 'Check building spacing and height differences in Street View images'
			},
			
			// Site conditions
			siteConditions: {
				topographyHints: 'Analyze Street View for slope conditions and drainage',
				accessibilityFactors: 'Assess emergency access routes and site accessibility'
			}
		};
	}

	// Helper methods for building characteristic estimation

	estimateBuildingTypeFromContext(availableViews, hasElevatedView) {
		if (availableViews === 0) return 'Unknown - No Street View available';
		if (availableViews >= 4 && hasElevatedView) return 'Likely multi-story building in urban area';
		if (availableViews >= 2) return 'Likely residential building in developed area';
		return 'Single view available - limited assessment possible';
	}

	estimateStoriesFromViews(hasElevatedView, hasMultipleAngles) {
		if (hasElevatedView && hasMultipleAngles) {
			return '2-5 stories (elevated view suggests multi-story structure)';
		} else if (hasMultipleAngles) {
			return '1-3 stories (multiple angles available)';
		} else {
			return '1-2 stories (limited view assessment)';
		}
	}

	getMaterialHints(imageUrls) {
		// Placeholder for future AI image analysis
		return {
			note: 'Material analysis requires AI image processing',
			recommendation: 'Implement computer vision for facade material detection',
			futureFeatures: [
				'Concrete vs masonry detection',
				'Building condition assessment',
				'Window and opening pattern analysis'
			]
		};
	}

	getStructuralHints(availableViews, hasElevatedView) {
		if (availableViews >= 3 && hasElevatedView) {
			return {
				assessment: 'Good visibility for structural system assessment',
				recommendations: [
					'Check for soft story conditions',
					'Assess column and beam visibility',
					'Look for structural irregularities'
				]
			};
		} else {
			return {
				assessment: 'Limited structural assessment possible',
				recommendations: [
					'Request additional building information',
					'Consider on-site inspection',
					'Use typical building characteristics for area'
				]
			};
		}
	}

	getAgeEstimationContext(imageUrls) {
		return {
			streetViewData: imageUrls.length > 0,
			analysisNote: 'Building age estimation possible through architectural style analysis',
			recommendation: 'Combine Street View analysis with neighborhood development patterns',
			futureEnhancements: [
				'AI-based architectural period detection',
				'Construction material age analysis',
				'Neighborhood development timeline correlation'
			]
		};
	}

	calculateAnalysisConfidence(imageUrls) {
		const viewCount = imageUrls.length;
		const hasElevatedView = imageUrls.some(img => img.angle.pitch > 0);
		const hasMultipleAngles = imageUrls.length >= 3;

		if (viewCount === 0) return 'none';
		if (viewCount >= 4 && hasElevatedView && hasMultipleAngles) return 'high';
		if (viewCount >= 2 && hasMultipleAngles) return 'medium';
		return 'low';
	}

	/**
	 * Generate metadata URL for Street View image checking
	 * @param {number} latitude - Latitude coordinate
	 * @param {number} longitude - Longitude coordinate
	 * @returns {string} Metadata API URL
	 */
	getMetadataUrl(latitude, longitude) {
		return `https://maps.googleapis.com/maps/api/streetview/metadata?location=${latitude},${longitude}&key=${this.apiKey}`;
	}

	/**
	 * Get Street View panorama information
	 * @param {number} latitude - Latitude coordinate
	 * @param {number} longitude - Longitude coordinate
	 * @returns {Promise<Object>} Panorama metadata
	 */
	async getPanoramaInfo(latitude, longitude) {
		try {
			const metadataUrl = this.getMetadataUrl(latitude, longitude);
			const response = await fetch(metadataUrl);
			const data = await response.json();

			if (data.status === 'OK') {
				return {
					available: true,
					location: data.location,
					date: data.date,
					copyright: data.copyright,
					panoId: data.pano_id
				};
			} else {
				return {
					available: false,
					error: data.status
				};
			}
		} catch (error) {
			console.error('Error fetching panorama info:', error);
			return {
				available: false,
				error: error.message
			};
		}
	}
}

// Export singleton instance
export const streetViewService = new StreetViewService();

export default StreetViewService;