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
	Sparkles
} from 'lucide-react';
import { useUserInput } from '@/context/UserInputContext';
import Link from 'next/link';

const ArchitecturePlanStep = ({ onNext }) => {
	const { userInput, updateUserInput, storeUserImages } = useUserInput();
	const [uploadedPlans, setUploadedPlans] = useState([]);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [selectedPlan, setSelectedPlan] = useState(null);

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
								Upload Architectural Plans
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

			{/* Uploaded Plans */}
			{uploadedPlans.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CheckCircle2 className="h-5 w-5 text-green-600" />
							Uploaded Plans
							<Badge variant="outline">
								{uploadedPlans.length} file{uploadedPlans.length !== 1 ? 's' : ''}
							</Badge>
						</CardTitle>
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
					</CardContent>
				</Card>
			)}

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
					Continue to Additional Photos
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