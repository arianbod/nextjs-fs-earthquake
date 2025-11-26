import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert-dialog';
import {
	analyzeImagesWithAI,
	processBuildingPhotoAnalysis,
	prepareImageForAnalysis,
} from '@/lib/imageAnalysis';
import {
	Upload,
	Camera,
	X,
	CheckCircle,
	CheckCircle2,
	AlertCircle,
	Loader2,
	Image as ImageIcon,
	Zap,
	Building,
	Eye,
	ArrowLeft,
	ArrowRight,
	Sparkles,
	FileImage,
	CloudUpload,
	Brain,
	FileCheck,
	Info,
	AlertTriangle,
	Layers,
} from 'lucide-react';
import Link from 'next/link';

const AIPhotoStep = ({ userInput, updateUserInput, onNext }) => {
	const [uploadedImages, setUploadedImages] = useState([]);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [analysisProgress, setAnalysisProgress] = useState(0);
	const [analysisStage, setAnalysisStage] = useState('');
	const [analysisResults, setAnalysisResults] = useState(null);
	const [dragOver, setDragOver] = useState(false);
	const [error, setError] = useState(null);
	const [detailedError, setDetailedError] = useState(null);

	// Analysis stages for better feedback
	const stages = [
		{ id: 'upload', label: 'Uploading Images', icon: CloudUpload },
		{ id: 'prepare', label: 'Preparing for Analysis', icon: FileImage },
		{ id: 'analyze', label: 'AI Analysis in Progress', icon: Brain },
		{ id: 'process', label: 'Processing Results', icon: FileCheck },
		{ id: 'complete', label: 'Analysis Complete', icon: CheckCircle2 },
	];

	// Handle file upload with validation
	const handleFileUpload = useCallback(async (files) => {
		setError(null);
		const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
		const maxSize = 10 * 1024 * 1024; // 10MB
		const maxFiles = 10;

		const validFiles = [];
		const errors = [];

		for (const file of Array.from(files)) {
			if (!validTypes.includes(file.type)) {
				errors.push(`${file.name}: Invalid file type`);
				continue;
			}
			if (file.size > maxSize) {
				errors.push(`${file.name}: File too large (max 10MB)`);
				continue;
			}
			validFiles.push(file);
		}

		if (uploadedImages.length + validFiles.length > maxFiles) {
			errors.push(`Maximum ${maxFiles} images allowed`);
			validFiles.splice(maxFiles - uploadedImages.length);
		}

		if (errors.length > 0) {
			setError(errors.join(', '));
		}

		const newImages = validFiles.map(file => ({
			id: Math.random().toString(36).substr(2, 9),
			file,
			url: URL.createObjectURL(file),
			name: file.name,
			size: file.size,
			type: file.type,
			analyzed: false,
			uploadProgress: 0,
		}));

		setUploadedImages(prev => [...prev, ...newImages]);
	}, [uploadedImages.length]);

	// Handle drag and drop
	const handleDrop = useCallback((e) => {
		e.preventDefault();
		setDragOver(false);
		
		const files = Array.from(e.dataTransfer.files).filter(file => 
			file.type.startsWith('image/')
		);
		
		if (files.length > 0) {
			handleFileUpload(files);
		}
	}, [handleFileUpload]);

	const handleDragOver = useCallback((e) => {
		e.preventDefault();
		setDragOver(true);
	}, []);

	const handleDragLeave = useCallback((e) => {
		e.preventDefault();
		setDragOver(false);
	}, []);

	// Remove uploaded image
	const removeImage = (imageId) => {
		setUploadedImages(prev => {
			const updated = prev.filter(img => img.id !== imageId);
			const imageToRemove = prev.find(img => img.id === imageId);
			if (imageToRemove) {
				URL.revokeObjectURL(imageToRemove.url);
			}
			return updated;
		});
	};

	// Enhanced analyze function with detailed progress
	const analyzeImages = async () => {
		if (uploadedImages.length === 0) return;

		setIsAnalyzing(true);
		setAnalysisProgress(0);
		setAnalysisResults(null);
		setError(null);
		setDetailedError(null);
		setAnalysisStage('upload');

		try {
			// Stage 1: Upload (0-25%)
			setAnalysisStage('upload');
			setAnalysisProgress(10);
			
			// Stage 2: Prepare (25-40%)
			setAnalysisStage('prepare');
			setAnalysisProgress(25);
			
			const preparedImages = await Promise.all(
				uploadedImages.map(async (img) => {
					try {
						return await prepareImageForAnalysis(img.file);
					} catch (err) {
						console.error(`Error preparing ${img.name}:`, err);
						throw new Error(`Failed to prepare ${img.name}: ${err.message}`);
					}
				})
			);
			
			setAnalysisProgress(40);

			// Stage 3: Analyze (40-80%)
			setAnalysisStage('analyze');
			setAnalysisProgress(50);
			
			const result = await analyzeImagesWithAI(preparedImages, 'building');
			
			setAnalysisProgress(80);

			// Stage 4: Process (80-95%)
			setAnalysisStage('process');
			setAnalysisProgress(85);
			
			// Check if result and result.analysis exist before processing
			if (!result || !result.analysis) {
				throw new Error('Invalid response from AI analysis');
			}
			
			const processedResults = processBuildingPhotoAnalysis(result);
			
			setAnalysisProgress(95);

			// Stage 5: Complete (95-100%)
			setAnalysisStage('complete');
			setAnalysisProgress(100);
			
			setAnalysisResults(processedResults);

			// Mark images as analyzed
			setUploadedImages(prev => 
				prev.map(img => ({ ...img, analyzed: true }))
			);

			// Save to user context with proper field mapping
			if (processedResults) {
				// Parse number of stories if it's a string
				let stories = processedResults.buildingCharacteristics?.stories;
				if (typeof stories === 'string' && !isNaN(parseInt(stories))) {
					stories = parseInt(stories);
				}
				
				// Map AI data to form fields
				const mappedData = {
					aiAnalysisData: processedResults,
					aiAnalysisComplete: true,
					// Building Info fields
					numberOfStories: stories || null,
					// Structural System fields (for later steps)
					structuralSystem: processedResults.buildingCharacteristics?.structuralSystem || null,
					buildingType: processedResults.buildingCharacteristics?.type || null,
					// Dimensions
					buildingLength: processedResults.dimensions?.length || null,
					buildingWidth: processedResults.dimensions?.width || null,
					buildingHeight: processedResults.dimensions?.height || null,
					// Material condition
					materialCondition: processedResults.buildingCharacteristics?.materialCondition || null,
					// Construction period (try to extract year)
					constructionPeriod: processedResults.buildingCharacteristics?.constructionPeriod || null,
				};
				
				console.log('Updating user input with AI data:', mappedData);
				updateUserInput(mappedData);
			}

		} catch (error) {
			console.error('Analysis error:', error);
			
			// Detailed error information for development
			setDetailedError({
				message: error.message || 'Unknown error occurred',
				stack: error.stack,
				timestamp: new Date().toISOString(),
				stage: analysisStage,
				images: uploadedImages.length,
			});
			
			// User-friendly error message
			if (error.message?.includes('Cannot read properties of undefined')) {
				setError('The AI analysis returned incomplete data. Please try again with clearer photos.');
			} else if (error.message?.includes('Failed to prepare')) {
				setError('Some images could not be processed. Please check the file formats.');
			} else if (error.message?.includes('Failed to analyze')) {
				setError('AI analysis failed. Please check your internet connection and try again.');
			} else {
				setError(error.message || 'Failed to analyze images. Please try again.');
			}
			
			setAnalysisResults(null);
			setAnalysisStage('');
		} finally {
			setIsAnalyzing(false);
		}
	};

	const canProceed = analysisResults && !analysisResults.error;

	return (
		<div className='max-w-6xl mx-auto space-y-6'>
			{/* Header */}
			<div className='text-center mb-8'>
				<div className='inline-flex items-center justify-center p-3 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full mb-4'>
					<Sparkles className='h-8 w-8 text-purple-600 dark:text-purple-400' />
				</div>
				<h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
					AI-Powered Building Analysis
				</h1>
				<p className='text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
					Our AI will analyze your photos combined with location and environmental data for comprehensive assessment
				</p>
				<div className='mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto'>
					<div className='p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
						<CheckCircle className='h-5 w-5 text-green-600 dark:text-green-400 mb-1' />
						<p className='text-sm font-medium text-green-800 dark:text-green-200'>Save Time</p>
						<p className='text-xs text-green-600 dark:text-green-400'>Skip manual form filling</p>
					</div>
					<div className='p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
						<Brain className='h-5 w-5 text-blue-600 dark:text-blue-400 mb-1' />
						<p className='text-sm font-medium text-blue-800 dark:text-blue-200'>AI Accuracy</p>
						<p className='text-xs text-blue-600 dark:text-blue-400'>Advanced vision analysis</p>
					</div>
					<div className='p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg'>
						<Eye className='h-5 w-5 text-purple-600 dark:text-purple-400 mb-1' />
						<p className='text-sm font-medium text-purple-800 dark:text-purple-200'>Transparency</p>
						<p className='text-xs text-purple-600 dark:text-purple-400'>Review detected data</p>
					</div>
				</div>
			</div>

			{/* Uploaded Images Preview - Above Upload Area */}
			{uploadedImages.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center justify-between'>
							<span className='flex items-center gap-2'>
								<ImageIcon className='h-5 w-5' />
								Uploaded Photos ({uploadedImages.length}/10)
							</span>
							{uploadedImages.length > 0 && !isAnalyzing && (
								<Button
									size='sm'
									variant='outline'
									onClick={() => setUploadedImages([])}
									className='text-red-600 hover:text-red-700'
								>
									Clear All
								</Button>
							)}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'>
							{uploadedImages.map((image) => (
								<div key={image.id} className='relative group'>
									<div className='aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700'>
										<img
											src={image.url}
											alt={image.name}
											className='w-full h-full object-cover'
										/>
									</div>
									<div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity rounded-lg flex items-center justify-center'>
										{!isAnalyzing && (
											<Button
												variant='destructive'
												size='sm'
												className='opacity-0 group-hover:opacity-100 transition-opacity'
												onClick={() => removeImage(image.id)}
											>
												<X className='h-4 w-4' />
											</Button>
										)}
									</div>
									{image.analyzed && (
										<div className='absolute top-2 right-2'>
											<Badge variant='success' className='text-xs bg-green-600'>
												<CheckCircle className='h-3 w-3 mr-1' />
												Analyzed
											</Badge>
										</div>
									)}
									<div className='mt-2'>
										<p className='text-xs text-gray-600 dark:text-gray-400 truncate'>
											{image.name}
										</p>
										<p className='text-xs text-gray-500'>
											{(image.size / 1024 / 1024).toFixed(1)}MB
										</p>
									</div>
								</div>
							))}
						</div>

						<div className='mt-6 flex justify-center'>
							<Button
								onClick={analyzeImages}
								disabled={isAnalyzing || uploadedImages.length === 0}
								size='lg'
								className='gap-2'
							>
								{isAnalyzing ? (
									<>
										<Loader2 className='h-4 w-4 animate-spin' />
										Analyzing...
									</>
								) : (
									<>
										<Zap className='h-4 w-4' />
										Analyze with AI
									</>
								)}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Upload Area */}
			<Card className='border-dashed border-2 border-gray-300 dark:border-gray-600'>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Camera className='h-5 w-5 text-blue-600' />
						{uploadedImages.length > 0 ? 'Add More Photos' : 'Upload Building Photos'}
					</CardTitle>
					<p className='text-sm text-gray-600 dark:text-gray-400'>
						{uploadedImages.length > 0 
							? `You've uploaded ${uploadedImages.length} photo${uploadedImages.length !== 1 ? 's' : ''}. Add more angles for better analysis.`
							: 'Upload multiple angles of your building for comprehensive analysis. The more photos you provide, the more accurate our AI analysis will be.'
						}
					</p>
				</CardHeader>
				<CardContent>
					<div
						className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
							dragOver 
								? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' 
								: 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
						}`}
						onDrop={handleDrop}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
					>
						<div className='space-y-4'>
							<div className='flex justify-center'>
								<div className='p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full'>
									<Upload className='h-12 w-12 text-blue-600 dark:text-blue-400' />
								</div>
							</div>
							<div>
								<h3 className='text-lg font-medium text-gray-900 dark:text-white'>
									Upload photos from different angles
								</h3>
								<p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
									Supports JPG, PNG, WEBP, HEIC formats • Maximum 10MB per file • Up to 10 photos
								</p>
								<div className='grid grid-cols-2 md:grid-cols-3 gap-2 mt-4 text-xs text-gray-600 dark:text-gray-400'>
									<div className='p-2 bg-gray-50 dark:bg-gray-800 rounded flex items-center gap-1'>
										<Building className='h-3 w-3' /> Front View
									</div>
									<div className='p-2 bg-gray-50 dark:bg-gray-800 rounded flex items-center gap-1'>
										<Building className='h-3 w-3' /> Side Views
									</div>
									<div className='p-2 bg-gray-50 dark:bg-gray-800 rounded flex items-center gap-1'>
										<Building className='h-3 w-3' /> Corner/Details
									</div>
								</div>
							</div>
							<div className='flex justify-center gap-3'>
								<Button
									variant='default'
									onClick={() => document.getElementById('photo-upload').click()}
									className='gap-2'
								>
									<Camera className='h-4 w-4' />
									Choose Photos
								</Button>
								<Button
									variant='outline'
									onClick={() => document.getElementById('photo-upload').click()}
									className='gap-2'
								>
									<FileImage className='h-4 w-4' />
									Browse Files
								</Button>
							</div>
							<input
								id='photo-upload'
								type='file'
								multiple
								accept='image/*'
								className='hidden'
								onChange={(e) => handleFileUpload(e.target.files)}
							/>
						</div>
					</div>

					{/* Photo Guidelines */}
					<div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
							<h4 className='font-medium text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2'>
								<Camera className='h-4 w-4' />
								Recommended Photos
							</h4>
							<ul className='space-y-1.5 text-sm text-blue-800 dark:text-blue-300'>
								<li className='flex items-center gap-2'>
									<CheckCircle2 className='h-3 w-3 flex-shrink-0' />
									Full building facade (front view)
								</li>
								<li className='flex items-center gap-2'>
									<CheckCircle2 className='h-3 w-3 flex-shrink-0' />
									Side views showing full height
								</li>
								<li className='flex items-center gap-2'>
									<CheckCircle2 className='h-3 w-3 flex-shrink-0' />
									Ground floor and foundation
								</li>
								<li className='flex items-center gap-2'>
									<CheckCircle2 className='h-3 w-3 flex-shrink-0' />
									Building corners and joints
								</li>
								<li className='flex items-center gap-2'>
									<CheckCircle2 className='h-3 w-3 flex-shrink-0' />
									Adjacent buildings (if any)
								</li>
								<li className='flex items-center gap-2'>
									<CheckCircle2 className='h-3 w-3 flex-shrink-0' />
									Visible structural elements
								</li>
							</ul>
						</div>
						<div className='p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg'>
							<h4 className='font-medium text-amber-900 dark:text-amber-200 mb-3 flex items-center gap-2'>
								<AlertTriangle className='h-4 w-4' />
								Photo Tips for Best Results
							</h4>
							<ul className='space-y-1.5 text-sm text-amber-800 dark:text-amber-300'>
								<li className='flex items-center gap-2'>
									<Info className='h-3 w-3 flex-shrink-0' />
									Take photos during daylight
								</li>
								<li className='flex items-center gap-2'>
									<Info className='h-3 w-3 flex-shrink-0' />
									Include entire building in frame
								</li>
								<li className='flex items-center gap-2'>
									<Info className='h-3 w-3 flex-shrink-0' />
									Avoid extreme angles or distortion
								</li>
								<li className='flex items-center gap-2'>
									<Info className='h-3 w-3 flex-shrink-0' />
									Clear photos without obstructions
								</li>
								<li className='flex items-center gap-2'>
									<Info className='h-3 w-3 flex-shrink-0' />
									Multiple angles for accuracy
								</li>
								<li className='flex items-center gap-2'>
									<Info className='h-3 w-3 flex-shrink-0' />
									High resolution preferred
								</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Error Display */}
			{error && (
				<Card className='border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'>
					<CardContent className='pt-6'>
						<div className='flex items-start gap-3'>
							<AlertCircle className='h-5 w-5 text-red-600 mt-0.5 flex-shrink-0' />
							<div className='flex-1'>
								<h4 className='font-medium text-red-800 dark:text-red-200'>
									Error Occurred
								</h4>
								<p className='text-sm text-red-600 dark:text-red-400 mt-1'>
									{error}
								</p>
								{detailedError && (
									<details className='mt-3'>
										<summary className='text-xs text-red-500 cursor-pointer hover:text-red-600'>
											Show technical details (for developers)
										</summary>
										<pre className='mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs overflow-auto'>
											{JSON.stringify(detailedError, null, 2)}
										</pre>
									</details>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			)}


			{/* Analysis Progress with Stages */}
			{isAnalyzing && (
				<Card className='border-blue-200 dark:border-blue-800'>
					<CardContent className='pt-6'>
						<div className='space-y-4'>
							<div className='flex items-center justify-between mb-2'>
								<span className='font-medium text-blue-900 dark:text-blue-200'>
									AI Analysis in Progress
								</span>
								<Badge variant='outline' className='gap-1'>
									<Loader2 className='h-3 w-3 animate-spin' />
									{analysisProgress}%
								</Badge>
							</div>
							
							<Progress value={analysisProgress} className='h-3' />
							
							{/* Stage Indicators */}
							<div className='flex justify-between mt-4'>
								{stages.map((stage, index) => {
									const Icon = stage.icon;
									const isActive = stage.id === analysisStage;
									const isComplete = stages.findIndex(s => s.id === analysisStage) > index;
									
									return (
										<div 
											key={stage.id} 
											className={`flex flex-col items-center text-xs ${
												isActive ? 'text-blue-600 dark:text-blue-400' : 
												isComplete ? 'text-green-600 dark:text-green-400' : 
												'text-gray-400'
											}`}
										>
											<div className={`p-2 rounded-full mb-1 ${
												isActive ? 'bg-blue-100 dark:bg-blue-900/30' : 
												isComplete ? 'bg-green-100 dark:bg-green-900/30' : 
												'bg-gray-100 dark:bg-gray-800'
											}`}>
												<Icon className='h-4 w-4' />
											</div>
											<span className='text-center max-w-[80px]'>{stage.label}</span>
										</div>
									);
								})}
							</div>
							
							<p className='text-sm text-center text-gray-600 dark:text-gray-400 mt-2'>
								{analysisStage === 'upload' && 'Uploading your images securely...'}
								{analysisStage === 'prepare' && 'Optimizing images for AI analysis...'}
								{analysisStage === 'analyze' && 'AI is analyzing your photos + Google Street View + environmental data...'}
								{analysisStage === 'process' && 'Processing and structuring results...'}
								{analysisStage === 'complete' && 'Finalizing analysis results...'}
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Analysis Results - Simplified: Just show key detected data */}
			{analysisResults && !analysisResults.error && (
				<Card className='border-green-200 dark:border-green-800'>
					<CardContent className='pt-6'>
						{/* Success Header */}
						<div className='flex items-center gap-3 mb-4'>
							<div className='p-2 bg-green-100 dark:bg-green-900/30 rounded-full'>
								<CheckCircle className='h-6 w-6 text-green-600' />
							</div>
							<div>
								<h3 className='font-semibold text-green-800 dark:text-green-200'>
									AI Analysis Complete
								</h3>
								<p className='text-sm text-green-600 dark:text-green-400'>
									Detected building info from {uploadedImages.length} photo(s)
								</p>
							</div>
							<Badge variant='outline' className='ml-auto'>
								{analysisResults.confidence?.toUpperCase() || 'MEDIUM'}
							</Badge>
						</div>

						{/* Key Extracted Data - Simple Grid */}
						<div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-4'>
							<div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center'>
								<div className='text-2xl font-bold text-gray-900 dark:text-white'>
									{analysisResults.buildingCharacteristics?.stories || '?'}
								</div>
								<div className='text-xs text-gray-500'>Stories</div>
							</div>
							<div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center'>
								<div className='text-sm font-medium text-gray-900 dark:text-white truncate'>
									{analysisResults.buildingCharacteristics?.type?.split(' ')[0] || 'Unknown'}
								</div>
								<div className='text-xs text-gray-500'>Type</div>
							</div>
							<div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center'>
								<div className='text-sm font-medium text-gray-900 dark:text-white'>
									{analysisResults.buildingCharacteristics?.constructionPeriod || 'Unknown'}
								</div>
								<div className='text-xs text-gray-500'>Era</div>
							</div>
							<div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center'>
								<div className='text-sm font-medium text-gray-900 dark:text-white capitalize'>
									{analysisResults.buildingCharacteristics?.materialCondition || 'Unknown'}
								</div>
								<div className='text-xs text-gray-500'>Condition</div>
							</div>
						</div>

						{/* Simple info message */}
						<p className='text-sm text-gray-600 dark:text-gray-400 text-center'>
							You'll confirm these details in the next step
						</p>
					</CardContent>
				</Card>
			)}

			{/* Navigation */}
			<div className='flex justify-between pt-4'>
				<Link href='/assessment/1'>
					<Button variant='outline' className='gap-2'>
						<ArrowLeft className='h-4 w-4' /> Back
					</Button>
				</Link>

				<Button
					onClick={onNext}
					disabled={!canProceed}
					className='gap-2'
				>
					{canProceed ? 'Continue with AI Data' : 'Analyze Photos First'}
					<ArrowRight className='h-4 w-4' />
				</Button>
			</div>
		</div>
	);
};

export default AIPhotoStep;