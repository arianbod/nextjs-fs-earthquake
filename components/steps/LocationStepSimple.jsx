// components/steps/LocationStepSimple.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUserInput } from '@/context/UserInputContext';
import { getZoneByCoordinates } from '@/utils/turkeySeismicData';
import { googlePlacesService } from '@/services/googlePlacesService';
import { streetViewService } from '@/services/streetViewService';
// Weather data is fetched via secure server API route /api/weather
import { MyMapComponent } from '@/components/MyMapComponent';
import { MapPin, Loader2, ArrowRight, Navigation, AlertTriangle, Check, Camera, Building, Eye, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

const LocationStepSimple = ({ onNext }) => {
	const t = useTranslations('Steps.location');
	const { userInput, updateUserInput, storeGoogleImages } = useUserInput();
	const [status, setStatus] = useState('idle'); // idle, loading, success, error
	const [error, setError] = useState(null);
	const [seismicZone, setSeismicZone] = useState(null);
	const [progress, setProgress] = useState(0);
	const [googleImages, setGoogleImages] = useState({ streetViews: [], satellite: null });

	// Show Google Maps images immediately (synchronous) and store to DB
	const showGoogleImages = (latitude, longitude, city = null) => {
		const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
		if (!apiKey) return;

		const headings = [0, 90, 180, 270];
		const streetViewUrls = headings.map(heading => ({
			url: `https://maps.googleapis.com/maps/api/streetview?size=640x400&location=${latitude},${longitude}&heading=${heading}&pitch=0&fov=90&key=${apiKey}`,
			heading,
			description: heading === 0 ? t('directions.north') : heading === 90 ? t('directions.east') : heading === 180 ? t('directions.south') : t('directions.west'),
			available: true
		}));

		const satelliteUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=19&size=640x400&maptype=satellite&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;

		// Set state for immediate display
		setGoogleImages({ streetViews: streetViewUrls, satellite: satelliteUrl });

		// Also update context for results page
		updateUserInput(prev => ({
			...prev,
			streetViewImages: streetViewUrls,
			satelliteViewUrl: satelliteUrl
		}));

		// Store to database in background (converts URLs to base64)
		storeGoogleImages(streetViewUrls, satelliteUrl, {
			latitude,
			longitude,
			city: city || userInput.city || 'Unknown Location',
			address: userInput.address || ''
		});
	};

	// Collect background data silently
	const collectBackgroundData = async (latitude, longitude, city = null) => {
		// Show images immediately (synchronous) and store to DB
		showGoogleImages(latitude, longitude, city);

		try {
			const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

			const [placesData, streetViewData, weatherData] = await Promise.allSettled([
				googlePlacesService.getEnhancedLocationData(latitude, longitude),
				streetViewService.getBuildingAnalysis(latitude, longitude),
				fetchWeatherData(latitude, longitude)
			]);

			const satelliteUrl = apiKey
				? `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=19&size=640x640&maptype=satellite&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`
				: null;

			if (placesData.status === 'fulfilled' && placesData.value.success) {
				const data = placesData.value.data;
				updateUserInput(prev => ({
					...prev,
					numberOfStories: data.buildingInfo?.estimatedStories || prev.numberOfStories,
					typeOfSoil: data.buildingInfo?.suggestedSoilType || prev.typeOfSoil,
					address: data.address?.formatted || prev.address,
					city: data.address?.components?.city || city || prev.city,
					neighborhood: data.address?.components?.neighborhood || prev.neighborhood,
					country: data.address?.components?.country || 'Turkey'
				}));
			}

			if (streetViewData.status === 'fulfilled' && streetViewData.value.success) {
				const streetViewImages = streetViewData.value.data.images || [];
				const mainView = streetViewImages.find(img => img.available) || streetViewImages[0];

				updateUserInput(prev => ({
					...prev,
					streetViewUrl: mainView?.url || null,
					streetViewImages: streetViewImages,
					streetViewData: streetViewData.value.data,
				}));

				storeGoogleImages(streetViewImages, satelliteUrl, {
					latitude, longitude,
					city: city || userInput.city || 'Unknown Location',
					address: userInput.address || ''
				});
			}

			updateUserInput(prev => ({ ...prev, satelliteViewUrl: satelliteUrl }));

			if (weatherData.status === 'fulfilled' && weatherData.value) {
				updateUserInput(prev => ({ ...prev, weatherData: weatherData.value }));
			}
		} catch (error) {
			console.error('Background data error:', error);
		}
	};

	const fetchWeatherData = async (lat, lng) => {
		try {
			// Call our secure server-side API route (API key stays on server)
			const response = await fetch(`/api/weather?lat=${lat}&lon=${lng}`);
			const weatherAnalysis = await response.json();

			if (weatherAnalysis.success) {
				// Return the full weather data structure expected by the results page
				return {
					temperature: weatherAnalysis.current?.temp || 20,
					temp: weatherAnalysis.current?.temp || 20,
					humidity: weatherAnalysis.current?.humidity || 50,
					windSpeed: weatherAnalysis.current?.windSpeed || 0,
					pressure: weatherAnalysis.current?.pressure || 1013,
					description: weatherAnalysis.current?.description || 'clear',
					rainfall: weatherAnalysis.rainfall || { total5Days: 0 },
					soilSaturationRisk: weatherAnalysis.soilSaturationRisk || 'LOW',
					analysis: weatherAnalysis.analysis,
					success: true
				};
			}

			// Fallback if API fails
			return {
				temperature: 20,
				temp: 20,
				humidity: 50,
				windSpeed: 5,
				pressure: 1013,
				description: 'Weather data unavailable',
				rainfall: { total5Days: 10 },
				soilSaturationRisk: 'MEDIUM',
				analysis: weatherAnalysis.analysis,
				success: false
			};
		} catch (error) {
			console.error('Weather fetch error:', error);
			// Return fallback data
			return {
				temperature: 20,
				temp: 20,
				humidity: 50,
				windSpeed: 5,
				rainfall: { total5Days: 10 },
				soilSaturationRisk: 'MEDIUM',
				success: false
			};
		}
	};

	const requestLocation = () => {
		setStatus('loading');
		setError(null);
		setProgress(0);

		const progressTimer = setInterval(() => {
			setProgress(p => Math.min(p + 15, 85));
		}, 400);

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					clearInterval(progressTimer);
					const { latitude, longitude } = position.coords;
					setProgress(90);

					const zoneInfo = getZoneByCoordinates(latitude, longitude);
					setSeismicZone(zoneInfo);

					let detectedCity = 'Unknown Location';
					const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

					if (googleKey) {
						try {
							const response = await fetch(
								`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleKey}`
							);
							if (response.ok) {
								const data = await response.json();
								if (data.results?.[0]) {
									const components = data.results[0].address_components || [];
									const cityComponent = components.find(c =>
										c.types.includes('locality') || c.types.includes('administrative_area_level_1')
									);
									detectedCity = cityComponent?.long_name || 'Unknown Location';
								}
							}
						} catch (e) { console.warn('Geocoding failed:', e); }
					}

					updateUserInput({
						latitude, longitude,
						location: { latitude, longitude },
						city: detectedCity,
						typeOfEarthquake: zoneInfo.zone,
						earthquakeZone: zoneInfo.zone,
						typeOfSoil: zoneInfo.soilType || userInput.typeOfSoil,
					});

					collectBackgroundData(latitude, longitude, detectedCity);
					setProgress(100);
					setTimeout(() => setStatus('success'), 300);
				},
				(err) => {
					clearInterval(progressTimer);
					setError(t('enableAccess'));
					setStatus('error');
				},
				{ timeout: 10000, maximumAge: 0 }
			);
		} else {
			clearInterval(progressTimer);
			setError('Location not supported');
			setStatus('error');
		}
	};

	const handleMapChange = (lat, lng) => {
		const zoneInfo = getZoneByCoordinates(lat, lng);
		setSeismicZone(zoneInfo);
		updateUserInput(prev => ({
			...prev,
			latitude: lat, longitude: lng,
			location: { latitude: lat, longitude: lng },
			typeOfEarthquake: zoneInfo.zone,
			earthquakeZone: zoneInfo.zone,
		}));
		collectBackgroundData(lat, lng, null);
	};

	useEffect(() => {
		if (userInput.latitude && userInput.longitude) {
			const zoneInfo = getZoneByCoordinates(userInput.latitude, userInput.longitude);
			setSeismicZone(zoneInfo);
			// Show images for existing location and store to DB
			showGoogleImages(userInput.latitude, userInput.longitude, userInput.city);
			setStatus('success');
			return;
		}
		requestLocation();
	}, []);

	const getZoneColor = (zone) => {
		const colors = {
			'Zone 1': 'text-red-500', 'Zone 2': 'text-orange-500',
			'Zone 3': 'text-yellow-500', 'Zone 4': 'text-green-500', 'Zone 5': 'text-blue-500'
		};
		return colors[zone] || 'text-gray-500';
	};

	return (
		<div className="min-h-[60vh] flex flex-col">
			{/* IDLE/LOADING STATE */}
			{(status === 'idle' || status === 'loading') && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex-1 flex flex-col items-center justify-center px-4"
				>
					<motion.div className="relative mb-8">
						{/* Pulsing rings */}
						<motion.div
							animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
							transition={{ duration: 1.5, repeat: Infinity }}
							className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
						/>
						<motion.div
							animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
							transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
							className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
						/>
						{/* Main circle */}
						<motion.div
							animate={status === 'loading' ? { scale: [1, 1.05, 1] } : {}}
							transition={{ duration: 0.8, repeat: Infinity }}
							className="relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
						>
							{status === 'loading' ? (
								<Loader2 className="w-12 h-12 text-white animate-spin" />
							) : (
								<Navigation className="w-12 h-12 text-white" />
							)}
						</motion.div>
					</motion.div>

					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
					>
						{status === 'loading' ? t('findingYou') : t('title')}
					</motion.h1>

					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3 }}
						className="text-gray-500 dark:text-gray-400 mb-6"
					>
						{status === 'loading' ? t('accessingGPS') : t('description')}
					</motion.p>

					{status === 'loading' && (
						<motion.div
							initial={{ opacity: 0, width: 0 }}
							animate={{ opacity: 1, width: '12rem' }}
							className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
						>
							<motion.div
								className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
								initial={{ width: 0 }}
								animate={{ width: `${progress}%` }}
							/>
						</motion.div>
					)}
				</motion.div>
			)}

			{/* ERROR STATE */}
			{status === 'error' && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex-1 flex flex-col items-center justify-center px-4"
				>
					<div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
						<AlertTriangle className="w-10 h-10 text-red-500" />
					</div>
					<h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
						{t('locationNeeded')}
					</h1>
					<p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-xs">
						{error}
					</p>
					<Button onClick={requestLocation} className="gap-2">
						<Navigation className="w-4 h-4" />
						{t('tryAgain')}
					</Button>
				</motion.div>
			)}

			{/* SUCCESS STATE */}
			{status === 'success' && userInput.location && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex-1 flex flex-col p-4"
				>
					{/* Map */}
					<motion.div
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className="rounded-2xl overflow-hidden shadow-lg mb-4 h-[45vh]"
					>
						<MyMapComponent
							latitude={userInput.location.latitude}
							longitude={userInput.location.longitude}
							onLocationChange={handleMapChange}
							showSeismicData={false}
							showStreetView={false}
						/>
					</motion.div>

					{/* Info cards */}
					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.2 }}
						className="grid grid-cols-2 gap-3 mb-4"
					>
						<div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
							<div className="flex items-center gap-2 mb-1">
								<MapPin className="w-4 h-4 text-gray-400" />
								<span className="text-xs text-gray-500">{t('locationLabel')}</span>
							</div>
							<p className="font-medium text-gray-900 dark:text-white text-sm truncate">
								{userInput.city || userInput.address || t('loading')}
							</p>
						</div>
						<div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
							<div className="flex items-center gap-2 mb-1">
								<div className={`w-2 h-2 rounded-full ${seismicZone?.zone === 'Zone 1' ? 'bg-red-500' : seismicZone?.zone === 'Zone 2' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
								<span className="text-xs text-gray-500">{t('seismicZone')}</span>
							</div>
							<p className={`font-medium text-sm ${getZoneColor(seismicZone?.zone)}`}>
								{seismicZone?.zone || t('loading')}
							</p>
						</div>
					</motion.div>

					{/* Google Maps Images Gallery */}
					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.3 }}
					>
						<Card className='border-blue-200 dark:border-blue-800 mb-4'>
							<CardHeader className='pb-2 py-3'>
								<CardTitle className='flex items-center gap-2 text-base'>
									<Camera className='h-4 w-4 text-blue-600' />
									{t('googleMapsImages')}
									{googleImages.satellite && (
										<Badge variant='secondary' className='ml-auto text-xs'>
											<CheckCircle2 className='h-3 w-3 mr-1' />
											{t('imagesCount', { count: googleImages.streetViews.length + 1 })}
										</Badge>
									)}
								</CardTitle>
							</CardHeader>
							<CardContent className='pt-0'>
								{(!googleImages.satellite && !googleImages.streetViews.length) ? (
									<div className='grid grid-cols-2 gap-2'>
										<Skeleton className='aspect-video rounded-lg' />
										<Skeleton className='aspect-video rounded-lg' />
										<p className='col-span-2 text-xs text-gray-500 text-center'>{t('loadingImages')}</p>
									</div>
								) : (
									<div className='space-y-2'>
										{/* Main views */}
										<div className='grid grid-cols-2 gap-2'>
											{googleImages.satellite && (
												<div className='relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700'>
													<img
														src={googleImages.satellite}
														alt={t('satelliteView')}
														className='w-full h-full object-cover'
													/>
													<div className='absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center'>
														{t('satelliteView')}
													</div>
												</div>
											)}
											{googleImages.streetViews[0] && (
												<div className='relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700'>
													<img
														src={googleImages.streetViews[0].url}
														alt={t('streetView')}
														className='w-full h-full object-cover'
													/>
													<div className='absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center'>
														{t('streetView')}
													</div>
												</div>
											)}
										</div>
										{/* Additional angles */}
										{googleImages.streetViews.length > 1 && (
											<div className='grid grid-cols-3 gap-1'>
												{googleImages.streetViews.slice(1).map((img, idx) => (
													<div key={idx} className='relative aspect-video rounded overflow-hidden border border-gray-200 dark:border-gray-700'>
														<img src={img.url} alt={img.description} className='w-full h-full object-cover' />
														<div className='absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-0.5 text-center'>
															{img.description}
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								)}
							</CardContent>
						</Card>
					</motion.div>

					{/* Success indicator */}
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.4, type: "spring" }}
						className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 mb-4"
					>
						<div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
							<Check className="w-3 h-3 text-white" strokeWidth={3} />
						</div>
						<span className="text-sm font-medium">{t('locationSet')}</span>
					</motion.div>

					{/* Continue button */}
					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.5 }}
					>
						<Button
							onClick={onNext}
							size="lg"
							className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 shadow-xl shadow-emerald-500/25"
						>
							{t('continue')}
							<ArrowRight className="w-5 h-5" />
						</Button>
					</motion.div>
				</motion.div>
			)}

			{/* Footer hint */}
			{status === 'success' && (
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6 }}
					className="text-center text-xs text-gray-400 pb-4"
				>
					{t('tapToAdjust')}
				</motion.p>
			)}
		</div>
	);
};

export default LocationStepSimple;
