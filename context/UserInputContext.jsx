// File: /context/UserInputContext.js
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { imageStorageManager, createImageGallery } from '@/lib/imageStorage';
import {
	createAssessment,
	getAssessment,
	updateAssessment,
	saveLocation,
	saveBuildingInfo,
	saveSafetyResult,
} from '@/lib/actions/assessment';
import { saveImages, getAssessmentImages, saveImage } from '@/lib/actions/file';
import { saveGoogleImagery, getGoogleImagery } from '@/lib/actions/imagery';

const UserInputContext = createContext();

/**
 * UserInputProvider - Client-side cache backed by database
 *
 * All data is persisted in the database. Context serves as:
 * 1. In-memory cache during active session
 * 2. State management for React components
 *
 * Data flow:
 * - New assessment: createAssessment → DB creates record → context gets ID
 * - Resume assessment: loadAssessment → DB fetch → context populated
 * - Updates: updateUserInput → context updated → saveXxxToDb → DB persisted
 */
export const UserInputProvider = ({ children }) => {
	const getDefaultState = () => ({
		// Database tracking
		assessmentId: null,
		dbSyncStatus: 'idle', // 'idle', 'saving', 'saved', 'error'
		lastSavedAt: null,

		// Location data
		location: null,
		address: '',
		latitude: null,
		longitude: null,
		city: null,
		neighborhood: null,
		country: 'Turkey',
		typeOfEarthquake: '',
		typeOfSoil: '',
		earthquakeZone: '',
		soilType: '',
		designRegulation: '',
		numberOfStories: 0,
		yearOfConstruction: '',
		structuralSystem: '',
		irregularity: '',
		planDimensions: [],
		manipulated: false,
		specificCondition: '',
		extraLoad: '',
		neighborBuildings: '',
		// New fields for improved building definition
		buildingLength: '',
		buildingWidth: '',
		storyHeight: '',
		columnSpacing: '',
		buildingType: '',
		dataSource: '', // 'auto-detected', 'ai-analysis', 'template', 'manual'
		confidence: null,
		// Street View and satellite image fields
		streetViewUrl: null,
		satelliteViewUrl: null,
		streetViewImages: [],
		streetViewData: null,
		// Enhanced data from Google Places and Street View
		enhancedData: null,
		environmentalData: null,
		environmentalDataReviewed: false,
		// Structural notes and AI insights
		structuralNotes: '',
		aiInsights: null,
		// Weather data
		weather: null,
		// User uploaded photos (loaded from DB)
		uploadedPhotos: [], // Array of { id, base64, name, size, type, analyzed }
		aiAnalysisData: null,
		aiAnalysisComplete: false,
	});

	const [userInput, setUserInput] = useState(getDefaultState);
	const [isLoadingFromDb, setIsLoadingFromDb] = useState(false);

	const updateUserInput = (newData) => {
		setUserInput((prevData) => ({ ...prevData, ...newData }));
	};

	// ============================================
	// DATABASE SYNC FUNCTIONS
	// ============================================

	/**
	 * Start a new assessment in the database
	 * @returns {Promise<string|null>} Assessment ID or null on error
	 */
	const startNewAssessment = useCallback(async () => {
		try {
			setUserInput((prev) => ({ ...prev, dbSyncStatus: 'saving' }));
			const result = await createAssessment();

			if (result.success) {
				setUserInput((prev) => ({
					...prev,
					assessmentId: result.assessmentId,
					dbSyncStatus: 'saved',
					lastSavedAt: new Date().toISOString(),
				}));
				return result.assessmentId;
			} else {
				console.error('Failed to create assessment:', result.error);
				setUserInput((prev) => ({ ...prev, dbSyncStatus: 'error' }));
				return null;
			}
		} catch (error) {
			console.error('Error creating assessment:', error);
			setUserInput((prev) => ({ ...prev, dbSyncStatus: 'error' }));
			return null;
		}
	}, []);

	/**
	 * Load an existing assessment from the database
	 * @param {string} id - Assessment ID
	 * @returns {Promise<boolean>} Success status
	 */
	const loadAssessment = useCallback(async (id) => {
		if (!id) return false;

		try {
			setIsLoadingFromDb(true);
			const result = await getAssessment(id, true);

			if (!result.success) {
				console.error('Failed to load assessment:', result.error);
				return false;
			}

			const { assessment } = result;

			// Load AI photo analysis from assessment (primary source)
			let aiAnalysisData = assessment.aiPhotoAnalysis || null;
			let aiAnalysisComplete = !!assessment.aiPhotoAnalysis;

			// Also fetch user-uploaded images from DB
			let uploadedPhotos = [];

			const imagesResult = await getAssessmentImages(id, 'USER_UPLOAD', true);
			if (imagesResult.success && imagesResult.images?.length > 0) {
				uploadedPhotos = imagesResult.images.map((img) => ({
					id: img.id,
					base64: img.imageData,
					name: img.fileName || 'photo.jpg',
					size: img.fileSize,
					type: img.mimeType || 'image/jpeg',
					analyzed: aiAnalysisComplete, // Mark as analyzed if we have analysis data
					aiAnalysis: img.aiAnalysis,
				}));
			}

			// Fetch Google imagery from DB
			let streetViewImages = [];
			let satelliteViewUrl = null;

			const googleImageryResult = await getGoogleImagery(id);
			if (googleImageryResult.success) {
				streetViewImages = googleImageryResult.streetViewImages || [];
				satelliteViewUrl = googleImageryResult.satelliteUrl;
			}

			// Map database fields to context state
			const mappedData = {
				assessmentId: assessment.id,
				dbSyncStatus: 'saved',
				lastSavedAt: assessment.updatedAt,

				// Location data
				...(assessment.location && {
					latitude: assessment.location.latitude,
					longitude: assessment.location.longitude,
					address: assessment.location.fullAddress || '',
					city: assessment.location.city,
					neighborhood: assessment.location.neighborhood,
					country: assessment.location.country || 'Turkey',
					earthquakeZone: assessment.location.earthquakeZone,
					soilType: assessment.location.soilType,
				}),

				// Weather data
				weather: assessment.weather,

				// Building info
				...(assessment.buildingInfo && {
					numberOfStories: assessment.buildingInfo.numberOfFloors,
					yearOfConstruction: assessment.buildingInfo.constructionYear?.toString() || '',
					structuralSystem: assessment.buildingInfo.structuralSystem,
					buildingType: assessment.buildingInfo.buildingType,
					irregularity: assessment.buildingInfo.hasVerticalIrregularity || assessment.buildingInfo.hasPlanIrregularity ? 'yes' : 'no',
				}),

				// Structural data from JSON fields
				structuralSystemData: assessment.structuralSystem,
				irregularities: assessment.irregularities,
				planDefinition: assessment.planDefinition,
				manipulations: assessment.manipulations,
				specificConditions: assessment.specificConditions,
				extraLoad: assessment.extraLoad,
				neighborBuildings: assessment.neighborBuildings,

				// AI insights from safety result
				...(assessment.safetyResult && {
					aiInsights: assessment.safetyResult.aiAnalysis,
				}),

				// Uploaded photos from DB
				uploadedPhotos,
				aiAnalysisData,
				aiAnalysisComplete,

				// Google imagery from DB
				streetViewImages,
				satelliteViewUrl,
				googleImagesStored: streetViewImages.length > 0 || !!satelliteViewUrl,
			};

			setUserInput((prev) => ({
				...getDefaultState(),
				...mappedData,
			}));

			return true;
		} catch (error) {
			console.error('Error loading assessment:', error);
			return false;
		} finally {
			setIsLoadingFromDb(false);
		}
	}, []);

	/**
	 * Save location data to database (Step 1)
	 * @returns {Promise<boolean>} Success status
	 */
	const saveLocationToDb = useCallback(async () => {
		let assessmentId = userInput.assessmentId;

		// Create assessment if doesn't exist
		if (!assessmentId) {
			assessmentId = await startNewAssessment();
			if (!assessmentId) return false;
		}

		try {
			setUserInput((prev) => ({ ...prev, dbSyncStatus: 'saving' }));

			const locationData = {
				latitude: userInput.latitude,
				longitude: userInput.longitude,
				fullAddress: userInput.address,
				city: userInput.city,
				neighborhood: userInput.neighborhood,
				country: userInput.country,
				earthquakeZone: userInput.earthquakeZone,
				soilType: userInput.soilType,
				placeId: userInput.enhancedData?.placeId,
				placeName: userInput.enhancedData?.name,
			};

			const result = await saveLocation(assessmentId, locationData);

			if (result.success) {
				setUserInput((prev) => ({
					...prev,
					dbSyncStatus: 'saved',
					lastSavedAt: new Date().toISOString(),
				}));
				return true;
			} else {
				setUserInput((prev) => ({ ...prev, dbSyncStatus: 'error' }));
				return false;
			}
		} catch (error) {
			console.error('Error saving location:', error);
			setUserInput((prev) => ({ ...prev, dbSyncStatus: 'error' }));
			return false;
		}
	}, [userInput, startNewAssessment]);

	/**
	 * Save weather and street view data to database (Step 2)
	 * @returns {Promise<boolean>} Success status
	 */
	const saveWeatherToDb = useCallback(async () => {
		if (!userInput.assessmentId) return false;

		try {
			setUserInput((prev) => ({ ...prev, dbSyncStatus: 'saving' }));

			const result = await updateAssessment(userInput.assessmentId, {
				weather: userInput.weather || userInput.environmentalData,
				currentStep: 3,
			});

			if (result.success) {
				setUserInput((prev) => ({
					...prev,
					dbSyncStatus: 'saved',
					lastSavedAt: new Date().toISOString(),
				}));
				return true;
			} else {
				setUserInput((prev) => ({ ...prev, dbSyncStatus: 'error' }));
				return false;
			}
		} catch (error) {
			console.error('Error saving weather:', error);
			setUserInput((prev) => ({ ...prev, dbSyncStatus: 'error' }));
			return false;
		}
	}, [userInput.assessmentId, userInput.weather, userInput.environmentalData]);

	/**
	 * Save AI photo analysis results to database (Step 3)
	 * @param {object} analysisData - AI analysis results
	 * @returns {Promise<boolean>} Success status
	 */
	const saveAiPhotoAnalysisToDb = useCallback(async (analysisData) => {
		if (!userInput.assessmentId) return false;

		try {
			setUserInput((prev) => ({ ...prev, dbSyncStatus: 'saving' }));

			const result = await updateAssessment(userInput.assessmentId, {
				aiPhotoAnalysis: analysisData,
				currentStep: 4,
			});

			if (result.success) {
				setUserInput((prev) => ({
					...prev,
					dbSyncStatus: 'saved',
					lastSavedAt: new Date().toISOString(),
					aiAnalysisData: analysisData,
					aiAnalysisComplete: true,
				}));
				return true;
			} else {
				setUserInput((prev) => ({ ...prev, dbSyncStatus: 'error' }));
				return false;
			}
		} catch (error) {
			console.error('Error saving AI photo analysis:', error);
			setUserInput((prev) => ({ ...prev, dbSyncStatus: 'error' }));
			return false;
		}
	}, [userInput.assessmentId]);

	/**
	 * Save building info to database (Step 4)
	 * @returns {Promise<boolean>} Success status
	 */
	const saveBuildingInfoToDb = useCallback(async () => {
		if (!userInput.assessmentId) return false;

		try {
			setUserInput((prev) => ({ ...prev, dbSyncStatus: 'saving' }));

			const buildingData = {
				buildingType: userInput.buildingType,
				numberOfFloors: parseInt(userInput.numberOfStories) || 1,
				constructionYear: userInput.yearOfConstruction ? parseInt(userInput.yearOfConstruction) : null,
				structuralSystem: userInput.structuralSystem,
				buildingAge: userInput.yearOfConstruction
					? new Date().getFullYear() - parseInt(userInput.yearOfConstruction)
					: null,
				hasVerticalIrregularity: userInput.irregularity === 'yes' || userInput.irregularity?.includes('vertical'),
				hasPlanIrregularity: userInput.irregularity === 'yes' || userInput.irregularity?.includes('plan'),
				soilType: userInput.soilType,
				floorArea: userInput.buildingLength && userInput.buildingWidth
					? parseFloat(userInput.buildingLength) * parseFloat(userInput.buildingWidth)
					: null,
			};

			const result = await saveBuildingInfo(userInput.assessmentId, buildingData);

			if (result.success) {
				setUserInput((prev) => ({
					...prev,
					dbSyncStatus: 'saved',
					lastSavedAt: new Date().toISOString(),
				}));
				return true;
			} else {
				setUserInput((prev) => ({ ...prev, dbSyncStatus: 'error' }));
				return false;
			}
		} catch (error) {
			console.error('Error saving building info:', error);
			setUserInput((prev) => ({ ...prev, dbSyncStatus: 'error' }));
			return false;
		}
	}, [userInput]);

	/**
	 * Save structural data to database (Steps 5-11)
	 * @param {number} step - Current step number
	 * @param {object} data - Step data to save
	 * @returns {Promise<boolean>} Success status
	 */
	const saveStructuralDataToDb = useCallback(async (step, data) => {
		if (!userInput.assessmentId) return false;

		try {
			setUserInput((prev) => ({ ...prev, dbSyncStatus: 'saving' }));

			const updateData = { currentStep: step + 1 };

			// Map step to database field
			switch (step) {
				case 5:
					updateData.structuralSystem = data;
					break;
				case 6:
					updateData.irregularities = data;
					break;
				case 7:
					updateData.planDefinition = data;
					break;
				case 8:
					updateData.manipulations = data;
					break;
				case 9:
					updateData.specificConditions = data;
					break;
				case 10:
					updateData.extraLoad = data;
					break;
				case 11:
					updateData.neighborBuildings = data;
					break;
			}

			const result = await updateAssessment(userInput.assessmentId, updateData);

			if (result.success) {
				setUserInput((prev) => ({
					...prev,
					dbSyncStatus: 'saved',
					lastSavedAt: new Date().toISOString(),
				}));
				return true;
			} else {
				setUserInput((prev) => ({ ...prev, dbSyncStatus: 'error' }));
				return false;
			}
		} catch (error) {
			console.error('Error saving structural data:', error);
			setUserInput((prev) => ({ ...prev, dbSyncStatus: 'error' }));
			return false;
		}
	}, [userInput.assessmentId]);

	/**
	 * Save final safety results to database
	 * @param {object} results - Safety calculation results
	 * @returns {Promise<boolean>} Success status
	 */
	const saveSafetyResultToDb = useCallback(async (results) => {
		if (!userInput.assessmentId) return false;

		try {
			setUserInput((prev) => ({ ...prev, dbSyncStatus: 'saving' }));

			const resultData = {
				overallScore: results.score || results.overallScore,
				riskLevel: results.riskLevel,
				safetyRating: results.grade || results.safetyRating,
				structuralScore: results.structuralScore,
				foundationScore: results.foundationScore,
				materialScore: results.materialScore,
				irregularityScore: results.irregularityScore,
				siteScore: results.siteScore,
				femaScore: results.femaScore,
				tbdyScore: results.tbdyScore,
				vulnerabilityIndex: results.vulnerabilityIndex,
				mainRiskFactors: results.riskFactors || results.mainRiskFactors,
				criticalIssues: results.criticalIssues,
				immediateActions: results.immediateActions,
				shortTermActions: results.shortTermActions,
				longTermActions: results.longTermActions,
				aiAnalysis: results.aiAnalysis || userInput.aiInsights,
				aiConfidence: results.confidence,
				calculationMethod: results.calculationMethod || 'TBDY-2018',
			};

			const result = await saveSafetyResult(userInput.assessmentId, resultData);

			if (result.success) {
				setUserInput((prev) => ({
					...prev,
					dbSyncStatus: 'saved',
					lastSavedAt: new Date().toISOString(),
				}));
				return true;
			} else {
				setUserInput((prev) => ({ ...prev, dbSyncStatus: 'error' }));
				return false;
			}
		} catch (error) {
			console.error('Error saving safety result:', error);
			setUserInput((prev) => ({ ...prev, dbSyncStatus: 'error' }));
			return false;
		}
	}, [userInput.assessmentId, userInput.aiInsights]);

	/**
	 * Save images to database
	 * @param {array} images - Array of image objects with base64 data
	 * @param {string} imageType - Type of images (USER_UPLOAD, STREET_VIEW, etc.)
	 * @returns {Promise<boolean>} Success status
	 */
	const saveImagesToDb = useCallback(async (images, imageType = 'USER_UPLOAD') => {
		if (!userInput.assessmentId || !images?.length) return false;

		try {
			const imageData = images.map((img) => ({
				imageType,
				imageData: img.data || img.base64 || img.imageData,
				thumbnailData: img.thumbnail || img.thumbnailData,
				fileName: img.name || img.fileName,
				mimeType: img.type || img.mimeType || 'image/jpeg',
				fileSize: img.size || img.fileSize,
				description: img.description,
				angle: img.angle,
				aiAnalysis: img.aiAnalysis,
			}));

			const result = await saveImages(userInput.assessmentId, imageData);

			if (result.success) {
				console.log(`Saved ${result.count} images to database`);
				return true;
			} else {
				console.error('Failed to save images:', result.error);
				return false;
			}
		} catch (error) {
			console.error('Error saving images:', error);
			return false;
		}
	}, [userInput.assessmentId]);

	/**
	 * Reset assessment and start fresh
	 */
	const resetAssessment = useCallback(() => {
		setUserInput(getDefaultState());
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch (error) {
			console.warn('Failed to clear localStorage:', error);
		}
	}, []);

	// Image management functions
	const storeGoogleImages = async (streetViewUrls, satelliteUrl, location) => {
		try {
			const imageData = await imageStorageManager.storeGoogleImages(streetViewUrls, satelliteUrl, location);
			const gallery = createImageGallery(imageStorageManager.getAllImages());

			updateUserInput({
				imageGallery: gallery,
				googleImagesStored: true,
				googleImagesStoredAt: new Date().toISOString(),
				// Also store the raw URLs for easy access
				streetViewImages: streetViewUrls?.filter(img => img.url) || [],
				satelliteViewUrl: satelliteUrl,
			});

			// Save to database if we have an assessment ID
			if (userInput.assessmentId) {
				try {
					const dbResult = await saveGoogleImagery(userInput.assessmentId, {
						streetViewImages: streetViewUrls?.map(sv => ({
							url: sv.url,
							heading: sv.angle || sv.heading,
							angle: sv.description || `Street View ${sv.angle || 0}°`,
							available: true,
						})) || [],
						satelliteUrl,
						latitude: location?.lat || userInput.latitude,
						longitude: location?.lng || userInput.longitude,
					});

					if (dbResult.success) {
						console.log(`Saved Google imagery to DB: ${dbResult.streetViewCount} street views, satellite: ${dbResult.hasSatellite}`);
					} else {
						console.warn('Failed to save Google imagery to DB:', dbResult.error);
					}
				} catch (dbError) {
					console.warn('Error saving Google imagery to database:', dbError);
				}
			}

			return imageData;
		} catch (error) {
			console.error('Error storing Google images:', error);
			return null;
		}
	};

	const storeUserImages = async (files) => {
		try {
			const userImages = await imageStorageManager.storeUserImages(files);
			const gallery = createImageGallery(imageStorageManager.getAllImages());
			
			updateUserInput({
				imageGallery: gallery,
				userImagesStored: true,
				userImagesStoredAt: new Date().toISOString()
			});
			
			return userImages;
		} catch (error) {
			console.error('Error storing user images:', error);
			return null;
		}
	};

	const getImageGallery = () => {
		return createImageGallery(imageStorageManager.getAllImages());
	};

	/**
	 * Store uploaded photos to context (for preservation during navigation)
	 * @param {Array} photos - Array of photo objects with file data
	 */
	const storeUploadedPhotos = useCallback((photos) => {
		setUserInput((prev) => ({
			...prev,
			uploadedPhotos: photos,
		}));
	}, []);

	/**
	 * Clear uploaded photos from context
	 */
	const clearUploadedPhotos = useCallback(() => {
		setUserInput((prev) => ({
			...prev,
			uploadedPhotos: [],
			aiAnalysisData: null,
			aiAnalysisComplete: false,
		}));
	}, []);

	const value = {
		userInput,
		updateUserInput,
		// Image management functions
		storeGoogleImages,
		storeUserImages,
		getImageGallery,
		storeUploadedPhotos,
		clearUploadedPhotos,
		// Database sync functions
		isLoadingFromDb,
		startNewAssessment,
		loadAssessment,
		saveLocationToDb,
		saveWeatherToDb,
		saveAiPhotoAnalysisToDb,
		saveBuildingInfoToDb,
		saveStructuralDataToDb,
		saveSafetyResultToDb,
		saveImagesToDb,
		resetAssessment,
	};

	return (
		<UserInputContext.Provider value={value}>
			{children}
		</UserInputContext.Provider>
	);
};

export const useUserInput = () => {
	const context = useContext(UserInputContext);
	if (!context) {
		throw new Error('useUserInput must be used within a UserInputProvider');
	}
	return context;
};

export default UserInputContext;
