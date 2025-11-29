// app/page.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
	ArrowRight,
	CheckCircle2,
	Clock,
	Award,
	Sparkles,
	Camera,
	MapPin,
	Cloud,
	Brain,
	Zap,
	Play,
	Mic,
	MessageSquare,
	Target,
	Users,
	Globe,
	Info,
	Building,
	X,
} from 'lucide-react';

// Components
import GuestHero from '@/components/homepage/GuestHero';
import AuthHero from '@/components/homepage/AuthHero';
import LoggedInDashboard from '@/components/homepage/LoggedInDashboard';

// Server actions
import { getLastDraftAssessment, getDashboardStats, getUserAssessments } from '@/lib/actions/assessment';

// Animated counter component
function AnimatedCounter({ value, suffix = '', duration = 2 }) {
	const [count, setCount] = useState(0);
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: '-100px' });
	const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;

	useEffect(() => {
		if (!isInView) return;

		let startTime;
		const animate = (timestamp) => {
			if (!startTime) startTime = timestamp;
			const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
			const easeOut = 1 - Math.pow(1 - progress, 3);
			setCount(Math.floor(easeOut * numericValue));
			if (progress < 1) requestAnimationFrame(animate);
		};
		requestAnimationFrame(animate);
	}, [isInView, numericValue, duration]);

	return (
		<span ref={ref}>
			{count}
			{suffix}
		</span>
	);
}

// Section wrapper for consistent scroll animations
function SectionWrapper({ children }) {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: '-100px' });

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0 }}
			animate={isInView ? { opacity: 1 } : { opacity: 0 }}
			transition={{ duration: 0.6 }}
		>
			{children}
		</motion.div>
	);
}

export default function HomePage() {
	const { user, isLoaded, isSignedIn } = useUser();
	const [activeFeature, setActiveFeature] = useState(0);
	const [isVideoPlaying, setIsVideoPlaying] = useState(false);

	// Auth-specific state
	const [draftAssessment, setDraftAssessment] = useState(null);
	const [stats, setStats] = useState(null);
	const [recentAssessments, setRecentAssessments] = useState([]);
	const [isLoadingUserData, setIsLoadingUserData] = useState(false);

	// Load user data when authenticated
	useEffect(() => {
		if (isSignedIn && isLoaded) {
			loadUserData();
		}
	}, [isSignedIn, isLoaded]);

	const loadUserData = async () => {
		setIsLoadingUserData(true);
		try {
			const [draftResult, statsResult, assessmentsResult] = await Promise.all([
				getLastDraftAssessment().catch(() => null),
				getDashboardStats().catch(() => null),
				getUserAssessments({ limit: 6 }).catch(() => null),
			]);

			if (draftResult?.success && draftResult.assessment) {
				setDraftAssessment(draftResult.assessment);
			}
			if (statsResult?.success && statsResult.stats) {
				setStats(statsResult.stats);
			}
			if (assessmentsResult?.success && assessmentsResult.assessments) {
				setRecentAssessments(assessmentsResult.assessments);
			}
		} catch (error) {
			console.error('Error loading user data:', error);
		} finally {
			setIsLoadingUserData(false);
		}
	};

	// Auto-rotate features
	useEffect(() => {
		const interval = setInterval(() => {
			setActiveFeature((prev) => (prev + 1) % 3);
		}, 4000);
		return () => clearInterval(interval);
	}, []);

	const aiFeatures = [
		{
			icon: Camera,
			title: 'AI Photo Analysis',
			description: 'Upload photos and our AI extracts building information automatically',
			color: 'purple',
		},
		{
			icon: MapPin,
			title: 'Location Intelligence',
			description: 'Real-time seismic and weather data for your exact location',
			color: 'blue',
		},
		{
			icon: Brain,
			title: 'Smart Assessment',
			description: 'AI pre-fills forms and suggests skip options for confident predictions',
			color: 'green',
		},
	];

	const assessmentFlow = [
		{
			step: 1,
			title: 'Location Detection',
			description: 'Pin your building on the map',
			icon: MapPin,
			time: '30 sec',
			isNew: false,
		},
		{
			step: 2,
			title: 'Environmental Analysis',
			description: 'View weather & seismic conditions',
			icon: Cloud,
			time: 'Auto',
			isNew: true,
		},
		{
			step: 3,
			title: 'AI Photo Analysis',
			description: 'Upload photos for instant analysis',
			icon: Sparkles,
			time: '1 min',
			isNew: true,
		},
		{
			step: 4,
			title: 'Review & Confirm',
			description: 'Verify AI-extracted information',
			icon: CheckCircle2,
			time: '30 sec',
			isNew: true,
		},
		{
			step: 5,
			title: 'Get Results',
			description: 'Receive safety score & certificate',
			icon: Award,
			time: 'Instant',
			isNew: false,
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden">
			{/* Conditional Hero Section */}
			{isLoaded && isSignedIn ? (
				<AuthHero
					user={user}
					draftAssessment={draftAssessment}
					stats={stats}
				/>
			) : (
				<GuestHero onWatchDemo={() => setIsVideoPlaying(true)} />
			)}

			{/* Logged-In Dashboard Section (only for authenticated users) */}
			{isLoaded && isSignedIn && recentAssessments.length > 0 && (
				<LoggedInDashboard recentAssessments={recentAssessments} />
			)}

			{/* AI Features Showcase */}
			<SectionWrapper>
				<section className="py-20 bg-white dark:bg-gray-900">
					<div className="container mx-auto px-4">
						<motion.div
							className="text-center mb-12"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
						>
							<Badge variant="outline" className="mb-4">
								AI-POWERED FEATURES
							</Badge>
							<h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
								Experience the Future of Safety Assessment
							</h2>
							<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
								Our Claude AI integration revolutionizes how building safety is assessed
							</p>
						</motion.div>

						<div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
							{/* Feature Display */}
							<motion.div
								className="relative"
								initial={{ opacity: 0, x: -50 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6 }}
							>
								<div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-2xl overflow-hidden">
									{/* Animated border glow */}
									<motion.div
										className="absolute inset-0 rounded-2xl"
										style={{
											background:
												'linear-gradient(90deg, transparent, rgba(147, 51, 234, 0.3), transparent)',
											backgroundSize: '200% 100%',
										}}
										animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
										transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
									/>

									<AnimatePresence mode="wait">
										{aiFeatures.map(
											(feature, index) =>
												activeFeature === index && (
													<motion.div
														key={index}
														initial={{ opacity: 0, x: 20 }}
														animate={{ opacity: 1, x: 0 }}
														exit={{ opacity: 0, x: -20 }}
														transition={{ duration: 0.4 }}
													>
														<div className="flex items-start gap-4">
															<motion.div
																className={`p-4 rounded-xl ${
																	feature.color === 'purple'
																		? 'bg-purple-100 dark:bg-purple-900/30'
																		: feature.color === 'blue'
																		? 'bg-blue-100 dark:bg-blue-900/30'
																		: 'bg-green-100 dark:bg-green-900/30'
																}`}
																whileHover={{ scale: 1.1, rotate: 5 }}
															>
																<feature.icon
																	className={`h-8 w-8 ${
																		feature.color === 'purple'
																			? 'text-purple-600 dark:text-purple-400'
																			: feature.color === 'blue'
																			? 'text-blue-600 dark:text-blue-400'
																			: 'text-green-600 dark:text-green-400'
																	}`}
																/>
															</motion.div>
															<div>
																<h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
																<p className="text-gray-600 dark:text-gray-300 text-lg">
																	{feature.description}
																</p>

																{/* Feature specific visuals */}
																{index === 0 && (
																	<div className="mt-6 grid grid-cols-3 gap-3">
																		{['Front View', 'Side View', 'Details'].map((label, i) => (
																			<motion.div
																				key={i}
																				className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow"
																				initial={{ opacity: 0, scale: 0.8 }}
																				animate={{ opacity: 1, scale: 1 }}
																				transition={{ delay: i * 0.15 }}
																			>
																				<motion.div
																					className="aspect-square bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded"
																					animate={{ opacity: [0.5, 1, 0.5] }}
																					transition={{
																						duration: 1.5,
																						delay: i * 0.2,
																						repeat: Infinity,
																					}}
																				/>
																				<p className="text-xs mt-2 text-center">{label}</p>
																			</motion.div>
																		))}
																	</div>
																)}

																{index === 1 && (
																	<motion.div
																		className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
																		initial={{ opacity: 0, y: 10 }}
																		animate={{ opacity: 1, y: 0 }}
																	>
																		<div className="flex items-center justify-between mb-2">
																			<span className="text-sm font-medium">
																				Seismic Zone: DD-1
																			</span>
																			<Badge variant="destructive">High Risk</Badge>
																		</div>
																		<div className="flex items-center justify-between">
																			<span className="text-sm font-medium">Soil Type: ZC</span>
																			<Badge className="bg-amber-500">Medium</Badge>
																		</div>
																	</motion.div>
																)}

																{index === 2 && (
																	<div className="mt-6 space-y-2">
																		{[
																			'Building height detected: 5 stories',
																			'Structure type: Reinforced concrete',
																			'Construction period: 2010-2020',
																		].map((text, i) => (
																			<motion.div
																				key={i}
																				className="flex items-center gap-2"
																				initial={{ opacity: 0, x: -10 }}
																				animate={{ opacity: 1, x: 0 }}
																				transition={{ delay: i * 0.15 }}
																			>
																				<CheckCircle2 className="h-4 w-4 text-green-600" />
																				<span className="text-sm">{text}</span>
																			</motion.div>
																		))}
																	</div>
																)}
															</div>
														</div>
													</motion.div>
												)
										)}
									</AnimatePresence>
								</div>

								{/* Feature Selector */}
								<div className="flex justify-center gap-2 mt-6">
									{aiFeatures.map((_, index) => (
										<motion.button
											key={index}
											onClick={() => setActiveFeature(index)}
											className={`h-2 rounded-full transition-all ${
												activeFeature === index ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
											}`}
											whileHover={{ scale: 1.2 }}
											whileTap={{ scale: 0.9 }}
										/>
									))}
								</div>
							</motion.div>

							{/* Benefits List */}
							<motion.div
								className="space-y-6"
								initial={{ opacity: 0, x: 50 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6, delay: 0.2 }}
							>
								{[
									{
										icon: Zap,
										title: '90% Faster Assessment',
										desc: 'AI automatically fills forms based on photo analysis and location data',
										color: 'green',
									},
									{
										icon: Target,
										title: 'Higher Accuracy',
										desc: 'Combines visual analysis with environmental data for precise results',
										color: 'blue',
									},
									{
										icon: MessageSquare,
										title: 'Voice Assistant Support',
										desc: 'Get real-time help through every step with our AI voice guide',
										color: 'purple',
									},
								].map((benefit, idx) => (
									<motion.div
										key={idx}
										className="flex gap-4 group"
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ delay: idx * 0.15 }}
										whileHover={{ x: 10 }}
									>
										<div className="flex-shrink-0">
											<motion.div
												className={`w-12 h-12 rounded-full flex items-center justify-center ${
													benefit.color === 'green'
														? 'bg-green-100 dark:bg-green-900/30'
														: benefit.color === 'blue'
														? 'bg-blue-100 dark:bg-blue-900/30'
														: 'bg-purple-100 dark:bg-purple-900/30'
												}`}
												whileHover={{ scale: 1.1, rotate: 10 }}
											>
												<benefit.icon
													className={`h-6 w-6 ${
														benefit.color === 'green'
															? 'text-green-600 dark:text-green-400'
															: benefit.color === 'blue'
															? 'text-blue-600 dark:text-blue-400'
															: 'text-purple-600 dark:text-purple-400'
													}`}
												/>
											</motion.div>
										</div>
										<div>
											<h4 className="text-lg font-semibold mb-2">{benefit.title}</h4>
											<p className="text-gray-600 dark:text-gray-300">{benefit.desc}</p>
										</div>
									</motion.div>
								))}
							</motion.div>
						</div>
					</div>
				</section>
			</SectionWrapper>

			{/* Assessment Flow Section */}
			<SectionWrapper>
				<section className="py-20 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
					<div className="container mx-auto px-4">
						<motion.div
							className="text-center mb-12"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
						>
							<Badge variant="outline" className="mb-4">
								SIMPLIFIED PROCESS
							</Badge>
							<h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">5 Simple Steps to Safety</h2>
							<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
								Our AI-enhanced flow makes assessment incredibly simple
							</p>
						</motion.div>

						<div className="max-w-5xl mx-auto">
							{/* Desktop Flow */}
							<div className="hidden lg:block relative">
								{/* Animated line */}
								<div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 transform -translate-y-1/2">
									<motion.div
										className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
										initial={{ width: '0%' }}
										whileInView={{ width: '100%' }}
										viewport={{ once: true }}
										transition={{ duration: 1.5, ease: 'easeOut' }}
									/>
								</div>

								<div className="grid grid-cols-5 gap-4 relative z-10">
									{assessmentFlow.map((step, index) => (
										<motion.div
											key={index}
											className="text-center"
											initial={{ opacity: 0, y: 30 }}
											whileInView={{ opacity: 1, y: 0 }}
											viewport={{ once: true }}
											transition={{ delay: index * 0.15, duration: 0.5 }}
										>
											<motion.div
												className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg cursor-pointer group"
												whileHover={{
													scale: 1.05,
													boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
												}}
												whileTap={{ scale: 0.98 }}
											>
												<div className="relative">
													<motion.div
														className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4"
														whileHover={{ rotate: 360 }}
														transition={{ duration: 0.6 }}
													>
														<step.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
													</motion.div>
													{step.isNew && (
														<motion.div
															initial={{ scale: 0 }}
															animate={{ scale: 1 }}
															transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
														>
															<Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-blue-600 text-xs">
																AI
															</Badge>
														</motion.div>
													)}
												</div>
												<h3 className="font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
												<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{step.description}</p>
												<Badge variant="outline" className="text-xs">
													{step.time}
												</Badge>
											</motion.div>
										</motion.div>
									))}
								</div>
							</div>

							{/* Mobile Flow */}
							<div className="lg:hidden space-y-4">
								{assessmentFlow.map((step, index) => (
									<motion.div
										key={index}
										className="flex gap-4 items-start"
										initial={{ opacity: 0, x: -30 }}
										whileInView={{ opacity: 1, x: 0 }}
										viewport={{ once: true }}
										transition={{ delay: index * 0.1 }}
									>
										<div className="flex-shrink-0 relative">
											<motion.div
												className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center"
												whileHover={{ scale: 1.1 }}
											>
												<step.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
											</motion.div>
											{index < assessmentFlow.length - 1 && (
												<div className="absolute top-12 left-1/2 w-0.5 h-8 bg-gradient-to-b from-blue-300 to-purple-300 dark:from-blue-700 dark:to-purple-700 -translate-x-1/2" />
											)}
										</div>
										<div className="flex-1 pb-4">
											<div className="flex items-center gap-2 mb-1">
												<h3 className="font-semibold text-gray-900 dark:text-white">{step.title}</h3>
												{step.isNew && (
													<Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-xs">AI</Badge>
												)}
											</div>
											<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{step.description}</p>
											<Badge variant="outline" className="text-xs">
												{step.time}
											</Badge>
										</div>
									</motion.div>
								))}
							</div>
						</div>

						{/* Start Assessment CTA */}
						<motion.div
							className="text-center mt-12"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: 0.5 }}
						>
							<Link href="/assessment/1">
								<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
									<Button size="lg" className="text-base gap-2 px-8">
										{isSignedIn ? 'Start New Assessment' : 'Begin Your Assessment'} <ArrowRight className="h-4 w-4" />
									</Button>
								</motion.div>
							</Link>
						</motion.div>
					</div>
				</section>
			</SectionWrapper>

			{/* Stats Section with Animated Counters */}
			<SectionWrapper>
				<section className="py-20 bg-white dark:bg-gray-900">
					<div className="container mx-auto px-4">
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
							{[
								{ icon: Building, value: '10', suffix: 'K+', label: 'Buildings Assessed', color: 'blue' },
								{ icon: Target, value: '95', suffix: '%', label: 'Accuracy Rate', color: 'green' },
								{ icon: Sparkles, value: 'AI', suffix: '', label: 'Powered Analysis', color: 'purple' },
								{ icon: Users, value: '25', suffix: 'K+', label: 'Happy Users', color: 'amber' },
							].map((stat, idx) => (
								<motion.div
									key={idx}
									className="text-center group"
									initial={{ opacity: 0, y: 30 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ delay: idx * 0.1 }}
								>
									<motion.div
										className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
											stat.color === 'blue'
												? 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30'
												: stat.color === 'green'
												? 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30'
												: stat.color === 'purple'
												? 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30'
												: 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30'
										}`}
										whileHover={{ scale: 1.15, rotate: 10 }}
										transition={{ type: 'spring', stiffness: 300 }}
									>
										<stat.icon
											className={`h-10 w-10 ${
												stat.color === 'blue'
													? 'text-blue-600 dark:text-blue-400'
													: stat.color === 'green'
													? 'text-green-600 dark:text-green-400'
													: stat.color === 'purple'
													? 'text-purple-600 dark:text-purple-400'
													: 'text-amber-600 dark:text-amber-400'
											}`}
										/>
									</motion.div>
									<div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
										{stat.value === 'AI' ? (
											<motion.span
												className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
												animate={{ backgroundPosition: ['0% center', '100% center'] }}
												transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
												style={{ backgroundSize: '200% auto' }}
											>
												AI
											</motion.span>
										) : (
											<AnimatedCounter value={stat.value} suffix={stat.suffix} duration={2} />
										)}
									</div>
									<div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
								</motion.div>
							))}
						</div>
					</div>
				</section>
			</SectionWrapper>

			{/* Voice Assistant Feature */}
			<SectionWrapper>
				<section className="py-20 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 relative overflow-hidden">
					{/* Background animation */}
					<div className="absolute inset-0 pointer-events-none">
						{[...Array(3)].map((_, i) => (
							<motion.div
								key={i}
								className="absolute w-64 h-64 rounded-full"
								style={{
									background: `radial-gradient(circle, ${i === 0 ? 'rgba(147,51,234,0.1)' : i === 1 ? 'rgba(59,130,246,0.1)' : 'rgba(236,72,153,0.1)'} 0%, transparent 70%)`,
									left: `${20 + i * 30}%`,
									top: `${10 + i * 20}%`,
								}}
								animate={{
									scale: [1, 1.2, 1],
									opacity: [0.3, 0.6, 0.3],
								}}
								transition={{
									duration: 4,
									delay: i * 0.5,
									repeat: Infinity,
									ease: 'easeInOut',
								}}
							/>
						))}
					</div>

					<div className="container mx-auto px-4 relative z-10">
						<motion.div
							className="max-w-4xl mx-auto text-center"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
						>
							<motion.div
								className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-800/30 dark:to-blue-800/30 mb-6"
								animate={{
									scale: [1, 1.1, 1],
									boxShadow: [
										'0 0 0 0 rgba(147,51,234,0.4)',
										'0 0 0 20px rgba(147,51,234,0)',
										'0 0 0 0 rgba(147,51,234,0.4)',
									],
								}}
								transition={{ duration: 2, repeat: Infinity }}
							>
								<Mic className="h-10 w-10 text-purple-600 dark:text-purple-400" />
							</motion.div>
							<h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">AI Voice Assistant Included</h2>
							<p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
								Get real-time guidance through every step. Just ask questions and receive instant help.
							</p>
							<div className="grid md:grid-cols-3 gap-6">
								{[
									{
										icon: MessageSquare,
										title: 'Natural Conversation',
										desc: 'Ask questions in plain language',
										color: 'blue',
									},
									{
										icon: Globe,
										title: 'Multi-Language',
										desc: 'Support for multiple languages',
										color: 'green',
									},
									{
										icon: Zap,
										title: 'Instant Responses',
										desc: 'Get help without interrupting flow',
										color: 'purple',
									},
								].map((card, idx) => (
									<motion.div
										key={idx}
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ delay: idx * 0.15 }}
									>
										<motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
											<Card className="p-6 h-full">
												<CardContent className="space-y-3 p-0">
													<motion.div whileHover={{ rotate: 15, scale: 1.1 }}>
														<card.icon
															className={`h-8 w-8 mx-auto ${
																card.color === 'blue'
																	? 'text-blue-600 dark:text-blue-400'
																	: card.color === 'green'
																	? 'text-green-600 dark:text-green-400'
																	: 'text-purple-600 dark:text-purple-400'
															}`}
														/>
													</motion.div>
													<h3 className="font-semibold">{card.title}</h3>
													<p className="text-sm text-gray-600 dark:text-gray-400">{card.desc}</p>
												</CardContent>
											</Card>
										</motion.div>
									</motion.div>
								))}
							</div>
						</motion.div>
					</div>
				</section>
			</SectionWrapper>

			{/* Final CTA - Different for Auth vs Guest */}
			<SectionWrapper>
				<section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 relative overflow-hidden">
					{/* Grid pattern */}
					<div
						className="absolute inset-0 opacity-10"
						style={{
							backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
							backgroundSize: '20px 20px',
						}}
					/>

					{/* Floating orbs */}
					{[...Array(5)].map((_, i) => (
						<motion.div
							key={i}
							className="absolute w-32 h-32 rounded-full bg-white/10"
							style={{
								left: `${10 + i * 20}%`,
								top: `${Math.random() * 60 + 20}%`,
							}}
							animate={{
								y: [0, -30, 0],
								opacity: [0.1, 0.3, 0.1],
							}}
							transition={{
								duration: 4,
								delay: i * 0.5,
								repeat: Infinity,
								ease: 'easeInOut',
							}}
						/>
					))}

					<div className="container mx-auto px-4 text-center relative z-10">
						<motion.div
							className="max-w-3xl mx-auto"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
						>
							<motion.h2
								className="text-4xl font-bold mb-4 text-white"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
							>
								{isSignedIn
									? 'Ready to Assess Another Building?'
									: 'Ready to Experience AI-Powered Safety Assessment?'
								}
							</motion.h2>
							<motion.p
								className="text-xl text-blue-100 mb-8"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.1 }}
							>
								{isSignedIn
									? 'Start a new assessment or view your dashboard to continue your work'
									: 'Join thousands who\'ve already secured their buildings with our advanced AI technology'
								}
							</motion.p>
							<motion.div
								className="flex flex-col sm:flex-row gap-4 justify-center"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.2 }}
							>
								<Link href="/assessment/1">
									<motion.div
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										animate={{
											boxShadow: [
												'0 0 0 0 rgba(255,255,255,0.4)',
												'0 0 0 10px rgba(255,255,255,0)',
												'0 0 0 0 rgba(255,255,255,0.4)',
											],
										}}
										transition={{ duration: 2, repeat: Infinity }}
										className="rounded-lg"
									>
										<Button size="lg" variant="secondary" className="text-base gap-2 px-8">
											<Sparkles className="h-5 w-5" />
											{isSignedIn ? 'Start New Assessment' : 'Start Free AI Assessment'}
											<ArrowRight className="h-5 w-5" />
										</Button>
									</motion.div>
								</Link>
								<Link href={isSignedIn ? '/dashboard' : '/about'}>
									<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
										<Button
											size="lg"
											variant="outline"
											className="text-base gap-2 px-8 bg-white/10 text-white border-white/30 hover:bg-white/20"
										>
											{isSignedIn ? (
												<>
													<Building className="h-5 w-5" />
													View Dashboard
												</>
											) : (
												<>
													<Info className="h-5 w-5" />
													Learn More
												</>
											)}
										</Button>
									</motion.div>
								</Link>
							</motion.div>
							{!isSignedIn && (
								<motion.p
									className="text-sm text-blue-200 mt-8"
									initial={{ opacity: 0 }}
									whileInView={{ opacity: 1 }}
									viewport={{ once: true }}
									transition={{ delay: 0.4 }}
								>
									No credit card required - 5-minute assessment - Instant results
								</motion.p>
							)}
						</motion.div>
					</div>
				</section>
			</SectionWrapper>

			{/* Academic Support */}
			<motion.section
				className="py-12 bg-gray-50 dark:bg-gray-900/50"
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true }}
			>
				<div className="container mx-auto px-4">
					<div className="text-center">
						<motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Academic Support & Validation</p>
							<p className="text-lg font-semibold text-gray-900 dark:text-white">Assistant Professor Hamid F Ghatte</p>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Antalya Bilim University - Structural Engineering Department
							</p>
						</motion.div>
					</div>
				</div>
			</motion.section>

			{/* Video Modal */}
			<AnimatePresence>
				{isVideoPlaying && (
					<motion.div
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setIsVideoPlaying(false)}
					>
						<motion.div
							className="relative w-full max-w-4xl mx-4 aspect-video bg-gray-900 rounded-2xl overflow-hidden"
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.8, opacity: 0 }}
							onClick={(e) => e.stopPropagation()}
						>
							<button
								onClick={() => setIsVideoPlaying(false)}
								className="absolute top-4 right-4 z-10 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
							>
								<X className="w-6 h-6 text-white" />
							</button>
							<div className="w-full h-full flex items-center justify-center text-white">
								<div className="text-center">
									<Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
									<p className="text-lg opacity-50">Demo video coming soon</p>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
