'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
	ArrowRight,
	Play,
	Sparkles,
	Clock,
	MapPin,
	Plus,
	Building,
	Target,
	TrendingUp,
	ChevronRight,
} from 'lucide-react';

export default function AuthHero({ user, draftAssessment, stats }) {
	const t = useTranslations('Hero');
	const tGreeting = useTranslations('Greeting');
	const tNav = useTranslations('Navigation');
	const heroRef = useRef(null);
	const isHeroInView = useInView(heroRef, { once: true });
	const router = useRouter();

	// Time-based greeting
	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return tGreeting('morning');
		if (hour < 18) return tGreeting('afternoon');
		return tGreeting('evening');
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1 },
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5, ease: 'easeOut' },
		},
	};

	const handleQuickResume = () => {
		if (draftAssessment) {
			const step = Math.min(draftAssessment.currentStep || 1, 4);
			router.push(`/assessment/${step}?id=${draftAssessment.id}`);
		}
	};

	const firstName = user?.firstName || user?.username || 'there';

	return (
		<section ref={heroRef} className="relative overflow-hidden pt-20 pb-12 lg:pt-28 lg:pb-16">
			{/* Subtle animated background */}
			<div className="absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl"
					animate={{
						x: [0, 20, 0],
						y: [0, -30, 0],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
				/>
				<motion.div
					className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-green-200/30 to-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl"
					animate={{
						x: [0, -15, 0],
						y: [0, 15, 0],
					}}
					transition={{ duration: 10, delay: 2, repeat: Infinity, ease: 'easeInOut' }}
				/>
			</div>

			<div className="container mx-auto px-4 relative z-10">
				<motion.div
					className="max-w-6xl mx-auto"
					initial="hidden"
					animate={isHeroInView ? 'visible' : 'hidden'}
					variants={containerVariants}
				>
					{/* Personalized Greeting */}
					<motion.div variants={itemVariants} className="mb-8">
						<h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
							{getGreeting()}, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{firstName}</span>
						</h1>
						<p className="text-lg text-gray-600 dark:text-gray-300">
							{draftAssessment
								? t('readyContinue')
								: t('readyStart')
							}
						</p>
					</motion.div>

					{/* Quick Actions Grid */}
					<motion.div variants={itemVariants} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
						{/* Quick Resume Card (if draft exists) */}
						{draftAssessment && (
							<motion.div
								whileHover={{ scale: 1.02, y: -4 }}
								whileTap={{ scale: 0.98 }}
								className="lg:col-span-2"
							>
								<Card
									className="cursor-pointer border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 hover:shadow-lg transition-all"
									onClick={handleQuickResume}
								>
									<CardContent className="p-6">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-2">
													<Badge className="bg-blue-600">
														<Clock className="h-3 w-3 mr-1" />
														{t('inProgress')}
													</Badge>
													<span className="text-sm text-gray-500 dark:text-gray-400">
														{t('stepOf', { step: draftAssessment.currentStep || 1, total: 4 })}
													</span>
												</div>
												<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
													{draftAssessment.title || t('untitledAssessment')}
												</h3>
												{draftAssessment.location && (
													<p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
														<MapPin className="h-3.5 w-3.5" />
														{draftAssessment.location.city || draftAssessment.location.fullAddress || t('locationSet')}
													</p>
												)}
											</div>
											<motion.div
												className="flex items-center gap-2"
												animate={{ x: [0, 5, 0] }}
												transition={{ duration: 1.5, repeat: Infinity }}
											>
												<Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
													<Play className="h-4 w-4" />
													{tNav('continue')}
													<ArrowRight className="h-4 w-4" />
												</Button>
											</motion.div>
										</div>
										{/* Progress bar */}
										<div className="mt-4">
											<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
												<motion.div
													className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
													initial={{ width: 0 }}
													animate={{ width: `${((draftAssessment.currentStep || 1) / 4) * 100}%` }}
													transition={{ duration: 0.8, ease: 'easeOut' }}
												/>
											</div>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						)}

						{/* New Assessment Card */}
						<motion.div
							whileHover={{ scale: 1.02, y: -4 }}
							whileTap={{ scale: 0.98 }}
							className={draftAssessment ? '' : 'lg:col-span-2'}
						>
							<Link href="/assessment/1">
								<Card className="cursor-pointer h-full border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all">
									<CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
										<motion.div
											className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4"
											whileHover={{ rotate: 90 }}
											transition={{ duration: 0.3 }}
										>
											<Plus className="h-7 w-7 text-blue-600 dark:text-blue-400" />
										</motion.div>
										<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
											{tNav('newAssessment')}
										</h3>
										<p className="text-sm text-gray-500 dark:text-gray-400">
											{t('startFresh')}
										</p>
									</CardContent>
								</Card>
							</Link>
						</motion.div>

						{/* View Dashboard Card */}
						{!draftAssessment && (
							<motion.div
								whileHover={{ scale: 1.02, y: -4 }}
								whileTap={{ scale: 0.98 }}
							>
								<Link href="/dashboard">
									<Card className="cursor-pointer h-full border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg transition-all">
										<CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
											<motion.div
												className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mb-4"
												whileHover={{ scale: 1.1 }}
											>
												<Building className="h-7 w-7 text-purple-600 dark:text-purple-400" />
											</motion.div>
											<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
												{t('viewDashboard')}
											</h3>
											<p className="text-sm text-gray-500 dark:text-gray-400">
												{t('seeAllAssessments')}
											</p>
										</CardContent>
									</Card>
								</Link>
							</motion.div>
						)}
					</motion.div>

					{/* Stats Row */}
					{stats && (stats.total > 0 || stats.totalCompleted > 0) && (
						<motion.div variants={itemVariants} className="flex flex-wrap gap-6 items-center justify-center md:justify-start">
							{stats.totalCompleted > 0 && (
								<div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
									<div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
										<Target className="h-4 w-4 text-green-600 dark:text-green-400" />
									</div>
									<span className="text-sm">
										<span className="font-semibold text-gray-900 dark:text-white">{stats.totalCompleted}</span> {t('completed')}
									</span>
								</div>
							)}
							{stats.inProgress > 0 && (
								<div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
									<div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
										<Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
									</div>
									<span className="text-sm">
										<span className="font-semibold text-gray-900 dark:text-white">{stats.inProgress}</span> {t('inProgressLower')}
									</span>
								</div>
							)}
							{stats.averageScore && (
								<div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
									<div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
										<TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
									</div>
									<span className="text-sm">
										<span className="font-semibold text-gray-900 dark:text-white">{stats.averageScore}%</span> {t('avgScore')}
									</span>
								</div>
							)}
							<Link
								href="/dashboard"
								className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
							>
								{t('viewAll')} <ChevronRight className="h-4 w-4" />
							</Link>
						</motion.div>
					)}
				</motion.div>
			</div>
		</section>
	);
}
