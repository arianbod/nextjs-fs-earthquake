'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import {
	Building,
	Building2,
	Clock,
	MapPin,
	ChevronLeft,
	ChevronRight,
	Calendar,
	FolderOpen,
	Plus,
	Camera,
	Map,
	Layers,
	ArrowRight,
	Eye,
	Play,
	CheckCircle2,
	AlertTriangle,
	XCircle,
} from 'lucide-react';

const ITEMS_PER_PAGE = 6;

// Format relative time
function formatRelativeTime(date) {
	const now = new Date();
	const then = new Date(date);
	const diffMs = now - then;
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffMins = Math.floor(diffMs / (1000 * 60));

	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays === 1) return 'Yesterday';
	if (diffDays < 7) return `${diffDays}d ago`;
	return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Get cover image from assessment
function getCoverImage(assessment) {
	if (!assessment.images || assessment.images.length === 0) {
		return null;
	}

	// Priority: User Upload > Street View (front, 0°) > Satellite
	const userUpload = assessment.images.find(img => img.imageType === 'USER_UPLOAD');
	if (userUpload) {
		return {
			src: userUpload.thumbnailData || userUpload.imageData,
			type: 'photo',
			icon: Camera,
		};
	}

	const streetView = assessment.images.find(img => img.imageType === 'STREET_VIEW' && img.angle === 0);
	const anyStreetView = assessment.images.find(img => img.imageType === 'STREET_VIEW');
	if (streetView || anyStreetView) {
		const sv = streetView || anyStreetView;
		return {
			src: sv.thumbnailData || sv.imageData,
			type: 'street',
			icon: Map,
		};
	}

	const satellite = assessment.images.find(img => img.imageType === 'SATELLITE');
	if (satellite) {
		return {
			src: satellite.thumbnailData || satellite.imageData,
			type: 'satellite',
			icon: Layers,
		};
	}

	return null;
}

// Status badge component
function StatusBadge({ status }) {
	const configs = {
		COMPLETE: {
			label: 'Completed',
			className: 'bg-green-500 text-white',
			icon: CheckCircle2,
		},
		DRAFT: {
			label: 'Draft',
			className: 'bg-gray-500 text-white',
			icon: Clock,
		},
		IN_PROGRESS: {
			label: 'In Progress',
			className: 'bg-blue-500 text-white',
			icon: Play,
		},
	};

	const config = configs[status] || configs.DRAFT;
	const Icon = config.icon;

	return (
		<Badge className={`text-xs gap-1 ${config.className}`}>
			<Icon className="h-3 w-3" />
			{config.label}
		</Badge>
	);
}

// Score indicator component
function ScoreIndicator({ score }) {
	const getScoreConfig = (score) => {
		if (score >= 70) return {
			color: 'text-green-600 dark:text-green-400',
			bgColor: 'bg-green-500',
			label: 'Safe',
			icon: CheckCircle2,
		};
		if (score >= 40) return {
			color: 'text-yellow-600 dark:text-yellow-400',
			bgColor: 'bg-yellow-500',
			label: 'Moderate',
			icon: AlertTriangle,
		};
		return {
			color: 'text-red-600 dark:text-red-400',
			bgColor: 'bg-red-500',
			label: 'At Risk',
			icon: XCircle,
		};
	};

	const config = getScoreConfig(score);
	const Icon = config.icon;

	return (
		<div className="flex items-center gap-2">
			<div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
				<span className="text-white font-bold text-sm">{Math.round(score)}</span>
			</div>
			<div className="flex flex-col">
				<span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
				<span className="text-xs text-gray-500 dark:text-gray-400">Safety Score</span>
			</div>
		</div>
	);
}

// Empty state component
function EmptyState() {
	return (
		<motion.div
			className="text-center py-16"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
		>
			<div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
				<FolderOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
			</div>
			<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
				No assessments yet
			</h3>
			<p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
				Start your first building safety assessment to see your results here
			</p>
			<Link href="/assessment/1">
				<Button size="lg" className="gap-2">
					<Plus className="h-5 w-5" />
					Start Your First Assessment
				</Button>
			</Link>
		</motion.div>
	);
}

// Vertical Assessment Card
function AssessmentCard({ assessment, onClick, index }) {
	const tSteps = useTranslations('Steps');
	const coverImage = getCoverImage(assessment);
	const hasScore = assessment.status === 'COMPLETE' && assessment.safetyResult?.overallScore !== undefined;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.05 }}
			whileHover={{ y: -8, scale: 1.02 }}
			className="h-full"
		>
			<Card
				className="cursor-pointer hover:shadow-xl transition-all duration-300 h-full overflow-hidden border-gray-200 dark:border-gray-700 group"
				onClick={onClick}
			>
				{/* Image Section */}
				<div className="relative h-40 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 overflow-hidden">
					{coverImage ? (
						<>
							<img
								src={coverImage.src}
								alt={assessment.title || 'Building'}
								className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
							/>
							{/* Image type indicator */}
							<div className="absolute bottom-2 left-2">
								<Badge variant="secondary" className="text-xs gap-1 bg-black/50 text-white backdrop-blur-sm">
									<coverImage.icon className="h-3 w-3" />
									{coverImage.type === 'photo' ? 'Photo' : coverImage.type === 'street' ? 'Street View' : 'Satellite'}
								</Badge>
							</div>
						</>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<Building2 className="h-16 w-16 text-blue-300 dark:text-blue-700" />
						</div>
					)}

					{/* Status Badge Overlay */}
					<div className="absolute top-2 right-2">
						<StatusBadge status={assessment.status} />
					</div>

					{/* Hover overlay */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
						<Button size="sm" variant="secondary" className="gap-1">
							{assessment.status === 'COMPLETE' ? (
								<>
									<Eye className="h-4 w-4" />
									View Results
								</>
							) : (
								<>
									<Play className="h-4 w-4" />
									Continue
								</>
							)}
						</Button>
					</div>
				</div>

				{/* Content Section */}
				<CardContent className="p-4">
					{/* Title and Location */}
					<div className="mb-3">
						<h3 className="font-semibold text-gray-900 dark:text-white truncate text-base mb-1">
							{assessment.title || 'Untitled Assessment'}
						</h3>
						{assessment.description && (
							<p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-1">
								{assessment.description}
							</p>
						)}
						{assessment.location && (
							<p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
								<MapPin className="h-3.5 w-3.5 flex-shrink-0" />
								{assessment.location.city || assessment.location.district || assessment.location.fullAddress || 'Location set'}
							</p>
						)}
					</div>

					{/* Building Info */}
					{assessment.buildingInfo && (
						<div className="flex flex-wrap gap-2 mb-3">
							{assessment.buildingInfo.buildingType && (
								<Badge variant="outline" className="text-xs">
									{assessment.buildingInfo.buildingType}
								</Badge>
							)}
							{assessment.buildingInfo.numberOfFloors && (
								<Badge variant="outline" className="text-xs">
									{assessment.buildingInfo.numberOfFloors} floors
								</Badge>
							)}
							{assessment.buildingInfo.constructionYear && (
								<Badge variant="outline" className="text-xs">
									Built {assessment.buildingInfo.constructionYear}
								</Badge>
							)}
						</div>
					)}

					{/* Score or Progress */}
					<div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
						{hasScore ? (
							<ScoreIndicator score={assessment.safetyResult.overallScore} />
						) : (
							<div className="flex items-center gap-2">
								<div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden w-20">
									<div
										className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
										style={{ width: `${((assessment.currentStep || 1) / 4) * 100}%` }}
									/>
								</div>
								<span className="text-xs text-gray-500 dark:text-gray-400">
									{tSteps('stepOf', { current: assessment.currentStep || 1, total: 4 })}
								</span>
							</div>
						)}

						<div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
							<Calendar className="h-3.5 w-3.5" />
							{formatRelativeTime(assessment.updatedAt)}
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

export default function LoggedInDashboard({ recentAssessments = [] }) {
	const router = useRouter();
	const [currentPage, setCurrentPage] = useState(1);

	const totalPages = Math.ceil(recentAssessments.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const endIndex = startIndex + ITEMS_PER_PAGE;
	const currentAssessments = recentAssessments.slice(startIndex, endIndex);

	const handleAssessmentClick = (assessment) => {
		if (assessment.status === 'COMPLETE') {
			router.push(`/result/${assessment.id}`);
		} else {
			const step = Math.min(assessment.currentStep || 1, 4);
			router.push(`/assessment/${step}?id=${assessment.id}`);
		}
	};

	const goToPage = (page) => {
		setCurrentPage(Math.max(1, Math.min(page, totalPages)));
	};

	return (
		<section className="py-12 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
			<div className="container mx-auto px-4">
				<motion.div
					className="max-w-6xl mx-auto"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
				>
					{/* Section Header */}
					<div className="flex items-center justify-between mb-8">
						<div>
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Assessments</h2>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								{recentAssessments.length > 0
									? `${recentAssessments.length} building evaluation${recentAssessments.length !== 1 ? 's' : ''}`
									: 'Your building evaluations will appear here'
								}
							</p>
						</div>
						{recentAssessments.length > 0 && (
							<Link href="/assessment/1">
								<Button className="gap-2">
									<Plus className="h-4 w-4" />
									<span className="hidden sm:inline">New Assessment</span>
								</Button>
							</Link>
						)}
					</div>

					{/* Empty State or Assessments Grid */}
					{recentAssessments.length === 0 ? (
						<EmptyState />
					) : (
						<>
							{/* Assessments Grid */}
							<AnimatePresence mode="wait">
								<motion.div
									key={currentPage}
									className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -20 }}
									transition={{ duration: 0.3 }}
								>
									{currentAssessments.map((assessment, index) => (
										<AssessmentCard
											key={assessment.id}
											assessment={assessment}
											onClick={() => handleAssessmentClick(assessment)}
											index={index}
										/>
									))}
								</motion.div>
							</AnimatePresence>

							{/* Pagination */}
							{totalPages > 1 && (
								<motion.div
									className="flex items-center justify-center gap-2 mt-10"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.3 }}
								>
									<Button
										variant="outline"
										size="sm"
										onClick={() => goToPage(currentPage - 1)}
										disabled={currentPage === 1}
										className="gap-1"
									>
										<ChevronLeft className="h-4 w-4" />
										<span className="hidden sm:inline">Previous</span>
									</Button>

									<div className="flex items-center gap-1">
										{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
											<Button
												key={page}
												variant={currentPage === page ? 'default' : 'ghost'}
												size="sm"
												onClick={() => goToPage(page)}
												className={`w-10 h-10 p-0 ${
													currentPage === page
														? 'bg-blue-600 hover:bg-blue-700'
														: ''
												}`}
											>
												{page}
											</Button>
										))}
									</div>

									<Button
										variant="outline"
										size="sm"
										onClick={() => goToPage(currentPage + 1)}
										disabled={currentPage === totalPages}
										className="gap-1"
									>
										<span className="hidden sm:inline">Next</span>
										<ChevronRight className="h-4 w-4" />
									</Button>
								</motion.div>
							)}
						</>
					)}
				</motion.div>
			</div>
		</section>
	);
}
