// components/steps/LocationStep.jsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Data from '@/utils/Data.json';
import { MyMapComponent } from '@/components/MyMapComponent';
import { Button } from '@/components/ui/button';
import { useUserInput } from '@/context/UserInputContext';
import { getZoneByCoordinates, getZoneColor, getZoneDefinition } from '@/utils/turkeySeismicData';
import { googlePlacesService } from '@/services/googlePlacesService';
import { streetViewService } from '@/services/streetViewService';
import {
	MapPin,
	AlertTriangle,
	Loader2,
	ArrowRight,
	Info,
	LocateFixed,
	Shield,
	Activity,
	Zap,
	Camera,
	Building,
	Eye,
	Sparkles,
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
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const LocationStep = ({ onNext }) => {
	const { userInput, updateUserInput, storeGoogleImages } = useUserInput();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [seismicZoneInfo, setSeismicZoneInfo] = useState(null);
	const [loadingProgress, setLoadingProgress] = useState(0);
	const [loadingStep, setLoadingStep] = useState('');
	const [showMinimumDisplay, setShowMinimumDisplay] = useState(false);
	
	// Enhanced automation states
	const [enhancedData, setEnhancedData] = useState(null);
	const [streetViewData, setStreetViewData] = useState(null);
	const [autoDataLoading, setAutoDataLoading] = useState(false);
	const [activeTab, setActiveTab] = useState('location');
	const [googleImages, setGoogleImages] = useState({ streetViews: [], satellite: null });
	const [imagesLoading, setImagesLoading] = useState(false);

	// Direct Google Images fetch - simple and synchronous for display
	const showGoogleImages = (latitude, longitude) => {
		const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
		if (!apiKey) {
			console.warn('No Google Maps API key available');
			return;
		}

		console.log('showGoogleImages called for:', latitude, longitude);

		// Generate URLs - these work directly as img src (no async needed)
		const headings = [0, 90, 180, 270];
		const streetViewUrls = headings.map(heading => ({
			url: `https://maps.googleapis.com/maps/api/streetview?size=640x400&location=${latitude},${longitude}&heading=${heading}&pitch=0&fov=90&key=${apiKey}`,
			heading,
			description: heading === 0 ? 'North' : heading === 90 ? 'East' : heading === 180 ? 'South' : 'West'
		}));

		const satelliteUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=19&size=640x400&maptype=satellite&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;

		console.log('Setting googleImages state:', { streetViews: streetViewUrls.length, satellite: !!satelliteUrl });

		// Set state immediately - this triggers re-render with images
		setGoogleImages({
			streetViews: streetViewUrls,
			satellite: satelliteUrl
		});

		// Also store in context for later use
		updateUserInput(prev => ({
			...prev,
			streetViewUrl: streetViewUrls[0]?.url,
			satelliteViewUrl: satelliteUrl,
			streetViewImages: streetViewUrls.map(sv => ({ ...sv, available: true })),
		}));
	};

	// Background storage to database (non-blocking)
	const storeImagesToDatabase = async (latitude, longitude) => {
		const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
		if (!apiKey) return;

		const headings = [0, 90, 180, 270];
		const streetViewUrls = headings.map(heading => ({
			url: `https://maps.googleapis.com/maps/api/streetview?size=640x400&location=${latitude},${longitude}&heading=${heading}&pitch=0&fov=90&key=${apiKey}`,
			heading,
			description: heading === 0 ? 'North' : heading === 90 ? 'East' : heading === 180 ? 'South' : 'West'
		}));
		const satelliteUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=19&size=640x400&maptype=satellite&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;

		try {
			const locationData = {
				latitude,
				longitude,
				city: userInput.city || 'Unknown Location',
				address: userInput.address || ''
			};
			await storeGoogleImages(streetViewUrls, satelliteUrl, locationData);
			console.log('Google images stored to database');
		} catch (err) {
			console.warn('Failed to store images to DB:', err);
		}
	};

	// Enhanced automatic data collection
	const collectEnhancedData = async (latitude, longitude, fallbackCity = null) => {
		setAutoDataLoading(true);

		// Immediately show Google images (synchronous - no waiting)
		showGoogleImages(latitude, longitude);

		// Store to database in background (non-blocking)
		storeImagesToDatabase(latitude, longitude);

		try {
			// Parallel data collection from multiple sources
			const [placesData, streetViewData] = await Promise.allSettled([
				googlePlacesService.getEnhancedLocationData(latitude, longitude),
				streetViewService.getBuildingAnalysis(latitude, longitude)
			]);

			// Process Google Places data
			if (placesData.status === 'fulfilled' && placesData.value.success) {
				setEnhancedData(placesData.value.data);
				
				// Auto-populate building characteristics from Places API
				const buildingInfo = placesData.value.data.buildingInfo;
				const addressInfo = placesData.value.data.address;
				
				updateUserInput(prev => ({
					...prev,
					// Update building characteristics with AI predictions
					numberOfStories: buildingInfo.estimatedStories || prev.numberOfStories,
					typeOfSoil: buildingInfo.suggestedSoilType || prev.typeOfSoil,
					// Add address information
					address: addressInfo?.formatted || prev.address,
					city: addressInfo?.components?.city || addressInfo?.components?.locality || fallbackCity || prev.city,
					neighborhood: addressInfo?.components?.neighborhood || prev.neighborhood,
					country: addressInfo?.components?.country || 'Turkey'
				}));
			}

			// Generate Google Maps satellite view URL regardless of Street View success
			const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
			console.log('LocationStep - Google Maps API Key available:', !!apiKey);
			const satelliteUrl = apiKey ? 
				`https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=19&size=640x640&maptype=satellite&markers=color:red%7C${latitude},${longitude}&key=${apiKey}` :
				null;
			console.log('LocationStep - Generated satellite URL:', satelliteUrl);

			// Process Street View data but save for later reveal
			if (streetViewData.status === 'fulfilled' && streetViewData.value.success) {
				setStreetViewData(streetViewData.value.data);
				
				// Save street view data for later wow moment
				const analysis = streetViewData.value.data.analysis;
				const streetViewImages = streetViewData.value.data.images || [];
				
				// Get the main street view URL (first available image)
				const mainStreetView = streetViewImages.find(img => img.available) || streetViewImages[0];
				
				updateUserInput(prev => ({
					...prev,
					// Save street view URLs for later reveal
					streetViewUrl: mainStreetView?.url || null,
					satelliteViewUrl: satelliteUrl,
					streetViewImages: streetViewImages, // Save all images
					streetViewData: streetViewData.value.data,
					// Update with Street View analysis but don't reveal yet
					designRegulation: analysis?.estimatedCharacteristics?.ageEstimationContext || prev.designRegulation,
					structuralNotes: `AI Analysis: ${analysis?.estimatedCharacteristics?.estimatedType}` || prev.structuralNotes
				}));

				// Store images in base64 format
				const locationData = {
					latitude,
					longitude,
					city: userInput.city || 'Unknown Location',
					address: userInput.address || 'Address not available'
				};
				
				console.log('LocationStep - About to store images:', {
					streetViewImages: streetViewImages.length,
					satelliteUrl: !!satelliteUrl,
					locationData
				});
				storeGoogleImages(streetViewImages, satelliteUrl, locationData);
			} else {
				// Even if Street View fails, save satellite URL
				console.warn('Street View data failed:', streetViewData.status === 'rejected' ? streetViewData.reason : 'Unknown error');
				
				// Create basic street view URL as fallback
				const fallbackStreetViewUrl = apiKey ? 
					`https://maps.googleapis.com/maps/api/streetview?size=640x640&location=${latitude},${longitude}&key=${apiKey}` :
					null;
				
				updateUserInput(prev => ({
					...prev,
					streetViewUrl: fallbackStreetViewUrl,
					satelliteViewUrl: satelliteUrl,
					streetViewImages: [],
					streetViewData: null,
				}));

				// Store fallback images
				const locationData = {
					latitude,
					longitude,
					city: userInput.city || 'Unknown Location',
					address: userInput.address || 'Address not available'
				};
				
				console.log('LocationStep - Fallback store images (Street View failed):', {
					streetViewImages: 0,
					satelliteUrl: !!satelliteUrl,
					locationData
				});
				storeGoogleImages([], satelliteUrl, locationData);
			}

		} catch (error) {
			console.error('Error collecting enhanced data:', error);
		} finally {
			setAutoDataLoading(false);
		}
	};

	const requestLocationPermission = () => {
		setIsLoading(true);
		setError(null);
		setLoadingProgress(0);
		setLoadingStep('Requesting location access...');
		setShowMinimumDisplay(false);

		// Enhanced loading simulation with progress steps
		const loadingSteps = [
			{ step: 'Requesting location access...', progress: 10 },
			{ step: 'Accessing GPS coordinates...', progress: 25 },
			{ step: 'Analyzing your area...', progress: 45 },
			{ step: 'Gathering location data...', progress: 65 },
			{ step: 'Preparing insights...', progress: 80 },
			{ step: 'Almost ready...', progress: 95 }
		];

		let stepIndex = 0;
		const progressInterval = setInterval(() => {
			if (stepIndex < loadingSteps.length) {
				setLoadingStep(loadingSteps[stepIndex].step);
				setLoadingProgress(loadingSteps[stepIndex].progress);
				stepIndex++;
			}
		}, 600);

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					clearInterval(progressInterval);
					
					const latitude = position.coords.latitude;
					const longitude = position.coords.longitude;
					
					// Set to processing state
					setLoadingStep('Processing location data...');
					setLoadingProgress(90);
					
					// Get seismic zone information
					const zoneInfo = getZoneByCoordinates(latitude, longitude);
					setSeismicZoneInfo(zoneInfo);
					
					// Try to get city name using reverse geocoding as fallback
					let detectedCity = 'Unknown Location';
					try {
						const response = await fetch(
							`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY || 'demo'}`
						);
						if (response.ok) {
							const data = await response.json();
							if (data.results && data.results[0]) {
								const components = data.results[0].components;
								detectedCity = components.city || components.town || components.village || components.county || 'Unknown Location';
							}
						}
					} catch (error) {
						console.warn('Failed to reverse geocode location:', error);
					}
					
					// Update basic location data
					updateUserInput({
						// Direct properties for compatibility with other steps
						latitude: latitude,
						longitude: longitude,
						// Also keep nested format for backwards compatibility
						location: {
							latitude: latitude,
							longitude: longitude,
						},
						// Set detected city name
						city: detectedCity,
						// Auto-set earthquake zone based on location
						typeOfEarthquake: zoneInfo.zone,
						earthquakeZone: zoneInfo.zone, // Also save with this key
						// Also set detected soil type if available
						typeOfSoil: zoneInfo.soilType || userInput.typeOfSoil,
						soilType: zoneInfo.soilType || userInput.typeOfSoil, // Also save with this key
					});

					// Collect enhanced data in background
					collectEnhancedData(latitude, longitude, detectedCity);
					
					setLoadingStep('Analysis complete!');
					setLoadingProgress(100);

					// Ensure minimum display time for smooth UX
					setTimeout(() => {
						setIsLoading(false);
					}, 800);
				},
				(err) => {
					clearInterval(progressInterval);
					console.error('Error getting location:', err);
					setError(
						"Unable to access location. Please ensure you've given permission."
					);
					setIsLoading(false);
				},
				{ timeout: 10000, maximumAge: 0 }
			);
		} else {
			clearInterval(progressInterval);
			setError('Geolocation is not supported by this browser.');
			setIsLoading(false);
		}

		// Ensure minimum 2 second display time
		setTimeout(() => {
			setShowMinimumDisplay(true);
		}, 2000);
	};

	// Photo analysis has been moved to dedicated AI Photo Step

	// Handle location change from map
	const handleLocationChange = (lat, lng) => {
		// Update seismic zone info for new location
		const zoneInfo = getZoneByCoordinates(lat, lng);
		setSeismicZoneInfo(zoneInfo);

		// Update user input with both formats
		updateUserInput(prev => ({
			...prev,
			// Direct properties for compatibility
			latitude: lat,
			longitude: lng,
			// Also keep nested format
			location: { latitude: lat, longitude: lng },
			typeOfEarthquake: zoneInfo.zone,
			earthquakeZone: zoneInfo.zone,
			typeOfSoil: zoneInfo.soilType || prev.typeOfSoil,
			soilType: zoneInfo.soilType || prev.typeOfSoil
		}));

		// Show images immediately for changed location
		showGoogleImages(lat, lng);

		// Collect enhanced data for new location
		collectEnhancedData(lat, lng, null);
	};

	useEffect(() => {
		// Check if we already have location data (e.g., loaded from database)
		if (userInput.latitude && userInput.longitude) {
			console.log('Location data already exists, skipping GPS request');

			// Set seismic zone info from existing data
			const zoneInfo = getZoneByCoordinates(userInput.latitude, userInput.longitude);
			setSeismicZoneInfo(zoneInfo);

			// Show Google images for this location
			if (googleImages.streetViews.length === 0) {
				showGoogleImages(userInput.latitude, userInput.longitude);
			}

			setIsLoading(false);
			return;
		}

		// No existing data, request fresh location
		requestLocationPermission();
	}, [userInput.latitude, userInput.longitude]);

	const stepOneData = Data.steps.find((step) => step.step === 1);

	return (
		<div className='max-w-4xl mx-auto viewport-optimized'>
			<div className='text-center mb-3 lg:mb-6'>
				<div className='inline-flex items-center justify-center p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3'>
					<MapPin className='h-5 w-5 text-blue-600 dark:text-blue-400' />
				</div>
				<h1 className='text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1'>
					{stepOneData.title}
				</h1>
				<p className='text-base lg:text-lg text-gray-600 dark:text-gray-300'>
					{stepOneData.description}
				</p>
			</div>

			<Card className='shadow-md border border-gray-200 dark:border-gray-700'>
				<CardHeader className='pb-2 lg:pb-4'>
					<CardTitle className='text-xl flex items-center gap-2'>
						<LocateFixed className='h-5 w-5 text-blue-600 dark:text-blue-400' />
						Building Location
					</CardTitle>
					<CardDescription>
						Just tell us where your building is located - we'll take care of the rest!
					</CardDescription>
				</CardHeader>

				<CardContent>
					{isLoading ? (
						<div className='space-y-4'>
							<div className='flex justify-center items-center py-4'>
								<div className='text-center max-w-md'>
									{/* Animated Building Icon */}
									<div className='relative mb-4'>
										<div className='w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center'>
											<div className='w-10 h-10 bg-blue-500 rounded animate-pulse flex flex-col items-center justify-center'>
												<div className='w-6 h-1.5 bg-white rounded mb-1'></div>
												<div className='w-4 h-1.5 bg-white rounded mb-1'></div>
												<div className='w-6 h-1.5 bg-white rounded'></div>
											</div>
										</div>
										<div className='absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center animate-bounce'>
											<MapPin className='w-2.5 h-2.5 text-white' />
										</div>
									</div>
									
									<p className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
										Analyzing Your Location
									</p>
									<p className='text-gray-600 dark:text-gray-400 mb-4'>
										{loadingStep}
									</p>
									
									{/* Progress Bar */}
									<div className='w-full max-w-sm mx-auto mb-3'>
										<div className='flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1'>
											<span>Progress</span>
											<span>{loadingProgress}%</span>
										</div>
										<Progress value={loadingProgress} className='h-1.5' />
									</div>
									
									{/* Step-by-step loading text */}
									<div className='space-y-1 text-xs text-gray-600 dark:text-gray-400'>
										<div className={`flex items-center justify-center gap-1 ${loadingProgress >= 10 ? 'text-green-600' : ''}`}>
											{loadingProgress >= 10 ? '✓' : '○'} Accessing GPS coordinates
										</div>
										<div className={`flex items-center justify-center gap-1 ${loadingProgress >= 60 ? 'text-green-600' : ''}`}>
											{loadingProgress >= 60 ? '✓' : '○'} Analyzing seismic data
										</div>
										<div className={`flex items-center justify-center gap-1 ${loadingProgress >= 80 ? 'text-green-600' : ''}`}>
											{loadingProgress >= 80 ? '✓' : '○'} Processing earthquake zones
										</div>
										<div className={`flex items-center justify-center gap-1 ${loadingProgress >= 100 ? 'text-green-600' : ''}`}>
											{loadingProgress >= 100 ? '✓' : '○'} Finalizing assessment
										</div>
									</div>
								</div>
							</div>
							
							{/* Animated skeleton map */}
							<div className='relative'>
								<Skeleton className='h-[280px] w-full rounded-lg' />
								<div className='absolute inset-0 flex items-center justify-center'>
									<div className='animate-pulse text-gray-400 dark:text-gray-600'>
										<MapPin className='w-8 h-8' />
									</div>
								</div>
							</div>
						</div>
					) : error ? (
						<div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 my-4'>
							<div className='flex items-start'>
								<AlertTriangle className='h-6 w-6 text-red-600 dark:text-red-400 mt-0.5' />
								<div className='ml-3'>
									<h3 className='text-lg font-medium text-red-800 dark:text-red-300'>
										Location Access Error
									</h3>
									<p className='mt-2 text-red-700 dark:text-red-300'>{error}</p>
									<p className='mt-2 text-red-700 dark:text-red-300'>
										We need your location to provide accurate seismic risk
										assessment. Please enable location access in your browser
										settings.
									</p>
									<Button
										onClick={requestLocationPermission}
										className='mt-4'
										variant='outline'>
										<LocateFixed className='mr-2 h-4 w-4' />
										Try Again
									</Button>
								</div>
							</div>
						</div>
					) : userInput.location ? (
						<div className='space-y-2 lg:space-y-4'>
							{/* Map Display */}
							<div className='rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700'>
								<MyMapComponent
									latitude={userInput.location.latitude}
									longitude={userInput.location.longitude}
									onLocationChange={handleLocationChange}
									showSeismicData={true}
									showStreetView={false}
									seismicZoneInfo={seismicZoneInfo}
								/>
							</div>

							{/* Google Street View and Satellite Images Gallery */}
							{(googleImages.satellite || googleImages.streetViews.length > 0 || imagesLoading) && (
								<Card className='border-blue-200 dark:border-blue-800'>
									<CardHeader className='pb-2'>
										<CardTitle className='flex items-center gap-2'>
											<Camera className='h-5 w-5 text-blue-600' />
											Google Maps Images
											{imagesLoading && (
												<Badge variant='outline' className='ml-auto'>
													<Loader2 className='h-3 w-3 mr-1 animate-spin' />
													Loading...
												</Badge>
											)}
											{!imagesLoading && googleImages.satellite && (
												<Badge variant='secondary' className='ml-auto'>
													<CheckCircle2 className='h-3 w-3 mr-1' />
													{googleImages.streetViews.length + 1} images
												</Badge>
											)}
										</CardTitle>
										<CardDescription>
											Satellite and street view images from your location
										</CardDescription>
									</CardHeader>
									<CardContent className='pt-2'>
										{imagesLoading ? (
											<div className='grid grid-cols-2 gap-3'>
												<Skeleton className='aspect-video rounded-lg' />
												<Skeleton className='aspect-video rounded-lg' />
											</div>
										) : (
											<div className='space-y-3'>
												{/* Main views: Satellite + Primary Street View */}
												<div className='grid md:grid-cols-2 gap-3'>
													{/* Satellite View */}
													{googleImages.satellite && (
														<div>
															<h4 className='text-xs font-medium mb-1 flex items-center gap-1'>
																<Building className='h-3 w-3' />
																Satellite View
															</h4>
															<div className='relative aspect-video rounded-lg overflow-hidden border-2 border-blue-200 dark:border-blue-700 shadow-sm'>
																<img
																	src={googleImages.satellite}
																	alt='Satellite view of building'
																	className='w-full h-full object-cover'
																	onError={(e) => {
																		e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800"><p class="text-gray-500 text-sm">Satellite view unavailable</p></div>';
																	}}
																/>
															</div>
														</div>
													)}

													{/* Primary Street View */}
													{googleImages.streetViews[0] && (
														<div>
															<h4 className='text-xs font-medium mb-1 flex items-center gap-1'>
																<Eye className='h-3 w-3' />
																Street View (North)
															</h4>
															<div className='relative aspect-video rounded-lg overflow-hidden border-2 border-blue-200 dark:border-blue-700 shadow-sm'>
																<img
																	src={googleImages.streetViews[0].url}
																	alt='Street view of building'
																	className='w-full h-full object-cover'
																	onError={(e) => {
																		e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800"><p class="text-gray-500 text-sm">Street view unavailable</p></div>';
																	}}
																/>
															</div>
														</div>
													)}
												</div>

												{/* Additional Street View angles */}
												{googleImages.streetViews.length > 1 && (
													<div>
														<h4 className='text-xs font-medium mb-2 flex items-center gap-1'>
															<Sparkles className='h-3 w-3' />
															Additional Angles
														</h4>
														<div className='grid grid-cols-3 gap-2'>
															{googleImages.streetViews.slice(1).map((img, idx) => (
																<div key={idx} className='relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700'>
																	<img
																		src={img.url}
																		alt={`Street View ${img.description}`}
																		className='w-full h-full object-cover'
																		onError={(e) => {
																			e.target.style.display = 'none';
																		}}
																	/>
																	<div className='absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center'>
																		{img.description}
																	</div>
																</div>
															))}
														</div>
													</div>
												)}

												{/* Status */}
												<div className='flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg'>
													<CheckCircle2 className='h-4 w-4' />
													<span>Images captured from Google Maps</span>
												</div>
											</div>
										)}
									</CardContent>
								</Card>
							)}

							{/* Seismic Zone Information */}
							{seismicZoneInfo && (
								<Card className='border-orange-200 dark:border-orange-800'>
									<CardHeader className='pb-2'>
										<CardTitle className='flex items-center gap-2 text-lg'>
											<Activity className='h-4 w-4 text-orange-600' />
											Seismic Zone Information
										</CardTitle>
									</CardHeader>
									<CardContent className='pt-2'>
										<div className='grid grid-cols-2 gap-3'>
											<div>
												<p className='text-sm text-gray-600 dark:text-gray-400'>Zone</p>
												<div className='flex items-center gap-2 mt-1'>
													<Badge className={`${getZoneColor(seismicZoneInfo.zone)}`}>
														{seismicZoneInfo.zone}
													</Badge>
													<span className='text-sm font-medium'>{seismicZoneInfo.definition}</span>
												</div>
											</div>
											<div>
												<p className='text-sm text-gray-600 dark:text-gray-400'>Soil Type</p>
												<p className='font-medium mt-1'>{seismicZoneInfo.soilType || 'To be determined'}</p>
											</div>
										</div>
									</CardContent>
								</Card>
							)}
							
							{/* Location confirmation */}
							<div className='flex items-start space-x-2 text-xs text-gray-600 dark:text-gray-400 p-3 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg'>
								<CheckCircle2 className='h-3 w-3 mt-0.5 flex-shrink-0 text-green-600' />
								<div>
									<p className='font-medium text-gray-900 dark:text-white text-sm'>Location data collected successfully!</p>
									<p className='text-xs mt-0.5'>We've gathered location information, street view images, and seismic zone data.</p>
								</div>
							</div>

						</div>
					) : (
						<div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 my-4 text-center'>
							<AlertTriangle className='h-10 w-10 text-yellow-500 mx-auto mb-4' />
							<h3 className='text-lg font-medium text-yellow-800 dark:text-yellow-300'>
								Location Required
							</h3>
							<p className='mt-2 text-yellow-700 dark:text-yellow-400'>
								{stepOneData.error}
							</p>
							<Button
								onClick={requestLocationPermission}
								className='mt-4'>
								<LocateFixed className='mr-2 h-4 w-4' />
								Allow Location Access
							</Button>
						</div>
					)}
				</CardContent>

				<CardFooter className='flex justify-end pt-2 lg:pt-4 border-t'>
					<Button
						onClick={onNext}
						disabled={!userInput.location}
						className='gap-2'>
						Next <ArrowRight className='h-4 w-4' />
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
};

export default LocationStep;
