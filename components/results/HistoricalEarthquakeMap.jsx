'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
	MapPin,
	Activity,
	Calendar,
	Filter,
	ChevronDown,
	ChevronUp,
	Info,
	AlertTriangle,
	Clock,
	Map,
	List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
	() => import('react-leaflet').then(mod => mod.MapContainer),
	{ ssr: false }
);
const TileLayer = dynamic(
	() => import('react-leaflet').then(mod => mod.TileLayer),
	{ ssr: false }
);
const CircleMarker = dynamic(
	() => import('react-leaflet').then(mod => mod.CircleMarker),
	{ ssr: false }
);
const Marker = dynamic(
	() => import('react-leaflet').then(mod => mod.Marker),
	{ ssr: false }
);
const Popup = dynamic(
	() => import('react-leaflet').then(mod => mod.Popup),
	{ ssr: false }
);
const Circle = dynamic(
	() => import('react-leaflet').then(mod => mod.Circle),
	{ ssr: false }
);

/**
 * HistoricalEarthquakeMap - Interactive map showing past earthquakes near the assessment location
 * Uses USGS Earthquake API for real-time seismic data and Leaflet/OpenStreetMap for visualization
 */
export function HistoricalEarthquakeMap({ latitude, longitude, className }) {
	const t = useTranslations('EarthquakeMap');
	const [earthquakes, setEarthquakes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedTimeRange, setSelectedTimeRange] = useState('year');
	const [selectedMagnitude, setSelectedMagnitude] = useState('2.5');
	const [expanded, setExpanded] = useState(false);
	const [selectedQuake, setSelectedQuake] = useState(null);
	const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
	const [mapReady, setMapReady] = useState(false);

	// Load Leaflet CSS
	useEffect(() => {
		if (typeof window !== 'undefined') {
			import('leaflet/dist/leaflet.css');
			setMapReady(true);
		}
	}, []);

	// Time range options
	const timeRanges = {
		week: { label: t('lastWeek'), days: 7 },
		month: { label: t('lastMonth'), days: 30 },
		year: { label: t('lastYear'), days: 365 },
		decade: { label: t('lastDecade'), days: 3650 }
	};

	// Magnitude options
	const magnitudeOptions = [
		{ value: '2.5', label: '2.5+' },
		{ value: '4.0', label: '4.0+' },
		{ value: '5.0', label: '5.0+' },
		{ value: '6.0', label: '6.0+' }
	];

	// Fetch earthquakes from USGS API
	const fetchEarthquakes = useCallback(async () => {
		if (!latitude || !longitude) return;

		setLoading(true);
		setError(null);

		try {
			const endDate = new Date();
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - timeRanges[selectedTimeRange].days);

			const params = new URLSearchParams({
				format: 'geojson',
				starttime: startDate.toISOString().split('T')[0],
				endtime: endDate.toISOString().split('T')[0],
				latitude: latitude.toString(),
				longitude: longitude.toString(),
				maxradiuskm: '500',
				minmagnitude: selectedMagnitude,
				orderby: 'magnitude',
				limit: '100'
			});

			const response = await fetch(
				`https://earthquake.usgs.gov/fdsnws/event/1/query?${params}`
			);

			if (!response.ok) {
				throw new Error('Failed to fetch earthquake data');
			}

			const data = await response.json();
			setEarthquakes(data.features || []);
		} catch (err) {
			console.error('Error fetching earthquakes:', err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [latitude, longitude, selectedTimeRange, selectedMagnitude]);

	useEffect(() => {
		fetchEarthquakes();
	}, [fetchEarthquakes]);

	// Get magnitude color (for both CSS classes and hex values)
	const getMagnitudeColor = (mag) => {
		if (mag >= 7) return { bg: 'bg-red-500', text: 'text-red-600', hex: '#EF4444', border: 'border-red-500' };
		if (mag >= 6) return { bg: 'bg-orange-500', text: 'text-orange-600', hex: '#F97316', border: 'border-orange-500' };
		if (mag >= 5) return { bg: 'bg-amber-500', text: 'text-amber-600', hex: '#F59E0B', border: 'border-amber-500' };
		if (mag >= 4) return { bg: 'bg-yellow-500', text: 'text-yellow-600', hex: '#EAB308', border: 'border-yellow-500' };
		return { bg: 'bg-green-500', text: 'text-green-600', hex: '#22C55E', border: 'border-green-500' };
	};

	// Get circle radius based on magnitude
	const getCircleRadius = (mag) => {
		return Math.max(5, mag * 4);
	};

	// Get distance from building
	const getDistance = (quakeLat, quakeLon) => {
		const R = 6371; // Earth's radius in km
		const dLat = (quakeLat - latitude) * Math.PI / 180;
		const dLon = (quakeLon - longitude) * Math.PI / 180;
		const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(latitude * Math.PI / 180) * Math.cos(quakeLat * Math.PI / 180) *
			Math.sin(dLon / 2) * Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return Math.round(R * c);
	};

	// Format date
	const formatDate = (timestamp) => {
		const date = new Date(timestamp);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	// Get summary statistics
	const summary = useMemo(() => {
		if (earthquakes.length === 0) return null;

		const magnitudes = earthquakes.map(eq => eq.properties.mag);
		const maxMag = Math.max(...magnitudes);
		const avgMag = (magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length).toFixed(1);
		const closest = earthquakes.reduce((prev, curr) => {
			const prevDist = getDistance(prev.geometry.coordinates[1], prev.geometry.coordinates[0]);
			const currDist = getDistance(curr.geometry.coordinates[1], curr.geometry.coordinates[0]);
			return currDist < prevDist ? curr : prev;
		});

		return {
			total: earthquakes.length,
			maxMag,
			avgMag,
			closestDist: getDistance(closest.geometry.coordinates[1], closest.geometry.coordinates[0]),
			closestMag: closest.properties.mag
		};
	}, [earthquakes, latitude, longitude]);

	if (!latitude || !longitude) {
		return null;
	}

	return (
		<div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${className}`}>
			{/* Header */}
			<div
				className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
				onClick={() => setExpanded(!expanded)}
			>
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
						<Activity className="w-5 h-5 text-orange-600" />
					</div>
					<div>
						<h3 className="font-semibold text-gray-900 dark:text-white">
							{t('title')}
						</h3>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{loading ? t('loading') : t('foundCount', { count: earthquakes.length })}
						</p>
					</div>
				</div>
				<Button variant="ghost" size="sm">
					{expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
				</Button>
			</div>

			<AnimatePresence>
				{expanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="overflow-hidden"
					>
						{/* Filters & View Toggle */}
						<div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div className="flex flex-wrap items-center gap-3">
									<div className="flex items-center gap-2">
										<Calendar className="w-4 h-4 text-gray-500" />
										<select
											value={selectedTimeRange}
											onChange={(e) => setSelectedTimeRange(e.target.value)}
											className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5"
										>
											{Object.entries(timeRanges).map(([key, { label }]) => (
												<option key={key} value={key}>{label}</option>
											))}
										</select>
									</div>
									<div className="flex items-center gap-2">
										<Filter className="w-4 h-4 text-gray-500" />
										<select
											value={selectedMagnitude}
											onChange={(e) => setSelectedMagnitude(e.target.value)}
											className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5"
										>
											{magnitudeOptions.map(({ value, label }) => (
												<option key={value} value={value}>{t('magnitude')} {label}</option>
											))}
										</select>
									</div>
								</div>
								{/* View Toggle */}
								<div className="flex items-center gap-1 bg-white dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
									<button
										onClick={(e) => { e.stopPropagation(); setViewMode('map'); }}
										className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${viewMode === 'map'
											? 'bg-orange-500 text-white'
											: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
											}`}
									>
										<Map className="w-4 h-4" />
										{t('mapView') || 'Map'}
									</button>
									<button
										onClick={(e) => { e.stopPropagation(); setViewMode('list'); }}
										className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${viewMode === 'list'
											? 'bg-orange-500 text-white'
											: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
											}`}
									>
										<List className="w-4 h-4" />
										{t('listView') || 'List'}
									</button>
								</div>
							</div>
						</div>

						{/* Summary Stats */}
						{summary && !loading && (
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
								<div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
									<div className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total}</div>
									<div className="text-xs text-gray-500">{t('totalEvents')}</div>
								</div>
								<div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
									<div className={`text-2xl font-bold ${getMagnitudeColor(summary.maxMag).text}`}>
										{summary.maxMag.toFixed(1)}
									</div>
									<div className="text-xs text-gray-500">{t('maxMagnitude')}</div>
								</div>
								<div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
									<div className="text-2xl font-bold text-gray-900 dark:text-white">{summary.avgMag}</div>
									<div className="text-xs text-gray-500">{t('avgMagnitude')}</div>
								</div>
								<div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
									<div className="text-2xl font-bold text-blue-600">{summary.closestDist} km</div>
									<div className="text-xs text-gray-500">{t('closestEvent')}</div>
								</div>
							</div>
						)}

						{/* Loading State */}
						{loading && (
							<div className="p-8 text-center">
								<div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
								<p className="text-gray-500">{t('loadingData')}</p>
							</div>
						)}

						{/* Error State */}
						{error && (
							<div className="p-4 m-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
								<div className="flex items-center gap-2 text-red-600">
									<AlertTriangle className="w-5 h-5" />
									<span>{error}</span>
								</div>
							</div>
						)}

						{/* Map View */}
						{!loading && !error && viewMode === 'map' && mapReady && (
							<div className="h-96 border-t border-gray-200 dark:border-gray-700">
								<MapContainer
									center={[latitude, longitude]}
									zoom={7}
									style={{ height: '100%', width: '100%' }}
									scrollWheelZoom={true}
								>
									<TileLayer
										attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
										url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
									/>

									{/* 500km radius circle */}
									<Circle
										center={[latitude, longitude]}
										radius={500000}
										pathOptions={{
											color: '#7C3AED',
											fillColor: '#7C3AED',
											fillOpacity: 0.05,
											weight: 2,
											dashArray: '5, 10'
										}}
									/>

									{/* Building marker */}
									<CircleMarker
										center={[latitude, longitude]}
										radius={10}
										pathOptions={{
											color: '#7C3AED',
											fillColor: '#7C3AED',
											fillOpacity: 1,
											weight: 3
										}}
									>
										<Popup>
											<div className="text-center">
												<strong>{t('yourBuilding') || 'Your Building'}</strong>
												<br />
												<span className="text-xs text-gray-500">
													{latitude.toFixed(4)}, {longitude.toFixed(4)}
												</span>
											</div>
										</Popup>
									</CircleMarker>

									{/* Earthquake markers */}
									{earthquakes.map((quake) => {
										const { properties, geometry } = quake;
										const [lon, lat] = geometry.coordinates;
										const colors = getMagnitudeColor(properties.mag);
										const distance = getDistance(lat, lon);

										return (
											<CircleMarker
												key={quake.id}
												center={[lat, lon]}
												radius={getCircleRadius(properties.mag)}
												pathOptions={{
													color: colors.hex,
													fillColor: colors.hex,
													fillOpacity: 0.6,
													weight: 2
												}}
											>
												<Popup>
													<div className="min-w-48">
														<div className="flex items-center gap-2 mb-2">
															<span
																className="px-2 py-1 rounded text-white text-sm font-bold"
																style={{ backgroundColor: colors.hex }}
															>
																M{properties.mag.toFixed(1)}
															</span>
															<span className="text-xs text-gray-500">
																{distance} km {t('away')}
															</span>
														</div>
														<p className="font-medium text-sm mb-1">
															{properties.place || 'Unknown location'}
														</p>
														<p className="text-xs text-gray-500 mb-2">
															{formatDate(properties.time)} • {t('depth')}: {geometry.coordinates[2].toFixed(1)} km
														</p>
														<a
															href={properties.url}
															target="_blank"
															rel="noopener noreferrer"
															className="text-xs text-orange-600 hover:text-orange-700"
														>
															{t('viewOnUsgs')} →
														</a>
													</div>
												</Popup>
											</CircleMarker>
										);
									})}
								</MapContainer>
							</div>
						)}

						{/* Legend (for map view) */}
						{!loading && !error && viewMode === 'map' && (
							<div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
								<div className="flex flex-wrap items-center justify-center gap-4 text-xs">
									<div className="flex items-center gap-1">
										<div className="w-3 h-3 rounded-full bg-green-500"></div>
										<span>2.5-3.9</span>
									</div>
									<div className="flex items-center gap-1">
										<div className="w-3 h-3 rounded-full bg-yellow-500"></div>
										<span>4.0-4.9</span>
									</div>
									<div className="flex items-center gap-1">
										<div className="w-3 h-3 rounded-full bg-amber-500"></div>
										<span>5.0-5.9</span>
									</div>
									<div className="flex items-center gap-1">
										<div className="w-3 h-3 rounded-full bg-orange-500"></div>
										<span>6.0-6.9</span>
									</div>
									<div className="flex items-center gap-1">
										<div className="w-3 h-3 rounded-full bg-red-500"></div>
										<span>7.0+</span>
									</div>
									<div className="flex items-center gap-1 ml-4">
										<div className="w-3 h-3 rounded-full bg-violet-500"></div>
										<span>{t('yourBuilding') || 'Your Building'}</span>
									</div>
								</div>
							</div>
						)}

						{/* List View */}
						{!loading && !error && viewMode === 'list' && (
							<div className="max-h-96 overflow-y-auto">
								{earthquakes.length === 0 ? (
									<div className="p-8 text-center text-gray-500">
										<Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
										<p>{t('noEarthquakes')}</p>
									</div>
								) : (
									<div className="divide-y divide-gray-200 dark:divide-gray-700">
										{earthquakes.map((quake, index) => {
											const { properties, geometry } = quake;
											const colors = getMagnitudeColor(properties.mag);
											const distance = getDistance(geometry.coordinates[1], geometry.coordinates[0]);

											return (
												<motion.div
													key={quake.id}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.05 }}
													className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors ${selectedQuake?.id === quake.id ? 'bg-orange-50 dark:bg-orange-900/20' : ''
														}`}
													onClick={() => setSelectedQuake(selectedQuake?.id === quake.id ? null : quake)}
												>
													<div className="flex items-start gap-3">
														<div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center text-white font-bold`}>
															{properties.mag.toFixed(1)}
														</div>
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2 mb-1">
																<span className="font-medium text-gray-900 dark:text-white truncate">
																	{properties.place || 'Unknown location'}
																</span>
															</div>
															<div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
																<span className="flex items-center gap-1">
																	<MapPin className="w-3 h-3" />
																	{distance} km {t('away')}
																</span>
																<span className="flex items-center gap-1">
																	<Clock className="w-3 h-3" />
																	{formatDate(properties.time)}
																</span>
															</div>
														</div>
													</div>

													{/* Expanded Details */}
													<AnimatePresence>
														{selectedQuake?.id === quake.id && (
															<motion.div
																initial={{ height: 0, opacity: 0 }}
																animate={{ height: 'auto', opacity: 1 }}
																exit={{ height: 0, opacity: 0 }}
																className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm"
															>
																<div className="grid grid-cols-2 gap-3">
																	<div>
																		<span className="text-gray-500">{t('depth')}:</span>
																		<span className="ml-2 font-medium text-gray-900 dark:text-white">
																			{geometry.coordinates[2].toFixed(1)} km
																		</span>
																	</div>
																	<div>
																		<span className="text-gray-500">{t('coordinates')}:</span>
																		<span className="ml-2 font-medium text-gray-900 dark:text-white">
																			{geometry.coordinates[1].toFixed(3)}, {geometry.coordinates[0].toFixed(3)}
																		</span>
																	</div>
																</div>
																<a
																	href={properties.url}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-block mt-2 text-orange-600 hover:text-orange-700"
																	onClick={(e) => e.stopPropagation()}
																>
																	{t('viewOnUsgs')} →
																</a>
															</motion.div>
														)}
													</AnimatePresence>
												</motion.div>
											);
										})}
									</div>
								)}
							</div>
						)}

						{/* Footer */}
						<div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
							<p className="text-xs text-center text-gray-500">
								{t('dataSource')}
							</p>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export default HistoricalEarthquakeMap;
