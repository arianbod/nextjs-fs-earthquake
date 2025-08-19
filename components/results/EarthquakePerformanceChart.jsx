import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertTriangle, Shield } from 'lucide-react';

const EarthquakePerformanceChart = ({ buildingData }) => {
	// Generate performance data for different Richter scales
	const generatePerformanceData = () => {
		const data = [];
		for (let richter = 4.0; richter <= 8.0; richter += 0.5) {
			let performance;
			let status;
			let color;
			
			// Calculate performance based on building characteristics and Richter scale
			const basePerformance = parseFloat(buildingData?.overallScore || 75);
			
			// Performance decreases exponentially with higher Richter scale
			const degradationFactor = Math.pow((richter - 3.5) / 4.5, 2);
			performance = Math.max(0, basePerformance * (1 - degradationFactor));
			
			// Color coding based on performance and Richter scale
			if (richter < 5.5) {
				status = 'Safe';
				color = '#22c55e'; // Green
			} else if (richter <= 6.5) {
				status = 'Caution';
				color = '#eab308'; // Yellow
			} else {
				status = 'Danger';
				color = '#ef4444'; // Red
			}
			
			data.push({
				richter: richter.toFixed(1),
				performance: Math.round(performance),
				status,
				color,
				fillColor: richter < 5.5 ? '#22c55e20' : richter <= 6.5 ? '#eab30820' : '#ef444420'
			});
		}
		return data;
	};

	const performanceData = generatePerformanceData();

	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
					<p className="font-semibold">{`Richter Scale: ${label}`}</p>
					<p className="text-blue-600 dark:text-blue-400">
						{`Performance: ${data.performance}%`}
					</p>
					<p className={`font-medium ${
						data.status === 'Safe' ? 'text-green-600' : 
						data.status === 'Caution' ? 'text-yellow-600' : 'text-red-600'
					}`}>
						Status: {data.status}
					</p>
				</div>
			);
		}
		return null;
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case 'Safe':
				return <Shield className="w-4 h-4 text-green-600" />;
			case 'Caution':
				return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
			case 'Danger':
				return <AlertTriangle className="w-4 h-4 text-red-600" />;
			default:
				return null;
		}
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendingUp className="w-5 h-5 text-blue-600" />
					Building Performance vs Earthquake Magnitude
				</CardTitle>
				<CardDescription>
					Expected building performance across different Richter scale magnitudes
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{/* Chart */}
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
								<defs>
									<linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
										<stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
								<XAxis 
									dataKey="richter" 
									label={{ value: 'Richter Scale', position: 'insideBottom', offset: -5 }}
									className="text-gray-600 dark:text-gray-400"
								/>
								<YAxis 
									label={{ value: 'Performance (%)', angle: -90, position: 'insideLeft' }}
									domain={[0, 100]}
									className="text-gray-600 dark:text-gray-400"
								/>
								<Tooltip content={<CustomTooltip />} />
								<Area
									type="monotone"
									dataKey="performance"
									stroke="#3b82f6"
									strokeWidth={3}
									fill="url(#performanceGradient)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>

					{/* Legend */}
					<div className="flex flex-wrap gap-4 justify-center">
						<div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
							<div className="w-3 h-3 bg-green-500 rounded-full"></div>
							<span className="text-sm font-medium text-green-700 dark:text-green-300">
								Safe (&lt; 5.5 Richter)
							</span>
						</div>
						<div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
							<div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
							<span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
								Caution (5.5-6.5 Richter)
							</span>
						</div>
						<div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
							<div className="w-3 h-3 bg-red-500 rounded-full"></div>
							<span className="text-sm font-medium text-red-700 dark:text-red-300">
								Danger (&gt; 6.5 Richter)
							</span>
						</div>
					</div>

					{/* Summary Stats */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
						{['Safe', 'Caution', 'Danger'].map((status) => {
							const statusData = performanceData.filter(d => d.status === status);
							const avgPerformance = statusData.reduce((sum, d) => sum + d.performance, 0) / statusData.length;
							
							return (
								<div key={status} className="text-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
									<div className="flex items-center justify-center gap-2 mb-2">
										{getStatusIcon(status)}
										<span className="font-semibold text-sm">{status} Zone</span>
									</div>
									<p className="text-lg font-bold text-gray-900 dark:text-gray-100">
										{Math.round(avgPerformance)}%
									</p>
									<p className="text-xs text-gray-600 dark:text-gray-400">
										Avg. Performance
									</p>
								</div>
							);
						})}
					</div>

					{/* Disclaimer */}
					<div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
						<p className="text-sm text-blue-700 dark:text-blue-300">
							<strong>Note:</strong> This visualization is based on your building's assessment data and serves as an estimation. 
							Actual performance may vary based on construction quality, maintenance, and local geological conditions.
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default EarthquakePerformanceChart;