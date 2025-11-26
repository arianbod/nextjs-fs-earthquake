// app/(pages)/result/[id]/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUserInput } from '@/context/UserInputContext';
import { saveAssessment, formatAssessmentForSaving } from '@/lib/assessmentService';
import { imageStorageManager } from '@/lib/imageStorage';
import EnhancedCertificate from '@/components/EnhancedCertificate';
import SafetyCalculator from '@/components/SafetyCalculator';
import PerformanceSummaryCard from '@/components/results/PerformanceSummaryCard';
import SuccessAnimation from '@/components/results/SuccessAnimation';

// New simplified components
import { ExpertModeToggle } from '@/components/results/ExpertModeToggle';
import { SafetyScoreHero } from '@/components/results/SafetyScoreHero';
import { KeyFindings } from '@/components/results/KeyFindings';
import { ExpertDataPanels } from '@/components/results/ExpertDataPanels';

import {
	AlertTriangle,
	CheckCircle2,
	Download,
	Share2,
	HomeIcon,
	Shield,
	FileText,
	Lightbulb,
	Phone,
	ArrowRight,
	Wrench,
	Users
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
	const { user, isLoaded: isUserLoaded } = useUser();
	const { userInput, clearSavedData, getImageGallery } = useUserInput();
	const [safetyResult, setSafetyResult] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);
	const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
	const [dataLoaded, setDataLoaded] = useState(false);
	const [assessmentSaved, setAssessmentSaved] = useState(false);
	const [savedAssessmentId, setSavedAssessmentId] = useState(null);

	// Expert mode toggle state - simple by default
	const [expertMode, setExpertMode] = useState(false);

	useEffect(() => {
		try {
			setLoading(true);
			console.log('Result page - userInput:', userInput);

			const calculator = new SafetyCalculator();
			const result = calculator.calculateSafety(userInput);
			setSafetyResult(result);
			setLoading(false);

			// Show success animation for passing scores
			const overallScore = parseFloat(result.overallScore || 0);
			if (overallScore >= 70) {
				setTimeout(() => {
					setShowSuccessAnimation(true);
				}, 500);
			}

			// Clear saved data after calculation
			setTimeout(() => {
				clearSavedData();
			}, 1000);

		} catch (err) {
			console.error('Error calculating safety score:', err);
			setError('An error occurred while calculating the safety score.');
			setLoading(false);
		}
	}, [userInput, clearSavedData]);

	// Auto-save assessment to database
	useEffect(() => {
		const autoSaveAssessment = async () => {
			if (!isUserLoaded || !user || !safetyResult || assessmentSaved) {
				return;
			}

			try {
				console.log('Auto-saving assessment...');
				const storedImages = imageStorageManager.getAllImages();
				const assessmentData = formatAssessmentForSaving(
					userInput,
					safetyResult,
					storedImages
				);
				const result = await saveAssessment(assessmentData);
				console.log('Assessment saved successfully:', result.assessmentId);
				setAssessmentSaved(true);
				setSavedAssessmentId(result.assessmentId);
			} catch (error) {
				console.error('Failed to auto-save assessment:', error);
			}
		};

		autoSaveAssessment();
	}, [isUserLoaded, user, safetyResult, userInput, assessmentSaved]);

	// Wait for localStorage to restore data
	useEffect(() => {
		const timer = setTimeout(() => {
			setDataLoaded(true);
		}, 200);
		return () => clearTimeout(timer);
	}, []);

	// Loading state
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

	// No data state
	if (!userInput || Object.keys(userInput).length === 0 || !userInput.numberOfStories) {
		return (
			<div className='max-w-md mx-auto my-16 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center'>
				<AlertTriangle className='h-16 w-16 text-yellow-500 mx-auto mb-4' />
				<h2 className='text-2xl font-bold mb-4'>No Assessment Data</h2>
				<p className='mb-8'>
					No input data available. Please complete the assessment form to see results.
				</p>
				<Link href='/assessment/1'>
					<Button>Start Assessment</Button>
				</Link>
			</div>
		);
	}

	// Error state
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

	// Calculating state
	if (loading || !safetyResult) {
		return (
			<div className='max-w-md mx-auto my-16 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center'>
				<div className='animate-pulse flex flex-col items-center'>
					<div className='rounded-full bg-gray-300 dark:bg-gray-600 h-16 w-16 mb-4'></div>
					<div className='h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4'></div>
					<div className='h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2'></div>
				</div>
				<p className='mt-6 text-gray-600 dark:text-gray-400'>
					Calculating safety score...
				</p>
			</div>
		);
	}

	const passingScore = 70;
	const isPassingScore = parseFloat(safetyResult.overallScore) >= passingScore;

	return (
		<div className='max-w-4xl mx-auto py-8 px-4 sm:px-6'>
			{/* Success Animation */}
			<SuccessAnimation
				score={safetyResult}
				show={showSuccessAnimation}
				onComplete={() => setShowSuccessAnimation(false)}
			/>

			{/* Navigation Header */}
			<div className='flex justify-between items-center mb-6'>
				<Link href='/'>
					<Button variant='ghost' size='sm' className='gap-1'>
						<HomeIcon className='h-4 w-4' /> Home
					</Button>
				</Link>
				<div className='flex items-center gap-3'>
					{assessmentSaved && user && (
						<Link href='/history'>
							<Button
								variant='outline'
								size='sm'
								className='gap-1 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'>
								<CheckCircle2 className='h-4 w-4' /> Saved!
							</Button>
						</Link>
					)}
					<Link href='/assessment/1'>
						<Button variant='outline' size='sm'>
							New Assessment
						</Button>
					</Link>
				</div>
			</div>

			{/* Result Header - Clean & Simple */}
			<header className='text-center mb-6'>
				<div className='inline-flex items-center justify-center p-3 rounded-full bg-gray-100 dark:bg-gray-800 mb-4'>
					{isPassingScore ? (
						<CheckCircle2 className='h-8 w-8 text-green-500' />
					) : (
						<AlertTriangle className='h-8 w-8 text-yellow-500' />
					)}
				</div>
				<h1 className='text-2xl font-bold mb-1'>Your Building Safety Report</h1>
				<p className='text-gray-600 dark:text-gray-400 text-sm'>
					{userInput.address || 'Assessment completed'}
				</p>
			</header>

			{/* Main Results - 3 Tab Structure */}
			<Tabs defaultValue='score' className='mb-8'>
				<TabsList className='grid grid-cols-3 mb-6'>
					<TabsTrigger value='score' className='gap-1'>
						<Shield className='h-4 w-4' /> Score
					</TabsTrigger>
					<TabsTrigger value='recommendations' className='gap-1'>
						<Lightbulb className='h-4 w-4' /> Actions
					</TabsTrigger>
					<TabsTrigger value='certificate' className='gap-1'>
						<FileText className='h-4 w-4' /> Report
					</TabsTrigger>
				</TabsList>

				{/* Tab 1: Safety Score (Default) */}
				<TabsContent value='score'>
					<div className='space-y-6'>
						{/* Hero Score Display */}
						<Card>
							<CardContent className='pt-6'>
								<SafetyScoreHero
									score={safetyResult}
									isPassing={isPassingScore}
								/>
							</CardContent>
						</Card>

						{/* Key Findings */}
						<Card>
							<CardContent className='pt-6'>
								<KeyFindings
									safetyResult={safetyResult}
									userInput={userInput}
								/>
							</CardContent>
						</Card>

						{/* Quick Actions */}
						<div className='flex flex-col sm:flex-row gap-3 justify-center'>
							<Button className='gap-2' onClick={() => window.print()}>
								<Download className='h-4 w-4' />
								Download Report
							</Button>
							<Button variant='outline' className='gap-2'>
								<Share2 className='h-4 w-4' />
								Share Results
							</Button>
						</div>

						{/* Expert Mode Toggle */}
						<div className='flex flex-col items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700'>
							<p className='text-sm text-gray-500 dark:text-gray-400'>
								Want to see detailed technical data?
							</p>
							<ExpertModeToggle
								expertMode={expertMode}
								setExpertMode={setExpertMode}
							/>
						</div>

						{/* Expert Data Panels (shown when expert mode is ON) */}
						{expertMode && (
							<div className='pt-6'>
								<ExpertDataPanels
									userInput={userInput}
									safetyResult={safetyResult}
									imageGallery={getImageGallery()}
								/>
							</div>
						)}
					</div>
				</TabsContent>

				{/* Tab 2: Recommendations */}
				<TabsContent value='recommendations'>
					<div className='space-y-6'>
						{/* Score-based recommendations */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Lightbulb className='h-5 w-5 text-yellow-500' />
									{isPassingScore ? 'Maintenance Recommendations' : 'Priority Actions Needed'}
								</CardTitle>
								<CardDescription>
									{isPassingScore
										? 'Keep your building safe with these best practices'
										: 'Steps to improve your building\'s earthquake safety'}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className='space-y-4'>
									{isPassingScore ? (
										<>
											<li className='flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg'>
												<CheckCircle2 className='h-5 w-5 text-green-500 mt-0.5' />
												<div>
													<p className='font-medium'>Regular Inspections</p>
													<p className='text-sm text-gray-600 dark:text-gray-400'>
														Schedule annual structural inspections to maintain safety
													</p>
												</div>
											</li>
											<li className='flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
												<Shield className='h-5 w-5 text-blue-500 mt-0.5' />
												<div>
													<p className='font-medium'>Emergency Preparedness</p>
													<p className='text-sm text-gray-600 dark:text-gray-400'>
														Create an earthquake emergency plan for occupants
													</p>
												</div>
											</li>
											<li className='flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
												<FileText className='h-5 w-5 text-gray-500 mt-0.5' />
												<div>
													<p className='font-medium'>Documentation</p>
													<p className='text-sm text-gray-600 dark:text-gray-400'>
														Keep this report and building plans accessible
													</p>
												</div>
											</li>
										</>
									) : (
										<>
											<li className='flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg'>
												<AlertTriangle className='h-5 w-5 text-red-500 mt-0.5' />
												<div>
													<p className='font-medium'>Professional Evaluation</p>
													<p className='text-sm text-gray-600 dark:text-gray-400'>
														Consult a structural engineer for detailed assessment
													</p>
												</div>
											</li>
											<li className='flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg'>
												<Wrench className='h-5 w-5 text-yellow-500 mt-0.5' />
												<div>
													<p className='font-medium'>Retrofit Options</p>
													<p className='text-sm text-gray-600 dark:text-gray-400'>
														Explore seismic retrofitting to strengthen your building
													</p>
												</div>
											</li>
											<li className='flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg'>
												<Users className='h-5 w-5 text-orange-500 mt-0.5' />
												<div>
													<p className='font-medium'>Occupant Safety</p>
													<p className='text-sm text-gray-600 dark:text-gray-400'>
														Review evacuation routes and secure heavy furniture
													</p>
												</div>
											</li>
										</>
									)}
								</ul>
							</CardContent>
						</Card>

						{/* Expert Consultation CTA */}
						<Card className='border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'>
							<CardContent className='pt-6'>
								<div className='text-center'>
									<h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
										Need Expert Advice?
									</h3>
									<p className='text-gray-600 dark:text-gray-400 mb-4'>
										Our certified structural engineers can provide a detailed assessment
									</p>
									<div className='flex flex-col sm:flex-row gap-3 justify-center'>
										<Button className='gap-2'>
											<Phone className='h-4 w-4' />
											Call: 054-512-351233
										</Button>
										<Button variant='outline' className='gap-2'>
											Schedule Consultation
											<ArrowRight className='h-4 w-4' />
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Cost Estimates (if applicable) */}
						{!isPassingScore && (
							<Card>
								<CardHeader>
									<CardTitle>Estimated Retrofit Costs</CardTitle>
									<CardDescription>
										Typical costs for seismic improvements in your building type
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
										<div className='p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center'>
											<p className='text-sm text-gray-500 mb-1'>Minor Improvements</p>
											<p className='text-xl font-bold text-green-600'>$2,000 - $5,000</p>
										</div>
										<div className='p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center'>
											<p className='text-sm text-gray-500 mb-1'>Moderate Retrofit</p>
											<p className='text-xl font-bold text-yellow-600'>$10,000 - $25,000</p>
										</div>
										<div className='p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center'>
											<p className='text-sm text-gray-500 mb-1'>Major Strengthening</p>
											<p className='text-xl font-bold text-orange-600'>$30,000+</p>
										</div>
									</div>
									<p className='text-xs text-gray-500 mt-3 text-center'>
										*Estimates based on typical residential buildings. Actual costs vary.
									</p>
								</CardContent>
							</Card>
						)}
					</div>
				</TabsContent>

				{/* Tab 3: Certificate/Report */}
				<TabsContent value='certificate'>
					<div className='space-y-6'>
						{/* Performance Summary */}
						<PerformanceSummaryCard safetyResult={safetyResult} userInput={userInput} />

						{/* Certificate */}
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
									<EnhancedCertificate score={safetyResult} userInput={userInput} />
								) : (
									<div className='border border-red-300 dark:border-red-700 p-6 rounded-lg bg-red-50 dark:bg-red-900/20'>
										<h2 className='text-xl font-bold text-red-600 dark:text-red-400 mb-4'>
											Safety Concerns Identified
										</h2>
										<ul className='space-y-2 mb-4'>
											<li className='flex justify-between'>
												<span>Overall Safety Score:</span>
												<span className='font-bold'>{safetyResult?.overallScore}%</span>
											</li>
											<li className='flex justify-between'>
												<span>Structural Integrity:</span>
												<span className='font-bold'>{safetyResult?.structuralIntegrity}%</span>
											</li>
											<li className='flex justify-between'>
												<span>Earthquake Impact:</span>
												<span className='font-bold'>{safetyResult?.earthquakeImpact}</span>
											</li>
										</ul>
										<p className='text-sm text-gray-700 dark:text-gray-300'>
											{safetyResult?.interpretation}
										</p>
									</div>
								)}
							</CardContent>
							<CardFooter className='flex justify-center gap-4 border-t pt-4'>
								<Button variant='outline' className='gap-2' onClick={() => window.print()}>
									<Download className='h-4 w-4' />
									Download {isPassingScore ? 'Certificate' : 'Report'}
								</Button>
								<Button className='gap-2'>
									<Share2 className='h-4 w-4' /> Share
								</Button>
							</CardFooter>
						</Card>
					</div>
				</TabsContent>
			</Tabs>

			{/* Footer Note */}
			<div className='text-center text-xs text-gray-500 dark:text-gray-400 mt-8'>
				<p>
					This assessment is based on the information provided and serves as a general guide.
					For a comprehensive structural analysis, please consult with a licensed professional engineer.
				</p>
			</div>
		</div>
	);
};

export default ResultPage;
