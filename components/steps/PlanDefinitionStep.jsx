// components/steps/PlanDefinitionStep.jsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Data from '@/utils/Data.json';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserInput } from '@/context/UserInputContext';
import { MyMapComponent } from '@/components/MyMapComponent';
import {
	analyzeImagesWithAI,
	processFloorPlanAnalysis,
	prepareImageForAnalysis,
	validateAnalysisResults,
} from '@/lib/imageAnalysis';
import {
	ArrowLeft,
	ArrowRight,
	MapPin,
	Upload,
	Edit3,
	Map,
	Camera,
	FileText,
	CheckCircle,
	AlertCircle,
	Save,
	Loader2,
} from 'lucide-react';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@/components/ui/tabs';

const PlanDefinitionStep = ({ onNext }) => {
	const { userInput, updateUserInput } = useUserInput();
	const stepFiveData = Data.steps.find((step) => step.step === 5);
	const [activeMethod, setActiveMethod] = useState('confirm');
	const [isConfirmed, setIsConfirmed] = useState(false);
	const [uploadedImage, setUploadedImage] = useState(null);
	const [analysisResult, setAnalysisResult] = useState(null);
	const [showSaveIndicator, setShowSaveIndicator] = useState(false);

	// Show save indicator when data changes
	useEffect(() => {
		if (Object.keys(userInput).length > 0) {
			setShowSaveIndicator(true);
			const timer = setTimeout(() => setShowSaveIndicator(false), 2000);
			return () => clearTimeout(timer);
		}
	}, [userInput]);

	// Auto-detected building data from Step 1 (location + satellite analysis)
	const autoDetectedData = {
		address: userInput.address || "Building Address",
		coordinates: `${userInput.latitude?.toFixed(4) || ''}, ${userInput.longitude?.toFixed(4) || ''}`,
		estimatedLength: userInput.estimatedLength || 25,
		estimatedWidth: userInput.estimatedWidth || 15, 
		estimatedStories: userInput.estimatedStories || 3,
		buildingType: userInput.buildingType || 'Rectangular',
		confidence: 0.75 // Satellite analysis confidence
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		updateUserInput({ [name]: value });
	};

	// Handle confirmation of auto-detected data
	const handleConfirmData = () => {
		setIsConfirmed(true);
		updateUserInput({
			buildingLength: autoDetectedData.estimatedLength,
			buildingWidth: autoDetectedData.estimatedWidth,
			numberOfStories: autoDetectedData.estimatedStories,
			buildingType: autoDetectedData.buildingType,
			dataSource: 'auto-detected'
		});
	};

	// Handle need for refinement
	const handleNeedsRefinement = () => {
		setActiveMethod('upload');
	};

	// Handle image upload and AI analysis
	const handleImageUpload = async (file) => {
		try {
			setUploadedImage(file);
			setAnalysisResult(null);
			
			// Show loading state
			setAnalysisResult({ loading: true });
			
			// Prepare image for analysis
			const preparedImage = await prepareImageForAnalysis(file);
			
			// Send to AI for floor plan analysis
			const result = await analyzeImagesWithAI([preparedImage], 'floorPlan');
			
			// Process the results
			const processedData = processFloorPlanAnalysis(result);
			
			// Validate results
			if (validateAnalysisResults(processedData)) {
				setAnalysisResult({
					...processedData,
					confidence: processedData.confidence,
					extractedElements: Object.keys(processedData).filter(k => processedData[k] !== null),
				});
				
				// Update user input with extracted data
				updateUserInput({
					buildingLength: processedData.buildingLength,
					buildingWidth: processedData.buildingWidth,
					numberOfStories: processedData.numberOfStories,
					columnSpacing: processedData.columnSpacing,
					structuralSystem: processedData.structuralSystem,
					foundationType: processedData.foundationType,
					dataSource: 'ai-floorplan-analysis',
				});
			} else {
				// Show error if validation fails
				setAnalysisResult({
					error: true,
					message: 'Could not extract sufficient information from the image. Please try a clearer image or enter details manually.',
				});
			}
		} catch (error) {
			console.error('Error analyzing floor plan:', error);
			setAnalysisResult({
				error: true,
				message: error.message || 'Failed to analyze the floor plan. Please try again.',
			});
		}
	};

	// Structural building types for manual input
	const structuralTypes = [
		{ name: 'Concrete Frame', description: 'Reinforced concrete columns & beams' },
		{ name: 'Steel Frame', description: 'Steel columns with steel/concrete beams' },
		{ name: 'Masonry', description: 'Load-bearing walls (brick/block)' },
		{ name: 'Timber Frame', description: 'Wood structural elements' }
	];

	const buildingTemplates = [
		{ 
			name: 'Small House', 
			length: 12, width: 8, stories: 2, 
			structural: 'Timber Frame',
			description: '2-story residential'
		},
		{ 
			name: 'Apartment', 
			length: 25, width: 15, stories: 4, 
			structural: 'Concrete Frame',
			description: '4-story residential'
		},
		{ 
			name: 'Office Building', 
			length: 30, width: 20, stories: 6, 
			structural: 'Steel Frame',
			description: '6-story commercial'
		},
		{ 
			name: 'Warehouse', 
			length: 50, width: 30, stories: 1, 
			structural: 'Steel Frame',
			description: '1-story industrial'
		}
	];

	const loadBuildingTemplate = (template) => {
		updateUserInput({
			buildingLength: template.length,
			buildingWidth: template.width,
			numberOfStories: template.stories,
			structuralSystem: template.structural,
			dataSource: 'template'
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onNext();
	};

	// Validation for new flow
	const isFormValid = () => {
		if (activeMethod === 'confirm') {
			return isConfirmed;
		}
		return userInput.buildingLength && 
			   userInput.buildingWidth && 
			   userInput.numberOfStories;
	};

	const getValidationMessage = () => {
		if (activeMethod === 'confirm' && !isConfirmed) {
			return "Please confirm the building information or choose to refine it";
		}
		if (!userInput.buildingLength) return "Please specify building length";
		if (!userInput.buildingWidth) return "Please specify building width";
		if (!userInput.numberOfStories) return "Please specify number of stories";
		return "";
	};

	return (
		<div className='max-w-3xl mx-auto'>
			{/* Save Indicator */}
			{showSaveIndicator && (
				<div className="fixed top-4 right-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2 shadow-lg z-50">
					<div className="flex items-center gap-2 text-green-700 dark:text-green-300">
						<Save className="h-4 w-4" />
						<span className="text-sm font-medium">Progress saved</span>
					</div>
				</div>
			)}

			<div className='text-center mb-6'>
				<div className='inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4'>
					<CheckCircle className='h-6 w-6 text-blue-600 dark:text-blue-400' />
				</div>
				<h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
					Confirm Building Details
				</h1>
				<p className='text-lg text-gray-600 dark:text-gray-300'>
					We've analyzed your building location. Please confirm or refine the details.
				</p>
			</div>

				{/* Step 1: Show Confirmation (if not confirmed yet) */}
			{activeMethod === 'confirm' && !isConfirmed && (
				<div className="space-y-6">
					{/* Building Location and Dimensions */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MapPin className="h-5 w-5 text-blue-600" />
								Auto-Detected Building Information
							</CardTitle>
							<CardDescription>
								Based on your location from Step 1, we estimated these dimensions.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
								<div className="text-sm"><strong>Location:</strong> {autoDetectedData.address}</div>
							</div>
							
							<div className="grid grid-cols-3 gap-4 mb-4">
								<div className="text-center p-4 border rounded-lg">
									<div className="text-2xl font-bold text-green-600">{autoDetectedData.estimatedLength}m</div>
									<div className="text-sm text-gray-600">Length</div>
								</div>
								<div className="text-center p-4 border rounded-lg">
									<div className="text-2xl font-bold text-blue-600">{autoDetectedData.estimatedWidth}m</div>
									<div className="text-sm text-gray-600">Width</div>
								</div>
								<div className="text-center p-4 border rounded-lg">
									<div className="text-2xl font-bold text-purple-600">{autoDetectedData.estimatedStories}</div>
									<div className="text-sm text-gray-600">Stories</div>
								</div>
							</div>

							<div className="flex items-center gap-2 text-sm text-amber-600 mb-4">
								<AlertCircle className="h-4 w-4" />
								<span>Confidence: {Math.round(autoDetectedData.confidence * 100)}%</span>
							</div>

							<div className="space-y-3">
								<Button 
									onClick={handleConfirmData}
									className="w-full bg-green-600 hover:bg-green-700"
									size="lg"
								>
									<CheckCircle className="h-5 w-5 mr-2" />
									Yes, this looks correct
								</Button>
								
								<Button 
									variant="outline"
									onClick={handleNeedsRefinement}
									className="w-full"
									size="lg"
								>
									<Upload className="h-5 w-5 mr-2" />
									No, I need more accurate data
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Step 2: Upload Plans (only if user needs refinement) */}
			{activeMethod === 'upload' && (
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Upload className="h-5 w-5 text-purple-600" />
								Upload Building Plans for AI Analysis
							</CardTitle>
							<CardDescription>
								Upload floor plans, architectural drawings, or photos. Our AI will extract precise dimensions.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
								<input
									type="file"
									accept="image/*,.pdf,.dwg"
									onChange={(e) => handleImageUpload(e.target.files[0])}
									className="hidden"
									id="file-upload"
								/>
								<label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
									<FileText className="h-12 w-12 text-gray-400" />
									<div>
										<p className="font-medium">Drop files here or click to browse</p>
										<p className="text-sm text-gray-500">JPG, PNG, PDF, DWG files</p>
									</div>
								</label>
							</div>
							
							{analysisResult && (
								<div className="mt-4">
									{analysisResult.loading && (
										<div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
											<div className="flex items-center gap-2">
												<Loader2 className="h-4 w-4 animate-spin text-blue-600" />
												<span className="font-medium">Analyzing floor plan with AI...</span>
											</div>
											<p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
												Extracting dimensions and structural information from your plan
											</p>
										</div>
									)}
									
									{analysisResult.error && (
										<div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
											<div className="flex items-center gap-2 mb-2">
												<AlertCircle className="h-4 w-4 text-red-600" />
												<span className="font-medium text-red-800 dark:text-red-200">Analysis Error</span>
											</div>
											<p className="text-sm text-red-700 dark:text-red-300">
												{analysisResult.message}
											</p>
										</div>
									)}
									
									{!analysisResult.loading && !analysisResult.error && analysisResult.buildingLength && (
										<div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
											<div className="flex items-center gap-2 mb-3">
												<CheckCircle className="h-4 w-4 text-purple-600" />
												<span className="font-medium">AI Analysis Complete!</span>
												<span className="text-xs bg-purple-100 dark:bg-purple-800 px-2 py-1 rounded">
													{analysisResult.confidence?.toUpperCase()} confidence
												</span>
											</div>
											<div className="grid grid-cols-3 gap-3 text-sm">
												{analysisResult.buildingLength && (
													<div><strong>Length:</strong> {analysisResult.buildingLength}m</div>
												)}
												{analysisResult.buildingWidth && (
													<div><strong>Width:</strong> {analysisResult.buildingWidth}m</div>
												)}
												{analysisResult.numberOfStories && (
													<div><strong>Stories:</strong> {analysisResult.numberOfStories}</div>
												)}
											</div>
											{analysisResult.columnSpacing && (
												<div className="mt-2 text-sm">
													<strong>Column Spacing:</strong> {analysisResult.columnSpacing}m
												</div>
											)}
											{analysisResult.structuralSystem && (
												<div className="mt-1 text-sm">
													<strong>Structure:</strong> {analysisResult.structuralSystem}
												</div>
											)}
										</div>
									)}
								</div>
							)}

							<div className="mt-6 pt-4 border-t">
								<Button 
									variant="outline"
									onClick={() => setActiveMethod('manual')}
									className="w-full"
								>
									<Edit3 className="h-4 w-4 mr-2" />
									Don't have plans? Enter manually instead
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Step 3: Manual Entry (only if upload not available) */}
			{activeMethod === 'manual' && (
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Edit3 className="h-5 w-5 text-green-600" />
								Manual Building Entry
							</CardTitle>
							<CardDescription>
								Enter your building dimensions and structural details manually
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Quick Templates */}
							<div>
								<label className="block text-sm font-medium mb-3">Quick Start Templates</label>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
									{buildingTemplates.map((template, index) => (
										<Button
											key={index}
											variant="outline"
											size="sm"
											onClick={() => loadBuildingTemplate(template)}
											className="h-auto p-3 text-xs hover:bg-blue-50"
										>
											<div className="text-center">
												<div className="font-medium">{template.name}</div>
												<div className="text-gray-500">{template.description}</div>
												<div className="text-xs text-gray-400 mt-1">
													{template.length}×{template.width}m
												</div>
											</div>
										</Button>
									))}
								</div>
								<p className="text-xs text-gray-500 mt-2">
									Click any template to auto-fill the form with typical dimensions
								</p>
							</div>

							{/* Essential Dimensions */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<label className="block text-sm font-medium mb-2">
										Building Length (m) <span className="text-red-500">*</span>
									</label>
									<Input
										type="number"
										name="buildingLength"
										value={userInput.buildingLength || ''}
										onChange={handleChange}
										placeholder="25.0"
										step="0.1"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-2">
										Building Width (m) <span className="text-red-500">*</span>
									</label>
									<Input
										type="number"
										name="buildingWidth"
										value={userInput.buildingWidth || ''}
										onChange={handleChange}
										placeholder="15.0"
										step="0.1"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-2">
										Number of Stories <span className="text-red-500">*</span>
									</label>
									<Input
										type="number"
										name="numberOfStories"
										value={userInput.numberOfStories || ''}
										onChange={handleChange}
										placeholder="3"
									/>
								</div>
							</div>

							{/* Structural System */}
							<div>
								<label className="block text-sm font-medium mb-3">Structural System</label>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									{structuralTypes.map((type, index) => (
										<Button
											key={index}
											variant={userInput.structuralSystem === type.name ? "default" : "outline"}
											onClick={() => updateUserInput({ structuralSystem: type.name })}
											className="h-auto p-3 text-left"
										>
											<div>
												<div className="font-medium text-sm">{type.name}</div>
												<div className="text-xs text-gray-500">{type.description}</div>
											</div>
										</Button>
									))}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Navigation */}
			<form onSubmit={handleSubmit}>
				<div className='flex justify-between pt-8 border-t'>
					<Link href='/assessment/4'>
						<Button variant='outline' className='gap-2'>
							<ArrowLeft className='h-4 w-4' /> Previous
						</Button>
					</Link>

					<div className='flex flex-col items-end gap-2'>
						{!isFormValid() && (
							<p className='text-sm text-red-500 dark:text-red-400'>
								{getValidationMessage()}
							</p>
						)}
						<Button type='submit' disabled={!isFormValid()} className='gap-2'>
							Next <ArrowRight className='h-4 w-4' />
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default PlanDefinitionStep;