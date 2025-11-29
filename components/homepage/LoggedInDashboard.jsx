'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
	ArrowRight,
	Building,
	Clock,
	MapPin,
	ChevronLeft,
	ChevronRight,
	Calendar,
	FolderOpen,
	Plus,
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

// Status badge component
function StatusBadge({ status }) {
	const configs = {
		COMPLETE: { label: 'Completed', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
		DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
		IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
	};

	const config = configs[status] || configs.DRAFT;

	return (
		<Badge variant="secondary" className={`text-xs ${config.className}`}>
			{config.label}
		</Badge>
	);
}

// Empty state component
function EmptyState() {
	return (
		<motion.div
			className="text-center py-12"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
		>
			<div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
				<FolderOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
			</div>
			<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
				No assessments yet
			</h3>
			<p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
				Start your first building safety assessment to see it here
			</p>
			<Link href="/assessment/1">
				<Button className="gap-2">
					<Plus className="h-4 w-4" />
					Start Your First Assessment
				</Button>
			</Link>
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
					<div className="flex items-center justify-between mb-6">
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
									className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -20 }}
									transition={{ duration: 0.3 }}
								>
									{currentAssessments.map((assessment, index) => (
										<motion.div
											key={assessment.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.05 }}
											whileHover={{ y: -4 }}
										>
											<Card
												className="cursor-pointer hover:shadow-md transition-all h-full border-gray-200 dark:border-gray-700"
												onClick={() => handleAssessmentClick(assessment)}
											>
												<CardContent className="p-4">
													<div className="flex items-start justify-between mb-3">
														<div className="flex items-center gap-2">
															<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
																<Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
															</div>
															<div className="flex-1 min-w-0">
																<h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
																	{assessment.title || 'Untitled Assessment'}
																</h3>
																{assessment.location && (
																	<p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
																		<MapPin className="h-3 w-3 flex-shrink-0" />
																		{assessment.location.city || assessment.location.fullAddress || 'Location set'}
																	</p>
																)}
															</div>
														</div>
														<StatusBadge status={assessment.status} />
													</div>

													{/* Score or Progress */}
													<div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
														<div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
															<Calendar className="h-3.5 w-3.5" />
															{formatRelativeTime(assessment.updatedAt)}
														</div>

														{assessment.status === 'COMPLETE' && assessment.safetyResult?.overallScore !== undefined ? (
															<div className="flex items-center gap-1.5">
																<div
																	className={`w-2 h-2 rounded-full ${
																		assessment.safetyResult.overallScore >= 70
																			? 'bg-green-500'
																			: assessment.safetyResult.overallScore >= 40
																			? 'bg-yellow-500'
																			: 'bg-red-500'
																	}`}
																/>
																<span className="text-sm font-semibold text-gray-900 dark:text-white">
																	{Math.round(assessment.safetyResult.overallScore)}%
																</span>
															</div>
														) : (
															<div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
																<Clock className="h-3.5 w-3.5" />
																Step {assessment.currentStep || 1}/4
															</div>
														)}
													</div>
												</CardContent>
											</Card>
										</motion.div>
									))}
								</motion.div>
							</AnimatePresence>

							{/* Pagination */}
							{totalPages > 1 && (
								<motion.div
									className="flex items-center justify-center gap-2 mt-8"
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
										<span className="hidden sm:inline">Prev</span>
									</Button>

									<div className="flex items-center gap-1">
										{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
											<Button
												key={page}
												variant={currentPage === page ? 'default' : 'ghost'}
												size="sm"
												onClick={() => goToPage(page)}
												className={`w-8 h-8 p-0 ${
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
