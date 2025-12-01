'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	ArrowRight,
	CheckCircle2,
	Clock,
	Sparkles,
	Zap,
	Play,
	Users,
	Activity,
	X,
} from 'lucide-react';

export default function GuestHero({ onWatchDemo }) {
	const t = useTranslations('Hero');
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

	return (
		<section ref={heroRef} className="relative overflow-hidden pt-20 pb-12 lg:pt-32 lg:pb-20">
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
					className="text-center max-w-5xl mx-auto space-y-8"
					initial="hidden"
					animate={isHeroInView ? 'visible' : 'hidden'}
					variants={containerVariants}
				>
					{/* AI Badge */}
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
								<Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
							</motion.div>
							<span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
								{t('badge')}
							</span>
							<Badge variant="default" className="bg-purple-600 text-xs">
								{t('new')}
							</Badge>
						</motion.div>
					</motion.div>

					{/* Main Heading with Letter Animation */}
					<motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
						<span className="block text-gray-900 dark:text-white">{t('title')}</span>
						<motion.span
							className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto]"
							animate={{ backgroundPosition: ['0% center', '200% center'] }}
							transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
						>
							{t('titleHighlight')}
						</motion.span>
					</motion.h1>

					{/* Subheading */}
					<motion.p
						variants={itemVariants}
						className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
					>
						{t('subtitle')}
						<span className="block mt-2 text-lg">{t('subtitleSecondary')}</span>
					</motion.p>

					{/* CTA Buttons */}
					<motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
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
									{t('cta')}
									<ArrowRight className="h-5 w-5" />
								</Button>
							</motion.div>
						</Link>
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button
								variant="outline"
								size="lg"
								className="text-lg px-8 py-6 gap-3 border-2"
								onClick={onWatchDemo}
							>
								<Play className="h-5 w-5" />
								{t('watchDemo')}
							</Button>
						</motion.div>
					</motion.div>

					{/* Trust Indicators with staggered animation */}
					<motion.div
						variants={itemVariants}
						className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400 pt-4"
					>
						{[
							{ icon: CheckCircle2, text: t('accuracy'), color: 'text-green-600' },
							{ icon: Clock, text: t('assessmentTime'), color: 'text-blue-600' },
							{ icon: Users, text: t('users'), color: 'text-purple-600' },
						].map((item, idx) => (
							<motion.span
								key={idx}
								className="flex items-center gap-2"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.8 + idx * 0.15 }}
							>
								<item.icon className={`h-4 w-4 ${item.color}`} />
								{item.text}
							</motion.span>
						))}
					</motion.div>
				</motion.div>

				{/* Seismic indicator animation */}
				<motion.div
					className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2 text-gray-400"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1.5 }}
				>
					<motion.div
						animate={{ y: [0, 5, 0] }}
						transition={{ duration: 1.5, repeat: Infinity }}
						className="flex flex-col items-center"
					>
						<Activity className="w-4 h-4" />
						<div className="w-px h-8 bg-gradient-to-b from-gray-400 to-transparent" />
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
