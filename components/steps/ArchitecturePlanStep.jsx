import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
	Upload,
	FileText,
	Image,
	X,
	Eye,
	Download,
	AlertCircle,
	CheckCircle2,
	ArrowLeft,
	ArrowRight,
	Building2,
	Ruler,
	FileImage,
	Zap,
	Sparkles,
	AlertTriangle,
	Home,
	Wrench
} from 'lucide-react';
import { useUserInput } from '@/context/UserInputContext';
import Link from 'next/link';

const ArchitecturePlanStep = ({ onNext }) => {
	const { userInput, updateUserInput, storeUserImages } = useUserInput();
	const [uploadedPlans, setUploadedPlans] = useState([]);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [selectedPlan, setSelectedPlan] = useState(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [analysisResults, setAnalysisResults] = useState({});
	const [showAnalysisResults, setShowAnalysisResults] = useState(false);

	const handleFileUpload = useCallback(async (files) => {
		setIsUploading(true);
		setUploadProgress(0);

		try {
			// Filter for plan-type files (images and PDFs)
			const planFiles = Array.from(files).filter(file => 
				file.type.startsWith('image/') || file.type === 'application/pdf'
			);

			if (planFiles.length === 0) {
				alert('Please upload image files (JPG, PNG, etc.) or PDF files containing your architectural plans.');
				return;
			}

			// Simulate upload progress
			const progressInterval = setInterval(() => {
				setUploadProgress(prev => {
					if (prev >= 90) {
						clearInterval(progressInterval);
						return 90;
					}
					return prev + 10;
				});
			}, 200);

			// Process and store the plans
			const processedPlans = [];
			for (let i = 0; i < planFiles.length; i++) {
				const file = planFiles[i];
				
				// Create preview
				const preview = URL.createObjectURL(file);
				
				const planData = {
					id: `plan_${Date.now()}_${i}`,
					file,
					preview,
					name: file.name,
					size: file.size,
					type: file.type,
					uploadedAt: new Date().toISOString(),
					category: detectPlanType(file.name)
				};

				processedPlans.push(planData);
			}

			// Store in user images system
			await storeUserImages(planFiles);

			setUploadedPlans(prev => [...prev, ...processedPlans]);
			
			// Don't auto-analyze, let user trigger analysis manually
			
			// Update user input
			updateUserInput(prev => ({
				...prev,
				architecturalPlans: [...(prev.architecturalPlans || []), ...processedPlans.map(p => ({
					id: p.id,
					name: p.name,
					size: p.size,
					type: p.type,
					category: p.category,
					uploadedAt: p.uploadedAt
				}))],
				hasArchitecturalPlans: true
			}));

			setUploadProgress(100);
			
			setTimeout(() => {
				clearInterval(progressInterval);
				setIsUploading(false);
				setUploadProgress(0);
			}, 500);

		} catch (error) {
			console.error('Error uploading architectural plans:', error);
			alert('Failed to upload plans. Please try again.');
			setIsUploading(false);
			setUploadProgress(0);
		}
	}, [storeUserImages, updateUserInput]);

	const handleDragOver = (e) => {
		e.preventDefault();
	};

	const handleDrop = (e) => {
		e.preventDefault();
		const files = e.dataTransfer.files;
		if (files.length > 0) {
			handleFileUpload(files);
		}
	};

	const detectPlanType = (filename) => {
		const name = filename.toLowerCase();
		if (name.includes('floor') || name.includes('plan')) return 'Floor Plan';
		if (name.includes('elevation') || name.includes('facade')) return 'Elevation';
		if (name.includes('section')) return 'Section';
		if (name.includes('site') || name.includes('plot')) return 'Site Plan';
		if (name.includes('structural')) return 'Structural';
		return 'Architectural Plan';
	};

	const getPlanIcon = (category) => {
		switch (category) {
			case 'Floor Plan': return <Building2 className="h-4 w-4" />;
			case 'Elevation': return <Ruler className="h-4 w-4" />;
			case 'Section': return <FileText className="h-4 w-4" />;
			case 'Site Plan': return <FileImage className="h-4 w-4" />;
			case 'Structural': return <Zap className="h-4 w-4" />;
			default: return <FileText className="h-4 w-4" />;
		}
	};

	const getCategoryColor = (category) => {
		switch (category) {
			case 'Floor Plan': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
			case 'Elevation': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
			case 'Section': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
			case 'Site Plan': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
			case 'Structural': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
			default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
		}
	};

	const removePlan = (planId) => {
		setUploadedPlans(prev => prev.filter(plan => plan.id !== planId));
		updateUserInput(prev => ({
			...prev,
			architecturalPlans: (prev.architecturalPlans || []).filter(plan => plan.id !== planId),
			hasArchitecturalPlans: (prev.architecturalPlans || []).length > 1
		}));
	};

	const formatFileSize = (bytes) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const handleStartAnalysis = async () => {
		if (uploadedPlans.length === 0) {
			alert('Please upload at least one architectural plan before starting analysis.');
			return;
		}

		setIsAnalyzing(true);
		try {
			await analyzePlans(uploadedPlans);
		} catch (error) {
			console.error('Plan analysis failed:', error);
		} finally {
			setIsAnalyzing(false);
		}
	};

	const analyzePlans = async (plans) => {
		const formData = new FormData();
		
		// Add image files
		plans.forEach((plan) => {
			formData.append('images', plan.file);
		});
		
		// Set analysis type for architectural plans
		formData.append('analysisType', 'architecturalPlan');
		
		console.log('Starting architectural plan analysis with:', {
			numImages: plans.length,
			context: context
		});
		
		// Add context from user input
		const context = {
			location: {
				city: userInput.city,
				latitude: userInput.latitude,
				longitude: userInput.longitude
			},
			seismic: userInput.environmentalData?.seismic,
			weather: userInput.environmentalData?.weather
		};
		formData.append('additionalContext', JSON.stringify(context));

		try {
			console.log('Sending request to /api/analyze-image...');
			const response = await fetch('/api/analyze-image', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error('API Error Response:', errorText);
				throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
			}

			console.log('Analysis response received, parsing...');
			const result = await response.json();
			console.log('Architectural plan analysis result:', result);
			
			setAnalysisResults(result.analysis || {});
			setShowAnalysisResults(true);
			
			// Store COMPREHENSIVE analysis results in user context
			updateUserInput(prev => ({
				...prev,
				// Complete architectural analysis data
				architecturalPlanAnalysis: result.analysis,
				architecturalPlanAnalyzed: true,
				
				// Detailed structural data for calculations
				structuralElements: result.analysis?.structuralElements,
				reinforcementDetails: result.analysis?.reinforcementDetails,
				rebarPositions: result.analysis?.rebarPositions,
				gridSystem: result.analysis?.gridSystem,
				positioningCoordinates: result.analysis?.positioningCoordinates,
				
				// Building layout for calculations
				roomLayout: result.analysis?.roomLayout || result.analysis?.architecturalLayout,
				doorWindows: result.analysis?.doorWindows || result.analysis?.openings,
				verticalCirculation: result.analysis?.verticalCirculation,
				stairs: result.analysis?.stairs,
				elevators: result.analysis?.elevators,
				
				// MEP and infrastructure data
				mepSystems: result.analysis?.mepSystems,
				infrastructure: result.analysis?.infrastructure,
				
				// Technical specifications for calculations
				technicalSpecs: result.analysis?.technicalSpecs,
				dimensions: result.analysis?.dimensions,
				seismicReinforcement: result.analysis?.seismicReinforcement,
				
				// Quality and completeness data
				planQualityAssessment: result.analysis?.qualityAssessment,
				
				// All annotations and notes
				annotations: result.analysis?.annotations,
				technicalNotes: result.analysis?.technicalNotes,
				textExtraction: result.analysis?.textExtraction,
				
				// Flag for comprehensive data availability
				hasComprehensivePlanData: true,
				planAnalysisTimestamp: new Date().toISOString()
			}));
			
		} catch (error) {
			console.error('Plan analysis error:', error);
			alert('Failed to analyze architectural plans. The plans have been uploaded successfully, but AI analysis is unavailable.');
		}
	};

	const getAnalysisStatus = () => {
		if (isAnalyzing) return { color: 'yellow', text: 'Analyzing...', icon: '🔄' };
		if (analysisResults.qualityAssessment?.sufficient === false) {
			return { color: 'red', text: 'Needs Better Images', icon: '⚠️' };
		}
		if (analysisResults.structuralElements) {
			return { color: 'green', text: 'Analysis Complete', icon: '✅' };
		}
		return { color: 'gray', text: 'Ready for Analysis', icon: '📋' };
	};

	const shouldShowReuploadSuggestion = () => {
		return analysisResults.qualityAssessment && (
			analysisResults.qualityAssessment.imageClarity === 'poor' ||
			analysisResults.qualityAssessment.sufficient === false ||
			analysisResults.qualityAssessment.completeness < 50
		);
	};

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<div className="text-center mb-8">
				<div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full mb-4">
					<Building2 className="h-10 w-10 text-blue-600 dark:text-blue-400" />
				</div>
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
					Architectural Plans
				</h1>
				<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
					Upload your building&apos;s architectural plans, blueprints, floor plans, and elevation drawings.
					<span className="inline-flex items-center gap-1 ml-2">
						<Sparkles className="h-4 w-4 text-purple-500" />
						<span className="text-purple-600 dark:text-purple-400 font-medium">AI will analyze them for structural insights</span>
					</span>
				</p>
			</div>

			{/* Uploaded Plans - Above Upload Area */}
			{uploadedPlans.length > 0 && (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<CheckCircle2 className="h-5 w-5 text-green-600" />
								Uploaded Plans
								<Badge variant="outline">
									{uploadedPlans.length} file{uploadedPlans.length !== 1 ? 's' : ''}
								</Badge>
							</CardTitle>
							<div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
								getAnalysisStatus().color === 'green' ? 'bg-green-100 text-green-800' :
								getAnalysisStatus().color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
								getAnalysisStatus().color === 'red' ? 'bg-red-100 text-red-800' :
								'bg-gray-100 text-gray-800'
							}`}>
								<span>{getAnalysisStatus().icon}</span>
								<span>{getAnalysisStatus().text}</span>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{uploadedPlans.map((plan) => (
								<div key={plan.id} className="relative group border rounded-lg p-3 hover:shadow-md transition-all">
									{/* Preview */}
									<div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
										{plan.type === 'application/pdf' ? (
											<FileText className="h-12 w-12 text-red-500" />
										) : (
											<img 
												src={plan.preview} 
												alt={plan.name}
												className="w-full h-full object-cover cursor-pointer"
												onClick={() => setSelectedPlan(plan)}
											/>
										)}
									</div>

									{/* Info */}
									<div className="space-y-2">
										<div className="flex items-start justify-between">
											<h4 className="font-medium text-sm truncate pr-2">{plan.name}</h4>
											<button
												onClick={() => removePlan(plan.id)}
												className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
											>
												<X className="h-4 w-4" />
											</button>
										</div>
										
										<div className="flex items-center justify-between">
											<Badge className={`text-xs ${getCategoryColor(plan.category)}`}>
												{getPlanIcon(plan.category)}
												<span className="ml-1">{plan.category}</span>
											</Badge>
											<span className="text-xs text-gray-500">{formatFileSize(plan.size)}</span>
										</div>

										<div className="flex gap-2">
											<Button
												size="sm"
												variant="outline"
												className="flex-1 text-xs"
												onClick={() => setSelectedPlan(plan)}
											>
												<Eye className="h-3 w-3 mr-1" />
												View
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Start Analysis Button */}
						{uploadedPlans.length > 0 && !showAnalysisResults && !isAnalyzing && (
							<div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
								<div className="text-center">
									<h4 className="font-medium text-purple-900 dark:text-purple-200 mb-2 flex items-center justify-center gap-2">
										<Sparkles className="h-5 w-5 text-purple-600" />
										Ready for AI Analysis
									</h4>
									<p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
										Upload more plans if needed, then start AI analysis to extract structural information
									</p>
									<Button 
										onClick={handleStartAnalysis} 
										className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2"
										disabled={isAnalyzing}
									>
										<Sparkles className="h-4 w-4 mr-2" />
										Start AI Analysis
									</Button>
								</div>
							</div>
						)}

						{/* Analysis Progress */}
						{isAnalyzing && (
							<div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
								<div className="flex items-center gap-3">
									<div className="animate-spin">
										<Sparkles className="h-5 w-5 text-blue-600" />
									</div>
									<div>
										<p className="font-medium text-blue-900 dark:text-blue-200">AI is analyzing your architectural plans...</p>
										<p className="text-sm text-blue-700 dark:text-blue-300">Extracting structural elements, dimensions, and technical specifications</p>
									</div>
								</div>
							</div>
						)}

						{/* Re-upload Suggestion */}
						{shouldShowReuploadSuggestion() && (
							<div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
								<div className="flex items-start gap-3">
									<AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
									<div>
										<h4 className="font-medium text-red-900 dark:text-red-200 mb-2">
											📸 Improve Plan Quality for Better Analysis
										</h4>
										<div className="text-sm text-red-700 dark:text-red-300 space-y-1">
											{analysisResults.qualityAssessment?.imageClarity === 'poor' && (
												<p>• 🔍 The image quality is too low - please upload clearer, high-resolution images</p>
											)}
											{analysisResults.qualityAssessment?.completeness < 50 && (
												<p>• 📏 Limited structural details visible - include plans with dimensions and technical annotations</p>
											)}
											{analysisResults.recommendations && analysisResults.recommendations.length > 0 && (
												<div>
													<p className="font-medium">AI Recommendations:</p>
													<ul className="list-disc list-inside ml-2">
														{analysisResults.recommendations.map((rec, index) => (
															<li key={index}>{rec}</li>
														))}
													</ul>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Analysis Results Display */}
						{showAnalysisResults && analysisResults && (
							<div className="mt-4 space-y-4">
								{/* Reinforcement Bar Positions - MOST CRITICAL */}
								{(analysisResults.reinforcementDetails || analysisResults.rebarPositions || analysisResults.structuralElements?.reinforcement) && (
									<Card className="border-red-200 dark:border-red-800">
										<CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
											<CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
												<Zap className="h-5 w-5" />
												🔩 REINFORCEMENT BAR POSITIONS - CRITICAL FOR EARTHQUAKE SAFETY
											</CardTitle>
											<p className="text-sm text-red-600 dark:text-red-400 mt-2">
												Exact positions of steel bars determine building survival during earthquakes
											</p>
										</CardHeader>
										<CardContent className="pt-6 space-y-6">
											{/* Column Rebar Positions */}
											{(analysisResults.reinforcementDetails?.columnRebar || analysisResults.rebarPositions?.columns) && (
												<div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
													<h4 className="font-semibold text-red-900 dark:text-red-200 mb-3 flex items-center gap-2">
														<div className="w-4 h-4 bg-red-600 rounded-sm"></div>
														📍 Column Reinforcement Positions
													</h4>
													<div className="text-sm space-y-2">
														{analysisResults.reinforcementDetails?.columnRebar && (
															<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-red-500">
																<p className="font-medium">Position Details:</p>
																<p>{analysisResults.reinforcementDetails.columnRebar}</p>
															</div>
														)}
														{analysisResults.rebarPositions?.columns && (
															<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-red-500">
																<p className="font-medium">Spatial Positioning:</p>
																<p>{analysisResults.rebarPositions.columns}</p>
															</div>
														)}
													</div>
												</div>
											)}

											{/* Beam Rebar Positions */}
											{(analysisResults.reinforcementDetails?.beamRebar || analysisResults.rebarPositions?.beams) && (
												<div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200">
													<h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-3 flex items-center gap-2">
														<div className="w-4 h-4 bg-purple-600 rounded-sm"></div>
														📍 Beam Reinforcement Positions
													</h4>
													<div className="text-sm space-y-2">
														{analysisResults.reinforcementDetails?.beamRebar && (
															<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-purple-500">
																<p className="font-medium">Reinforcement Layout:</p>
																<p>{analysisResults.reinforcementDetails.beamRebar}</p>
															</div>
														)}
														{analysisResults.rebarPositions?.beams && (
															<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-purple-500">
																<p className="font-medium">Spatial Positioning:</p>
																<p>{analysisResults.rebarPositions.beams}</p>
															</div>
														)}
													</div>
												</div>
											)}

											{/* Foundation Rebar Positions */}
											{(analysisResults.reinforcementDetails?.foundationRebar || analysisResults.rebarPositions?.foundation) && (
												<div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200">
													<h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-3 flex items-center gap-2">
														<div className="w-4 h-4 bg-amber-600 rounded-sm"></div>
														📍 Foundation Reinforcement Positions
													</h4>
													<div className="text-sm space-y-2">
														{analysisResults.reinforcementDetails?.foundationRebar && (
															<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-amber-500">
																<p className="font-medium">Foundation Layout:</p>
																<p>{analysisResults.reinforcementDetails.foundationRebar}</p>
															</div>
														)}
														{analysisResults.rebarPositions?.foundation && (
															<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-amber-500">
																<p className="font-medium">Spatial Positioning:</p>
																<p>{analysisResults.rebarPositions.foundation}</p>
															</div>
														)}
													</div>
												</div>
											)}

											{/* Structural Grid & Positioning */}
											{(analysisResults.gridSystem || analysisResults.positioningCoordinates) && (
												<div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
													<h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
														<div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
														🗺️ Building Grid & Rebar Coordinates
													</h4>
													<div className="text-sm space-y-2">
														{analysisResults.gridSystem && (
															<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-blue-500">
																<p className="font-medium">Structural Grid:</p>
																<p>{analysisResults.gridSystem}</p>
															</div>
														)}
														{analysisResults.positioningCoordinates && (
															<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-blue-500">
																<p className="font-medium">Reinforcement Coordinates:</p>
																<p>{analysisResults.positioningCoordinates}</p>
															</div>
														)}
													</div>
												</div>
											)}

											{/* Seismic Reinforcement Details */}
											{analysisResults.seismicReinforcement && (
												<div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200">
													<h4 className="font-semibold text-orange-900 dark:text-orange-200 mb-3 flex items-center gap-2">
														<AlertTriangle className="w-4 h-4 text-orange-600" />
														⚡ Seismic Reinforcement Positioning
													</h4>
													<div className="text-sm">
														<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-orange-500">
															<p className="font-medium">Critical Seismic Details:</p>
															<p>{analysisResults.seismicReinforcement}</p>
														</div>
													</div>
												</div>
											)}
										</CardContent>
									</Card>
								)}

								{/* Structural Elements */}
								{analysisResults.structuralElements && (
									<Card className="border-green-200 dark:border-green-800">
										<CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
											<CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
												<Building2 className="h-5 w-5" />
												🏗️ Extracted Structural Elements
											</CardTitle>
										</CardHeader>
										<CardContent className="pt-6">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												{/* Columns & Grid */}
												{(analysisResults.structuralElements.columns || analysisResults.structuralElements.gridLayout) && (
													<div className="space-y-3">
														<h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
															<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
															Column System
														</h4>
														{analysisResults.structuralElements.columns && (
															<div className="text-sm space-y-1">
																<p><strong>Positions:</strong> {analysisResults.structuralElements.columns}</p>
															</div>
														)}
														{analysisResults.structuralElements.gridLayout && (
															<div className="text-sm space-y-1">
																<p><strong>Grid Layout:</strong> {analysisResults.structuralElements.gridLayout}</p>
															</div>
														)}
													</div>
												)}

												{/* Beams */}
												{analysisResults.structuralElements.beams && (
													<div className="space-y-3">
														<h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
															<div className="w-3 h-3 bg-purple-500 rounded-full"></div>
															Beam System
														</h4>
														<div className="text-sm">
															<p>{analysisResults.structuralElements.beams}</p>
														</div>
													</div>
												)}

												{/* Walls */}
												{analysisResults.structuralElements.walls && (
													<div className="space-y-3">
														<h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
															<div className="w-3 h-3 bg-orange-500 rounded-full"></div>
															Wall System
														</h4>
														<div className="text-sm">
															<p>{analysisResults.structuralElements.walls}</p>
														</div>
													</div>
												)}

												{/* Foundation */}
												{analysisResults.structuralElements.foundation && (
													<div className="space-y-3">
														<h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
															<div className="w-3 h-3 bg-amber-600 rounded-full"></div>
															Foundation
														</h4>
														<div className="text-sm">
															<p>{analysisResults.structuralElements.foundation}</p>
														</div>
													</div>
												)}
											</div>
										</CardContent>
									</Card>
								)}

								{/* Dimensions & Technical Data */}
								{analysisResults.dimensions && (
									<Card className="border-blue-200 dark:border-blue-800">
										<CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
											<CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
												<Ruler className="h-5 w-5" />
												📏 Dimensional Analysis
											</CardTitle>
										</CardHeader>
										<CardContent className="pt-6">
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
												{analysisResults.dimensions.buildingLength && (
													<div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
														<p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
															{analysisResults.dimensions.buildingLength}m
														</p>
														<p className="text-sm text-blue-700 dark:text-blue-300">Building Length</p>
													</div>
												)}
												{analysisResults.dimensions.buildingWidth && (
													<div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
														<p className="text-2xl font-bold text-indigo-900 dark:text-indigo-200">
															{analysisResults.dimensions.buildingWidth}m
														</p>
														<p className="text-sm text-indigo-700 dark:text-indigo-300">Building Width</p>
													</div>
												)}
												{analysisResults.dimensions.totalArea && (
													<div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
														<p className="text-2xl font-bold text-purple-900 dark:text-purple-200">
															{analysisResults.dimensions.totalArea}m²
														</p>
														<p className="text-sm text-purple-700 dark:text-purple-300">Total Area</p>
													</div>
												)}
											</div>
											
											{(analysisResults.dimensions.columnSpacing || analysisResults.dimensions.wallThickness) && (
												<div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
													{analysisResults.dimensions.columnSpacing && (
														<div className="p-3 border rounded-lg">
															<p className="font-medium text-sm">Column Spacing</p>
															<p className="text-gray-600 dark:text-gray-400 text-sm">{analysisResults.dimensions.columnSpacing}</p>
														</div>
													)}
													{analysisResults.dimensions.wallThickness && (
														<div className="p-3 border rounded-lg">
															<p className="font-medium text-sm">Wall Thickness</p>
															<p className="text-gray-600 dark:text-gray-400 text-sm">{analysisResults.dimensions.wallThickness}</p>
														</div>
													)}
												</div>
											)}
										</CardContent>
									</Card>
								)}

								{/* Technical Specifications */}
								{analysisResults.technicalSpecs && (
									<Card className="border-purple-200 dark:border-purple-800">
										<CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
											<CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
												<FileText className="h-5 w-5" />
												⚙️ Technical Specifications
											</CardTitle>
										</CardHeader>
										<CardContent className="pt-6 space-y-4">
											{analysisResults.technicalSpecs.structuralSystem && (
												<div>
													<p className="font-medium">Structural System</p>
													<p className="text-gray-600 dark:text-gray-400 text-sm">{analysisResults.technicalSpecs.structuralSystem}</p>
												</div>
											)}
											{analysisResults.technicalSpecs.foundationSystem && (
												<div>
													<p className="font-medium">Foundation System</p>
													<p className="text-gray-600 dark:text-gray-400 text-sm">{analysisResults.technicalSpecs.foundationSystem}</p>
												</div>
											)}
											{(analysisResults.technicalSpecs.concreteGrade || analysisResults.technicalSpecs.steelGrade) && (
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{analysisResults.technicalSpecs.concreteGrade && (
														<div>
															<p className="font-medium text-sm">Concrete Grade</p>
															<p className="text-gray-600 dark:text-gray-400 text-sm">{analysisResults.technicalSpecs.concreteGrade}</p>
														</div>
													)}
													{analysisResults.technicalSpecs.steelGrade && (
														<div>
															<p className="font-medium text-sm">Steel Grade</p>
															<p className="text-gray-600 dark:text-gray-400 text-sm">{analysisResults.technicalSpecs.steelGrade}</p>
														</div>
													)}
												</div>
											)}
										</CardContent>
									</Card>
								)}

								{/* Room Layout & Positioning */}
								{(analysisResults.roomLayout || analysisResults.architecturalLayout) && (
									<Card className="border-cyan-200 dark:border-cyan-800">
										<CardHeader className="bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20">
											<CardTitle className="flex items-center gap-2 text-cyan-800 dark:text-cyan-200">
												<Home className="h-5 w-5" />
												🏠 Room Layout & Architectural Elements
											</CardTitle>
										</CardHeader>
										<CardContent className="pt-6 space-y-4">
											{/* Room Positioning */}
											{(analysisResults.roomLayout?.rooms || analysisResults.architecturalLayout?.rooms) && (
												<div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200">
													<h4 className="font-semibold text-cyan-900 dark:text-cyan-200 mb-3 flex items-center gap-2">
														<div className="w-4 h-4 bg-cyan-600 rounded-sm"></div>
														📍 Room Positions & Dimensions
													</h4>
													<div className="text-sm">
														<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-cyan-500">
															{analysisResults.roomLayout?.rooms || analysisResults.architecturalLayout?.rooms}
														</div>
													</div>
												</div>
											)}

											{/* Doors & Windows */}
											{(analysisResults.doorWindows || analysisResults.openings) && (
												<div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200">
													<h4 className="font-semibold text-teal-900 dark:text-teal-200 mb-3 flex items-center gap-2">
														<div className="w-4 h-4 bg-teal-600 rounded-sm"></div>
														🚪 Doors & Windows Positioning
													</h4>
													<div className="text-sm">
														<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-teal-500">
															{analysisResults.doorWindows || analysisResults.openings}
														</div>
													</div>
												</div>
											)}

											{/* Stairs & Elevators */}
											{(analysisResults.verticalCirculation || analysisResults.stairs || analysisResults.elevators) && (
												<div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200">
													<h4 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-3 flex items-center gap-2">
														<div className="w-4 h-4 bg-emerald-600 rounded-sm"></div>
														🪜 Vertical Circulation Elements
													</h4>
													<div className="text-sm space-y-2">
														{analysisResults.stairs && (
															<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-emerald-500">
																<p className="font-medium">Stairs:</p>
																<p>{analysisResults.stairs}</p>
															</div>
														)}
														{analysisResults.elevators && (
															<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-emerald-500">
																<p className="font-medium">Elevators:</p>
																<p>{analysisResults.elevators}</p>
															</div>
														)}
														{analysisResults.verticalCirculation && (
															<div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-emerald-500">
																<p className="font-medium">Circulation Details:</p>
																<p>{analysisResults.verticalCirculation}</p>
															</div>
														)}
													</div>
												</div>
											)}
										</CardContent>
									</Card>
								)}

								{/* MEP Systems & Infrastructure */}
								{(analysisResults.mepSystems || analysisResults.infrastructure) && (
									<Card className="border-indigo-200 dark:border-indigo-800">
										<CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
											<CardTitle className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
												<Wrench className="h-5 w-5" />
												⚡ MEP Systems & Infrastructure
											</CardTitle>
										</CardHeader>
										<CardContent className="pt-6 space-y-4">
											{analysisResults.mepSystems?.mechanical && (
												<div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200">
													<h5 className="font-medium text-indigo-900 dark:text-indigo-200 mb-2">🌬️ Mechanical Systems</h5>
													<div className="text-sm bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-indigo-500">
														{analysisResults.mepSystems.mechanical}
													</div>
												</div>
											)}
											{analysisResults.mepSystems?.electrical && (
												<div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
													<h5 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">⚡ Electrical Systems</h5>
													<div className="text-sm bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-yellow-500">
														{analysisResults.mepSystems.electrical}
													</div>
												</div>
											)}
											{analysisResults.mepSystems?.plumbing && (
												<div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
													<h5 className="font-medium text-blue-900 dark:text-blue-200 mb-2">🚿 Plumbing Systems</h5>
													<div className="text-sm bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-blue-500">
														{analysisResults.mepSystems.plumbing}
													</div>
												</div>
											)}
										</CardContent>
									</Card>
								)}

								{/* Text Annotations & Technical Notes */}
								{(analysisResults.annotations || analysisResults.technicalNotes || analysisResults.textExtraction) && (
									<Card className="border-gray-200 dark:border-gray-800">
										<CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20">
											<CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
												<FileText className="h-5 w-5" />
												📝 Annotations & Technical Notes
											</CardTitle>
										</CardHeader>
										<CardContent className="pt-6 space-y-4">
											{analysisResults.annotations && (
												<div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200">
													<h5 className="font-medium text-gray-900 dark:text-gray-200 mb-2">Plan Annotations</h5>
													<div className="text-sm bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-gray-500">
														{analysisResults.annotations}
													</div>
												</div>
											)}
											{analysisResults.technicalNotes && (
												<div className="p-3 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200">
													<h5 className="font-medium text-slate-900 dark:text-slate-200 mb-2">Technical Specifications</h5>
													<div className="text-sm bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-slate-500">
														{analysisResults.technicalNotes}
													</div>
												</div>
											)}
											{analysisResults.textExtraction && (
												<div className="p-3 bg-neutral-50 dark:bg-neutral-900/20 rounded-lg border border-neutral-200">
													<h5 className="font-medium text-neutral-900 dark:text-neutral-200 mb-2">Extracted Text & Labels</h5>
													<div className="text-sm bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-neutral-500">
														{analysisResults.textExtraction}
													</div>
												</div>
											)}
										</CardContent>
									</Card>
								)}

								{/* Quality Assessment */}
								{analysisResults.qualityAssessment && (
									<Card className="border-yellow-200 dark:border-yellow-800">
										<CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
											<CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
												<Eye className="h-5 w-5" />
												🔍 Analysis Quality Report
											</CardTitle>
										</CardHeader>
										<CardContent className="pt-6">
											<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
												<div className="text-center">
													<div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${
														analysisResults.qualityAssessment.imageClarity === 'excellent' ? 'bg-green-100 text-green-600' :
														analysisResults.qualityAssessment.imageClarity === 'good' ? 'bg-blue-100 text-blue-600' :
														analysisResults.qualityAssessment.imageClarity === 'fair' ? 'bg-yellow-100 text-yellow-600' :
														'bg-red-100 text-red-600'
													}`}>
														{analysisResults.qualityAssessment.imageClarity === 'excellent' ? '🌟' :
														 analysisResults.qualityAssessment.imageClarity === 'good' ? '👍' :
														 analysisResults.qualityAssessment.imageClarity === 'fair' ? '⚠️' : '❌'}
													</div>
													<p className="font-medium text-sm">Image Clarity</p>
													<p className="text-xs text-gray-600 capitalize">{analysisResults.qualityAssessment.imageClarity}</p>
												</div>

												<div className="text-center">
													<div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 bg-blue-100 text-blue-600">
														{analysisResults.qualityAssessment.completeness || 0}%
													</div>
													<p className="font-medium text-sm">Completeness</p>
													<p className="text-xs text-gray-600">Information Available</p>
												</div>

												<div className="text-center">
													<div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${
														analysisResults.qualityAssessment.dimensionsAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
													}`}>
														{analysisResults.qualityAssessment.dimensionsAvailable ? '📏' : '❌'}
													</div>
													<p className="font-medium text-sm">Dimensions</p>
													<p className="text-xs text-gray-600">{analysisResults.qualityAssessment.dimensionsAvailable ? 'Available' : 'Missing'}</p>
												</div>

												<div className="text-center">
													<div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${
														analysisResults.qualityAssessment.sufficient ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
													}`}>
														{analysisResults.qualityAssessment.sufficient ? '✅' : '⚠️'}
													</div>
													<p className="font-medium text-sm">Assessment</p>
													<p className="text-xs text-gray-600">{analysisResults.qualityAssessment.sufficient ? 'Sufficient' : 'Needs More Data'}</p>
												</div>
											</div>
										</CardContent>
									</Card>
								)}
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Upload Area */}
			<Card className="border-dashed border-2 border-blue-300 dark:border-blue-600">
				<CardContent className="pt-6">
					<div
						className="cursor-pointer transition-all duration-200 rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50"
						onDragOver={handleDragOver}
						onDrop={handleDrop}
						onClick={() => document.getElementById('plan-upload').click()}
					>
						<Upload className="mx-auto h-12 w-12 mb-4 text-gray-400" />
						
						<div>
							<p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
								{uploadedPlans.length > 0 ? 'Add More Plans' : 'Upload Architectural Plans'}
							</p>
							<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
								Drag & drop your plans here, or click to select files
							</p>
							<Button variant="outline" className="mb-4">
								<Building2 className="h-4 w-4 mr-2" />
								Choose Files
							</Button>
							<div className="flex justify-center space-x-4 text-xs text-gray-400">
								<span>• Floor Plans</span>
								<span>• Elevations</span>
								<span>• Sections</span>
								<span>• Site Plans</span>
								<span>• Structural Drawings</span>
							</div>
						</div>
						<input
							id="plan-upload"
							type="file"
							multiple
							accept="image/*,.pdf"
							className="hidden"
							onChange={(e) => handleFileUpload(e.target.files)}
						/>
					</div>

					{isUploading && (
						<div className="mt-4">
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm text-gray-600 dark:text-gray-400">Uploading plans...</span>
								<span className="text-sm text-gray-600 dark:text-gray-400">{uploadProgress}%</span>
							</div>
							<Progress value={uploadProgress} className="w-full" />
						</div>
					)}
				</CardContent>
			</Card>


			{/* Instructions */}
			<Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
				<CardContent className="pt-6">
					<div className="flex items-start gap-3">
						<AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
						<div>
							<h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
								Tips for Better Analysis
							</h4>
							<ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
								<li>• Upload clear, high-resolution images of your plans</li>
								<li>• Include floor plans, elevations, and structural drawings if available</li>
								<li>• PDFs are supported for digital architectural drawings</li>
								<li>• Our AI will analyze dimensions, structural elements, and building characteristics</li>
								<li>• Multiple plan types help provide a more comprehensive assessment</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Navigation */}
			<div className="flex justify-between pt-4">
				<Link href="/assessment/2">
					<Button variant="outline" className="gap-2">
						<ArrowLeft className="h-4 w-4" /> Back to Environmental Data
					</Button>
				</Link>

				<Button 
					onClick={onNext} 
					className="gap-2"
				>
					Continue to Building Photos
					<ArrowRight className="h-4 w-4" />
				</Button>
			</div>

			{/* Plan Viewer Modal */}
			{selectedPlan && (
				<div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
					<div className="relative max-w-4xl max-h-[90vh] w-full">
						<Button
							variant="secondary"
							size="sm"
							className="absolute -top-12 right-0 z-10"
							onClick={() => setSelectedPlan(null)}
						>
							<X className="h-4 w-4" />
						</Button>

						<div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
							<div className="aspect-video flex items-center justify-center">
								{selectedPlan.type === 'application/pdf' ? (
									<div className="text-center p-8">
										<FileText className="h-24 w-24 text-red-500 mx-auto mb-4" />
										<h3 className="text-lg font-medium mb-2">{selectedPlan.name}</h3>
										<p className="text-gray-600 dark:text-gray-400 mb-4">PDF files cannot be previewed here</p>
										<Button variant="outline">
											<Download className="h-4 w-4 mr-2" />
											Download to View
										</Button>
									</div>
								) : (
									<img
										src={selectedPlan.preview}
										alt={selectedPlan.name}
										className="w-full h-full object-contain max-h-[70vh]"
									/>
								)}
							</div>
							
							<div className="p-4 border-t border-gray-200 dark:border-gray-700">
								<div className="flex items-center justify-between">
									<div>
										<div className="flex items-center gap-2 mb-1">
											<Badge className={getCategoryColor(selectedPlan.category)}>
												{getPlanIcon(selectedPlan.category)}
												<span className="ml-1">{selectedPlan.category}</span>
											</Badge>
										</div>
										<h3 className="font-medium">{selectedPlan.name}</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
											Size: {formatFileSize(selectedPlan.size)}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ArchitecturePlanStep;