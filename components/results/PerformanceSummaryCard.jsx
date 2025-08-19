import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

const PerformanceSummaryCard = ({ safetyResult, userInput }) => {
	const overallScore = parseFloat(safetyResult?.overallScore || 0);
	
	// Traffic light logic
	const getTrafficLightStatus = (score) => {
		if (score >= 75) return { active: 'green', level: 'Good', message: 'Your building meets safety standards' };
		if (score >= 50) return { active: 'yellow', level: 'Caution', message: 'Your building may need improvements' };
		return { active: 'red', level: 'Critical', message: 'Your building requires immediate attention' };
	};

	const status = getTrafficLightStatus(overallScore);

	// Performance level indicators
	const getPerformanceIcon = (level) => {
		switch (level) {
			case 'Good':
				return <CheckCircle2 className="w-6 h-6 text-green-600" />;
			case 'Caution':
				return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
			case 'Critical':
				return <AlertTriangle className="w-6 h-6 text-red-600" />;
			default:
				return <Activity className="w-6 h-6 text-gray-600" />;
		}
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Shield className="w-5 h-5 text-blue-600" />
					Building Performance Summary
				</CardTitle>
				<CardDescription>
					Visual assessment of your building's earthquake safety performance
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{/* Traffic Light Visualization */}
					<div className="flex flex-col items-center space-y-4">
						<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
							Performance Level Indicator
						</h3>
						
						{/* Traffic Light Container */}
						<div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center space-y-3">
							{/* Red Light */}
							<div className={`w-16 h-16 rounded-full border-4 border-gray-600 flex items-center justify-center transition-all duration-300 ${
								status.active === 'red' 
									? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse' 
									: 'bg-gray-700'
							}`}>
								{status.active === 'red' && (
									<AlertTriangle className="w-8 h-8 text-white" />
								)}
							</div>
							
							{/* Yellow Light */}
							<div className={`w-16 h-16 rounded-full border-4 border-gray-600 flex items-center justify-center transition-all duration-300 ${
								status.active === 'yellow' 
									? 'bg-yellow-500 shadow-lg shadow-yellow-500/50 animate-pulse' 
									: 'bg-gray-700'
							}`}>
								{status.active === 'yellow' && (
									<AlertTriangle className="w-8 h-8 text-white" />
								)}
							</div>
							
							{/* Green Light */}
							<div className={`w-16 h-16 rounded-full border-4 border-gray-600 flex items-center justify-center transition-all duration-300 ${
								status.active === 'green' 
									? 'bg-green-500 shadow-lg shadow-green-500/50 animate-pulse' 
									: 'bg-gray-700'
							}`}>
								{status.active === 'green' && (
									<CheckCircle2 className="w-8 h-8 text-white" />
								)}
							</div>
						</div>

						{/* Status Message */}
						<div className="text-center">
							<div className="flex items-center justify-center gap-2 mb-2">
								{getPerformanceIcon(status.level)}
								<h4 className={`text-xl font-bold ${
									status.active === 'green' ? 'text-green-600' :
									status.active === 'yellow' ? 'text-yellow-600' : 'text-red-600'
								}`}>
									{status.level} Performance
								</h4>
							</div>
							<p className="text-gray-600 dark:text-gray-400 max-w-md">
								{status.message}
							</p>
						</div>
					</div>

					{/* Performance Metrics */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
						<div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
							<div className="text-2xl font-bold text-blue-600">
								{safetyResult?.overallScore}%
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-400">
								Overall Score
							</div>
						</div>
						
						<div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
							<div className="text-2xl font-bold text-green-600">
								{safetyResult?.maxSafeRichter || '5.5'}
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-400">
								Max Safe Richter
							</div>
						</div>
						
						<div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
							<div className="text-2xl font-bold text-purple-600">
								{safetyResult?.performanceLevels || 'Good'}
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
								Performance Level
							</div>
						</div>
					</div>

					{/* Performance Description */}
					<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
						<h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
							What This Means
						</h4>
						<p className="text-blue-700 dark:text-blue-400 text-sm">
							{status.active === 'green' && (
								"Your building demonstrates good earthquake resistance and meets current safety standards. Regular maintenance and monitoring are recommended."
							)}
							{status.active === 'yellow' && (
								"Your building shows moderate earthquake resistance but may benefit from structural improvements. Consider consulting a structural engineer for assessment."
							)}
							{status.active === 'red' && (
								"Your building may have significant vulnerabilities to earthquake damage. Professional structural assessment and improvements are strongly recommended."
							)}
						</p>
					</div>

					{/* Building Classification */}
					{safetyResult?.buildingClassification && (
						<div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
							<div className={`p-2 rounded-full bg-${safetyResult.buildingClassification.color}-100 dark:bg-${safetyResult.buildingClassification.color}-900/20`}>
								<Shield className={`w-5 h-5 text-${safetyResult.buildingClassification.color}-600`} />
							</div>
							<div>
								<h5 className="font-semibold text-gray-800 dark:text-gray-200">
									{safetyResult.buildingClassification.category}
								</h5>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									{safetyResult.buildingClassification.description}
								</p>
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default PerformanceSummaryCard;