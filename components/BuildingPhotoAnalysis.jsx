// Building Photo Analysis Component
// Allows users to upload photos for AI-powered building analysis

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
	AlertCircle,
	Loader2,
	Image as ImageIcon,
	Zap,
	Building,
	Eye
} from 'lucide-react';

const BuildingPhotoAnalysis = ({ onAnalysisComplete, existingData = null }) => {
	const [uploadedImages, setUploadedImages] = useState([]);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [analysisProgress, setAnalysisProgress] = useState(0);
	const [analysisResults, setAnalysisResults] = useState(null);
	const [dragOver, setDragOver] = useState(false);

	// Handle file upload
	const handleFileUpload = useCallback((files) => {
		const newImages = Array.from(files).map(file => ({
			id: Math.random().toString(36).substr(2, 9),
			file,
			url: URL.createObjectURL(file),
			name: file.name,
			size: file.size,
			analyzed: false
		}));

		setUploadedImages(prev => [...prev, ...newImages]);
	}, []);

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
			// Clean up object URL
			const imageToRemove = prev.find(img => img.id === imageId);
			if (imageToRemove) {
				URL.revokeObjectURL(imageToRemove.url);
			}
			return updated;
		});
	};

	// Analyze uploaded images
	const analyzeImages = async () => {
		if (uploadedImages.length === 0) return;

		setIsAnalyzing(true);
		setAnalysisProgress(0);
		setAnalysisResults(null);

		try {
			// Progress tracking
			const progressInterval = setInterval(() => {
				setAnalysisProgress(prev => Math.min(prev + 10, 90));
			}, 500);

			// Prepare images for analysis
			const preparedImages = await Promise.all(
				uploadedImages.map(img => prepareImageForAnalysis(img.file))
			);

			// Send to AI for building photo analysis
			const result = await analyzeImagesWithAI(preparedImages, 'building');
			
			clearInterval(progressInterval);
			setAnalysisProgress(100);

			// Process the results
			const processedResults = processBuildingPhotoAnalysis(result);
			setAnalysisResults(processedResults);

			// Mark images as analyzed
			setUploadedImages(prev => 
				prev.map(img => ({ ...img, analyzed: true }))
			);

			// Pass results to parent component
			if (onAnalysisComplete) {
				onAnalysisComplete(processedResults);
			}

		} catch (error) {
			console.error('Analysis error:', error);
			setAnalysisResults({
				error: true,
				message: error.message || 'Failed to analyze images. Please try again.'
			});
		} finally {
			setIsAnalyzing(false);
		}
	};


	return (
		<div className="space-y-6">
			{/* Upload Area */}
			<Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Camera className="h-5 w-5 text-blue-600" />
						Building Photo Analysis
					</CardTitle>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Upload photos of your building for AI-powered structural analysis
					</p>
				</CardHeader>
				<CardContent>
					<div
						className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
							dragOver 
								? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
								: 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
						}`}
						onDrop={handleDrop}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
					>
						<div className="space-y-4">
							<div className="flex justify-center">
								<Upload className="h-12 w-12 text-gray-400" />
							</div>
							<div>
								<h3 className="text-lg font-medium text-gray-900 dark:text-white">
									Drop photos here or click to upload
								</h3>
								<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
									Supports JPG, PNG, HEIC formats. Maximum 10 photos.
								</p>
							</div>
							<Button
								variant="outline"
								onClick={() => document.getElementById('photo-upload').click()}
								className="gap-2"
							>
								<Camera className="h-4 w-4" />
								Choose Photos
							</Button>
							<input
								id="photo-upload"
								type="file"
								multiple
								accept="image/*"
								className="hidden"
								onChange={(e) => handleFileUpload(e.target.files)}
							/>
						</div>
					</div>

					{/* Photo Guidelines */}
					<div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
						<h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
							📸 Photo Guidelines for Best Results
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800 dark:text-blue-300">
							<div>• Full building facade view</div>
							<div>• Ground floor and foundation</div>
							<div>• Building corners and irregularities</div>
							<div>• Adjacent buildings (pounding risk)</div>
							<div>• Roof and top floors</div>
							<div>• Structural details (columns, beams)</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Uploaded Images */}
			{uploadedImages.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ImageIcon className="h-5 w-5" />
							Uploaded Photos ({uploadedImages.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{uploadedImages.map((image) => (
								<div key={image.id} className="relative group">
									<img
										src={image.url}
										alt={image.name}
										className="w-full h-32 object-cover rounded-lg border"
									/>
									<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg" />
									<Button
										variant="destructive"
										size="sm"
										className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
										onClick={() => removeImage(image.id)}
									>
										<X className="h-3 w-3" />
									</Button>
									{image.analyzed && (
										<div className="absolute bottom-2 left-2">
											<Badge variant="success" className="text-xs">
												<CheckCircle className="h-3 w-3 mr-1" />
												Analyzed
											</Badge>
										</div>
									)}
									<div className="absolute bottom-2 right-2">
										<Badge variant="outline" className="text-xs">
											{Math.round(image.size / 1024)}KB
										</Badge>
									</div>
								</div>
							))}
						</div>

						<div className="mt-4 flex justify-between items-center">
							<p className="text-sm text-gray-600 dark:text-gray-400">
								{uploadedImages.length} photo(s) ready for analysis
							</p>
							<Button
								onClick={analyzeImages}
								disabled={isAnalyzing || uploadedImages.length === 0}
								className="gap-2"
							>
								{isAnalyzing ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Zap className="h-4 w-4" />
								)}
								{isAnalyzing ? 'Analyzing...' : 'Analyze Photos'}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Analysis Progress */}
			{isAnalyzing && (
				<Card>
					<CardContent className="pt-6">
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<Loader2 className="h-5 w-5 animate-spin text-blue-600" />
								<span className="font-medium">AI Analysis in Progress...</span>
							</div>
							<Progress value={analysisProgress} className="w-full" />
							<p className="text-sm text-gray-600 dark:text-gray-400">
								{analysisProgress}% Complete - Processing building characteristics
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Analysis Error */}
			{analysisResults && analysisResults.error && (
				<Card className="border-red-200 dark:border-red-800">
					<CardContent className="pt-6">
						<div className="flex items-start gap-3">
							<AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
							<div>
								<h4 className="font-medium text-red-800 dark:text-red-200">
									Analysis Failed
								</h4>
								<p className="text-sm text-red-600 dark:text-red-400 mt-1">
									{analysisResults.message}
								</p>
								<Button 
									onClick={analyzeImages} 
									variant="outline" 
									size="sm" 
									className="mt-3"
								>
									Try Again
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Analysis Results */}
			{analysisResults && !analysisResults.error && (
				<Card className="border-green-200 dark:border-green-800">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
							<CheckCircle className="h-5 w-5" />
							AI Analysis Complete
						</CardTitle>
						<p className="text-sm text-green-600 dark:text-green-400">
							Confidence Level: {analysisResults.confidence?.toUpperCase() || 'MEDIUM'} • 
							{analysisResults.metadata?.imagesAnalyzed || uploadedImages.length} images analyzed
						</p>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Detected Features */}
						<div>
							<h4 className="font-medium mb-3 flex items-center gap-2">
								<Building className="h-4 w-4" />
								Detected Building Characteristics
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<div className="flex justify-between">
										<span className="text-sm text-gray-600">Building Type:</span>
										<Badge variant="outline">{analysisResults.buildingCharacteristics?.type || 'Unknown'}</Badge>
									</div>
									<div className="flex justify-between">
										<span className="text-sm text-gray-600">Stories:</span>
										<span className="text-sm font-medium">{analysisResults.buildingCharacteristics?.stories || 'Unknown'}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sm text-gray-600">Construction Period:</span>
										<span className="text-sm font-medium">{analysisResults.buildingCharacteristics?.constructionPeriod || 'Unknown'}</span>
									</div>
								</div>
								<div className="space-y-2">
									<div className="flex justify-between">
										<span className="text-sm text-gray-600">Structural System:</span>
										<span className="text-sm font-medium">{analysisResults.buildingCharacteristics?.structuralSystem || 'Unknown'}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sm text-gray-600">Material Condition:</span>
										<Badge variant="success">{analysisResults.buildingCharacteristics?.materialCondition || 'Unknown'}</Badge>
									</div>
								</div>
							</div>
						</div>

						{/* Irregularities */}
						{analysisResults.structuralIrregularities && (
							<div>
								<h4 className="font-medium mb-3">Structural Irregularities</h4>
								<div className="grid grid-cols-3 gap-4">
									{Object.entries(analysisResults.structuralIrregularities).map(([type, status]) => (
										<div key={type} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
											<div className="text-sm font-medium capitalize">{type}</div>
											<Badge 
												variant={status === 'Regular' || status === 'Unknown' ? 'success' : 'warning'}
												className="mt-1"
											>
												{status}
											</Badge>
										</div>
									))}
								</div>
							</div>
						)}

						{/* AI Insights */}
						{analysisResults.aiInsights && Object.keys(analysisResults.aiInsights).length > 0 && (
							<div>
								<h4 className="font-medium mb-3 flex items-center gap-2">
									<Eye className="h-4 w-4" />
									AI Visual Insights
								</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
									{Object.entries(analysisResults.aiInsights).map(([feature, description]) => (
										<div key={feature} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
											<div className="font-medium capitalize text-blue-900 dark:text-blue-200">
												{feature.replace(/([A-Z])/g, ' $1').trim()}:
											</div>
											<div className="text-blue-700 dark:text-blue-300 mt-1">
												{description}
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Recommendations */}
						{analysisResults.recommendations && analysisResults.recommendations.length > 0 && (
							<div>
								<h4 className="font-medium mb-3">Recommendations</h4>
								<div className="space-y-2">
									{analysisResults.recommendations.map((rec, index) => (
										<div key={index} className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
											<AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
											<span className="text-sm text-amber-800 dark:text-amber-200">{rec}</span>
										</div>
									))}
								</div>
							</div>
						)}
						
						{/* Raw AI Response Data */}
						{showRawData && (
							<div className="mt-6">
								<h4 className="font-medium mb-3 flex items-center gap-2">
									<Eye className="h-4 w-4" />
									Complete AI Response
								</h4>
								<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
									{analysisResults.rawAIResponse ? (
										typeof analysisResults.rawAIResponse === 'string' ? (
											<pre className="text-xs font-mono whitespace-pre-wrap text-gray-700 dark:text-gray-300">
												{analysisResults.rawAIResponse}
											</pre>
										) : (
											<pre className="text-xs font-mono whitespace-pre-wrap text-gray-700 dark:text-gray-300">
												{JSON.stringify(analysisResults.rawAIResponse, null, 2)}
											</pre>
										)
									) : (
										<div className="text-sm text-gray-500">
											No raw response data available
										</div>
									)}
								</div>
							</div>
						)}
						
						{/* Debug Information */}
						{debugInfo && (
							<div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
								<details>
									<summary className="cursor-pointer font-medium text-purple-900 dark:text-purple-200">
										🔧 Debug Information
									</summary>
									<div className="mt-3 space-y-2 text-xs font-mono">
										<div className="text-purple-700 dark:text-purple-300">
											<strong>Timestamp:</strong> {debugInfo.timestamp}
										</div>
										<div className="text-purple-700 dark:text-purple-300">
											<strong>Processing Time:</strong> {debugInfo.processingTime}ms
										</div>
										<div className="text-purple-700 dark:text-purple-300">
											<strong>Analysis Type:</strong> {debugInfo.analysisType}
										</div>
										<div className="text-purple-700 dark:text-purple-300">
											<strong>Model:</strong> {debugInfo.claudeModel}
										</div>
										<div className="text-purple-700 dark:text-purple-300">
											<strong>JSON Extracted:</strong> {debugInfo.jsonExtracted ? 'Yes' : 'No'}
										</div>
										<div className="text-purple-700 dark:text-purple-300">
											<strong>API Key Present:</strong> {debugInfo.apiKeyPresent ? 'Yes' : 'No'}
										</div>
									</div>
								</details>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Integration Note */}
			<Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
				<CardContent className="pt-6">
					<div className="flex items-start gap-3">
						<Zap className="h-5 w-5 text-purple-600 mt-0.5" />
						<div>
							<h4 className="font-medium text-purple-900 dark:text-purple-200">
								AI-Powered Analysis
							</h4>
							<p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
								This feature uses advanced computer vision to analyze building photos. 
								Results are automatically integrated with your assessment data for more accurate seismic evaluation.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default BuildingPhotoAnalysis;