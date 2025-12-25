// app/(pages)/about/page.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
	ArrowRight,
	Shield,
	MapPin,
	Brain,
	Building,
	Sparkles,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AboutPage() {
	const t = useTranslations('About');
	const heroRef = useRef(null);
	const isHeroInView = useInView(heroRef, { once: true });

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

	const features = [
		{
			icon: MapPin,
			title: t('features.feature1.title'),
			description: t('features.feature1.description'),
		},
		{
			icon: Building,
			title: t('features.feature2.title'),
			description: t('features.feature2.description'),
		},
		{
			icon: Brain,
			title: t('features.feature3.title'),
			description: t('features.feature3.description'),
		},
	];

	return (
		<div className="min-h-screen">
			{/* Hero Section - matching homepage style */}
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
							>
								<Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
								<span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
									{t('mission.label')}
								</span>
							</motion.div>
						</motion.div>

						{/* Main Heading */}
						<motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
							<span className="block text-gray-900 dark:text-white">{t('title')}</span>
							<motion.span
								className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto]"
								animate={{ backgroundPosition: ['0% center', '200% center'] }}
								transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
							>
								{t('mission.title')}
							</motion.span>
						</motion.h1>

						{/* Subheading */}
						<motion.p
							variants={itemVariants}
							className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
						>
							{t('mission.description')}
						</motion.p>

						{/* Vision Quote */}
						<motion.div
							variants={itemVariants}
							className="max-w-xl mx-auto"
						>
							<div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-r-lg text-left">
								<p className="text-gray-700 dark:text-gray-300 italic">
									"{t('mission.vision')}"
								</p>
							</div>
						</motion.div>

						{/* CTA */}
						<motion.div variants={itemVariants} className="pt-4">
							<Link href="/assessment/1">
								<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
									<Button
										size="lg"
										className="text-lg px-8 py-6 gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
									>
										<Sparkles className="h-5 w-5" />
										{t('cta.assessButton')}
										<ArrowRight className="h-5 w-5" />
									</Button>
								</motion.div>
							</Link>
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Features Section - Simple 3 columns like homepage steps */}
			<section className="py-16 bg-white dark:bg-gray-900 overflow-hidden relative">
				{/* Background decoration */}
				<div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full opacity-20 blur-3xl" />
				<div className="absolute -bottom-24 -left-24 w-96 h-96 bg-green-200 dark:bg-green-900/20 rounded-full opacity-20 blur-3xl" />

				<div className="container mx-auto px-4 relative z-10">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
							{t('features.title')}
						</h2>
						<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
							{t('features.subtitle')}
						</p>
					</div>

					{/* 3 Step Features - matching homepage HowItWorks */}
					<div className="max-w-5xl mx-auto">
						<div className="grid md:grid-cols-3 gap-8">
							{features.map((feature, index) => (
								<div key={index} className="relative">
									<div className="flex flex-col items-center">
										{/* Icon circle with connecting line */}
										<div className="relative">
											<div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 z-10 border-4 border-white dark:border-gray-900">
												<feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
											</div>
											{index < features.length - 1 && (
												<div className="absolute top-1/2 left-full h-0.5 w-full bg-blue-200 dark:bg-blue-800 -translate-y-1/2 md:block hidden" />
											)}
										</div>

										{/* Content */}
										<div className="text-center mt-4">
											<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
												{feature.title}
											</h3>
											<p className="text-gray-600 dark:text-gray-400">
												{feature.description}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Simple CTA Section */}
			<section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl font-bold mb-4 text-white">
						{t('cta.title')}
					</h2>
					<p className="text-xl text-blue-100 mb-8 max-w-xl mx-auto">
						{t('cta.subtitle')}
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link href="/">
							<Button variant="outline" className="border-white text-white hover:bg-white/10 px-6 py-3">
								{t('cta.backButton')}
							</Button>
						</Link>
						<Link href="/assessment/1">
							<Button variant="secondary" className="gap-2 px-6 py-3">
								{t('cta.assessButton')} <ArrowRight className="w-4 h-4" />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Simple Footer */}
			<footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8">
				<div className="container mx-auto px-4 text-center">
					<p className="font-semibold text-gray-700 dark:text-gray-300">
						{t('footer.title')}
					</p>
					<p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">
						{t('footer.disclaimer')}
					</p>
				</div>
			</footer>
		</div>
	);
}
