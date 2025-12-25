import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Home, Award, Target } from 'lucide-react';
import { useTranslations } from 'next-intl';

const BuildingComparisonChart = ({ safetyResult, userInput }) => {
	const t = useTranslations('Results.comparison');
	const overallScore = parseFloat(safetyResult?.overallScore || 0);
	const buildingType = safetyResult?.buildingType || 'Unknown';
	const yearOfConstruction = parseInt(userInput?.yearOfConstruction || 2000);
	
	// Calculate averages for comparison
	const getAverageForBuildingType = (type) => {
		// Mock data based on typical performance by building type
		const typeAverages = {
			'C1': 78, // Concrete moment frame
			'C2': 75, // Concrete shear walls
			'C3': 65, // Concrete frame with URM infill
			'S1': 82, // Steel moment frame
			'S2': 79, // Steel braced frame
			'S3': 70, // Steel light frame
			'W1': 68, // Light wood frame
			'W2': 65, // Commercial wood
			'RM1': 60, // Reinforced masonry
			'RM2': 58, // Reinforced masonry with precast
			'URM': 45, // Unreinforced masonry
			'MH': 40,  // Mobile homes
			'PC1': 68, // Precast tilt-up
			'PC2': 72  // Precast with shear walls
		};
		return typeAverages[type] || 65;
	};

	const getAverageForAge = (year) => {
		const currentYear = new Date().getFullYear();
		const age = currentYear - year;
		
		// Age-based average scores
		if (age <= 10) return 85;
		if (age <= 20) return 75;
		if (age <= 30) return 65;
		if (age <= 40) return 58;
		if (age <= 50) return 52;
		return 45;
	};

	const buildingTypeAverage = getAverageForBuildingType(buildingType);
	const ageAverage = getAverageForAge(yearOfConstruction);
	const minimumRecommended = 70;

	// Prepare data for chart
	const comparisonData = [
		{
			category: t('yourBuilding'),
			score: overallScore,
			color: overallScore >= minimumRecommended ? '#22c55e' : '#ef4444',
			description: t('yourDescription')
		},
		{
			category: t('avgType', { type: buildingType }),
			score: buildingTypeAverage,
			color: buildingTypeAverage >= minimumRecommended ? '#22c55e' : '#ef4444',
			description: t('avgTypeDescription')
		},
		{
			category: t('avgAge', { age: new Date().getFullYear() - yearOfConstruction }),
			score: ageAverage,
			color: ageAverage >= minimumRecommended ? '#22c55e' : '#ef4444',
			description: t('avgAgeDescription')
		},
		{
			category: t('recommendedMin'),
			score: minimumRecommended,
			color: '#3b82f6',
			description: t('recommendedMinDescription')
		}
	];

	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
					<p className="font-semibold">{label}</p>
					<p className="text-blue-600 dark:text-blue-400">
						{t('scoreLabel')}: {data.score}%
					</p>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						{data.description}
					</p>
				</div>
			);
		}
		return null;
	};

	const CustomBar = (props) => {
		const { fill, payload } = props;
		return <Bar {...props} fill={payload.color} />;
	};

	// Performance analysis
	const getPerformanceComparison = () => {
		const comparisons = [];

		if (overallScore > buildingTypeAverage) {
			comparisons.push({
				type: 'positive',
				text: t('above', { points: (overallScore - buildingTypeAverage).toFixed(1), type: buildingType })
			});
		} else if (overallScore < buildingTypeAverage) {
			comparisons.push({
				type: 'negative',
				text: t('below', { points: (buildingTypeAverage - overallScore).toFixed(1), type: buildingType })
			});
		} else {
			comparisons.push({
				type: 'neutral',
				text: t('average', { type: buildingType })
			});
		}

		if (overallScore > ageAverage) {
			comparisons.push({
				type: 'positive',
				text: t('ageAbove', { points: (overallScore - ageAverage).toFixed(1) })
			});
		} else if (overallScore < ageAverage) {
			comparisons.push({
				type: 'negative',
				text: t('ageBelow', { points: (ageAverage - overallScore).toFixed(1) })
			});
		}

		return comparisons;
	};

	const performanceComparisons = getPerformanceComparison();

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendingUp className="w-5 h-5 text-blue-600" />
					{t('title')}
				</CardTitle>
				<CardDescription>
					{t('description')}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{/* Chart */}
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
								<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
								<XAxis 
									dataKey="category" 
									angle={-45}
									textAnchor="end"
									height={80}
									interval={0}
									className="text-gray-600 dark:text-gray-400"
								/>
								<YAxis
									label={{ value: t('scoreLabel'), angle: -90, position: 'insideLeft' }}
									domain={[0, 100]}
									className="text-gray-600 dark:text-gray-400"
								/>
								<Tooltip content={<CustomTooltip />} />
								<Bar 
									dataKey="score" 
									radius={[4, 4, 0, 0]}
									stroke="#374151"
									strokeWidth={1}
								>
									{comparisonData.map((entry, index) => (
										<Bar key={`cell-${index}`} fill={entry.color} />
									))}
								</Bar>
								{/* Reference line for minimum recommended */}
								<Bar 
									dataKey={() => minimumRecommended}
									fill="transparent"
									stroke="#6b7280"
									strokeWidth={2}
									strokeDasharray="5,5"
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>

					{/* Performance Analysis */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Key Insights */}
						<div className="space-y-3">
							<h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
								<Award className="w-4 h-4 text-blue-600" />
								{t('insightsTitle')}
							</h4>
							{performanceComparisons.map((comparison, index) => (
								<div key={index} className="flex items-start gap-2">
									<div className={`w-2 h-2 rounded-full mt-2 ${
										comparison.type === 'positive' ? 'bg-green-500' :
										comparison.type === 'negative' ? 'bg-red-500' : 'bg-gray-500'
									}`} />
									<p className="text-sm text-gray-600 dark:text-gray-400">
										{comparison.text}
									</p>
								</div>
							))}
						</div>

						{/* Recommendations */}
						<div className="space-y-3">
							<h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
								<Target className="w-4 h-4 text-green-600" />
								{t('recommendationsTitle')}
							</h4>
							{overallScore < minimumRecommended && (
								<div className="space-y-2">
									<div className="flex items-start gap-2">
										<div className="w-2 h-2 rounded-full mt-2 bg-red-500" />
										<p className="text-sm text-gray-600 dark:text-gray-400">
											{t('improve', { threshold: minimumRecommended })}
										</p>
									</div>
									<div className="flex items-start gap-2">
										<div className="w-2 h-2 rounded-full mt-2 bg-orange-500" />
										<p className="text-sm text-gray-600 dark:text-gray-400">
											{t('consult')}
										</p>
									</div>
								</div>
							)}
							{overallScore >= minimumRecommended && (
								<div className="space-y-2">
									<div className="flex items-start gap-2">
										<div className="w-2 h-2 rounded-full mt-2 bg-green-500" />
										<p className="text-sm text-gray-600 dark:text-gray-400">
											{t('meets')}
										</p>
									</div>
									<div className="flex items-start gap-2">
										<div className="w-2 h-2 rounded-full mt-2 bg-blue-500" />
										<p className="text-sm text-gray-600 dark:text-gray-400">
											{t('maintain')}
										</p>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Score Breakdown */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
						{comparisonData.map((item, index) => (
							<div key={index} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
								<div className={`text-2xl font-bold ${
									item.score >= minimumRecommended ? 'text-green-600' : 'text-red-600'
								}`}>
									{item.score}%
								</div>
								<div className="text-xs text-gray-600 dark:text-gray-400">
									{item.category}
								</div>
							</div>
						))}
					</div>

					{/* Methodology Note */}
					<div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
						<p className="text-sm text-blue-700 dark:text-blue-300">
							<strong>Note:</strong> {t('methodology')}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default BuildingComparisonChart;