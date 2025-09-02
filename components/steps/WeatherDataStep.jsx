import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
	Cloud,
	CloudRain,
	CloudSnow,
	Sun,
	Wind,
	Droplets,
	Thermometer,
	Eye,
	Gauge,
	MapPin,
	AlertTriangle,
	Info,
	CheckCircle2,
	ArrowLeft,
	ArrowRight,
	Loader2,
	Calendar,
	TrendingUp,
	TrendingDown,
	Waves,
	Mountain,
	Satellite,
	Building,
	Sparkles,
	Zap,
	Map,
	Camera,
} from 'lucide-react';
import Link from 'next/link';

const WeatherDataStep = ({ userInput, updateUserInput, onNext }) => {
	const [weatherData, setWeatherData] = useState(null);
	const [seismicData, setSeismicData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showSatelliteReveal, setShowSatelliteReveal] = useState(false);
	const [satelliteImageUrl, setSatelliteImageUrl] = useState(null);
	const [revealStage, setRevealStage] = useState(0); // 0: weather, 1: surprise building view

	// Simulate fetching weather and seismic data based on location
	useEffect(() => {
		const fetchEnvironmentalData = async () => {
			setLoading(true);
			setError(null);

			try {
				// Simulate API delay
				await new Promise(resolve => setTimeout(resolve, 1500));

				// Mock weather data based on location
				const mockWeatherData = {
					current: {
						temperature: 22,
						humidity: 65,
						windSpeed: 12,
						pressure: 1013,
						visibility: 10,
						condition: 'Partly Cloudy',
						icon: Sun,
						uvIndex: 6,
						precipitation: 0,
					},
					location: {
						city: userInput.city || 'Istanbul',
						country: 'Turkey',
						coordinates: {
							lat: userInput.latitude || 41.0082,
							lng: userInput.longitude || 28.9784,
						},
						timezone: 'Europe/Istanbul',
						elevation: 40, // meters
					},
					forecast: {
						rain: {
							probability: 20,
							amount: 2, // mm
						},
						temperature: {
							min: 18,
							max: 26,
						},
					},
					historical: {
						avgRainfall: 844, // mm per year
						avgTemperature: 15,
						extremeWeather: ['Heavy rain', 'Strong winds', 'Occasional snow'],
					},
				};

				// Mock seismic data
				const mockSeismicData = {
					zone: userInput.earthquakeZone || 'DD-1',
					zoneDescription: 'High Seismic Activity Zone',
					soilType: userInput.soilType || 'ZC',
					soilDescription: 'Medium Soil - Moderate amplification',
					recentActivity: {
						lastWeek: 3,
						lastMonth: 12,
						lastYear: 156,
					},
					nearestFault: {
						name: 'North Anatolian Fault',
						distance: 85, // km
						type: 'Strike-slip',
						lastMajorEvent: '1999 Izmit Earthquake (M7.6)',
					},
					historicalEvents: [
						{ year: 1999, magnitude: 7.6, location: 'Izmit', distance: 90 },
						{ year: 1999, magnitude: 7.2, location: 'Düzce', distance: 150 },
						{ year: 2011, magnitude: 5.8, location: 'Van', distance: 1200 },
					],
					riskFactors: {
						seismicHazard: 'High',
						liquefactionPotential: 'Moderate',
						landslideSusceptibility: 'Low',
						tsunamiRisk: 'Very Low',
					},
				};

				setWeatherData(mockWeatherData);
				setSeismicData(mockSeismicData);

				// Generate satellite image URL (Google Maps Static API simulation)
				const lat = userInput.latitude || 41.0082;
				const lng = userInput.longitude || 28.9784;
				const satelliteUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=19&size=600x400&maptype=satellite&markers=color:red%7C${lat},${lng}&key=YOUR_API_KEY`;
				setSatelliteImageUrl(satelliteUrl);

				// Save to user context
				updateUserInput({
					environmentalData: {
						weather: mockWeatherData,
						seismic: mockSeismicData,
					},
					environmentalDataReviewed: true,
					satelliteImageUrl: satelliteUrl,
				});

				// Start progressive reveal after initial load
				setTimeout(() => {
					setRevealStage(1);
					setTimeout(() => {
						setShowSatelliteReveal(true);
					}, 2000);
				}, 1500);
			} catch (err) {
				console.error('Error fetching environmental data:', err);
				setError('Failed to fetch environmental data. Please try again.');
			} finally {
				setLoading(false);
			}
		};

		if (userInput.latitude && userInput.longitude) {
			fetchEnvironmentalData();
		} else {
			setError('Location data not available. Please complete the location step first.');
			setLoading(false);
		}
	}, [userInput.latitude, userInput.longitude]);

	const getWeatherIcon = (condition) => {
		const icons = {
			'Clear': Sun,
			'Partly Cloudy': Cloud,
			'Cloudy': Cloud,
			'Rainy': CloudRain,
			'Snowy': CloudSnow,
		};
		return icons[condition] || Cloud;
	};

	const getRiskColor = (level) => {
		const colors = {
			'Very Low': 'text-green-600 bg-green-50 dark:bg-green-900/20',
			'Low': 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
			'Moderate': 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
			'High': 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
			'Very High': 'text-red-600 bg-red-50 dark:bg-red-900/20',
		};
		return colors[level] || 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
	};

	const getZoneColor = (zone) => {
		const colors = {
			'DD-1': 'destructive',
			'DD-2': 'warning', 
			'DD-3': 'secondary',
			'DD-4': 'success',
		};
		return colors[zone] || 'default';
	};

	if (loading) {
		return (
			<div className='max-w-6xl mx-auto space-y-6'>
				<Card>
					<CardContent className='pt-8'>
						<div className='flex flex-col items-center justify-center space-y-4'>
							<Loader2 className='h-12 w-12 animate-spin text-blue-600' />
							<h3 className='text-lg font-medium'>Gathering Environmental Data</h3>
							<p className='text-sm text-gray-600 dark:text-gray-400'>
								Fetching weather and seismic information for your location...
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className='max-w-6xl mx-auto space-y-6'>
				<Card className='border-red-200 dark:border-red-800'>
					<CardContent className='pt-6'>
						<div className='flex items-start gap-3'>
							<AlertTriangle className='h-5 w-5 text-red-600 mt-0.5' />
							<div>
								<h3 className='font-medium text-red-800 dark:text-red-200'>Error</h3>
								<p className='text-sm text-red-600 dark:text-red-400 mt-1'>{error}</p>
								<Link href='/assessment/1'>
									<Button variant='outline' className='mt-4' size='sm'>
										<ArrowLeft className='h-4 w-4 mr-2' />
										Back to Location
									</Button>
								</Link>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='max-w-6xl mx-auto space-y-6'>
			{/* Header */}
			<div className='text-center mb-8'>
				<div className='inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full mb-4 animate-pulse'>
					<Cloud className='h-10 w-10 text-blue-600 dark:text-blue-400' />
				</div>
				<h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
					Environmental Insights
				</h1>
				<p className='text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
					<span className='inline-flex items-center gap-1'>
						<Sparkles className='h-5 w-5 text-purple-500' />
						Surprise! 
					</span>
					We've analyzed your location and have something amazing to show you...
				</p>
				{revealStage >= 1 && (
					<div className='mt-4 animate-fade-in'>
						<Badge variant='outline' className='bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700 gap-1'>
							<Satellite className='h-3 w-3' />
							Including satellite view of your building!
						</Badge>
					</div>
				)}
			</div>

			{/* Location Summary */}
			<Card className='border-blue-200 dark:border-blue-800'>
				<CardHeader className='bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'>
					<CardTitle className='flex items-center gap-2'>
						<MapPin className='h-5 w-5 text-blue-600' />
						Location Information
					</CardTitle>
				</CardHeader>
				<CardContent className='pt-6'>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						<div>
							<p className='text-sm text-gray-600 dark:text-gray-400'>City</p>
							<p className='font-medium'>{weatherData?.location.city || userInput.city || 'Unknown'}</p>
						</div>
						<div>
							<p className='text-sm text-gray-600 dark:text-gray-400'>Coordinates</p>
							<p className='font-medium'>
								{weatherData?.location.coordinates.lat.toFixed(4)}, {weatherData?.location.coordinates.lng.toFixed(4)}
							</p>
						</div>
						<div>
							<p className='text-sm text-gray-600 dark:text-gray-400'>Elevation</p>
							<p className='font-medium'>{weatherData?.location.elevation}m above sea level</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* SURPRISE: Street View and Satellite View */}
			{userInput.streetViewUrl && (
				<Card className='border-purple-200 dark:border-purple-800 overflow-hidden'>
					<CardHeader className='bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20'>
						<div className='flex items-center justify-between'>
							<CardTitle className='flex items-center gap-2'>
								<Camera className='h-5 w-5 text-purple-600' />
								<span>Surprise! We Found Your Building</span>
								<Badge className='bg-gradient-to-r from-purple-600 to-blue-600'>WOW</Badge>
							</CardTitle>
						</div>
					</CardHeader>
					<CardContent className='pt-6'>
						<div className='grid md:grid-cols-2 gap-4'>
							<div>
								<h4 className='font-medium mb-2 flex items-center gap-2'>
									<Eye className='h-4 w-4' />
									Street View
								</h4>
								<div className='relative aspect-video rounded-lg overflow-hidden border-2 border-purple-200 dark:border-purple-700'>
									<img 
										src={userInput.streetViewUrl} 
										alt='Street view of your building'
										className='w-full h-full object-cover'
									/>
									<div className='absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs'>
										Google Street View
									</div>
								</div>
							</div>
							<div>
								<h4 className='font-medium mb-2 flex items-center gap-2'>
									<MapPin className='h-4 w-4' />
									Satellite View
								</h4>
								<div className='relative aspect-video rounded-lg overflow-hidden border-2 border-blue-200 dark:border-blue-700'>
									{userInput.satelliteViewUrl && (
										<img 
											src={userInput.satelliteViewUrl} 
											alt='Satellite view of your building'
											className='w-full h-full object-cover'
										/>
									)}
									<div className='absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs'>
										Google Satellite
									</div>
								</div>
							</div>
						</div>
						<div className='mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg'>
							<p className='text-sm text-purple-700 dark:text-purple-300 flex items-start gap-2'>
								<Sparkles className='h-4 w-4 mt-0.5 flex-shrink-0' />
								We've been gathering visual data about your building while you were selecting the location. This helps our AI provide more accurate assessments!
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Current Weather - Visual Card */}
			{weatherData && (
				<Card className='overflow-hidden'>
					<div className='relative h-64 bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-400 dark:from-blue-800 dark:via-blue-700 dark:to-cyan-800'>
						{/* Animated Weather Icon */}
						<div className='absolute inset-0 flex items-center justify-center'>
							{weatherData.current.condition === 'Partly Cloudy' && (
								<div className='relative'>
									<Sun className='h-24 w-24 text-yellow-300 animate-pulse' />
									<Cloud className='h-16 w-16 text-white absolute -bottom-2 -right-2 animate-bounce' style={{ animationDelay: '0.5s' }} />
								</div>
							)}
							{weatherData.current.condition === 'Clear' && (
								<Sun className='h-32 w-32 text-yellow-300 animate-spin' style={{ animationDuration: '20s' }} />
							)}
							{weatherData.current.condition === 'Rainy' && (
								<div className='relative'>
									<CloudRain className='h-24 w-24 text-gray-300 animate-pulse' />
									<div className='absolute top-16 left-4'>
										<Droplets className='h-6 w-6 text-blue-200 animate-bounce' />
									</div>
									<div className='absolute top-16 right-4'>
										<Droplets className='h-6 w-6 text-blue-200 animate-bounce' style={{ animationDelay: '0.3s' }} />
									</div>
								</div>
							)}
						</div>

						{/* Location and Temperature Overlay */}
						<div className='absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent'>
							<div className='text-white'>
								<p className='text-sm opacity-90 flex items-center gap-1'>
									<MapPin className='h-4 w-4' />
									{weatherData.location.city}, {weatherData.location.country}
								</p>
								<div className='flex items-end justify-between mt-2'>
									<div>
										<p className='text-5xl font-bold'>{weatherData.current.temperature}°</p>
										<p className='text-lg mt-1'>{weatherData.current.condition}</p>
									</div>
									<div className='text-right'>
										<p className='text-sm opacity-90'>H: {weatherData.forecast.temperature.max}°</p>
										<p className='text-sm opacity-90'>L: {weatherData.forecast.temperature.min}°</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Simple Weather Details */}
					<CardContent className='pt-6'>
						<div className='grid grid-cols-3 gap-4 text-center'>
							<div className='p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'>
								<div className='flex justify-center mb-2'>
									<div className='p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full'>
										<Droplets className='h-6 w-6 text-blue-600 dark:text-blue-400 animate-pulse' />
									</div>
								</div>
								<p className='text-2xl font-bold text-gray-900 dark:text-white'>{weatherData.current.humidity}%</p>
								<p className='text-sm text-gray-600 dark:text-gray-400'>Humidity</p>
							</div>

							<div className='p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'>
								<div className='flex justify-center mb-2'>
									<div className='p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-full'>
										<Wind className='h-6 w-6 text-cyan-600 dark:text-cyan-400' style={{ animation: 'sway 2s ease-in-out infinite' }} />
									</div>
								</div>
								<p className='text-2xl font-bold text-gray-900 dark:text-white'>{weatherData.current.windSpeed}</p>
								<p className='text-sm text-gray-600 dark:text-gray-400'>km/h Wind</p>
							</div>

							<div className='p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'>
								<div className='flex justify-center mb-2'>
									<div className='p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full'>
										<CloudRain className='h-6 w-6 text-purple-600 dark:text-purple-400' />
									</div>
								</div>
								<p className='text-2xl font-bold text-gray-900 dark:text-white'>{weatherData.forecast.rain.probability}%</p>
								<p className='text-sm text-gray-600 dark:text-gray-400'>Rain Chance</p>
							</div>
						</div>

						<style jsx>{`
							@keyframes sway {
								0%, 100% { transform: rotate(-5deg); }
								50% { transform: rotate(5deg); }
							}
						`}</style>

					</CardContent>
				</Card>
			)}

			{/* Seismic Data */}
			{seismicData && (
				<Card className='border-orange-200 dark:border-orange-800'>
					<CardHeader className='bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'>
						<CardTitle className='flex items-center justify-between'>
							<span className='flex items-center gap-2 text-orange-800 dark:text-orange-200'>
								<Mountain className='h-5 w-5' />
								Seismic Risk Assessment
							</span>
							<Badge variant={getZoneColor(seismicData.zone)}>
								Zone {seismicData.zone}
							</Badge>
						</CardTitle>
						<p className='text-sm text-orange-600 dark:text-orange-400 mt-2'>
							{seismicData.zoneDescription}
						</p>
					</CardHeader>
					<CardContent className='space-y-6 pt-6'>
						{/* Seismic Zone and Soil */}
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className='p-4 border border-orange-200 dark:border-orange-800 rounded-lg'>
								<h4 className='font-medium mb-3'>Earthquake Zone Classification</h4>
								<div className='space-y-2'>
									<div className='flex justify-between items-center'>
										<span className='text-sm text-gray-600 dark:text-gray-400'>Zone</span>
										<Badge variant={getZoneColor(seismicData.zone)} className='font-bold'>
											{seismicData.zone}
										</Badge>
									</div>
									<p className='text-xs text-gray-600 dark:text-gray-400'>
										{seismicData.zoneDescription}
									</p>
								</div>
							</div>

							<div className='p-4 border border-blue-200 dark:border-blue-800 rounded-lg'>
								<h4 className='font-medium mb-3'>Soil Classification</h4>
								<div className='space-y-2'>
									<div className='flex justify-between items-center'>
										<span className='text-sm text-gray-600 dark:text-gray-400'>Type</span>
										<Badge variant='outline' className='font-bold'>
											{seismicData.soilType}
										</Badge>
									</div>
									<p className='text-xs text-gray-600 dark:text-gray-400'>
										{seismicData.soilDescription}
									</p>
								</div>
							</div>
						</div>

						{/* Recent Activity */}
						<div className='p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg'>
							<h4 className='font-medium mb-3 flex items-center gap-2'>
								<Waves className='h-4 w-4 text-amber-600' />
								Recent Seismic Activity
							</h4>
							<div className='grid grid-cols-3 gap-4'>
								<div className='text-center'>
									<p className='text-2xl font-bold text-amber-900 dark:text-amber-200'>
										{seismicData.recentActivity.lastWeek}
									</p>
									<p className='text-xs text-amber-700 dark:text-amber-300'>Last Week</p>
								</div>
								<div className='text-center'>
									<p className='text-2xl font-bold text-amber-900 dark:text-amber-200'>
										{seismicData.recentActivity.lastMonth}
									</p>
									<p className='text-xs text-amber-700 dark:text-amber-300'>Last Month</p>
								</div>
								<div className='text-center'>
									<p className='text-2xl font-bold text-amber-900 dark:text-amber-200'>
										{seismicData.recentActivity.lastYear}
									</p>
									<p className='text-xs text-amber-700 dark:text-amber-300'>Last Year</p>
								</div>
							</div>
						</div>

						{/* Nearest Fault */}
						<div className='p-4 bg-red-50 dark:bg-red-900/20 rounded-lg'>
							<h4 className='font-medium mb-3 flex items-center gap-2'>
								<AlertTriangle className='h-4 w-4 text-red-600' />
								Nearest Fault Line
							</h4>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
								<div>
									<p className='text-gray-600 dark:text-gray-400'>Fault Name</p>
									<p className='font-medium'>{seismicData.nearestFault.name}</p>
								</div>
								<div>
									<p className='text-gray-600 dark:text-gray-400'>Distance</p>
									<p className='font-medium'>{seismicData.nearestFault.distance} km</p>
								</div>
								<div>
									<p className='text-gray-600 dark:text-gray-400'>Fault Type</p>
									<p className='font-medium'>{seismicData.nearestFault.type}</p>
								</div>
								<div>
									<p className='text-gray-600 dark:text-gray-400'>Last Major Event</p>
									<p className='font-medium text-xs'>{seismicData.nearestFault.lastMajorEvent}</p>
								</div>
							</div>
						</div>

						{/* Visual Risk Indicators */}
						<div>
							<h4 className='font-medium mb-4 text-center'>Risk Assessment Overview</h4>
							<div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
								{Object.entries(seismicData.riskFactors).map(([factor, level]) => (
									<div key={factor} className={`p-3 rounded-lg ${getRiskColor(level)}`}>
										<p className='text-xs font-medium capitalize'>
											{factor.replace(/([A-Z])/g, ' $1').trim()}
										</p>
										<p className='text-sm font-bold mt-1'>{level}</p>
									</div>
								))}
							</div>
						</div>

						{/* Important Notice */}
						<div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
							<div className='flex items-start gap-3'>
								<Info className='h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0' />
								<div>
									<h4 className='font-medium text-blue-900 dark:text-blue-200'>
										How This Data Affects Your Assessment
									</h4>
									<p className='text-sm text-blue-700 dark:text-blue-300 mt-1'>
										The environmental data above provides important context for your building's seismic risk assessment. 
										Weather patterns affect soil conditions and building materials over time, while seismic zone classification 
										directly impacts the safety requirements for your structure. This information will be automatically 
										factored into your final safety score.
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Navigation */}
			<div className='flex justify-between pt-4'>
				<Link href='/assessment/1'>
					<Button variant='outline' className='gap-2'>
						<ArrowLeft className='h-4 w-4' /> Back to Location
					</Button>
				</Link>

				<Button onClick={onNext} className='gap-2'>
					Continue to Photo Upload
					<ArrowRight className='h-4 w-4' />
				</Button>
			</div>
		</div>
	);
};

export default WeatherDataStep;