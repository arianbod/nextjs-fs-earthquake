// app/(pages)/result/[id]/page.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { useUserInput } from '@/context/UserInputContext';
import EnhancedCertificate from '@/components/EnhancedCertificate';
import SafetyCalculator from '@/components/SafetyCalculator';
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

const ResultPage = () => {
	const { userInput } = useUserInput();
	const [safetyResult, setSafetyResult] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		try {
			setLoading(true);
			const calculator = new SafetyCalculator();
			const result = calculator.calculateSafety(userInput);
			setSafetyResult(result);
			setLoading(false);
		} catch (err) {
			console.error('Error calculating safety score:', err);
			setError('An error occurred while calculating the safety score.');
			setLoading(false);
		}
	}, [userInput]);

	if (!userInput || Object.keys(userInput).length === 0) {
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
				<TabsList className='grid grid-cols-3 mb-8'>
					<TabsTrigger
						value='summary'
						className='gap-1'>
						<ListChecks className='h-4 w-4' /> Summary
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
