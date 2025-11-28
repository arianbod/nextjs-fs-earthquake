'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Satellite, Eye, ChevronLeft, ChevronRight, MapPin, Compass } from 'lucide-react';

/**
 * ImageryShowcase - Dramatic reveal of collected Google imagery
 * Shows Street View + Satellite view with smooth transitions
 */
export function ImageryShowcase({ userInput, imageGallery }) {
	const [activeView, setActiveView] = useState('street'); // street, satellite, user
	const [currentStreetIndex, setCurrentStreetIndex] = useState(0);

	const streetViewImages = userInput?.streetViewImages?.filter(img => img.available) || [];
	const satelliteUrl = userInput?.satelliteViewUrl;
	const userPhotos = userInput?.uploadedPhotos || imageGallery?.categories?.user?.images || [];

	const hasStreetView = streetViewImages.length > 0;
	const hasSatellite = !!satelliteUrl;
	const hasUserPhotos = userPhotos.length > 0;

	if (!hasStreetView && !hasSatellite && !hasUserPhotos) return null;

	const nextStreetView = () => {
		setCurrentStreetIndex((prev) => (prev + 1) % streetViewImages.length);
	};

	const prevStreetView = () => {
		setCurrentStreetIndex((prev) => (prev - 1 + streetViewImages.length) % streetViewImages.length);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
			className="w-full"
		>
			{/* Section Header */}
			<div className="flex items-center gap-2 mb-4">
				<div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
					<Eye className="w-4 h-4 text-white" />
				</div>
				<div>
					<h3 className="font-bold text-gray-900 dark:text-white">We Found Your Building</h3>
					<p className="text-xs text-gray-500">Images collected from multiple sources</p>
				</div>
			</div>

			{/* View Tabs */}
			<div className="flex gap-2 mb-4">
				{hasStreetView && (
					<button
						onClick={() => setActiveView('street')}
						className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
							activeView === 'street'
								? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
								: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
						}`}
					>
						<Camera className="w-4 h-4" />
						Street View
					</button>
				)}
				{hasSatellite && (
					<button
						onClick={() => setActiveView('satellite')}
						className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
							activeView === 'satellite'
								? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
								: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
						}`}
					>
						<Satellite className="w-4 h-4" />
						Satellite
					</button>
				)}
				{hasUserPhotos && (
					<button
						onClick={() => setActiveView('user')}
						className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
							activeView === 'user'
								? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
								: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
						}`}
					>
						<Camera className="w-4 h-4" />
						Your Photos
					</button>
				)}
			</div>

			{/* Image Display */}
			<div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video shadow-2xl">
				<AnimatePresence mode="wait">
					{/* Street View */}
					{activeView === 'street' && hasStreetView && (
						<motion.div
							key="street"
							initial={{ opacity: 0, scale: 1.1 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ duration: 0.5 }}
							className="absolute inset-0"
						>
							<img
								src={streetViewImages[currentStreetIndex]?.url}
								alt="Street View"
								className="w-full h-full object-cover"
							/>

							{/* Overlay gradient */}
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

							{/* Navigation arrows */}
							{streetViewImages.length > 1 && (
								<>
									<button
										onClick={prevStreetView}
										className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
									>
										<ChevronLeft className="w-6 h-6" />
									</button>
									<button
										onClick={nextStreetView}
										className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
									>
										<ChevronRight className="w-6 h-6" />
									</button>
								</>
							)}

							{/* Info overlay */}
							<div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
								<div>
									<div className="flex items-center gap-2 text-white/80 text-sm mb-1">
										<Compass className="w-4 h-4" />
										<span>{streetViewImages[currentStreetIndex]?.angle || 'Front'} view</span>
									</div>
									<p className="text-white font-medium">{userInput?.address || userInput?.city}</p>
								</div>
								{streetViewImages.length > 1 && (
									<div className="flex gap-1">
										{streetViewImages.map((_, idx) => (
											<div
												key={idx}
												className={`w-2 h-2 rounded-full transition-colors ${
													idx === currentStreetIndex ? 'bg-white' : 'bg-white/40'
												}`}
											/>
										))}
									</div>
								)}
							</div>

							{/* Google badge */}
							<div className="absolute top-4 right-4 px-3 py-1 bg-black/50 rounded-full text-white text-xs flex items-center gap-1">
								<span className="text-blue-400">G</span>oogle Street View
							</div>
						</motion.div>
					)}

					{/* Satellite View */}
					{activeView === 'satellite' && hasSatellite && (
						<motion.div
							key="satellite"
							initial={{ opacity: 0, scale: 1.1 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ duration: 0.5 }}
							className="absolute inset-0"
						>
							<img
								src={satelliteUrl}
								alt="Satellite View"
								className="w-full h-full object-cover"
							/>

							{/* Overlay */}
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

							{/* Marker pulse */}
							<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
								<motion.div
									animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
									transition={{ duration: 2, repeat: Infinity }}
									className="absolute inset-0 w-12 h-12 -ml-6 -mt-6 rounded-full bg-red-500"
								/>
								<MapPin className="w-8 h-8 text-red-500 drop-shadow-lg relative z-10" />
							</div>

							{/* Info */}
							<div className="absolute bottom-4 left-4">
								<p className="text-white/80 text-sm mb-1">Satellite imagery</p>
								<p className="text-white font-medium">
									{userInput?.latitude?.toFixed(4)}, {userInput?.longitude?.toFixed(4)}
								</p>
							</div>

							{/* Google badge */}
							<div className="absolute top-4 right-4 px-3 py-1 bg-black/50 rounded-full text-white text-xs flex items-center gap-1">
								<span className="text-green-400">G</span>oogle Satellite
							</div>
						</motion.div>
					)}

					{/* User Photos */}
					{activeView === 'user' && hasUserPhotos && (
						<motion.div
							key="user"
							initial={{ opacity: 0, scale: 1.1 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ duration: 0.5 }}
							className="absolute inset-0 p-4"
						>
							<div className="grid grid-cols-3 gap-2 h-full">
								{userPhotos.slice(0, 6).map((photo, idx) => (
									<motion.div
										key={idx}
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: idx * 0.1 }}
										className="rounded-lg overflow-hidden bg-gray-800"
									>
										<img
											src={photo.base64 || photo.url || photo.imageData}
											alt={`User photo ${idx + 1}`}
											className="w-full h-full object-cover"
										/>
									</motion.div>
								))}
							</div>

							{/* Badge */}
							<div className="absolute top-4 right-4 px-3 py-1 bg-black/50 rounded-full text-white text-xs flex items-center gap-1">
								<Camera className="w-3 h-3" />
								{userPhotos.length} photos analyzed
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Caption */}
			<p className="text-xs text-gray-500 text-center mt-3">
				{activeView === 'street' && 'Street-level imagery automatically collected from your location'}
				{activeView === 'satellite' && 'High-resolution satellite view of your building area'}
				{activeView === 'user' && 'Photos you uploaded for AI analysis'}
			</p>
		</motion.div>
	);
}

export default ImageryShowcase;
