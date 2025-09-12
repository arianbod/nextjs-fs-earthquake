import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
	Upload,
	Camera,
	X,
	Eye,
	ArrowLeft,
	ArrowRight,
	AlertCircle,
	CheckCircle2,
	Building,
	Wrench,
	Home,
	ExternalLink,
	Sparkles,
	ChevronLeft,
	ChevronRight
} from 'lucide-react';
import { useUserInput } from '@/context/UserInputContext';
import Link from 'next/link';

const AdditionalPhotosStep = ({ onNext }) => {
	const { userInput, updateUserInput, storeUserImages } = useUserInput();
	const [uploadedPhotos, setUploadedPhotos] = useState([]);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [selectedPhoto, setSelectedPhoto] = useState(null);
	const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

	const handleFileUpload = useCallback(async (files) => {
		setIsUploading(true);
		setUploadProgress(0);

		try {
			// Filter for image files only
			const imageFiles = Array.from(files).filter(file => 
				file.type.startsWith('image/')
			);

			if (imageFiles.length === 0) {
				alert('Please upload image files (JPG, PNG, etc.) of your building.');
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

			// Process and store the photos
			const processedPhotos = [];
			for (let i = 0; i < imageFiles.length; i++) {
				const file = imageFiles[i];
				
				// Create preview
				const preview = URL.createObjectURL(file);
				
				const photoData = {
					id: `additional_photo_${Date.now()}_${i}`,
					file,
					preview,
					name: file.name,
					size: file.size,
					type: file.type,
					uploadedAt: new Date().toISOString(),
					category: detectPhotoType(file.name)
				};

				processedPhotos.push(photoData);
			}

			// Store in user images system
			await storeUserImages(imageFiles);

			setUploadedPhotos(prev => [...prev, ...processedPhotos]);
			
			// Update user input
			updateUserInput(prev => ({
				...prev,
				additionalPhotos: [...(prev.additionalPhotos || []), ...processedPhotos.map(p => ({
					id: p.id,
					name: p.name,
					size: p.size,
					type: p.type,
					category: p.category,
					uploadedAt: p.uploadedAt
				}))],
				hasAdditionalPhotos: true
			}));

			setUploadProgress(100);
			
			setTimeout(() => {
				clearInterval(progressInterval);
				setIsUploading(false);
				setUploadProgress(0);
			}, 500);

		} catch (error) {
			console.error('Error uploading additional photos:', error);
			alert('Failed to upload photos. Please try again.');
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

	const detectPhotoType = (filename) => {
		const name = filename.toLowerCase();
		if (name.includes('exterior') || name.includes('outside') || name.includes('facade')) return 'Exterior';
		if (name.includes('interior') || name.includes('inside') || name.includes('room')) return 'Interior';
		if (name.includes('damage') || name.includes('crack') || name.includes('issue')) return 'Damage/Issues';
		if (name.includes('foundation') || name.includes('basement')) return 'Foundation';
		if (name.includes('roof') || name.includes('ceiling')) return 'Roof/Ceiling';
		if (name.includes('window') || name.includes('door')) return 'Openings';
		if (name.includes('structural') || name.includes('column') || name.includes('beam')) return 'Structural';
		return 'General';
	};

	const getPhotoIcon = (category) => {
		switch (category) {
			case 'Exterior': return <Home className="h-4 w-4" />;
			case 'Interior': return <Building className="h-4 w-4" />;
			case 'Damage/Issues': return <AlertCircle className="h-4 w-4" />;
			case 'Foundation': return <Wrench className="h-4 w-4" />;
			case 'Roof/Ceiling': return <ExternalLink className="h-4 w-4" />;
			case 'Openings': return <ExternalLink className="h-4 w-4" />;
			case 'Structural': return <Wrench className="h-4 w-4" />;
			default: return <Camera className="h-4 w-4" />;
		}
	};

	const getCategoryColor = (category) => {
		switch (category) {
			case 'Exterior': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
			case 'Interior': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
			case 'Damage/Issues': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
			case 'Foundation': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
			case 'Roof/Ceiling': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
			case 'Openings': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400';
			case 'Structural': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
			default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
		}
	};

	const removePhoto = (photoId) => {
		setUploadedPhotos(prev => prev.filter(photo => photo.id !== photoId));
		updateUserInput(prev => ({
			...prev,
			additionalPhotos: (prev.additionalPhotos || []).filter(photo => photo.id !== photoId),
			hasAdditionalPhotos: (prev.additionalPhotos || []).length > 1
		}));
	};

	const formatFileSize = (bytes) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const openPhotoModal = (photo, index) => {
		setSelectedPhoto(photo);
		setCurrentPhotoIndex(index);
	};

	const navigatePhoto = (direction) => {
		const newIndex = direction === 'next' 
			? (currentPhotoIndex + 1) % uploadedPhotos.length
			: (currentPhotoIndex - 1 + uploadedPhotos.length) % uploadedPhotos.length;
		
		setCurrentPhotoIndex(newIndex);
		setSelectedPhoto(uploadedPhotos[newIndex]);
	};

	const photoCategories = [
		{ name: 'Exterior Views', description: 'Building exterior, facades, surrounding areas' },
		{ name: 'Interior Spaces', description: 'Rooms, hallways, living spaces' },
		{ name: 'Structural Elements', description: 'Columns, beams, load-bearing walls' },
		{ name: 'Foundation & Basement', description: 'Foundation, basement, underground structures' },
		{ name: 'Roof & Ceiling', description: 'Roof structure, ceiling conditions' },
		{ name: 'Damage & Issues', description: 'Cracks, deterioration, structural problems' },
		{ name: 'Windows & Doors', description: 'Openings, frames, hardware' }
	];

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<div className="text-center mb-8">
				<div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-full mb-4">
					<Camera className="h-10 w-10 text-green-600 dark:text-green-400" />
				</div>
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
					Additional Building Photos
				</h1>
				<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
					Upload additional photos of your building including interior, exterior, structural elements, and any damage or concerns.
					<span className="inline-flex items-center gap-1 ml-2">
						<Sparkles className="h-4 w-4 text-purple-500" />
						<span className="text-purple-600 dark:text-purple-400 font-medium">AI will identify structural details</span>
					</span>
				</p>
			</div>

			{/* Photo Categories Guide */}
			<Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
				<CardHeader>
					<CardTitle className="text-blue-900 dark:text-blue-200">📸 Recommended Photo Types</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						{photoCategories.map((category, index) => (
							<div key={index} className="flex items-start gap-3 p-2">
								<div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
								<div>
									<p className="font-medium text-blue-900 dark:text-blue-200 text-sm">{category.name}</p>
									<p className="text-xs text-blue-700 dark:text-blue-300">{category.description}</p>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Upload Area */}
			<Card className="border-dashed border-2 border-green-300 dark:border-green-600">
				<CardContent className="pt-6">
					<div
						className="cursor-pointer transition-all duration-200 rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50"
						onDragOver={handleDragOver}
						onDrop={handleDrop}
						onClick={() => document.getElementById('photo-upload').click()}
					>
						<Upload className="mx-auto h-12 w-12 mb-4 text-gray-400" />
						
						<div>
							<p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
								Upload Additional Photos
							</p>
							<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
								Drag & drop your photos here, or click to select files
							</p>
							<Button variant="outline" className="mb-4">
								<Camera className="h-4 w-4 mr-2" />
								Choose Photos
							</Button>
							<div className="flex justify-center space-x-4 text-xs text-gray-400">
								<span>• JPG/PNG</span>
								<span>• Multiple files</span>
								<span>• Max 10MB each</span>
							</div>
						</div>
						<input
							id="photo-upload"
							type="file"
							multiple
							accept="image/*"
							className="hidden"
							onChange={(e) => handleFileUpload(e.target.files)}
						/>
					</div>

					{isUploading && (
						<div className="mt-4">
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm text-gray-600 dark:text-gray-400">Uploading photos...</span>
								<span className="text-sm text-gray-600 dark:text-gray-400">{uploadProgress}%</span>
							</div>
							<Progress value={uploadProgress} className="w-full" />
						</div>
					)}
				</CardContent>
			</Card>

			{/* Uploaded Photos */}
			{uploadedPhotos.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CheckCircle2 className="h-5 w-5 text-green-600" />
							Uploaded Photos
							<Badge variant="outline">
								{uploadedPhotos.length} photo{uploadedPhotos.length !== 1 ? 's' : ''}
							</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{uploadedPhotos.map((photo, index) => (
								<div key={photo.id} className="relative group border rounded-lg overflow-hidden hover:shadow-md transition-all">
									{/* Photo Preview */}
									<div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
										<img 
											src={photo.preview} 
											alt={photo.name}
											className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
											onClick={() => openPhotoModal(photo, index)}
										/>
									</div>

									{/* Remove Button */}
									<button
										onClick={() => removePhoto(photo.id)}
										className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
									>
										<X className="h-3 w-3" />
									</button>

									{/* Info Overlay */}
									<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
										<div className="flex items-center justify-between">
											<Badge className={`text-xs ${getCategoryColor(photo.category)}`}>
												{getPhotoIcon(photo.category)}
												<span className="ml-1">{photo.category}</span>
											</Badge>
											<button
												onClick={() => openPhotoModal(photo, index)}
												className="text-white hover:text-blue-200 transition-colors"
											>
												<Eye className="h-3 w-3" />
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Instructions */}
			<Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
				<CardContent className="pt-6">
					<div className="flex items-start gap-3">
						<AlertCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
						<div>
							<h4 className="font-medium text-green-900 dark:text-green-200 mb-2">
								Photography Tips for Better Analysis
							</h4>
							<ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
								<li>• Take clear, well-lit photos from multiple angles</li>
								<li>• Include wide shots and close-ups of important structural elements</li>
								<li>• Document any visible cracks, damage, or structural concerns</li>
								<li>• Capture both interior and exterior views of the building</li>
								<li>• Photos of foundations, columns, and load-bearing walls are particularly valuable</li>
								<li>• Our AI will analyze these photos alongside your architectural plans</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Navigation */}
			<div className="flex justify-between pt-4">
				<Link href="/assessment/3">
					<Button variant="outline" className="gap-2">
						<ArrowLeft className="h-4 w-4" /> Back to Plans Upload
					</Button>
				</Link>

				<Button onClick={onNext} className="gap-2">
					Continue to AI Photo Analysis
					<ArrowRight className="h-4 w-4" />
				</Button>
			</div>

			{/* Photo Viewer Modal */}
			{selectedPhoto && (
				<div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
					<div className="relative max-w-4xl max-h-[90vh] w-full">
						{/* Close button */}
						<Button
							variant="secondary"
							size="sm"
							className="absolute -top-12 right-0 z-10"
							onClick={() => setSelectedPhoto(null)}
						>
							<X className="h-4 w-4" />
						</Button>

						{/* Navigation */}
						{uploadedPhotos.length > 1 && (
							<>
								<Button
									variant="secondary"
									size="sm"
									className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
									onClick={() => navigatePhoto('prev')}
								>
									<ChevronLeft className="h-4 w-4" />
								</Button>
								<Button
									variant="secondary"
									size="sm"
									className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
									onClick={() => navigatePhoto('next')}
								>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</>
						)}

						{/* Photo */}
						<div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
							<img
								src={selectedPhoto.preview}
								alt={selectedPhoto.name}
								className="w-full h-full object-contain max-h-[70vh]"
							/>
							
							{/* Photo info */}
							<div className="p-4 border-t border-gray-200 dark:border-gray-700">
								<div className="flex items-center justify-between">
									<div>
										<div className="flex items-center gap-2 mb-1">
											<Badge className={getCategoryColor(selectedPhoto.category)}>
												{getPhotoIcon(selectedPhoto.category)}
												<span className="ml-1">{selectedPhoto.category}</span>
											</Badge>
											<span className="text-sm text-gray-500">
												{currentPhotoIndex + 1} of {uploadedPhotos.length}
											</span>
										</div>
										<h3 className="font-medium">{selectedPhoto.name}</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
											Size: {formatFileSize(selectedPhoto.size)}
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

export default AdditionalPhotosStep;