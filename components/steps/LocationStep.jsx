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
import BuildingPhotoAnalysis from '@/components/BuildingPhotoAnalysis';
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
	const [photoAnalysisResults, setPhotoAnalysisResults] = useState(null);

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
					neighborhood: addressInfo?.components?.neighborhood || prev.neighborhood
				}));
			}

			// Process Street View data
			if (streetViewData.status === 'fulfilled' && streetViewData.value.success) {
				setStreetViewData(streetViewData.value.data);
				
				// Auto-populate structural information from Street View analysis
				const analysis = streetViewData.value.data.analysis;
				if (analysis && analysis.estimatedCharacteristics) {
					updateUserInput(prev => ({
						...prev,
						// Update with Street View analysis
						designRegulation: analysis.estimatedCharacteristics.ageEstimationContext || prev.designRegulation,
						structuralNotes: `AI Analysis: ${analysis.estimatedCharacteristics.estimatedType}` || prev.structuralNotes
					}));
				}
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
			{ step: 'Analyzing seismic data...', progress: 45 },
			{ step: 'Collecting building data...', progress: 65 },
			{ step: 'Processing Street View...', progress: 80 },
			{ step: 'Finalizing assessment...', progress: 95 }
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
						location: {
							latitude: latitude,
							longitude: longitude,
						},
						// Auto-set earthquake zone based on location
						typeOfEarthquake: zoneInfo.zone,
						// Also set detected soil type if available
						typeOfSoil: zoneInfo.soilType || userInput.typeOfSoil,
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

	// Handle photo analysis results
	const handlePhotoAnalysis = (analysisResults) => {
		setPhotoAnalysisResults(analysisResults);
		
		// Auto-populate building data from photo analysis
		if (analysisResults && analysisResults.detectedFeatures) {
			const features = analysisResults.detectedFeatures;
			
			updateUserInput(prev => ({
				...prev,
				numberOfStories: features.estimatedStories || prev.numberOfStories,
				structuralSystem: features.structuralSystem || prev.structuralSystem,
				designRegulation: features.constructionPeriod || prev.designRegulation,
				buildingCondition: features.materialCondition || prev.buildingCondition,
				// Add AI insights
				aiInsights: analysisResults.aiInsights || prev.aiInsights
			}));
		}
	};

	// Handle location change from map
	const handleLocationChange = (lat, lng) => {
		// Update seismic zone info for new location
		const zoneInfo = getZoneByCoordinates(lat, lng);
		setSeismicZoneInfo(zoneInfo);
		
		// Update user input
		updateUserInput(prev => ({
			...prev,
			location: { latitude: lat, longitude: lng },
			typeOfEarthquake: zoneInfo.zone,
			typeOfSoil: zoneInfo.soilType || prev.typeOfSoil
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
						We need to know your building's location to analyze local seismic
						conditions
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
							{/* Auto-Collection Status */}
							{autoDataLoading && (
								<Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
									<CardContent className="pt-4">
										<div className="flex items-center gap-3">
											<Loader2 className="h-5 w-5 animate-spin text-blue-600" />
											<div>
												<div className="font-medium text-blue-900 dark:text-blue-200">
													🤖 Collecting Enhanced Building Data
												</div>
												<div className="text-sm text-blue-700 dark:text-blue-300">
													Analyzing location with Google Places API and Street View...
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							)}

							{/* Enhanced Map with new features */}
							<div className='rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700'>
								<MyMapComponent
									latitude={userInput.location.latitude}
									longitude={userInput.location.longitude}
									onLocationChange={handleLocationChange}
									showSeismicData={true}
									showStreetView={true}
									seismicZoneInfo={seismicZoneInfo}
								/>
							</div>

							{/* Tabbed Interface for Enhanced Data */}
							<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
								<TabsList className="grid w-full grid-cols-4">
									<TabsTrigger value="location" className="gap-2">
										<MapPin className="h-4 w-4" />
										Location
									</TabsTrigger>
									<TabsTrigger value="auto-data" className="gap-2">
										<Zap className="h-4 w-4" />
										Auto Data
									</TabsTrigger>
									<TabsTrigger value="street-view" className="gap-2">
										<Camera className="h-4 w-4" />
										Street View
									</TabsTrigger>
									<TabsTrigger value="photos" className="gap-2">
										<Eye className="h-4 w-4" />
										Photo AI
									</TabsTrigger>
								</TabsList>

								<TabsContent value="location" className="space-y-4">
									<div className='flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400'>
										<Info className='h-4 w-4 mt-0.5 flex-shrink-0' />
										<p>{stepOneData.info}</p>
									</div>
									{/* Existing location details */}
								</TabsContent>

								<TabsContent value="auto-data" className="space-y-4">
									{enhancedData ? (
										<Card>
											<CardHeader>
												<CardTitle className="flex items-center gap-2">
													<Sparkles className="h-5 w-5 text-purple-600" />
													AI-Enhanced Building Data
												</CardTitle>
												<CardDescription>
													Automatically collected from Google Places API
												</CardDescription>
											</CardHeader>
											<CardContent className="space-y-4">
												{/* Building Characteristics */}
												<div>
													<h4 className="font-medium mb-2">Inferred Building Characteristics</h4>
													<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
														<div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
															<div className="text-sm text-gray-600 dark:text-gray-400">Building Type</div>
															<div className="font-medium">{enhancedData.buildingInfo.likelyBuildingType}</div>
														</div>
														<div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
															<div className="text-sm text-gray-600 dark:text-gray-400">Estimated Stories</div>
															<div className="font-medium">{enhancedData.buildingInfo.estimatedStories}</div>
														</div>
														<div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
															<div className="text-sm text-gray-600 dark:text-gray-400">Construction Period</div>
															<div className="font-medium">{enhancedData.buildingInfo.estimatedConstructionPeriod}</div>
														</div>
														<div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
															<div className="text-sm text-gray-600 dark:text-gray-400">Suggested Soil Type</div>
															<div className="font-medium">{enhancedData.buildingInfo.suggestedSoilType}</div>
														</div>
													</div>
												</div>

												{/* Neighborhood Analysis */}
												<div>
													<h4 className="font-medium mb-2">Neighborhood Analysis</h4>
													<div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
														<div className="text-sm text-blue-700 dark:text-blue-300">
															Development Level: <Badge variant="outline">{enhancedData.neighborhood.developmentLevel}</Badge>
														</div>
														<div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
															Safety Score: {enhancedData.neighborhood.safetyFactors.score}/5
														</div>
													</div>
												</div>

												{/* Confidence Metrics */}
												<div>
													<h4 className="font-medium mb-2">Data Confidence</h4>
													<div className="flex gap-2">
														<Badge variant={enhancedData.buildingInfo.confidence.overall === 'high' ? 'default' : 'secondary'}>
															Overall: {enhancedData.buildingInfo.confidence.overall}
														</Badge>
														<Badge variant={enhancedData.buildingInfo.confidence.buildingType === 'high' ? 'default' : 'secondary'}>
															Building: {enhancedData.buildingInfo.confidence.buildingType}
														</Badge>
													</div>
												</div>
											</CardContent>
										</Card>
									) : (
										<Card>
											<CardContent className="pt-6 text-center">
												<Zap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
												<p className="text-gray-600 dark:text-gray-400">
													Enhanced data will appear here after location analysis
												</p>
											</CardContent>
										</Card>
									)}
								</TabsContent>

								<TabsContent value="street-view" className="space-y-4">
									{streetViewData ? (
										<Card>
											<CardHeader>
												<CardTitle className="flex items-center gap-2">
													<Camera className="h-5 w-5 text-green-600" />
													Street View Analysis
												</CardTitle>
												<CardDescription>
													Building analysis from Google Street View imagery
												</CardDescription>
											</CardHeader>
											<CardContent className="space-y-4">
												{streetViewData.analysis.buildingVisible ? (
													<>
														<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
															<div>
																<h4 className="font-medium mb-2">Visual Assessment</h4>
																<div className="space-y-2 text-sm">
																	<div>Views Available: {streetViewData.analysis.viewsAnalyzed}</div>
																	<div>Confidence: <Badge>{streetViewData.analysis.confidence}</Badge></div>
																</div>
															</div>
															<div>
																<h4 className="font-medium mb-2">Structural Features</h4>
																<div className="text-sm text-gray-600 dark:text-gray-400">
																	{streetViewData.analysis.structuralObservations.irregularityAssessment.recommendation}
																</div>
															</div>
														</div>
														
														{/* Street View Images */}
														<div>
															<h4 className="font-medium mb-2">Available Views</h4>
															<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
																{streetViewData.images.slice(0, 6).map((img, index) => (
																	<div key={index} className="text-center">
																		<img 
																			src={img.url} 
																			alt={img.description}
																			className="w-full h-20 object-cover rounded border"
																		/>
																		<div className="text-xs text-gray-500 mt-1">{img.description}</div>
																	</div>
																))}
															</div>
														</div>
													</>
												) : (
													<div className="text-center py-4">
														<AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
														<p className="text-amber-700 dark:text-amber-300">
															{streetViewData.analysis.error || 'No Street View imagery available for this location'}
														</p>
													</div>
												)}
											</CardContent>
										</Card>
									) : (
										<Card>
											<CardContent className="pt-6 text-center">
												<Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
												<p className="text-gray-600 dark:text-gray-400">
													Street View analysis will appear here after location processing
												</p>
											</CardContent>
										</Card>
									)}
								</TabsContent>

								<TabsContent value="photos" className="space-y-4">
									<BuildingPhotoAnalysis 
										onAnalysisComplete={handlePhotoAnalysis}
										existingData={userInput}
									/>
								</TabsContent>
							</Tabs>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{/* Location Details */}
								<div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg'>
									<div className='font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2'>
										<MapPin className='h-4 w-4 text-blue-600' />
										Location Details
									</div>
									<div className='grid grid-cols-2 gap-2 text-sm'>
										<div className='text-gray-600 dark:text-gray-400'>
											Latitude:
										</div>
										<div className='font-mono'>
											{userInput.location.latitude.toFixed(6)}
										</div>
										<div className='text-gray-600 dark:text-gray-400'>
											Longitude:
										</div>
										<div className='font-mono'>
											{userInput.location.longitude.toFixed(6)}
										</div>
									</div>
								</div>

								{/* Seismic Zone Information */}
								{seismicZoneInfo && (
									<div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg'>
										<div className='font-medium text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2'>
											<Activity className='h-4 w-4 text-blue-600' />
											Detected Seismic Zone
										</div>
										<div className='space-y-2'>
											<div className='flex items-center justify-between'>
												<span className='text-sm text-blue-700 dark:text-blue-300'>Zone:</span>
												<span 
													className='px-2 py-1 rounded text-xs font-semibold text-white'
													style={{ backgroundColor: getZoneColor(seismicZoneInfo.zone) }}
												>
													{seismicZoneInfo.zone}
												</span>
											</div>
											<div className='flex items-center justify-between'>
												<span className='text-sm text-blue-700 dark:text-blue-300'>Risk Level:</span>
												<span className='text-sm font-medium text-blue-900 dark:text-blue-200'>
													{seismicZoneInfo.riskLevel}
												</span>
											</div>
											{seismicZoneInfo.name && (
												<div className='flex items-center justify-between'>
													<span className='text-sm text-blue-700 dark:text-blue-300'>Nearest City:</span>
													<span className='text-sm font-medium text-blue-900 dark:text-blue-200'>
														{seismicZoneInfo.name}
													</span>
												</div>
											)}
											<div className='text-xs text-blue-600 dark:text-blue-400 mt-2'>
												{seismicZoneInfo.description}
											</div>
										</div>
									</div>
								)}
							</div>

							{/* Turkish Seismic Zones Information */}
							<div className='mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg'>
								<div className='flex items-start gap-2'>
									<Shield className='h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0' />
									<div>
										<h4 className='font-medium text-amber-800 dark:text-amber-300 mb-2'>
											Turkish Seismic Zones Explained
										</h4>
										<div className='grid grid-cols-1 md:grid-cols-4 gap-3 text-xs'>
											{Object.entries(getZoneDefinition('Zone 1')).map(([key, _]) => {
												if (key === 'color') return null;
												const zones = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'];
												return zones.map(zone => {
													const def = getZoneDefinition(zone);
													if (key === 'description') {
														return (
															<div key={zone} className='text-center p-2 rounded' style={{ backgroundColor: `${def.color}20` }}>
																<div className='font-semibold' style={{ color: def.color }}>
																	{zone.replace('Zone ', '')}
																</div>
																<div className='text-amber-700 dark:text-amber-400 mt-1'>
																	{def.description}
																</div>
															</div>
														);
													}
													return null;
												});
											})}
										</div>
									</div>
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
