'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	CloudRain, Wind, Thermometer, AlertOctagon, Activity,
	Mountain, Droplets, Timer, Shield, ChevronRight
} from 'lucide-react';

/**
 * WorstCaseScenario - Dramatic weather and seismic scenario display
 * Shows current conditions + simulated earthquake impact
 */
export function WorstCaseScenario({ weatherData, seismicData, userInput, delay = 0 }) {
	const [activeTab, setActiveTab] = useState('current');
	const [showSimulation, setShowSimulation] = useState(false);

	// Get weather data
	const weather = weatherData || userInput?.weatherData || {};
	const seismic = seismicData || userInput?.seismicZone || {};

	// Simulate earthquake scenario based on zone
	const getEarthquakeScenario = () => {
		const zone = seismic.zone || seismic.seismicZone || 2;
		const scenarios = {
			1: { magnitude: '7.0+', intensity: 'Extreme', probability: 'High', damage: 'Severe structural damage likely' },
			2: { magnitude: '6.0-6.9', intensity: 'Very Strong', probability: 'Moderate-High', damage: 'Significant damage possible' },
			3: { magnitude: '5.0-5.9', intensity: 'Strong', probability: 'Moderate', damage: 'Moderate damage expected' },
			4: { magnitude: '4.0-4.9', intensity: 'Moderate', probability: 'Lower', damage: 'Minor damage possible' },
		};
		return scenarios[zone] || scenarios[2];
	};

	const scenario = getEarthquakeScenario();

	// Weather impact on building
	const getWeatherImpact = () => {
		const impacts = [];

		if (weather.windSpeed > 30) {
			impacts.push({ type: 'wind', severity: 'high', text: 'High winds may stress structure' });
		} else if (weather.windSpeed > 15) {
			impacts.push({ type: 'wind', severity: 'medium', text: 'Moderate wind loading' });
		}

		if (weather.humidity > 80) {
			impacts.push({ type: 'humidity', severity: 'medium', text: 'High humidity - corrosion risk' });
		}

		if (weather.temperature > 35 || weather.temperature < 0) {
			impacts.push({ type: 'temp', severity: 'medium', text: 'Extreme temperature stress' });
		}

		if (weather.precipitation > 0 || weather.description?.toLowerCase().includes('rain')) {
			impacts.push({ type: 'rain', severity: 'low', text: 'Precipitation - monitor drainage' });
		}

		return impacts;
	};

	const weatherImpacts = getWeatherImpact();

	useEffect(() => {
		const timer = setTimeout(() => setShowSimulation(true), delay + 2000);
		return () => clearTimeout(timer);
	}, [delay]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: delay / 1000 }}
			className="w-full"
		>
			{/* Header */}
			<div className="flex items-center gap-3 mb-4">
				<div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
					<AlertOctagon className="w-5 h-5 text-white" />
				</div>
				<div>
					<h3 className="font-bold text-gray-900 dark:text-white">Risk Scenarios</h3>
					<p className="text-xs text-gray-500">Current conditions & worst-case analysis</p>
				</div>
			</div>

			{/* Tab switcher */}
			<div className="flex gap-2 mb-4">
				{['current', 'earthquake'].map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
							activeTab === tab
								? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg'
								: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
						}`}
					>
						{tab === 'current' ? 'Current Weather' : 'Earthquake Scenario'}
					</button>
				))}
			</div>

			<AnimatePresence mode="wait">
				{/* Current Weather Tab */}
				{activeTab === 'current' && (
					<motion.div
						key="current"
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 20 }}
						className="space-y-4"
					>
						{/* Weather card */}
						<div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-5 text-white">
							<div className="flex items-start justify-between mb-4">
								<div>
									<p className="text-blue-100 text-sm mb-1">Current Conditions</p>
									<p className="text-3xl font-bold">
										{weather.temperature || weather.temp || '--'}°C
									</p>
								</div>
								<div className="text-right">
									<p className="text-sm text-blue-100 capitalize">
										{weather.description || weather.weatherDescription || 'Clear'}
									</p>
									<p className="text-xs text-blue-200 mt-1">
										{userInput?.city || 'Your Location'}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-3 gap-3">
								<div className="bg-white/20 rounded-xl p-3 text-center">
									<Wind className="w-5 h-5 mx-auto mb-1 text-blue-100" />
									<p className="text-lg font-semibold">{weather.windSpeed || '--'}</p>
									<p className="text-xs text-blue-200">km/h</p>
								</div>
								<div className="bg-white/20 rounded-xl p-3 text-center">
									<Droplets className="w-5 h-5 mx-auto mb-1 text-blue-100" />
									<p className="text-lg font-semibold">{weather.humidity || '--'}%</p>
									<p className="text-xs text-blue-200">humidity</p>
								</div>
								<div className="bg-white/20 rounded-xl p-3 text-center">
									<CloudRain className="w-5 h-5 mx-auto mb-1 text-blue-100" />
									<p className="text-lg font-semibold">{weather.precipitation || '0'}</p>
									<p className="text-xs text-blue-200">mm rain</p>
								</div>
							</div>
						</div>

						{/* Weather impacts */}
						{weatherImpacts.length > 0 && (
							<div className="space-y-2">
								<p className="text-xs text-gray-500 uppercase tracking-wide">Weather Impacts</p>
								{weatherImpacts.map((impact, idx) => (
									<motion.div
										key={idx}
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: idx * 0.1 }}
										className={`flex items-center gap-3 p-3 rounded-xl ${
											impact.severity === 'high' ? 'bg-rose-50 dark:bg-rose-900/20' :
											impact.severity === 'medium' ? 'bg-amber-50 dark:bg-amber-900/20' :
											'bg-blue-50 dark:bg-blue-900/20'
										}`}
									>
										{impact.type === 'wind' && <Wind className="w-4 h-4 text-gray-500" />}
										{impact.type === 'humidity' && <Droplets className="w-4 h-4 text-gray-500" />}
										{impact.type === 'temp' && <Thermometer className="w-4 h-4 text-gray-500" />}
										{impact.type === 'rain' && <CloudRain className="w-4 h-4 text-gray-500" />}
										<span className="text-sm text-gray-700 dark:text-gray-300">{impact.text}</span>
									</motion.div>
								))}
							</div>
						)}
					</motion.div>
				)}

				{/* Earthquake Scenario Tab */}
				{activeTab === 'earthquake' && (
					<motion.div
						key="earthquake"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						className="space-y-4"
					>
						{/* Seismic zone indicator */}
						<div className="bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl p-5 text-white relative overflow-hidden">
							{/* Animated seismic waves */}
							<motion.div
								animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
								transition={{ duration: 2, repeat: Infinity }}
								className="absolute top-1/2 left-1/2 w-20 h-20 -ml-10 -mt-10 rounded-full border-2 border-white/30"
							/>
							<motion.div
								animate={{ scale: [1, 2.5, 1], opacity: [0.2, 0, 0.2] }}
								transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
								className="absolute top-1/2 left-1/2 w-20 h-20 -ml-10 -mt-10 rounded-full border-2 border-white/20"
							/>

							<div className="relative z-10">
								<div className="flex items-start justify-between mb-4">
									<div>
										<p className="text-rose-100 text-sm mb-1">Seismic Zone</p>
										<p className="text-4xl font-bold">
											{seismic.zone || seismic.seismicZone || 2}
										</p>
									</div>
									<Activity className="w-8 h-8 text-rose-200" />
								</div>

								<div className="grid grid-cols-2 gap-3 mt-4">
									<div>
										<p className="text-xs text-rose-200">Max Magnitude</p>
										<p className="font-semibold">{scenario.magnitude}</p>
									</div>
									<div>
										<p className="text-xs text-rose-200">Probability</p>
										<p className="font-semibold">{scenario.probability}</p>
									</div>
								</div>
							</div>
						</div>

						{/* Worst case simulation */}
						{showSimulation && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4"
							>
								<div className="flex items-center gap-2 mb-3">
									<div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
									<p className="text-sm font-medium text-gray-900 dark:text-white">
										Simulated Scenario
									</p>
								</div>

								<div className="space-y-3">
									<div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-xl">
										<div className="flex items-center gap-2">
											<Activity className="w-4 h-4 text-rose-500" />
											<span className="text-sm text-gray-600 dark:text-gray-300">Intensity</span>
										</div>
										<span className="font-semibold text-rose-500">{scenario.intensity}</span>
									</div>

									<div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-xl">
										<div className="flex items-center gap-2">
											<Timer className="w-4 h-4 text-amber-500" />
											<span className="text-sm text-gray-600 dark:text-gray-300">Duration</span>
										</div>
										<span className="font-semibold text-gray-900 dark:text-white">15-45 sec</span>
									</div>

									<div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-xl">
										<div className="flex items-center gap-2">
											<Mountain className="w-4 h-4 text-orange-500" />
											<span className="text-sm text-gray-600 dark:text-gray-300">Ground Motion</span>
										</div>
										<span className="font-semibold text-gray-900 dark:text-white">
											{seismic.pga || '0.3'}g
										</span>
									</div>
								</div>

								<div className="mt-4 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
									<p className="text-sm text-rose-700 dark:text-rose-300">
										<strong>Expected Impact:</strong> {scenario.damage}
									</p>
								</div>
							</motion.div>
						)}

						{/* Safety recommendation */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 }}
							className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl"
						>
							<Shield className="w-5 h-5 text-emerald-500 flex-shrink-0" />
							<div>
								<p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
									Safety Recommendation
								</p>
								<p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
									Review detailed assessment below for improvement actions
								</p>
							</div>
							<ChevronRight className="w-4 h-4 text-emerald-400 ml-auto" />
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}

export default WorstCaseScenario;
