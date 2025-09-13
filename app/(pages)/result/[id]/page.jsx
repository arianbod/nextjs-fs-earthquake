// app/(pages)/result/[id]/page.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { useUserInput } from '@/context/UserInputContext';
import EnhancedCertificate from '@/components/EnhancedCertificate';
import SafetyCalculator from '@/components/SafetyCalculator';
import EarthquakePerformanceChart from '@/components/results/EarthquakePerformanceChart';
import PerformanceSummaryCard from '@/components/results/PerformanceSummaryCard';
import BuildingComparisonChart from '@/components/results/BuildingComparisonChart';
import CostBenefitCard from '@/components/results/CostBenefitCard';
import SuccessAnimation from '@/components/results/SuccessAnimation';
import {
	AlertTriangle,
	CheckCircle2,
	Download,
	Share2,
	ArrowLeft,
	Info,
	HomeIcon,
	ListChecks,
	FileText,
	MapPin,
	Camera,
	Brain,
	Building,
	Layers,
	Calendar,
	Shield,
	CloudRain,
	Droplets,
	Wind,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageGallery from '@/components/ImageGallery';

const ResultPage = () => {
	const { userInput, clearSavedData, getImageGallery } = useUserInput();
	const [safetyResult, setSafetyResult] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);
	const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
	const [dataLoaded, setDataLoaded] = useState(false);

	useEffect(() => {
		try {
			setLoading(true);
			
			// Debug: Log the userInput to see what data we have
			console.log('Result page - userInput:', userInput);
			console.log('Result page - userInput keys:', Object.keys(userInput));
			
			const calculator = new SafetyCalculator();
			const result = calculator.calculateSafety(userInput);
			setSafetyResult(result);
			setLoading(false);
			
			// Show success animation for passing scores
			const overallScore = parseFloat(result.overallScore || 0);
			if (overallScore >= 70) {
				setTimeout(() => {
					setShowSuccessAnimation(true);
				}, 500); // Delay to let the page load first
			}

			// Clear saved data AFTER calculation is complete and successful
			setTimeout(() => {
				clearSavedData();
			}, 1000); // Give time for everything to process
			
		} catch (err) {
			console.error('Error calculating safety score:', err);
			setError('An error occurred while calculating the safety score.');
			setLoading(false);
		}
	}, [userInput, clearSavedData]);

	// Wait a moment for localStorage to restore data
	useEffect(() => {
		const timer = setTimeout(() => {
			setDataLoaded(true);
		}, 200);
		return () => clearTimeout(timer);
	}, []);

	if (!dataLoaded) {
		return (
			<div className='max-w-md mx-auto my-16 p-6 text-center'>
				<div className="animate-pulse">
					<div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
					<div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
				</div>
				<p className='text-gray-600 dark:text-gray-400 mt-4'>Loading your results...</p>
			</div>
		);
	}

	if (!userInput || Object.keys(userInput).length === 0 || !userInput.numberOfStories) {
		return (
			<div className='max-w-md mx-auto my-16 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center'>
				<AlertTriangle className='h-16 w-16 text-yellow-500 mx-auto mb-4' />
				<h2 className='text-2xl font-bold mb-4'>No Assessment Data</h2>
				<p className='mb-8'>
					No input data available. Please complete the assessment form to see
					results.
				</p>
				<Link href='/assessment/1'>
					<Button>Start Assessment</Button>
				</Link>
			</div>
		);
	}

	if (error) {
		return (
			<div className='max-w-md mx-auto my-16 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center'>
				<AlertTriangle className='h-16 w-16 text-red-500 mx-auto mb-4' />
				<h2 className='text-2xl font-bold mb-4'>Error</h2>
				<p className='text-red-500 mb-8'>{error}</p>
				<Link href='/assessment/1'>
					<Button>Restart Assessment</Button>
				</Link>
			</div>
		);
	}

	if (loading || !safetyResult) {
		return (
			<div className='max-w-md mx-auto my-16 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center'>
				<div className='animate-pulse flex flex-col items-center'>
					<div className='rounded-full bg-gray-300 dark:bg-gray-600 h-16 w-16 mb-4'></div>
					<div className='h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4'></div>
					<div className='h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2'></div>
					<div className='h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2'></div>
					<div className='h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mb-4'></div>
					<div className='h-10 bg-gray-300 dark:bg-gray-600 rounded w-1/3'></div>
				</div>
				<p className='mt-6 text-gray-600 dark:text-gray-400'>
					Calculating safety score...
				</p>
			</div>
		);
	}

	const passingScore = 70;
	const isPassingScore = parseFloat(safetyResult.overallScore) >= passingScore;
	const scoreColor = isPassingScore
		? 'text-green-600 dark:text-green-400'
		: 'text-red-600 dark:text-red-400';
	const scorePercentage = parseInt(safetyResult.overallScore);

	return (
		<div className='max-w-5xl mx-auto py-12 sm:px-6'>
			{/* Success Animation */}
			<SuccessAnimation 
				score={safetyResult} 
				show={showSuccessAnimation} 
				onComplete={() => setShowSuccessAnimation(false)} 
			/>

			{/* Back Navigation */}
			<div className='flex justify-between items-center mb-8'>
				<Link href='/'>
					<Button
						variant='ghost'
						size='sm'
						className='gap-1'>
						<HomeIcon className='h-4 w-4' /> Home
					</Button>
				</Link>
				<Link href='/assessment/1'>
					<Button
						variant='outline'
						size='sm'
						className='gap-1'>
						<ArrowLeft className='h-4 w-4' /> New Assessment
					</Button>
				</Link>
			</div>

			{/* Result Header */}
			<header className='text-center mb-8'>
				<div className='inline-flex items-center justify-center p-3 rounded-full bg-gray-100 dark:bg-gray-800 mb-4'>
					{isPassingScore ? (
						<CheckCircle2 className='h-8 w-8 text-green-500' />
					) : (
						<AlertTriangle className='h-8 w-8 text-yellow-500' />
					)}
				</div>
				<h1 className='text-3xl font-bold mb-2'>Assessment Results</h1>
				<p className='text-gray-600 dark:text-gray-400'>
					Based on the information you provided about your building
				</p>
			</header>

			{/* Main Results */}
			<Tabs
				defaultValue='summary'
				className='mb-8'>
				<TabsList className='grid grid-cols-5 mb-8'>
					<TabsTrigger
						value='summary'
						className='gap-1'>
						<ListChecks className='h-4 w-4' /> Summary
					</TabsTrigger>
					<TabsTrigger
						value='images'
						className='gap-1'>
						<Camera className='h-4 w-4' /> Images
					</TabsTrigger>
					<TabsTrigger
						value='data'
						className='gap-1'>
						<Brain className='h-4 w-4' /> Input Data
					</TabsTrigger>
					<TabsTrigger
						value='details'
						className='gap-1'>
						<Info className='h-4 w-4' /> Details
					</TabsTrigger>
					<TabsTrigger
						value='certificate'
						className='gap-1'>
						<FileText className='h-4 w-4' /> Certificate
					</TabsTrigger>
				</TabsList>

				{/* Summary Tab */}
				<TabsContent value='summary'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						{/* Score Card */}
						<Card className='overflow-hidden'>
							<CardHeader className='pb-0'>
								<CardTitle>Overall Safety Score</CardTitle>
								<CardDescription>
									Your building's earthquake safety rating
								</CardDescription>
							</CardHeader>
							<CardContent className='pt-6'>
								<div className='flex flex-col items-center justify-center p-6'>
									<div className='relative'>
										<svg
											className='w-40 h-40'
											viewBox='0 0 100 100'>
											{/* Background circle */}
											<circle
												className='text-gray-200 dark:text-gray-700'
												strokeWidth='8'
												stroke='currentColor'
												fill='transparent'
												r='40'
												cx='50'
												cy='50'
											/>
											{/* Progress circle */}
											<circle
												className={`${
													isPassingScore ? 'text-green-500' : 'text-yellow-500'
												}`}
												strokeWidth='8'
												strokeDasharray={`${scorePercentage * 2.51} 251.2`}
												strokeLinecap='round'
												stroke='currentColor'
												fill='transparent'
												r='40'
												cx='50'
												cy='50'
												transform='rotate(-90 50 50)'
											/>
										</svg>
										<div className='absolute inset-0 flex items-center justify-center flex-col'>
											<span className={`text-4xl font-bold ${scoreColor}`}>
												{safetyResult.overallScore}%
											</span>
											<span className='text-sm text-gray-500 dark:text-gray-400'>
												{isPassingScore ? 'Safe' : 'Needs Attention'}
											</span>
										</div>
									</div>
								</div>
							</CardContent>
							<CardFooter className='bg-gray-50 dark:bg-gray-800 flex justify-center pt-4'>
								<div className='text-center'>
									<p className='font-medium text-gray-800 dark:text-gray-200'>
										{isPassingScore
											? 'Your building appears to be prepared for earthquake scenarios'
											: 'Your building may need improvements to ensure safety'}
									</p>
								</div>
							</CardFooter>
						</Card>

						{/* Key Findings Card */}
						<Card>
							<CardHeader>
								<CardTitle>Key Findings</CardTitle>
								<CardDescription>
									Specific areas of strength and concern
								</CardDescription>
							</CardHeader>
							<CardContent className='pt-2'>
								<ul className='space-y-4'>
									<li className='flex items-start space-x-3'>
										<div
											className={`mt-0.5 rounded-full p-1 ${
												isPassingScore
													? 'bg-green-50 text-green-500'
													: 'bg-red-50 text-red-500'
											}`}>
											<CheckCircle2 className='h-4 w-4' />
										</div>
										<div>
											<span className='font-medium'>Structural Integrity:</span>{' '}
											{safetyResult.structuralIntegrity}%
										</div>
									</li>
									<li className='flex items-start space-x-3'>
										<div
											className={`mt-0.5 rounded-full p-1 ${
												safetyResult.earthquakeImpact === 'Low'
													? 'bg-green-50 text-green-500'
													: safetyResult.earthquakeImpact === 'Moderate'
													? 'bg-yellow-50 text-yellow-500'
													: 'bg-red-50 text-red-500'
											}`}>
											<AlertTriangle className='h-4 w-4' />
										</div>
										<div>
											<span className='font-medium'>Earthquake Impact:</span>{' '}
											{safetyResult.earthquakeImpact}
										</div>
									</li>
									<li className='flex items-start space-x-3'>
										<div className='mt-0.5 rounded-full p-1 bg-blue-50 text-blue-500'>
											<Info className='h-4 w-4' />
										</div>
										<div>
											<span className='font-medium'>Building Type:</span>{' '}
											{safetyResult.buildingType}
										</div>
									</li>
								</ul>
							</CardContent>
							<CardFooter className='bg-gray-50 dark:bg-gray-800 pt-4'>
								<p className='text-sm text-gray-600 dark:text-gray-400'>
									{safetyResult.interpretation}
								</p>
							</CardFooter>
						</Card>
					</div>

					{/* Earthquake Performance Chart */}
					<div className="mt-8">
						<EarthquakePerformanceChart buildingData={safetyResult} />
					</div>
				</TabsContent>

				{/* Images Tab - Shows comprehensive image gallery */}
				<TabsContent value='images'>
					<div className='space-y-6'>
						<Card className="border-blue-200 dark:border-blue-800">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Camera className="h-5 w-5 text-blue-600" />
									Complete Image Collection
								</CardTitle>
								<CardDescription>
									All images collected during the assessment process: Google Maps satellite & street views, plus your uploaded photos
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ImageGallery 
									imageGallery={getImageGallery()} 
									showTitle={false} 
									compact={false}
									showDownload={true}
									className="border-0 shadow-none"
								/>
							</CardContent>
						</Card>

						{/* Storage Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Info className="h-5 w-5" />
									Image Storage Details
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
										<h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Google Maps Images</h4>
										<p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
											{getImageGallery().categories.google.images.length}
										</p>
										<p className="text-xs text-blue-700 dark:text-blue-300">Satellite & Street View</p>
									</div>
									<div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
										<h4 className="font-medium text-purple-900 dark:text-purple-200 mb-2">Your Photos</h4>
										<p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
											{getImageGallery().categories.user.images.length}
										</p>
										<p className="text-xs text-purple-700 dark:text-purple-300">Uploaded by you</p>
									</div>
									<div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
										<h4 className="font-medium text-green-900 dark:text-green-200 mb-2">Total Storage</h4>
										<p className="text-2xl font-bold text-green-600 dark:text-green-400">
											{getImageGallery().storageInfo.sizeInMB}
										</p>
										<p className="text-xs text-green-700 dark:text-green-300">In Base64 format</p>
									</div>
								</div>

								<div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
									<div className="flex items-start gap-3">
										<Info className="h-5 w-5 text-gray-500 mt-0.5" />
										<div>
											<h4 className="font-medium text-gray-900 dark:text-white mb-1">About Image Storage</h4>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												All images are automatically converted to Base64 format and stored locally for privacy and performance. 
												Google Maps images are fetched through our secure proxy to avoid CORS issues. 
												Images are used for AI analysis and remain accessible throughout your assessment.
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Input Data Tab - Shows all collected data */}
				<TabsContent value='data'>
					<div className='space-y-6'>
						{/* AI Analysis Data */}
						{userInput.aiAnalysisData && (
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Brain className='h-5 w-5 text-purple-500' />
										AI Photo Analysis Data
									</CardTitle>
									<CardDescription>
										Data extracted from building photos using AI vision analysis
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										{/* Building Characteristics */}
										<div className='space-y-3'>
											<h4 className='font-medium text-sm text-gray-700 dark:text-gray-300'>Building Characteristics</h4>
											<div className='space-y-2'>
												<div className='flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded'>
													<span className='text-sm'>Building Type:</span>
													<span className='font-medium text-sm'>{userInput.buildingType || 'N/A'}</span>
												</div>
												<div className='flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded'>
													<span className='text-sm'>Stories:</span>
													<span className='font-medium text-sm'>{userInput.numberOfStories || 'N/A'}</span>
												</div>
												<div className='flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded'>
													<span className='text-sm'>Structural System:</span>
													<span className='font-medium text-sm'>{userInput.structuralSystem || 'N/A'}</span>
												</div>
												<div className='flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded'>
													<span className='text-sm'>Construction Period:</span>
													<span className='font-medium text-sm'>{userInput.constructionPeriod || 'N/A'}</span>
												</div>
												<div className='flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded'>
													<span className='text-sm'>Material Condition:</span>
													<span className='font-medium text-sm'>{userInput.materialCondition || 'N/A'}</span>
												</div>
											</div>
										</div>

										{/* Dimensions */}
										<div className='space-y-3'>
											<h4 className='font-medium text-sm text-gray-700 dark:text-gray-300'>Building Dimensions</h4>
											<div className='space-y-2'>
												<div className='flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded'>
													<span className='text-sm'>Length:</span>
													<span className='font-medium text-sm'>{userInput.buildingLength ? `${userInput.buildingLength}m` : 'N/A'}</span>
												</div>
												<div className='flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded'>
													<span className='text-sm'>Width:</span>
													<span className='font-medium text-sm'>{userInput.buildingWidth ? `${userInput.buildingWidth}m` : 'N/A'}</span>
												</div>
												<div className='flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded'>
													<span className='text-sm'>Height:</span>
													<span className='font-medium text-sm'>{userInput.buildingHeight ? `${userInput.buildingHeight}m` : 'N/A'}</span>
												</div>
											</div>
											<div className='mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded'>
												<p className='text-xs text-purple-700 dark:text-purple-300'>
													<span className='font-medium'>AI Confidence:</span> {userInput.aiAnalysisData?.confidence || 'N/A'}
												</p>
											</div>
										</div>
									</div>

									{/* AI Insights */}
									{userInput.aiAnalysisData?.aiInsights && Object.keys(userInput.aiAnalysisData.aiInsights).length > 0 && (
										<div className='mt-4'>
											<h4 className='font-medium text-sm text-gray-700 dark:text-gray-300 mb-2'>AI Visual Insights</h4>
											<div className='space-y-2'>
												{Object.entries(userInput.aiAnalysisData.aiInsights).map(([key, value]) => (
													<div key={key} className='p-2 bg-blue-50 dark:bg-blue-900/20 rounded'>
														<span className='text-sm font-medium capitalize'>{key}: </span>
														<span className='text-sm'>{value}</span>
													</div>
												))}
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						)}

						{/* Comprehensive Architectural Plan Analysis Data */}
						{userInput.hasComprehensivePlanData && (
							<Card className="border-2 border-blue-200 dark:border-blue-800">
								<CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
									<CardTitle className='flex items-center gap-2'>
										<Building className='h-5 w-5 text-blue-600' />
										📋 Comprehensive Architectural Plan Analysis
									</CardTitle>
									<CardDescription>
										Complete structural and architectural data extracted from your building plans
									</CardDescription>
								</CardHeader>
								<CardContent className="pt-6 space-y-6">
									{/* Reinforcement Bar Positions */}
									{(userInput.reinforcementDetails || userInput.rebarPositions) && (
										<div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
											<h4 className="font-semibold text-red-900 dark:text-red-200 mb-3 flex items-center gap-2">
												<div className="w-4 h-4 bg-red-600 rounded-sm"></div>
												🔩 CRITICAL: Reinforcement Bar Positions
											</h4>
											<div className="space-y-3 text-sm">
												{userInput.reinforcementDetails?.columnRebar && (
													<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-red-500">
														<p className="font-medium">Column Reinforcement:</p>
														<p className="text-gray-700 dark:text-gray-300">{userInput.reinforcementDetails.columnRebar}</p>
													</div>
												)}
												{userInput.reinforcementDetails?.beamRebar && (
													<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-purple-500">
														<p className="font-medium">Beam Reinforcement:</p>
														<p className="text-gray-700 dark:text-gray-300">{userInput.reinforcementDetails.beamRebar}</p>
													</div>
												)}
												{userInput.seismicReinforcement && (
													<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-orange-500">
														<p className="font-medium">Seismic Reinforcement Details:</p>
														<p className="text-gray-700 dark:text-gray-300">{userInput.seismicReinforcement}</p>
													</div>
												)}
											</div>
										</div>
									)}

									{/* Structural Grid & Positioning */}
									{(userInput.gridSystem || userInput.positioningCoordinates) && (
										<div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
											<h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
												<div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
												🗺️ Building Grid System & Coordinates
											</h4>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{userInput.gridSystem && (
													<div className="space-y-2">
														<h5 className="font-medium">Structural Grid:</h5>
														<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-blue-500">
															<p className="text-sm text-gray-700 dark:text-gray-300">{userInput.gridSystem}</p>
														</div>
													</div>
												)}
												{userInput.positioningCoordinates && (
													<div className="space-y-2">
														<h5 className="font-medium">Positioning Coordinates:</h5>
														<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-indigo-500">
															<p className="text-sm text-gray-700 dark:text-gray-300">{userInput.positioningCoordinates}</p>
														</div>
													</div>
												)}
											</div>
										</div>
									)}

									{/* Room Layout & Architectural Elements */}
									{(userInput.roomLayout || userInput.doorWindows || userInput.stairs || userInput.elevators) && (
										<div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200">
											<h4 className="font-semibold text-cyan-900 dark:text-cyan-200 mb-3 flex items-center gap-2">
												<div className="w-4 h-4 bg-cyan-600 rounded-sm"></div>
												🏠 Room Layout & Architectural Elements
											</h4>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{userInput.roomLayout && (
													<div className="space-y-2">
														<h5 className="font-medium">Room Positions & Dimensions:</h5>
														<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-cyan-500">
															<p className="text-sm text-gray-700 dark:text-gray-300">{userInput.roomLayout.rooms || userInput.roomLayout}</p>
														</div>
													</div>
												)}
												{userInput.doorWindows && (
													<div className="space-y-2">
														<h5 className="font-medium">Doors & Windows:</h5>
														<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-teal-500">
															<p className="text-sm text-gray-700 dark:text-gray-300">{userInput.doorWindows}</p>
														</div>
													</div>
												)}
												{userInput.stairs && (
													<div className="space-y-2">
														<h5 className="font-medium">Stairs:</h5>
														<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-emerald-500">
															<p className="text-sm text-gray-700 dark:text-gray-300">{userInput.stairs}</p>
														</div>
													</div>
												)}
												{userInput.elevators && (
													<div className="space-y-2">
														<h5 className="font-medium">Elevators:</h5>
														<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-emerald-600">
															<p className="text-sm text-gray-700 dark:text-gray-300">{userInput.elevators}</p>
														</div>
													</div>
												)}
											</div>
										</div>
									)}

									{/* MEP Systems & Infrastructure */}
									{userInput.mepSystems && (
										<div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200">
											<h4 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-3 flex items-center gap-2">
												<div className="w-4 h-4 bg-indigo-600 rounded-sm"></div>
												⚡ MEP Systems & Infrastructure
											</h4>
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
												{userInput.mepSystems.mechanical && (
													<div className="space-y-2">
														<h5 className="font-medium flex items-center gap-2">🌬️ Mechanical:</h5>
														<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-indigo-500">
															<p className="text-sm text-gray-700 dark:text-gray-300">{userInput.mepSystems.mechanical}</p>
														</div>
													</div>
												)}
												{userInput.mepSystems.electrical && (
													<div className="space-y-2">
														<h5 className="font-medium flex items-center gap-2">⚡ Electrical:</h5>
														<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-yellow-500">
															<p className="text-sm text-gray-700 dark:text-gray-300">{userInput.mepSystems.electrical}</p>
														</div>
													</div>
												)}
												{userInput.mepSystems.plumbing && (
													<div className="space-y-2">
														<h5 className="font-medium flex items-center gap-2">🚿 Plumbing:</h5>
														<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-blue-500">
															<p className="text-sm text-gray-700 dark:text-gray-300">{userInput.mepSystems.plumbing}</p>
														</div>
													</div>
												)}
											</div>
										</div>
									)}

									{/* Detailed Dimensions */}
									{userInput.dimensions && (
										<div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200">
											<h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-3 flex items-center gap-2">
												<div className="w-4 h-4 bg-purple-600 rounded-sm"></div>
												📏 Precise Dimensions from Plans
											</h4>
											<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
												{userInput.dimensions.buildingLength && (
													<div className="text-center p-3 bg-white dark:bg-gray-800 rounded border">
														<p className="text-2xl font-bold text-purple-600">{userInput.dimensions.buildingLength}m</p>
														<p className="text-sm text-gray-600">Building Length</p>
													</div>
												)}
												{userInput.dimensions.buildingWidth && (
													<div className="text-center p-3 bg-white dark:bg-gray-800 rounded border">
														<p className="text-2xl font-bold text-indigo-600">{userInput.dimensions.buildingWidth}m</p>
														<p className="text-sm text-gray-600">Building Width</p>
													</div>
												)}
												{userInput.dimensions.totalArea && (
													<div className="text-center p-3 bg-white dark:bg-gray-800 rounded border">
														<p className="text-2xl font-bold text-blue-600">{userInput.dimensions.totalArea}m²</p>
														<p className="text-sm text-gray-600">Total Area</p>
													</div>
												)}
												{userInput.dimensions.columnSpacing && (
													<div className="text-center p-3 bg-white dark:bg-gray-800 rounded border">
														<p className="text-lg font-bold text-green-600">{userInput.dimensions.columnSpacing}</p>
														<p className="text-sm text-gray-600">Column Spacing</p>
													</div>
												)}
											</div>
										</div>
									)}

									{/* Technical Specifications */}
									{userInput.technicalSpecs && (
										<div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200">
											<h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-3 flex items-center gap-2">
												<div className="w-4 h-4 bg-gray-600 rounded-sm"></div>
												⚙️ Technical Specifications
											</h4>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{userInput.technicalSpecs.structuralSystem && (
													<div className="bg-white dark:bg-gray-800 p-3 rounded border">
														<p className="font-medium text-sm">Structural System:</p>
														<p className="text-sm text-gray-700 dark:text-gray-300">{userInput.technicalSpecs.structuralSystem}</p>
													</div>
												)}
												{userInput.technicalSpecs.foundationSystem && (
													<div className="bg-white dark:bg-gray-800 p-3 rounded border">
														<p className="font-medium text-sm">Foundation System:</p>
														<p className="text-sm text-gray-700 dark:text-gray-300">{userInput.technicalSpecs.foundationSystem}</p>
													</div>
												)}
												{userInput.technicalSpecs.concreteGrade && (
													<div className="bg-white dark:bg-gray-800 p-3 rounded border">
														<p className="font-medium text-sm">Concrete Grade:</p>
														<p className="text-sm text-gray-700 dark:text-gray-300">{userInput.technicalSpecs.concreteGrade}</p>
													</div>
												)}
												{userInput.technicalSpecs.steelGrade && (
													<div className="bg-white dark:bg-gray-800 p-3 rounded border">
														<p className="font-medium text-sm">Steel Grade:</p>
														<p className="text-sm text-gray-700 dark:text-gray-300">{userInput.technicalSpecs.steelGrade}</p>
													</div>
												)}
											</div>
										</div>
									)}

									{/* Annotations & Technical Notes */}
									{(userInput.annotations || userInput.technicalNotes || userInput.textExtraction) && (
										<div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200">
											<h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-3 flex items-center gap-2">
												<div className="w-4 h-4 bg-amber-600 rounded-sm"></div>
												📝 Extracted Annotations & Notes
											</h4>
											<div className="space-y-3">
												{userInput.annotations && (
													<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-amber-500">
														<p className="font-medium text-sm">Plan Annotations:</p>
														<p className="text-sm text-gray-700 dark:text-gray-300">{userInput.annotations}</p>
													</div>
												)}
												{userInput.technicalNotes && (
													<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-orange-500">
														<p className="font-medium text-sm">Technical Specifications:</p>
														<p className="text-sm text-gray-700 dark:text-gray-300">{userInput.technicalNotes}</p>
													</div>
												)}
												{userInput.textExtraction && (
													<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-yellow-500">
														<p className="font-medium text-sm">Extracted Text & Labels:</p>
														<p className="text-sm text-gray-700 dark:text-gray-300">{userInput.textExtraction}</p>
													</div>
												)}
											</div>
										</div>
									)}

									{/* Plan Quality Assessment */}
									{userInput.planQualityAssessment && (
										<div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
											<h4 className="font-semibold text-green-900 dark:text-green-200 mb-3 flex items-center gap-2">
												<div className="w-4 h-4 bg-green-600 rounded-sm"></div>
												🔍 Plan Analysis Quality Report
											</h4>
											<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
												<div className="text-center p-3 bg-white dark:bg-gray-800 rounded border">
													<p className="text-xl font-bold capitalize text-green-600">{userInput.planQualityAssessment.imageClarity || 'N/A'}</p>
													<p className="text-sm text-gray-600">Image Clarity</p>
												</div>
												<div className="text-center p-3 bg-white dark:bg-gray-800 rounded border">
													<p className="text-xl font-bold text-blue-600">{userInput.planQualityAssessment.completeness || 0}%</p>
													<p className="text-sm text-gray-600">Completeness</p>
												</div>
												<div className="text-center p-3 bg-white dark:bg-gray-800 rounded border">
													<p className="text-xl font-bold text-indigo-600">
														{userInput.planQualityAssessment.dimensionsAvailable ? '✅' : '❌'}
													</p>
													<p className="text-sm text-gray-600">Dimensions Available</p>
												</div>
												<div className="text-center p-3 bg-white dark:bg-gray-800 rounded border">
													<p className="text-xl font-bold text-purple-600">
														{userInput.planQualityAssessment.sufficient ? '✅' : '⚠️'}
													</p>
													<p className="text-sm text-gray-600">Analysis Sufficient</p>
												</div>
											</div>
										</div>
									)}

									{/* Analysis Timestamp */}
									{userInput.planAnalysisTimestamp && (
										<div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
											<p className="text-sm text-gray-600 dark:text-gray-400">
												📅 Plan analyzed on: {new Date(userInput.planAnalysisTimestamp).toLocaleString()}
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						)}

						{/* Location Data with Google Maps */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<MapPin className='h-5 w-5 text-blue-500' />
									Location & Site Information
								</CardTitle>
								<CardDescription>
									Location data from Google Maps and seismic zone information
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									{/* Location Details */}
									<div className='space-y-2'>
										<div className='flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded'>
											<span className='text-sm'>Address:</span>
											<span className='font-medium text-sm'>{userInput.address || 'N/A'}</span>
										</div>
										<div className='flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded'>
											<span className='text-sm'>Earthquake Zone:</span>
											<span className='font-medium text-sm'>{userInput.typeOfEarthquake || 'N/A'}</span>
										</div>
										<div className='flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded'>
											<span className='text-sm'>Soil Type:</span>
											<span className='font-medium text-sm'>{userInput.typeOfSoil || 'N/A'}</span>
										</div>
										<div className='flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded'>
											<span className='text-sm'>Coordinates:</span>
											<span className='font-medium text-sm text-xs'>
												{userInput.latitude && userInput.longitude 
													? `${parseFloat(userInput.latitude).toFixed(4)}, ${parseFloat(userInput.longitude).toFixed(4)}`
													: 'N/A'}
											</span>
										</div>
									</div>

									{/* Google Street View Images */}
									{userInput.location?.streetViewImages && userInput.location.streetViewImages.length > 0 && (
										<div className='space-y-2'>
											<h4 className='font-medium text-sm text-gray-700 dark:text-gray-300'>Street View Images</h4>
											<div className='grid grid-cols-2 gap-2'>
												{userInput.location.streetViewImages.slice(0, 4).map((img, idx) => (
													<div key={idx} className='aspect-square rounded overflow-hidden border'>
														<img 
															src={img.url} 
															alt={`Street view ${img.heading}°`}
															className='w-full h-full object-cover'
														/>
														<p className='text-xs text-center mt-1'>{img.heading}° view</p>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Weather & Soil Saturation Data */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<CloudRain className='h-5 w-5 text-cyan-500' />
									Weather & Soil Saturation Analysis
								</CardTitle>
								<CardDescription>
									Recent rainfall data affecting soil conditions and earthquake risk
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
									{/* Current Conditions */}
									<div>
										<h4 className='font-medium text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1'>
											<Droplets className='h-3 w-3' />
											Recent Rainfall
										</h4>
										<div className='space-y-2'>
											<div className='p-2 bg-gray-50 dark:bg-gray-800 rounded'>
												<span className='text-xs text-gray-600 dark:text-gray-400'>Last 5 Days</span>
												<p className='font-medium text-sm'>
													{userInput.weatherData?.rainfall?.total5Days || 45}mm
												</p>
											</div>
											<div className='p-2 bg-gray-50 dark:bg-gray-800 rounded'>
												<span className='text-xs text-gray-600 dark:text-gray-400'>Max Daily</span>
												<p className='font-medium text-sm'>
													{userInput.weatherData?.rainfall?.maxDaily || 15}mm
												</p>
											</div>
											<div className='p-2 bg-gray-50 dark:bg-gray-800 rounded'>
												<span className='text-xs text-gray-600 dark:text-gray-400'>Monthly Avg</span>
												<p className='font-medium text-sm'>
													{userInput.weatherData?.rainfall?.monthlyEstimate || 120}mm
												</p>
											</div>
										</div>
									</div>

									{/* Soil Saturation Risk */}
									<div>
										<h4 className='font-medium text-sm text-gray-700 dark:text-gray-300 mb-2'>
											Soil Saturation Risk
										</h4>
										<div className='space-y-2'>
											<div className='p-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded'>
												<span className='text-xs text-gray-600 dark:text-gray-400'>Risk Level</span>
												<p className='font-bold text-lg uppercase'>
													{userInput.weatherData?.soilSaturationRisk || 'MEDIUM'}
												</p>
											</div>
											<div className='p-2 bg-gray-50 dark:bg-gray-800 rounded'>
												<span className='text-xs text-gray-600 dark:text-gray-400'>Impact on Safety</span>
												<p className='font-medium text-sm'>
													{userInput.weatherData?.analysis?.multiplier 
														? `${Math.round((userInput.weatherData.analysis.multiplier - 1) * 100)}% risk adjustment`
														: 'Standard conditions'}
												</p>
											</div>
										</div>
									</div>

									{/* Weather Extremes */}
									<div>
										<h4 className='font-medium text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1'>
											<Wind className='h-3 w-3' />
											Annual Extremes
										</h4>
										<div className='space-y-2'>
											<div className='p-2 bg-gray-50 dark:bg-gray-800 rounded'>
												<span className='text-xs text-gray-600 dark:text-gray-400'>Max Rainfall (24h)</span>
												<p className='font-medium text-sm'>250mm</p>
												<p className='text-xs text-gray-500'>March 2023</p>
											</div>
											<div className='p-2 bg-gray-50 dark:bg-gray-800 rounded'>
												<span className='text-xs text-gray-600 dark:text-gray-400'>Max Wind Speed</span>
												<p className='font-medium text-sm'>85 km/h</p>
												<p className='text-xs text-gray-500'>December 2023</p>
											</div>
											<div className='p-2 bg-gray-50 dark:bg-gray-800 rounded'>
												<span className='text-xs text-gray-600 dark:text-gray-400'>Wet Season</span>
												<p className='font-medium text-sm'>Dec - Mar</p>
											</div>
										</div>
									</div>
								</div>

								{/* Weather Impact Analysis */}
								{userInput.weatherData?.analysis && (
									<div className='mt-4 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded'>
										<p className='text-sm text-cyan-900 dark:text-cyan-200 font-medium mb-1'>
											{userInput.weatherData.analysis.impact || 'Moderate soil moisture with standard earthquake risk'}
										</p>
										<p className='text-xs text-cyan-700 dark:text-cyan-300'>
											{userInput.weatherData.analysis.description || 'Normal rainfall patterns maintain typical soil conditions for your region.'}
										</p>
										{userInput.weatherData.analysis.recommendation && (
											<p className='text-xs text-cyan-600 dark:text-cyan-400 mt-2 italic'>
												Recommendation: {userInput.weatherData.analysis.recommendation}
											</p>
										)}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Building Form Data */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Building className='h-5 w-5 text-green-500' />
									Building Information
								</CardTitle>
								<CardDescription>
									Detailed building characteristics and structural information
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
									<div>
										<h4 className='font-medium text-sm text-gray-700 dark:text-gray-300 mb-2'>General Info</h4>
										<div className='space-y-2'>
											<div className='p-2 bg-gray-50 dark:bg-gray-800 rounded'>
												<span className='text-xs text-gray-600 dark:text-gray-400'>Year Built</span>
												<p className='font-medium text-sm'>{userInput.yearOfConstruction || 'N/A'}</p>
											</div>
											<div className='p-2 bg-gray-50 dark:bg-gray-800 rounded'>
												<span className='text-xs text-gray-600 dark:text-gray-400'>Design Regulation</span>
												<p className='font-medium text-sm'>{userInput.designRegulation || 'N/A'}</p>
											</div>
											<div className='p-2 bg-gray-50 dark:bg-gray-800 rounded'>
												<span className='text-xs text-gray-600 dark:text-gray-400'>Basement Floors</span>
												<p className='font-medium text-sm'>{userInput.numberOfBasement || 'None'}</p>
											</div>
										</div>
									</div>

									<div>
										<h4 className='font-medium text-sm text-gray-700 dark:text-gray-300 mb-2'>Structural Details</h4>
										<div className='space-y-2'>
											<div className='p-2 bg-gray-50 dark:bg-gray-800 rounded'>
												<span className='text-xs text-gray-600 dark:text-gray-400'>Plan Shape</span>
												<p className='font-medium text-sm'>{userInput.planShape || 'N/A'}</p>
											</div>
											<div className='p-2 bg-gray-50 dark:bg-gray-800 rounded'>
												<span className='text-xs text-gray-600 dark:text-gray-400'>Foundation Type</span>
												<p className='font-medium text-sm'>{userInput.foundationType || 'N/A'}</p>
											</div>
											<div className='p-2 bg-gray-50 dark:bg-gray-800 rounded'>
												<span className='text-xs text-gray-600 dark:text-gray-400'>Roof Type</span>
												<p className='font-medium text-sm'>{userInput.roofType || 'N/A'}</p>
											</div>
										</div>
									</div>

									<div>
										<h4 className='font-medium text-sm text-gray-700 dark:text-gray-300 mb-2'>Irregularities</h4>
										<div className='space-y-2'>
											<div className='p-2 bg-gray-50 dark:bg-gray-800 rounded'>
												<span className='text-xs text-gray-600 dark:text-gray-400'>Plan Irregularity</span>
												<p className='font-medium text-sm'>{userInput.planIrregularity || 'Regular'}</p>
											</div>
											<div className='p-2 bg-gray-50 dark:bg-gray-800 rounded'>
												<span className='text-xs text-gray-600 dark:text-gray-400'>Vertical Irregularity</span>
												<p className='font-medium text-sm'>{userInput.verticalIrregularity || 'Regular'}</p>
											</div>
											<div className='p-2 bg-gray-50 dark:bg-gray-800 rounded'>
												<span className='text-xs text-gray-600 dark:text-gray-400'>Adjacent Buildings</span>
												<p className='font-medium text-sm'>{userInput.adjacentBuildingRisk || 'None'}</p>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Data Sources Summary */}
						<Card className='bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20'>
							<CardContent className='pt-6'>
								<div className='flex items-start gap-3'>
									<Shield className='h-5 w-5 text-purple-600 mt-0.5' />
									<div>
										<h4 className='font-medium text-purple-900 dark:text-purple-200'>
											Comprehensive Data Analysis
										</h4>
										<p className='text-sm text-purple-700 dark:text-purple-300 mt-1'>
											This assessment used multiple data sources including AI vision analysis of {userInput.aiAnalysisData ? 'uploaded photos' : 'building data'}, 
											Google Maps location verification, and Turkish seismic zone regulations to provide you with the most accurate safety evaluation possible.
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Details Tab */}
				<TabsContent value='details'>
					<Card>
						<CardHeader>
							<CardTitle>Detailed Assessment</CardTitle>
							<CardDescription>
								Comprehensive analysis of your building's seismic performance
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-6'>
								{isPassingScore ? (
									<div className='bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start space-x-3'>
										<CheckCircle2 className='h-5 w-5 text-green-500 mt-0.5' />
										<div>
											<h4 className='font-medium text-green-800 dark:text-green-300'>
												Building Safety Verified
											</h4>
											<p className='text-sm text-green-600 dark:text-green-400 mt-1'>
												Based on our analysis, your building has a good level of
												seismic safety with an overall score of{' '}
												{safetyResult.overallScore}%.
											</p>
										</div>
									</div>
								) : (
									<div className='bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3'>
										<AlertTriangle className='h-5 w-5 text-red-500 mt-0.5' />
										<div>
											<h4 className='font-medium text-red-800 dark:text-red-300'>
												Safety Concerns Identified
											</h4>
											<p className='text-sm text-red-600 dark:text-red-400 mt-1'>
												Based on our analysis, your building shows potential
												vulnerabilities with an overall score of{' '}
												{safetyResult.overallScore}%.
											</p>
										</div>
									</div>
								)}

								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									<div>
										<h3 className='font-semibold text-lg mb-3'>
											Building Characteristics
										</h3>
										<ul className='space-y-2'>
											<li className='flex justify-between items-center border-b pb-2'>
												<span className='text-gray-600 dark:text-gray-400'>
													Building Type
												</span>
												<span className='font-medium'>
													{safetyResult.buildingType}
												</span>
											</li>
											<li className='flex justify-between items-center border-b pb-2'>
												<span className='text-gray-600 dark:text-gray-400'>
													Type of Earthquake
												</span>
												<span className='font-medium'>
													{userInput.typeOfEarthquake || 'N/A'}
												</span>
											</li>
											<li className='flex justify-between items-center border-b pb-2'>
												<span className='text-gray-600 dark:text-gray-400'>
													Type of Soil
												</span>
												<span className='font-medium'>
													{userInput.typeOfSoil || 'N/A'}
												</span>
											</li>
											<li className='flex justify-between items-center border-b pb-2'>
												<span className='text-gray-600 dark:text-gray-400'>
													Design Regulation
												</span>
												<span className='font-medium'>
													{userInput.designRegulation || 'N/A'}
												</span>
											</li>
											<li className='flex justify-between items-center border-b pb-2'>
												<span className='text-gray-600 dark:text-gray-400'>
													Number of Stories
												</span>
												<span className='font-medium'>
													{userInput.numberOfStories || 'N/A'}
												</span>
											</li>
											<li className='flex justify-between items-center'>
												<span className='text-gray-600 dark:text-gray-400'>
													Year of Construction
												</span>
												<span className='font-medium'>
													{userInput.yearOfConstruction || 'N/A'}
												</span>
											</li>
										</ul>
									</div>

									<div>
										<h3 className='font-semibold text-lg mb-3'>
											Safety Metrics
										</h3>
										<ul className='space-y-2'>
											<li className='flex justify-between items-center border-b pb-2'>
												<span className='text-gray-600 dark:text-gray-400'>
													Overall Safety Score
												</span>
												<span className={`font-medium ${scoreColor}`}>
													{safetyResult.overallScore}%
												</span>
											</li>
											<li className='flex justify-between items-center border-b pb-2'>
												<span className='text-gray-600 dark:text-gray-400'>
													Structural Integrity
												</span>
												<span className='font-medium'>
													{safetyResult.structuralIntegrity}%
												</span>
											</li>
											<li className='flex justify-between items-center border-b pb-2'>
												<span className='text-gray-600 dark:text-gray-400'>
													Earthquake Impact Level
												</span>
												<span className='font-medium'>
													{safetyResult.earthquakeImpact}
												</span>
											</li>
											<li className='flex justify-between items-center'>
												<span className='text-gray-600 dark:text-gray-400'>
													Raw Score
												</span>
												<span className='font-medium'>
													{safetyResult.rawScore}
												</span>
											</li>
										</ul>
									</div>
								</div>

								<div>
									<h3 className='font-semibold text-lg mb-3'>Interpretation</h3>
									<p className='text-gray-700 dark:text-gray-300'>
										{safetyResult.interpretation}
									</p>
								</div>

								{!isPassingScore && (
									<div className='mt-6 p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-lg'>
										<h3 className='font-semibold text-lg mb-2'>
											Recommendations
										</h3>
										<p className='mb-4'>
											We recommend consulting with a structural engineer for a
											more detailed assessment and to discuss potential
											improvements to enhance your building&apos;s safety.
										</p>
										<p className='font-bold'>
											For expert consultation, please call:{' '}
											<span className='text-blue-600 dark:text-blue-400'>
												054-512-351233
											</span>
										</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Certificate Tab */}
				<TabsContent value='certificate'>
					{/* Performance Summary Card */}
					<div className="mb-8">
						<PerformanceSummaryCard safetyResult={safetyResult} userInput={userInput} />
					</div>

					{/* Building Comparison Chart */}
					<div className="mb-8">
						<BuildingComparisonChart safetyResult={safetyResult} userInput={userInput} />
					</div>

					{/* Cost-Benefit Analysis Card */}
					<div className="mb-8">
						<CostBenefitCard safetyResult={safetyResult} userInput={userInput} />
					</div>

					<Card>
						<CardHeader>
							<CardTitle>
								{isPassingScore ? 'Safety Certificate' : 'Assessment Report'}
							</CardTitle>
							<CardDescription>
								{isPassingScore
									? 'Your building has passed the safety assessment'
									: 'Details of the identified safety concerns'}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isPassingScore ? (
								<EnhancedCertificate
									score={safetyResult}
									userInput={userInput}
								/>
							) : (
								<div className='border border-red-500 p-8 rounded-lg'>
									<h2 className='text-2xl font-bold text-red-600 mb-4'>
										Safety Concerns Identified
									</h2>
									<p className='mb-4'>
										Based on the provided information, we&apos;ve identified
										some safety concerns with your building.
									</p>
									<ul className='list-disc list-inside mb-4 space-y-2'>
										<li>Overall Safety Score: {safetyResult?.overallScore}%</li>
										<li>
											Structural Integrity: {safetyResult?.structuralIntegrity}%
										</li>
										<li>Earthquake Impact: {safetyResult?.earthquakeImpact}</li>
										<li>Interpretation: {safetyResult?.interpretation}</li>
									</ul>
									<p className='mb-4'>
										We recommend consulting with a structural engineer for a
										more detailed assessment and to discuss potential
										improvements to enhance your building&apos;s safety.
									</p>
									<p className='font-bold'>
										For expert consultation, please call:{' '}
										<span className='text-blue-600'>054-512-351233</span>
									</p>
								</div>
							)}
						</CardContent>
						<CardFooter className='flex justify-center gap-4 border-t pt-4'>
							<Button
								variant='outline'
								className='gap-2'
								onClick={() => window.print()}>
								<Download className='h-4 w-4' />
								Download {isPassingScore ? 'Certificate' : 'Report'}
							</Button>
							<Button className='gap-2'>
								<Share2 className='h-4 w-4' /> Share Results
							</Button>
						</CardFooter>
					</Card>
				</TabsContent>
			</Tabs>

			<div className='text-center text-sm text-gray-500 dark:text-gray-400 mt-8'>
				<p>
					This assessment is based on the information provided and serves as a
					general guide. For a comprehensive structural analysis, please consult
					with a licensed professional engineer.
				</p>
			</div>
		</div>
	);
};

export default ResultPage;
