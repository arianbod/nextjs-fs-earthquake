'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	ArrowRight,
	Shield,
	Sparkles,
	Zap,
	Brain,
	MapPin,
	BarChart3,
	GraduationCap,
} from 'lucide-react';

export default function AboutPage() {
	const t = useTranslations('About');
	const heroRef = useRef(null);
	const missionRef = useRef(null);
	const techRef = useRef(null);
	const isHeroInView = useInView(heroRef, { once: true });
	const isMissionInView = useInView(missionRef, { once: true });
	const isTechInView = useInView(techRef, { once: true });

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1 },
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.6, ease: 'easeOut' },
		},
	};

	const technologies = [
		{
			icon: Brain,
			label: 'AI/ML',
			description: t('tech.aiml'),
			color: 'text-purple-600',
			bgColor: 'bg-purple-100 dark:bg-purple-900/30',
		},
		{
			icon: MapPin,
			label: t('tech.gisLabel'),
			description: t('tech.gismapping'),
			color: 'text-blue-600',
			bgColor: 'bg-blue-100 dark:bg-blue-900/30',
		},
		{
			icon: BarChart3,
			label: t('tech.realtimeLabel'),
			description: t('tech.realtimeanalysis'),
			color: 'text-green-600',
			bgColor: 'bg-green-100 dark:bg-green-900/30',
		},
	];

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section ref={heroRef} className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
				{/* Animated Background Blobs */}
				<div className="absolute inset-0 overflow-hidden">
					<motion.div
						className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
						animate={{
							x: [0, 30, 0],
							y: [0, -50, 0],
							scale: [1, 1.1, 1],
						}}
						transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
					/>
					<motion.div
						className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
						animate={{
							x: [0, -20, 0],
							y: [0, 20, 0],
							scale: [1, 0.9, 1],
						}}
						transition={{ duration: 7, delay: 2, repeat: Infinity, ease: 'easeInOut' }}
					/>
					<motion.div
						className="absolute top-40 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
						animate={{
							x: [0, 20, 0],
							y: [0, 30, 0],
							scale: [1, 1.05, 1],
						}}
						transition={{ duration: 7, delay: 4, repeat: Infinity, ease: 'easeInOut' }}
					/>

					{/* Floating particles */}
					<div className="absolute inset-0 pointer-events-none">
						{[...Array(15)].map((_, i) => (
							<motion.div
								key={i}
								className="absolute w-1 h-1 rounded-full bg-blue-400/40"
								style={{
									left: `${10 + Math.random() * 80}%`,
									top: `${10 + Math.random() * 80}%`,
								}}
								animate={{
									y: [0, -30, 0],
									opacity: [0.2, 0.6, 0.2],
								}}
								transition={{
									duration: 3 + Math.random() * 2,
									delay: i * 0.3,
									repeat: Infinity,
									ease: 'easeInOut',
								}}
							/>
						))}
					</div>
				</div>

				<div className="container mx-auto px-4 relative z-10">
					<motion.div
						className="text-center max-w-4xl mx-auto space-y-8"
						initial="hidden"
						animate={isHeroInView ? 'visible' : 'hidden'}
						variants={containerVariants}
					>
						{/* Badge */}
						<motion.div variants={itemVariants} className="inline-block">
							<motion.div
								className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-800"
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<motion.div
									animate={{ rotate: [0, 15, -15, 0] }}
									transition={{ duration: 2, repeat: Infinity }}
								>
									<Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
								</motion.div>
								<span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
									{t('hero.badge')}
								</span>
								<Badge variant="default" className="bg-purple-600 text-xs">
									{t('hero.badgeLabel')}
								</Badge>
							</motion.div>
						</motion.div>

						{/* Main Heading */}
						<motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
							<span className="block text-gray-900 dark:text-white">{t('title')}</span>
							<motion.span
								className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto]"
								animate={{ backgroundPosition: ['0% center', '200% center'] }}
								transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
							>
								{t('hero.highlight')}
							</motion.span>
						</motion.h1>

						{/* Subtitle */}
						<motion.p
							variants={itemVariants}
							className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
						>
							{t('mission.description')}
						</motion.p>

						{/* Stats */}
						<motion.div
							variants={itemVariants}
							className="flex flex-wrap justify-center gap-8 pt-6"
						>
							{[
								{ value: '25,000+', label: t('stats.assessments') },
								{ value: '95%', label: t('stats.accuracy') },
								{ value: '24/7', label: t('stats.availability') },
							].map((stat, idx) => (
								<motion.div
									key={idx}
									className="text-center"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.8 + idx * 0.15 }}
								>
									<div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
										{stat.value}
									</div>
									<div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
										{stat.label}
									</div>
								</motion.div>
							))}
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Mission Section */}
			<section ref={missionRef} className="py-16 lg:py-24 bg-white dark:bg-gray-900">
				<div className="container mx-auto px-4">
					<motion.div
						className="max-w-4xl mx-auto"
						initial="hidden"
						animate={isMissionInView ? 'visible' : 'hidden'}
						variants={containerVariants}
					>
						<motion.div variants={itemVariants} className="text-center mb-12">
							<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-800 mb-6">
								<GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
								<span className="text-sm font-medium text-blue-700 dark:text-blue-300">
									{t('mission.label')}
								</span>
							</div>
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
								{t('mission.title')}
							</h2>
							<p className="text-lg text-gray-600 dark:text-gray-300">
								{t('mission.vision')}
							</p>
						</motion.div>

						{/* Academic Support Card */}
						<motion.div
							variants={itemVariants}
							className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
						>
							<div className="flex flex-col md:flex-row items-center gap-6">
								<div className="flex-shrink-0">
									<div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
										<GraduationCap className="w-10 h-10 text-white" />
									</div>
								</div>
								<div className="text-center md:text-left">
									<div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
										{t('academic.label')}
									</div>
									<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
										{t('academic.professor')}
									</h3>
									<p className="text-gray-600 dark:text-gray-300 mb-1">
										{t('academic.university')}
									</p>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										{t('academic.specialization')}
									</p>
								</div>
							</div>
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Technology Section */}
			<section ref={techRef} className="relative py-16 lg:py-24 overflow-hidden">
				{/* Background decoration */}
				<div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full opacity-20 blur-3xl"></div>
				<div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full opacity-20 blur-3xl"></div>

				<div className="container mx-auto px-4 relative z-10">
					<motion.div
						className="max-w-5xl mx-auto"
						initial="hidden"
						animate={isTechInView ? 'visible' : 'hidden'}
						variants={containerVariants}
					>
						<motion.div variants={itemVariants} className="text-center mb-12">
							<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-800 mb-6">
								<Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
								<span className="text-sm font-medium text-purple-700 dark:text-purple-300">
									{t('tech.label')}
								</span>
							</div>
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
								{t('tech.title')}
							</h2>
							<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
								{t('tech.subtitle')}
							</p>
						</motion.div>

						{/* Technology Cards */}
						<motion.div
							variants={itemVariants}
							className="grid md:grid-cols-3 gap-6"
						>
							{technologies.map((tech, idx) => (
								<motion.div
									key={idx}
									className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow"
									whileHover={{ y: -5 }}
								>
									<div className={`w-12 h-12 rounded-xl ${tech.bgColor} flex items-center justify-center mb-4`}>
										<tech.icon className={`w-6 h-6 ${tech.color}`} />
									</div>
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
										{tech.label}
									</h3>
									<p className="text-gray-600 dark:text-gray-400 text-sm">
										{tech.description}
									</p>
								</motion.div>
							))}
						</motion.div>

						{/* CTA */}
						<motion.div
							variants={itemVariants}
							className="text-center mt-12"
						>
							<Link href="/assessment/1">
								<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
									<Button
										size="lg"
										className="text-lg px-8 py-6 gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
									>
										<motion.div
											animate={{ rotate: [0, 360] }}
											transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
										>
											<Zap className="h-5 w-5" />
										</motion.div>
										{t('cta.assessButton')}
										<ArrowRight className="h-5 w-5" />
									</Button>
								</motion.div>
							</Link>
							<p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
								{t('cta.subtitle')}
							</p>
						</motion.div>
					</motion.div>
				</div>
			</section>
		</div>
	);
}
