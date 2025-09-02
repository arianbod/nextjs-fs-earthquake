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
	Sparkles
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
	const { userInput, updateUserInput } = useUserInput();
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

	// Enhanced automatic data collection
	const collectEnhancedData = async (latitude, longitude) => {
		setAutoDataLoading(true);
		
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
					city: addressInfo?.components?.city || addressInfo?.components?.locality || 'Istanbul',
					neighborhood: addressInfo?.components?.neighborhood || prev.neighborhood,
					country: addressInfo?.components?.country || 'Turkey'
				}));
			}

			// Process Street View data but save for later reveal
			if (streetViewData.status === 'fulfilled' && streetViewData.value.success) {
				setStreetViewData(streetViewData.value.data);
				
				// Save street view data for later wow moment
				const analysis = streetViewData.value.data.analysis;
				updateUserInput(prev => ({
					...prev,
					// Save street view URLs for later reveal
					streetViewUrl: streetViewData.value.data.streetViewUrl,
					satelliteViewUrl: streetViewData.value.data.satelliteUrl,
					streetViewData: streetViewData.value.data,
					// Update with Street View analysis but don't reveal yet
					designRegulation: analysis?.estimatedCharacteristics?.ageEstimationContext || prev.designRegulation,
					structuralNotes: `AI Analysis: ${analysis?.estimatedCharacteristics?.estimatedType}` || prev.structuralNotes
				}));
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
						// Auto-set earthquake zone based on location
						typeOfEarthquake: zoneInfo.zone,
						earthquakeZone: zoneInfo.zone, // Also save with this key
						// Also set detected soil type if available
						typeOfSoil: zoneInfo.soilType || userInput.typeOfSoil,
						soilType: zoneInfo.soilType || userInput.typeOfSoil, // Also save with this key
					});

					// Collect enhanced data in background
					collectEnhancedData(latitude, longitude);
					
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

		// Collect enhanced data for new location
		collectEnhancedData(lat, lng);
	};

	useEffect(() => {
		requestLocationPermission();
	}, []);

	const stepOneData = Data.steps.find((step) => step.step === 1);

	return (
		<div className='max-w-4xl mx-auto'>
			<div className='text-center mb-8'>
				<div className='inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4'>
					<MapPin className='h-6 w-6 text-blue-600 dark:text-blue-400' />
				</div>
				<h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
					{stepOneData.title}
				</h1>
				<p className='text-lg text-gray-600 dark:text-gray-300'>
					{stepOneData.description}
				</p>
			</div>

			<Card className='shadow-md border border-gray-200 dark:border-gray-700'>
				<CardHeader className='pb-4'>
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
						<div className='space-y-6'>
							<div className='flex justify-center items-center py-8'>
								<div className='text-center max-w-md'>
									{/* Animated Building Icon */}
									<div className='relative mb-6'>
										<div className='w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center'>
											<div className='w-12 h-12 bg-blue-500 rounded animate-pulse flex flex-col items-center justify-center'>
												<div className='w-8 h-2 bg-white rounded mb-1'></div>
												<div className='w-6 h-2 bg-white rounded mb-1'></div>
												<div className='w-8 h-2 bg-white rounded'></div>
											</div>
										</div>
										<div className='absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce'>
											<MapPin className='w-3 h-3 text-white' />
										</div>
									</div>
									
									<p className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
										Analyzing Your Location
									</p>
									<p className='text-gray-600 dark:text-gray-400 mb-6'>
										{loadingStep}
									</p>
									
									{/* Progress Bar */}
									<div className='w-full max-w-sm mx-auto mb-4'>
										<div className='flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2'>
											<span>Progress</span>
											<span>{loadingProgress}%</span>
										</div>
										<Progress value={loadingProgress} className='h-2' />
									</div>
									
									{/* Step-by-step loading text */}
									<div className='space-y-2 text-sm text-gray-600 dark:text-gray-400'>
										<div className={`flex items-center justify-center gap-2 ${loadingProgress >= 10 ? 'text-green-600' : ''}`}>
											{loadingProgress >= 10 ? '✓' : '○'} Accessing GPS coordinates
										</div>
										<div className={`flex items-center justify-center gap-2 ${loadingProgress >= 60 ? 'text-green-600' : ''}`}>
											{loadingProgress >= 60 ? '✓' : '○'} Analyzing seismic data
										</div>
										<div className={`flex items-center justify-center gap-2 ${loadingProgress >= 80 ? 'text-green-600' : ''}`}>
											{loadingProgress >= 80 ? '✓' : '○'} Processing earthquake zones
										</div>
										<div className={`flex items-center justify-center gap-2 ${loadingProgress >= 100 ? 'text-green-600' : ''}`}>
											{loadingProgress >= 100 ? '✓' : '○'} Finalizing assessment
										</div>
									</div>
								</div>
							</div>
							
							{/* Animated skeleton map */}
							<div className='relative'>
								<Skeleton className='h-[400px] w-full rounded-lg' />
								<div className='absolute inset-0 flex items-center justify-center'>
									<div className='animate-pulse text-gray-400 dark:text-gray-600'>
										<MapPin className='w-12 h-12' />
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
						<div className='space-y-4'>
							{/* Simple Map Display */}
							<div className='rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700'>
								<MyMapComponent
									latitude={userInput.location.latitude}
									longitude={userInput.location.longitude}
									onLocationChange={handleLocationChange}
									showSeismicData={false}
									showStreetView={false}
									seismicZoneInfo={null}
								/>
							</div>
							
							{/* Simple location confirmation with hint of more to come */}
							<div className='flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg'>
								<Info className='h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600' />
								<div>
									<p className='mb-1'>Location confirmed! <span className='font-medium text-gray-900 dark:text-white'>We're analyzing your area in the background...</span></p>
									<p className='text-xs text-blue-600 dark:text-blue-400'>✨ Next: We'll show you some amazing environmental insights about your location!</p>
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

				<CardFooter className='flex justify-end pt-4 border-t'>
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
