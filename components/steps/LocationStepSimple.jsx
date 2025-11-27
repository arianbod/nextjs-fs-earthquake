// components/steps/LocationStepSimple.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUserInput } from '@/context/UserInputContext';
import { getZoneByCoordinates } from '@/utils/turkeySeismicData';
import { googlePlacesService } from '@/services/googlePlacesService';
import { streetViewService } from '@/services/streetViewService';
import { MyMapComponent } from '@/components/MyMapComponent';
import {
	MapPin,
	AlertTriangle,
	Loader2,
	ArrowRight,
	Info,
	LocateFixed,
	CheckCircle2
} from 'lucide-react';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * LocationStepSimple - Simplified location step
 *
 * Key UX principles:
 * - Simple, clean UI with just map + address + seismic zone
 * - All data (street views, weather, etc.) collected SILENTLY in background
 * - "Wow moments" saved for results page reveal
 * - User just sees: map, address, zone number
 */
const LocationStepSimple = ({ onNext }) => {
	const { userInput, updateUserInput, storeGoogleImages } = useUserInput();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [seismicZone, setSeismicZone] = useState(null);
	const [loadingProgress, setLoadingProgress] = useState(0);
	const [loadingStep, setLoadingStep] = useState('');
	const [backgroundDataCollected, setBackgroundDataCollected] = useState(false);

	// Collect ALL data silently in background - don't show any of it
	const collectBackgroundData = async (latitude, longitude, city = null) => {
		try {
			const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

			// Parallel collection of all data sources
			const [placesData, streetViewData, weatherData] = await Promise.allSettled([
				googlePlacesService.getEnhancedLocationData(latitude, longitude),
				streetViewService.getBuildingAnalysis(latitude, longitude),
				fetchWeatherData(latitude, longitude)
			]);

			// Generate satellite URL
			const satelliteUrl = apiKey
				? `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=19&size=640x640&maptype=satellite&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`
				: null;

			// Process and store Places data silently
			if (placesData.status === 'fulfilled' && placesData.value.success) {
				const data = placesData.value.data;
				updateUserInput(prev => ({
					...prev,
					// Building characteristics (hidden from user)
					numberOfStories: data.buildingInfo?.estimatedStories || prev.numberOfStories,
					typeOfSoil: data.buildingInfo?.suggestedSoilType || prev.typeOfSoil,
					// Address info
					address: data.address?.formatted || prev.address,
					city: data.address?.components?.city || city || prev.city,
					neighborhood: data.address?.components?.neighborhood || prev.neighborhood,
					country: data.address?.components?.country || 'Turkey'
				}));
			}

			// Process Street View data silently - save for results reveal
			let streetViewImages = [];
			let mainStreetViewUrl = null;

			if (streetViewData.status === 'fulfilled' && streetViewData.value.success) {
				streetViewImages = streetViewData.value.data.images || [];
				const mainView = streetViewImages.find(img => img.available) || streetViewImages[0];
				mainStreetViewUrl = mainView?.url || null;

				const analysis = streetViewData.value.data.analysis;
				updateUserInput(prev => ({
					...prev,
					// Save for results page "wow" reveal
					streetViewUrl: mainStreetViewUrl,
					streetViewImages: streetViewImages,
					streetViewData: streetViewData.value.data,
					// Hidden AI insights
					designRegulation: analysis?.estimatedCharacteristics?.ageEstimationContext || prev.designRegulation,
					structuralNotes: analysis?.estimatedCharacteristics?.estimatedType || prev.structuralNotes
				}));
			}

			// Always save satellite URL
			updateUserInput(prev => ({
				...prev,
				satelliteViewUrl: satelliteUrl
			}));

			// Store images for results reveal
			const locationData = {
				latitude,
				longitude,
				city: city || userInput.city || 'Unknown Location',
				address: userInput.address || 'Address not available'
			};
			storeGoogleImages(streetViewImages, satelliteUrl, locationData);

			// Process weather data silently - save for expert mode
			if (weatherData.status === 'fulfilled' && weatherData.value) {
				updateUserInput(prev => ({
					...prev,
					weatherData: weatherData.value
				}));
			}

			setBackgroundDataCollected(true);
		} catch (error) {
			console.error('Background data collection error:', error);
			// Don't show error to user - this is background data
		}
	};

	// Fetch weather data silently
	const fetchWeatherData = async (lat, lng) => {
		try {
			// Simulate weather API (in production, use real API)
			await new Promise(resolve => setTimeout(resolve, 500));

			return {
				rainfall: {
					total5Days: Math.floor(Math.random() * 50) + 10,
					maxDaily: Math.floor(Math.random() * 20) + 5,
					monthlyEstimate: Math.floor(Math.random() * 100) + 50
				},
				soilSaturationRisk: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
				analysis: {
					impact: 'Moderate soil conditions',
					description: 'Normal rainfall patterns for this region',
					multiplier: 1 + (Math.random() * 0.2)
				}
			};
		} catch (error) {
			console.warn('Weather data fetch failed:', error);
			return null;
		}
	};

	// Request location permission
	const requestLocationPermission = () => {
		setIsLoading(true);
		setError(null);
		setLoadingProgress(0);
		setLoadingStep('Requesting location access...');

		// Simple loading steps
		const steps = [
			{ step: 'Accessing GPS...', progress: 25 },
			{ step: 'Finding your location...', progress: 50 },
			{ step: 'Almost ready...', progress: 75 },
		];

		let stepIndex = 0;
		const progressInterval = setInterval(() => {
			if (stepIndex < steps.length) {
				setLoadingStep(steps[stepIndex].step);
				setLoadingProgress(steps[stepIndex].progress);
				stepIndex++;
			}
		}, 500);

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					clearInterval(progressInterval);
					const { latitude, longitude } = position.coords;

					setLoadingStep('Processing...');
					setLoadingProgress(90);

					// Get seismic zone
					const zoneInfo = getZoneByCoordinates(latitude, longitude);
					setSeismicZone(zoneInfo);

					// Try reverse geocoding for city
					let detectedCity = 'Unknown Location';
					const opencageKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;

					// Only call OpenCage if we have a valid API key (not demo)
					if (opencageKey && opencageKey !== 'demo') {
						try {
							const response = await fetch(
								`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${opencageKey}`
							);
							if (response.ok) {
								const data = await response.json();
								if (data.results && data.results[0]) {
									const c = data.results[0].components;
									detectedCity = c.city || c.town || c.village || c.county || 'Unknown Location';
								}
							}
						} catch (e) {
							console.warn('OpenCage geocoding failed:', e);
						}
					} else {
						// Fallback: try Google Geocoding API
						const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
						if (googleKey) {
							try {
								const response = await fetch(
									`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleKey}`
								);
								if (response.ok) {
									const data = await response.json();
									if (data.results && data.results[0]) {
										const components = data.results[0].address_components || [];
										const cityComponent = components.find(c =>
											c.types.includes('locality') || c.types.includes('administrative_area_level_1')
										);
										detectedCity = cityComponent?.long_name || 'Unknown Location';
									}
								}
							} catch (e) {
								console.warn('Google geocoding failed:', e);
							}
						}
					}

					// Update basic location data (this is what user sees)
					updateUserInput({
						latitude,
						longitude,
						location: { latitude, longitude },
						city: detectedCity,
						typeOfEarthquake: zoneInfo.zone,
						earthquakeZone: zoneInfo.zone,
						typeOfSoil: zoneInfo.soilType || userInput.typeOfSoil,
						soilType: zoneInfo.soilType || userInput.typeOfSoil,
					});

					// Collect all enhanced data SILENTLY in background
					collectBackgroundData(latitude, longitude, detectedCity);

					setLoadingProgress(100);
					setLoadingStep('Ready!');

					setTimeout(() => {
						setIsLoading(false);
					}, 500);
				},
				(err) => {
					clearInterval(progressInterval);
					console.error('Location error:', err);
					setError("Unable to access location. Please enable location permissions.");
					setIsLoading(false);
				},
				{ timeout: 10000, maximumAge: 0 }
			);
		} else {
			clearInterval(progressInterval);
			setError('Geolocation is not supported by this browser.');
			setIsLoading(false);
		}
	};

	// Handle map location change
	const handleLocationChange = (lat, lng) => {
		const zoneInfo = getZoneByCoordinates(lat, lng);
		setSeismicZone(zoneInfo);

		updateUserInput(prev => ({
			...prev,
			latitude: lat,
			longitude: lng,
			location: { latitude: lat, longitude: lng },
			typeOfEarthquake: zoneInfo.zone,
			earthquakeZone: zoneInfo.zone,
			typeOfSoil: zoneInfo.soilType || prev.typeOfSoil,
			soilType: zoneInfo.soilType || prev.typeOfSoil
		}));

		// Re-collect background data for new location
		setBackgroundDataCollected(false);
		collectBackgroundData(lat, lng, null);
	};

	useEffect(() => {
		// Check if we already have location data (e.g., loaded from database)
		if (userInput.latitude && userInput.longitude) {
			console.log('Location data already exists, skipping GPS request');

			// Set seismic zone info from existing data
			const zoneInfo = getZoneByCoordinates(userInput.latitude, userInput.longitude);
			setSeismicZone(zoneInfo);

			// Mark as ready
			setIsLoading(false);
			setBackgroundDataCollected(true);
			return;
		}

		// No existing data, request fresh location
		requestLocationPermission();
	}, [userInput.latitude, userInput.longitude]);

	// Get zone description for tooltip
	const getZoneDescription = (zone) => {
		const descriptions = {
			'Zone 1': 'Highest seismic hazard - Very active region',
			'Zone 2': 'High seismic hazard - Active region',
			'Zone 3': 'Moderate seismic hazard',
			'Zone 4': 'Low seismic hazard',
			'Zone 5': 'Minimal seismic hazard'
		};
		return descriptions[zone] || 'Seismic zone information';
	};

	return (
		<div className="max-w-2xl mx-auto">
			{/* Simple Header */}
			<div className="text-center mb-6">
				<div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
					<MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
				</div>
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
					Where is your building?
				</h1>
				<p className="text-gray-600 dark:text-gray-400">
					We'll analyze the location's seismic risk
				</p>
			</div>

			<Card className="shadow-sm">
				<CardContent className="pt-6">
					{isLoading ? (
						// Simple loading state
						<div className="text-center py-12">
							<Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-4" />
							<p className="text-gray-600 dark:text-gray-400 mb-3">{loadingStep}</p>
							<div className="max-w-xs mx-auto">
								<Progress value={loadingProgress} className="h-2" />
							</div>
						</div>
					) : error ? (
						// Error state
						<div className="text-center py-12">
							<AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
							<p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
							<Button onClick={requestLocationPermission} variant="outline">
								<LocateFixed className="mr-2 h-4 w-4" />
								Try Again
							</Button>
						</div>
					) : userInput.location ? (
						// Main content - SIMPLE
						<div className="space-y-4">
							{/* Map - The main UI element */}
							<div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-[300px]">
								<MyMapComponent
									latitude={userInput.location.latitude}
									longitude={userInput.location.longitude}
									onLocationChange={handleLocationChange}
									showSeismicData={false}
									showStreetView={false}
								/>
							</div>

							{/* Simple info display */}
							<div className="grid grid-cols-2 gap-4">
								{/* Address */}
								<div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
									<p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Address</p>
									<p className="font-medium text-sm text-gray-900 dark:text-white truncate">
										{userInput.address || userInput.city || 'Detecting...'}
									</p>
								</div>

								{/* Seismic Zone - Simple with tooltip */}
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-help">
												<p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
													Seismic Zone <Info className="h-3 w-3" />
												</p>
												<p className="font-medium text-sm text-gray-900 dark:text-white">
													{seismicZone?.zone || 'Analyzing...'}
												</p>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<p className="max-w-xs">
												{getZoneDescription(seismicZone?.zone)}
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>

							{/* Success indicator */}
							<div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">
								<CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
								<span className="text-green-700 dark:text-green-300">
									Location detected successfully
								</span>
								{backgroundDataCollected && (
									<span className="text-green-600 dark:text-green-400 text-xs ml-auto">
										Data collected
									</span>
								)}
							</div>
						</div>
					) : (
						// No location yet
						<div className="text-center py-12">
							<MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<p className="text-gray-600 dark:text-gray-400 mb-4">
								Location access required for assessment
							</p>
							<Button onClick={requestLocationPermission}>
								<LocateFixed className="mr-2 h-4 w-4" />
								Enable Location
							</Button>
						</div>
					)}
				</CardContent>

				<CardFooter className="flex justify-end border-t pt-4">
					<Button
						onClick={onNext}
						disabled={!userInput.location}
						className="gap-2"
					>
						Continue <ArrowRight className="h-4 w-4" />
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
};

export default LocationStepSimple;
