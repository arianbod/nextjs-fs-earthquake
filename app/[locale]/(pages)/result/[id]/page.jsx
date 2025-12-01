// app/(pages)/result/[id]/page.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useUserInput } from '@/context/UserInputContext';
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedCertificate from '@/components/EnhancedCertificate';
import SafetyCalculator from '@/components/SafetyCalculator';
import { getAssessment } from '@/lib/actions/assessment';
import { toast } from 'sonner';

// New wow-factor components
import { ScoreReveal } from '@/components/results/ScoreReveal';
import { ImageryShowcase } from '@/components/results/ImageryShowcase';
import { AIInsightsReveal } from '@/components/results/AIInsightsReveal';
import { WorstCaseScenario } from '@/components/results/WorstCaseScenario';

// Existing components
import { ExpertModeToggle } from '@/components/results/ExpertModeToggle';
import { KeyFindings } from '@/components/results/KeyFindings';
import { ExpertDataPanels } from '@/components/results/ExpertDataPanels';
import PerformanceSummaryCard from '@/components/results/PerformanceSummaryCard';
import { ShareModal } from '@/components/results/ShareModal';
import { generatePDF } from '@/components/results/PDFReport';
import { HistoricalEarthquakeMap } from '@/components/results/HistoricalEarthquakeMap';
import { RetrofitCostCalculator } from '@/components/results/RetrofitCostCalculator';
import { EmailReportModal } from '@/components/results/EmailReportModal';

import {
	AlertTriangle, CheckCircle2, Download, Share2, HomeIcon, Shield,
	FileText, Lightbulb, Phone, ArrowRight, Wrench, Users, Copy,
	LayoutDashboard, ChevronDown, Sparkles, Award, Target, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const ResultPage = () => {
	const params = useParams();
	const assessmentId = params.id;
	const { user, isLoaded: isUserLoaded } = useUser();
	const { userInput, getImageGallery, saveSafetyResultToDb, loadAssessment } = useUserInput();
	const [safetyResult, setSafetyResult] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);
	const [dataLoaded, setDataLoaded] = useState(false);
	const [assessmentSaved, setAssessmentSaved] = useState(false);
	const [savedAssessmentId, setSavedAssessmentId] = useState(assessmentId !== 'preview' ? assessmentId : null);
	const [isOwner, setIsOwner] = useState(true);
	const [loadedFromDb, setLoadedFromDb] = useState(false);

	// New state for dramatic reveal flow
	const [phase, setPhase] = useState('loading'); // loading, reveal, complete
	const [expertMode, setExpertMode] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [showShareModal, setShowShareModal] = useState(false);
	const [showEmailModal, setShowEmailModal] = useState(false);
	const detailsRef = useRef(null);

	// Load assessment from database if ID provided
	useEffect(() => {
		const loadFromDatabase = async () => {
			if (assessmentId && assessmentId !== 'preview' && !loadedFromDb) {
				try {
					setLoading(true);
					const result = await getAssessment(assessmentId, true);

					if (result.success && result.assessment) {
						setIsOwner(result.isOwner);
						setLoadedFromDb(true);

						if (result.assessment.safetyResult) {
							setSafetyResult({
								overallScore: result.assessment.safetyResult.overallScore,
								structuralIntegrity: result.assessment.safetyResult.structuralScore,
								earthquakeImpact: result.assessment.safetyResult.riskLevel,
								interpretation: `Safety Rating: ${result.assessment.safetyResult.safetyRating}`,
								...result.assessment.safetyResult,
							});
							setAssessmentSaved(true);
							setDataLoaded(true);
							setLoading(false);
							return;
						}

						await loadAssessment(assessmentId);
					}
				} catch (err) {
					console.error('Error loading from database:', err);
				}
			}
			setDataLoaded(true);
		};

		loadFromDatabase();
	}, [assessmentId]);

	// Copy shareable link
	const copyShareableLink = () => {
		const url = `${window.location.origin}/result/${savedAssessmentId || assessmentId}`;
		navigator.clipboard.writeText(url);
		toast.success('Link copied to clipboard');
	};

	// Calculate safety result
	useEffect(() => {
		try {
			setLoading(true);
			const calculator = new SafetyCalculator();
			const result = calculator.calculateSafety(userInput);
			setSafetyResult(result);
			setLoading(false);
			setPhase('reveal');
		} catch (err) {
			console.error('Error calculating safety score:', err);
			setError('An error occurred while calculating the safety score.');
			setLoading(false);
		}
	}, [userInput]);

	// Auto-save results
	useEffect(() => {
		const autoSaveResults = async () => {
			if (!isUserLoaded || !user || !safetyResult || assessmentSaved || loadedFromDb) {
				return;
			}

			const currentAssessmentId = userInput.assessmentId || savedAssessmentId;
			if (!currentAssessmentId || currentAssessmentId === 'preview') {
				return;
			}

			try {
				const saved = await saveSafetyResultToDb(safetyResult);
				if (saved) {
					setAssessmentSaved(true);
					setSavedAssessmentId(currentAssessmentId);
				}
			} catch (error) {
				console.error('Failed to auto-save results:', error);
			}
		};

		autoSaveResults();
	}, [isUserLoaded, user, safetyResult, userInput.assessmentId, assessmentSaved, loadedFromDb]);

	// Data load timer
	useEffect(() => {
		const timer = setTimeout(() => setDataLoaded(true), 200);
		return () => clearTimeout(timer);
	}, []);

	// Handle score reveal completion
	const handleRevealComplete = () => {
		setPhase('complete');
		setTimeout(() => setShowDetails(true), 500);
	};

	// Scroll to details
	const scrollToDetails = () => {
		detailsRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	// Loading state
	if (!dataLoaded) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="text-center"
				>
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
						className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-violet-200 border-t-violet-500"
					/>
					<p className="text-gray-500">Preparing your results...</p>
				</motion.div>
			</div>
		);
	}

	// No data state
	if (!userInput || Object.keys(userInput).length === 0 || !userInput.numberOfStories) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center"
				>
					<div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
						<AlertTriangle className="w-10 h-10 text-amber-500" />
					</div>
					<h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">No Assessment Data</h2>
					<p className="text-gray-500 mb-8">
						Complete the assessment to see your building's safety report.
					</p>
					<Link href="/assessment/1">
						<Button size="lg" className="w-full h-14 text-lg bg-gradient-to-r from-violet-500 to-purple-600">
							Start Assessment
						</Button>
					</Link>
				</motion.div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center"
				>
					<div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
						<AlertTriangle className="w-10 h-10 text-red-500" />
					</div>
					<h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Error</h2>
					<p className="text-red-500 mb-8">{error}</p>
					<Link href="/assessment/1">
						<Button size="lg" className="w-full h-14 text-lg">Restart Assessment</Button>
					</Link>
				</motion.div>
			</div>
		);
	}

	// Still calculating
	if (loading || !safetyResult) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="text-center"
				>
					<motion.div
						animate={{ scale: [1, 1.2, 1] }}
						transition={{ duration: 1.5, repeat: Infinity }}
						className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
					>
						<Shield className="w-10 h-10 text-white" />
					</motion.div>
					<p className="text-gray-500">Analyzing safety data...</p>
				</motion.div>
			</div>
		);
	}

	const isPassingScore = parseFloat(safetyResult.overallScore) >= 70;
	const imageGallery = getImageGallery();

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			{/* Share Modal */}
			<ShareModal
				isOpen={showShareModal}
				onClose={() => setShowShareModal(false)}
				assessmentId={savedAssessmentId || assessmentId}
				score={safetyResult?.overallScore}
				buildingName={userInput.address || userInput.city}
			/>

			{/* Email Modal */}
			<EmailReportModal
				isOpen={showEmailModal}
				onClose={() => setShowEmailModal(false)}
				assessmentId={savedAssessmentId || assessmentId}
				score={safetyResult?.overallScore}
				buildingName={userInput.address || userInput.city}
			/>

			{/* Navigation Header */}
			<motion.header
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800"
			>
				<div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
					<Link href="/">
						<Button variant="ghost" size="sm" className="gap-1">
							<HomeIcon className="h-4 w-4" /> Home
						</Button>
					</Link>
					<div className="flex items-center gap-2">
						{assessmentSaved && user && (
							<Link href="/dashboard">
								<Button variant="outline" size="sm" className="gap-1 border-emerald-500 text-emerald-600">
									<LayoutDashboard className="h-4 w-4" /> Dashboard
								</Button>
							</Link>
						)}
						{savedAssessmentId && savedAssessmentId !== 'preview' && (
							<Button variant="outline" size="sm" className="gap-1" onClick={copyShareableLink}>
								<Copy className="h-4 w-4" />
							</Button>
						)}
						<Link href="/assessment/1">
							<Button variant="outline" size="sm">New</Button>
						</Link>
					</div>
				</div>
			</motion.header>

			{/* Main Content */}
			<main className="max-w-4xl mx-auto px-4 py-8">
				{/* Score Reveal Section */}
				<section className="mb-12">
					<ScoreReveal score={safetyResult} onRevealComplete={handleRevealComplete} />
				</section>

				{/* Details reveal after score animation */}
				<AnimatePresence>
					{showDetails && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5 }}
						>
							{/* Address/Location Card */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className="text-center mb-10"
							>
								<p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Assessment for</p>
								<h2 className="text-xl font-bold text-gray-900 dark:text-white">
									{userInput.address || userInput.city || 'Your Building'}
								</h2>
							</motion.div>

							{/* Two-column grid for showcase components */}
							<div className="grid md:grid-cols-2 gap-6 mb-10">
								{/* Google Imagery */}
								<motion.div
									initial={{ opacity: 0, x: -30 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.2 }}
								>
									<ImageryShowcase userInput={userInput} imageGallery={imageGallery} />
								</motion.div>

								{/* AI Insights */}
								<motion.div
									initial={{ opacity: 0, x: 30 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.4 }}
								>
									<AIInsightsReveal
										aiData={userInput.aiAnalysisData}
										userInput={userInput}
										delay={600}
									/>
								</motion.div>
							</div>

							{/* Weather/Scenario Section */}
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.6 }}
								className="mb-10"
							>
								<WorstCaseScenario
									weatherData={userInput.weatherData}
									seismicData={userInput.seismicZone || { zone: userInput.seismicZone }}
									userInput={userInput}
									delay={800}
								/>
							</motion.div>

							{/* Key Findings Card */}
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.8 }}
								className="mb-10"
							>
								<Card className="overflow-hidden">
									<CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
										<CardTitle className="flex items-center gap-2">
											<Target className="w-5 h-5 text-violet-500" />
											Key Safety Findings
										</CardTitle>
									</CardHeader>
									<CardContent className="pt-6">
										<KeyFindings safetyResult={safetyResult} userInput={userInput} />
									</CardContent>
								</Card>
							</motion.div>

							{/* Historical Earthquake Map */}
							{userInput?.latitude && userInput?.longitude && (
								<motion.div
									initial={{ opacity: 0, y: 30 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.9 }}
									className="mb-10"
								>
									<HistoricalEarthquakeMap
										latitude={parseFloat(userInput.latitude)}
										longitude={parseFloat(userInput.longitude)}
									/>
								</motion.div>
							)}

							{/* Retrofit Cost Calculator */}
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.95 }}
								className="mb-10"
							>
								<RetrofitCostCalculator
									safetyResult={safetyResult}
									userInput={userInput}
								/>
							</motion.div>

							{/* Actions Section */}
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 1 }}
								className="mb-10"
							>
								<div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
									<Button
										size="lg"
										className="gap-2 h-14 px-8 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90"
										onClick={() => generatePDF(safetyResult, userInput, savedAssessmentId || assessmentId)}
									>
										<Download className="h-5 w-5" />
										Download PDF
									</Button>
									<Button
										size="lg"
										variant="outline"
										className="gap-2 h-14 px-8"
										onClick={() => setShowShareModal(true)}
										disabled={!savedAssessmentId || savedAssessmentId === 'preview'}
									>
										<Share2 className="h-5 w-5" />
										Share
									</Button>
									<Button
										size="lg"
										variant="outline"
										className="gap-2 h-14 px-8"
										onClick={() => setShowEmailModal(true)}
									>
										<Mail className="h-5 w-5" />
										Email Report
									</Button>
								</div>
							</motion.div>

							{/* Recommendations Section */}
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 1.2 }}
								ref={detailsRef}
								className="mb-10"
							>
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Lightbulb className="h-5 w-5 text-amber-500" />
											{isPassingScore ? 'Maintenance Tips' : 'Priority Actions'}
										</CardTitle>
										<CardDescription>
											{isPassingScore
												? 'Keep your building safe'
												: 'Steps to improve safety'}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ul className="space-y-3">
											{isPassingScore ? (
												<>
													<RecommendationItem
														icon={CheckCircle2}
														iconColor="text-emerald-500"
														bgColor="bg-emerald-50 dark:bg-emerald-900/20"
														title="Regular Inspections"
														description="Schedule annual structural inspections"
													/>
													<RecommendationItem
														icon={Shield}
														iconColor="text-blue-500"
														bgColor="bg-blue-50 dark:bg-blue-900/20"
														title="Emergency Plan"
														description="Create earthquake preparedness plan"
													/>
													<RecommendationItem
														icon={FileText}
														iconColor="text-gray-500"
														bgColor="bg-gray-50 dark:bg-gray-800"
														title="Documentation"
														description="Keep this report accessible"
													/>
												</>
											) : (
												<>
													<RecommendationItem
														icon={AlertTriangle}
														iconColor="text-red-500"
														bgColor="bg-red-50 dark:bg-red-900/20"
														title="Professional Evaluation"
														description="Consult a structural engineer"
													/>
													<RecommendationItem
														icon={Wrench}
														iconColor="text-amber-500"
														bgColor="bg-amber-50 dark:bg-amber-900/20"
														title="Retrofit Options"
														description="Explore seismic strengthening"
													/>
													<RecommendationItem
														icon={Users}
														iconColor="text-orange-500"
														bgColor="bg-orange-50 dark:bg-orange-900/20"
														title="Occupant Safety"
														description="Review evacuation routes"
													/>
												</>
											)}
										</ul>
									</CardContent>
								</Card>
							</motion.div>

							{/* Expert Mode Section */}
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 1.4 }}
								className="mb-10"
							>
								<div className="flex flex-col items-center gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
									<p className="text-sm text-gray-500">Want detailed technical data?</p>
									<ExpertModeToggle expertMode={expertMode} setExpertMode={setExpertMode} />
								</div>

								{expertMode && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: 'auto' }}
										transition={{ duration: 0.3 }}
									>
										<ExpertDataPanels
											userInput={userInput}
											safetyResult={safetyResult}
											imageGallery={imageGallery}
										/>
									</motion.div>
								)}
							</motion.div>

							{/* Certificate Section */}
							{isPassingScore && (
								<motion.div
									initial={{ opacity: 0, y: 30 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 1.6 }}
									className="mb-10"
								>
									<Card className="overflow-hidden border-2 border-emerald-200 dark:border-emerald-800">
										<CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
											<CardTitle className="flex items-center gap-2">
												<Award className="h-5 w-5 text-emerald-500" />
												Safety Certificate
											</CardTitle>
											<CardDescription>
												Your building passed the assessment
											</CardDescription>
										</CardHeader>
										<CardContent className="pt-6">
											<EnhancedCertificate score={safetyResult} userInput={userInput} />
										</CardContent>
									</Card>
								</motion.div>
							)}

							{/* Expert Consultation CTA */}
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 1.8 }}
								className="mb-10"
							>
								<Card className="border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
									<CardContent className="py-8 text-center">
										<Sparkles className="w-10 h-10 text-violet-500 mx-auto mb-4" />
										<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
											Need Expert Advice?
										</h3>
										<p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
											Our certified structural engineers can provide a detailed on-site assessment
										</p>
										<div className="flex flex-col sm:flex-row gap-3 justify-center">
											<Button size="lg" className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600">
												<Phone className="h-4 w-4" />
												Schedule Consultation
											</Button>
										</div>
									</CardContent>
								</Card>
							</motion.div>

							{/* Footer Note */}
							<motion.footer
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 2 }}
								className="text-center text-xs text-gray-400 py-8"
							>
								<p>
									This assessment is based on the information provided and serves as a general guide.
									For comprehensive structural analysis, consult a licensed professional engineer.
								</p>
							</motion.footer>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Scroll indicator when not showing details yet */}
				{phase === 'complete' && !showDetails && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="fixed bottom-8 left-1/2 -translate-x-1/2"
					>
						<motion.div
							animate={{ y: [0, 10, 0] }}
							transition={{ duration: 1.5, repeat: Infinity }}
							className="flex flex-col items-center text-gray-400"
						>
							<ChevronDown className="w-6 h-6" />
							<span className="text-xs">Scroll for details</span>
						</motion.div>
					</motion.div>
				)}
			</main>
		</div>
	);
};

// Recommendation item component
const RecommendationItem = ({ icon: Icon, iconColor, bgColor, title, description }) => (
	<li className={`flex items-start gap-3 p-4 rounded-xl ${bgColor}`}>
		<Icon className={`h-5 w-5 ${iconColor} mt-0.5 flex-shrink-0`} />
		<div>
			<p className="font-medium text-gray-900 dark:text-white">{title}</p>
			<p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
		</div>
	</li>
);

export default ResultPage;
