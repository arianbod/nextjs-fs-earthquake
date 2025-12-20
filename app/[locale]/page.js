// app/page.js
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	ArrowRight,
	MapPin,
	Camera,
	Shield,
	Sparkles,
	Building2,
	X,
	Play,
	CheckCircle2,
} from 'lucide-react';

// Components
import AuthHero from '@/components/homepage/AuthHero';
import LoggedInDashboard from '@/components/homepage/LoggedInDashboard';

// Server actions
import { getLastDraftAssessment, getDashboardStats, getUserAssessments } from '@/lib/actions/assessment';

export default function HomePage() {
	const { user, isLoaded, isSignedIn } = useUser();
	const t = useTranslations('Home');

	// Auth-specific state
	const [draftAssessment, setDraftAssessment] = useState(null);
	const [stats, setStats] = useState(null);
	const [recentAssessments, setRecentAssessments] = useState([]);
	const [isVideoPlaying, setIsVideoPlaying] = useState(false);

	// Load user data when authenticated
	useEffect(() => {
		if (isSignedIn && isLoaded) {
			loadUserData();
		}
	}, [isSignedIn, isLoaded]);

	const loadUserData = async () => {
		try {
			const [draftResult, statsResult, assessmentsResult] = await Promise.all([
				getLastDraftAssessment().catch(() => null),
				getDashboardStats().catch(() => null),
				getUserAssessments({ limit: 50 }).catch(() => null),
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
		}
	};

	// Show authenticated view
	if (isLoaded && isSignedIn) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
				<AuthHero user={user} draftAssessment={draftAssessment} stats={stats} />
				<LoggedInDashboard recentAssessments={recentAssessments} />
			</div>
		);
	}

	// Guest homepage - clean, visual design
	return (
		<div className="min-h-screen bg-white dark:bg-gray-900">
			{/* Hero Section - Full-width visual */}
			<section className="relative min-h-[90vh] flex items-center overflow-hidden">
				{/* Background Image */}
				<div className="absolute inset-0 z-0">
					<Image
						src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80"
						alt="Modern city skyline"
						fill
						className="object-cover"
						priority
					/>
					<div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
				</div>

				{/* Hero Content */}
				<div className="container mx-auto px-4 relative z-10 py-20">
					<motion.div
						className="max-w-2xl"
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
					>
						<motion.div
							className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.3 }}
						>
							<Sparkles className="h-4 w-4 text-yellow-400" />
							<span className="text-sm text-white/90">{t('hero.badge')}</span>
						</motion.div>

						<h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
							{t('hero.title')}
						</h1>

						<p className="text-xl text-white/80 mb-8 max-w-lg">
							{t('hero.subtitle')}
						</p>

						<div className="flex flex-col sm:flex-row gap-4">
							<Link href="/assessment/1">
								<Button size="lg" className="text-lg px-8 py-6 gap-2 bg-white text-gray-900 hover:bg-white/90">
									{t('hero.cta')}
									<ArrowRight className="h-5 w-5" />
								</Button>
							</Link>
							<Button
								size="lg"
								variant="outline"
								className="text-lg px-8 py-6 gap-2 border-white/30 text-white bg-white/10 hover:bg-white/20"
								onClick={() => setIsVideoPlaying(true)}
							>
								<Play className="h-5 w-5" />
								{t('hero.watchDemo')}
							</Button>
						</div>
					</motion.div>
				</div>

				{/* Scroll indicator */}
				<motion.div
					className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
					animate={{ y: [0, 10, 0] }}
					transition={{ duration: 2, repeat: Infinity }}
				>
					<div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
						<div className="w-1 h-3 bg-white/50 rounded-full" />
					</div>
				</motion.div>
			</section>

			{/* Visual Showcase - Image Grid */}
			<section className="py-20 px-4">
				<div className="container mx-auto max-w-6xl">
					<motion.div
						className="text-center mb-12"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
					>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
							{t('showcase.title')}
						</h2>
						<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
							{t('showcase.subtitle')}
						</p>
					</motion.div>

					{/* Image Grid */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{[
							{
								src: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
								alt: 'Modern house',
								span: 'md:col-span-2 md:row-span-2',
							},
							{
								src: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
								alt: 'Apartment building',
								span: '',
							},
							{
								src: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
								alt: 'Building inspection',
								span: '',
							},
							{
								src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
								alt: 'Residential building',
								span: '',
							},
							{
								src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
								alt: 'Modern architecture',
								span: '',
							},
						].map((img, idx) => (
							<motion.div
								key={idx}
								className={`relative rounded-2xl overflow-hidden ${img.span} ${idx === 0 ? 'aspect-square' : 'aspect-video md:aspect-square'}`}
								initial={{ opacity: 0, scale: 0.95 }}
								whileInView={{ opacity: 1, scale: 1 }}
								viewport={{ once: true }}
								transition={{ delay: idx * 0.1 }}
							>
								<Image
									src={img.src}
									alt={img.alt}
									fill
									className="object-cover hover:scale-105 transition-transform duration-500"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* How It Works - Simple 3 Steps */}
			<section className="py-20 bg-slate-50 dark:bg-gray-800/50">
				<div className="container mx-auto px-4 max-w-5xl">
					<motion.div
						className="text-center mb-16"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
					>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
							{t('howItWorks.title')}
						</h2>
					</motion.div>

					<div className="grid md:grid-cols-3 gap-8">
						{[
							{
								icon: MapPin,
								title: t('howItWorks.step1.title'),
								desc: t('howItWorks.step1.desc'),
								color: 'bg-blue-500',
							},
							{
								icon: Camera,
								title: t('howItWorks.step2.title'),
								desc: t('howItWorks.step2.desc'),
								color: 'bg-purple-500',
							},
							{
								icon: Shield,
								title: t('howItWorks.step3.title'),
								desc: t('howItWorks.step3.desc'),
								color: 'bg-green-500',
							},
						].map((step, idx) => (
							<motion.div
								key={idx}
								className="text-center"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: idx * 0.15 }}
							>
								<motion.div
									className={`w-20 h-20 mx-auto rounded-2xl ${step.color} flex items-center justify-center mb-6 shadow-lg`}
									whileHover={{ scale: 1.1, rotate: 5 }}
								>
									<step.icon className="h-10 w-10 text-white" />
								</motion.div>
								<div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
									{t('howItWorks.stepLabel', { number: idx + 1 })}
								</div>
								<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
									{step.title}
								</h3>
								<p className="text-gray-600 dark:text-gray-300">
									{step.desc}
								</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Feature Cards with Images */}
			<section className="py-20 px-4">
				<div className="container mx-auto max-w-6xl">
					<div className="grid lg:grid-cols-2 gap-8">
						{/* AI Analysis Card */}
						<motion.div
							initial={{ opacity: 0, x: -30 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
						>
							<Card className="overflow-hidden h-full border-0 shadow-xl">
								<div className="relative h-64">
									<Image
										src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
										alt="AI Analysis"
										fill
										className="object-cover"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
									<div className="absolute bottom-4 left-4 right-4">
										<div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500 rounded-full text-white text-sm">
											<Sparkles className="h-4 w-4" />
											{t('features.aiPowered')}
										</div>
									</div>
								</div>
								<CardContent className="p-6">
									<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
										{t('features.ai.title')}
									</h3>
									<p className="text-gray-600 dark:text-gray-300 mb-4">
										{t('features.ai.desc')}
									</p>
									<ul className="space-y-2">
										{[t('features.ai.point1'), t('features.ai.point2'), t('features.ai.point3')].map((point, i) => (
											<li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
												<CheckCircle2 className="h-4 w-4 text-green-500" />
												{point}
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						</motion.div>

						{/* Safety Results Card */}
						<motion.div
							initial={{ opacity: 0, x: 30 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
						>
							<Card className="overflow-hidden h-full border-0 shadow-xl">
								<div className="relative h-64">
									<Image
										src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80"
										alt="Safety Report"
										fill
										className="object-cover"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
									<div className="absolute bottom-4 left-4 right-4">
										<div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500 rounded-full text-white text-sm">
											<Shield className="h-4 w-4" />
											{t('features.certified')}
										</div>
									</div>
								</div>
								<CardContent className="p-6">
									<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
										{t('features.report.title')}
									</h3>
									<p className="text-gray-600 dark:text-gray-300 mb-4">
										{t('features.report.desc')}
									</p>
									<ul className="space-y-2">
										{[t('features.report.point1'), t('features.report.point2'), t('features.report.point3')].map((point, i) => (
											<li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
												<CheckCircle2 className="h-4 w-4 text-green-500" />
												{point}
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Final CTA - Visual */}
			<section className="relative py-32 overflow-hidden">
				<div className="absolute inset-0 z-0">
					<Image
						src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80"
						alt="Safe home"
						fill
						className="object-cover"
					/>
					<div className="absolute inset-0 bg-blue-900/80" />
				</div>

				<div className="container mx-auto px-4 text-center relative z-10">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="max-w-2xl mx-auto"
					>
						<h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
							{t('cta.title')}
						</h2>
						<p className="text-xl text-white/80 mb-8">
							{t('cta.subtitle')}
						</p>
						<Link href="/assessment/1">
							<Button size="lg" className="text-lg px-10 py-6 gap-2 bg-white text-gray-900 hover:bg-white/90">
								{t('cta.button')}
								<ArrowRight className="h-5 w-5" />
							</Button>
						</Link>
						<p className="text-sm text-white/60 mt-6">
							{t('cta.note')}
						</p>
					</motion.div>
				</div>
			</section>

			{/* Simple Footer Note */}
			<section className="py-12 bg-slate-50 dark:bg-gray-800/50">
				<div className="container mx-auto px-4 text-center">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						{t('footer.academic')}
					</p>
					<p className="text-base font-medium text-gray-700 dark:text-gray-300 mt-1">
						Assistant Professor Hamid F Ghatte
					</p>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Antalya Bilim University - Structural Engineering Department
					</p>
				</div>
			</section>

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
									<p className="text-lg opacity-50">{t('hero.videoComingSoon')}</p>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
