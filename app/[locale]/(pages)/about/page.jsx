// app/(pages)/about/page.jsx
'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	ArrowRight,
	Shield,
	GraduationCap,
	Target,
	Lightbulb,
	Users,
	Building,
	MapPin,
	Sparkles,
	Globe,
	Cpu,
	BarChart3,
	CheckCircle2,
	Brain,
	Layers,
	Zap,
	Award,
	BookOpen,
	Heart,
	TrendingUp,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

// Animated counter component
function AnimatedCounter({ end, duration = 2, suffix = '' }) {
	const [count, setCount] = useState(0);
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true });

	useEffect(() => {
		if (isInView) {
			let start = 0;
			const increment = end / (duration * 60);
			const timer = setInterval(() => {
				start += increment;
				if (start >= end) {
					setCount(end);
					clearInterval(timer);
				} else {
					setCount(Math.floor(start));
				}
			}, 1000 / 60);
			return () => clearInterval(timer);
		}
	}, [isInView, end, duration]);

	return (
		<span ref={ref}>
			{count.toLocaleString()}
			{suffix}
		</span>
	);
}

export default function AboutPage() {
	const t = useTranslations('About');
	const heroRef = useRef(null);
	const isHeroInView = useInView(heroRef, { once: true });
	const { scrollYProgress } = useScroll();
	const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

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

	const stats = [
		{ value: 50000, suffix: '+', label: t('stats.assessments'), icon: Building },
		{ value: 95, suffix: '%', label: t('stats.accuracy'), icon: Target },
		{ value: 120, suffix: '+', label: t('stats.countries'), icon: Globe },
		{ value: 24, suffix: '/7', label: t('stats.availability'), icon: Zap },
	];

	const timeline = [
		{
			year: '2023',
			title: t('timeline.item1.title'),
			description: t('timeline.item1.description'),
			icon: Lightbulb,
		},
		{
			year: '2024',
			title: t('timeline.item2.title'),
			description: t('timeline.item2.description'),
			icon: Brain,
		},
		{
			year: '2024',
			title: t('timeline.item3.title'),
			description: t('timeline.item3.description'),
			icon: Globe,
		},
		{
			year: '2025',
			title: t('timeline.item4.title'),
			description: t('timeline.item4.description'),
			icon: TrendingUp,
		},
	];

	const technologies = [
		{ name: 'AI/ML', icon: Brain, color: 'from-purple-500 to-pink-500' },
		{ name: 'Seismic Data', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
		{ name: 'GIS Mapping', icon: MapPin, color: 'from-green-500 to-emerald-500' },
		{ name: 'Real-time Analysis', icon: Cpu, color: 'from-orange-500 to-red-500' },
	];

	return (
		<div className="min-h-screen overflow-hidden">
			{/* Hero Section with Animated Background */}
			<section ref={heroRef} className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
				{/* Animated Background */}
				<div className="absolute inset-0">
					<div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900" />

					{/* Animated Blobs */}
					<motion.div
						className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20"
						animate={{
							x: [0, 50, 0],
							y: [0, -30, 0],
							scale: [1, 1.2, 1],
						}}
						transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
					/>
					<motion.div
						className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20"
						animate={{
							x: [0, -30, 0],
							y: [0, 50, 0],
							scale: [1, 0.9, 1],
						}}
						transition={{ duration: 8, delay: 2, repeat: Infinity, ease: 'easeInOut' }}
					/>
					<motion.div
						className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
						animate={{
							scale: [1, 1.3, 1],
						}}
						transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
					/>

					{/* Grid Pattern */}
					<div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
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
								className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg"
								whileHover={{ scale: 1.05 }}
							>
								<motion.div
									animate={{ rotate: [0, 15, -15, 0] }}
									transition={{ duration: 2, repeat: Infinity }}
								>
									<Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
								</motion.div>
								<span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
									{t('hero.badge')}
								</span>
								<Badge variant="default" className="bg-gradient-to-r from-blue-600 to-purple-600 text-xs">
									{t('hero.badgeLabel')}
								</Badge>
							</motion.div>
						</motion.div>

						{/* Main Title */}
						<motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
							<span className="block text-gray-900 dark:text-white">{t('title')}</span>
							<motion.span
								className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-[length:200%_auto]"
								animate={{ backgroundPosition: ['0% center', '200% center'] }}
								transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
							>
								{t('hero.highlight')}
							</motion.span>
						</motion.h1>

						{/* Description */}
						<motion.p
							variants={itemVariants}
							className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
						>
							{t('mission.description')}
						</motion.p>

						{/* CTA Buttons */}
						<motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
							<Link href="/assessment/1">
								<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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

				{/* Scroll Indicator */}
				<motion.div
					className="absolute bottom-8 left-1/2 -translate-x-1/2"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1, y: [0, 10, 0] }}
					transition={{ delay: 1, duration: 1.5, repeat: Infinity }}
				>
					<div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center">
						<motion.div
							className="w-1.5 h-3 bg-gray-400 dark:bg-gray-600 rounded-full mt-2"
							animate={{ y: [0, 12, 0] }}
							transition={{ duration: 1.5, repeat: Infinity }}
						/>
					</div>
				</motion.div>
			</section>

			{/* Stats Section */}
			<section className="py-20 relative">
				<div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/50 to-transparent dark:via-blue-900/10" />
				<div className="container mx-auto px-4 relative z-10">
					<motion.div
						className="grid grid-cols-2 md:grid-cols-4 gap-8"
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						{stats.map((stat, index) => (
							<motion.div
								key={index}
								className="text-center p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.1 }}
								whileHover={{ scale: 1.05, y: -5 }}
							>
								<stat.icon className="h-8 w-8 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
								<div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
									<AnimatedCounter end={stat.value} suffix={stat.suffix} />
								</div>
								<p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">{stat.label}</p>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>

			{/* Mission & Vision Section */}
			<section className="py-20 bg-white dark:bg-gray-900">
				<div className="container mx-auto px-4">
					<div className="grid lg:grid-cols-2 gap-16 items-center">
						{/* Left Side - Content */}
						<motion.div
							className="space-y-8"
							initial={{ opacity: 0, x: -50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
						>
							<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
								<Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
								<span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
									{t('mission.label')}
								</span>
							</div>

							<h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
								{t('mission.title')}
							</h2>

							<p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
								{t('mission.description')}
							</p>

							<motion.div
								className="relative p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-l-4 border-blue-600"
								whileHover={{ x: 10 }}
							>
								<p className="text-lg text-gray-700 dark:text-gray-300 italic">
									"{t('mission.vision')}"
								</p>
							</motion.div>

							{/* Features List */}
							<div className="grid sm:grid-cols-2 gap-4">
								{[
									{ icon: CheckCircle2, text: t('features.feature1.title') },
									{ icon: Shield, text: t('features.feature2.title') },
									{ icon: Brain, text: t('features.feature3.title') },
									{ icon: Globe, text: t('objectives.objective1.title') },
								].map((item, idx) => (
									<motion.div
										key={idx}
										className="flex items-center gap-3"
										initial={{ opacity: 0, x: -20 }}
										whileInView={{ opacity: 1, x: 0 }}
										viewport={{ once: true }}
										transition={{ delay: idx * 0.1 }}
									>
										<div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
											<item.icon className="h-5 w-5 text-green-600 dark:text-green-400" />
										</div>
										<span className="text-gray-700 dark:text-gray-300 font-medium">{item.text}</span>
									</motion.div>
								))}
							</div>
						</motion.div>

						{/* Right Side - Visual */}
						<motion.div
							className="relative"
							initial={{ opacity: 0, x: 50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
						>
							<div className="relative aspect-square max-w-lg mx-auto">
								{/* Orbiting Elements */}
								<motion.div
									className="absolute inset-0"
									animate={{ rotate: 360 }}
									transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
								>
									{[0, 60, 120, 180, 240, 300].map((angle, i) => (
										<motion.div
											key={i}
											className="absolute w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg flex items-center justify-center"
											style={{
												left: `${50 + 40 * Math.cos((angle * Math.PI) / 180)}%`,
												top: `${50 + 40 * Math.sin((angle * Math.PI) / 180)}%`,
												transform: 'translate(-50%, -50%)',
											}}
											animate={{ rotate: -360 }}
											transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
										>
											{[Building, Shield, MapPin, Users, BarChart3, Cpu][i] &&
												(() => {
													const Icon = [Building, Shield, MapPin, Users, BarChart3, Cpu][i];
													return <Icon className="h-6 w-6 text-white" />;
												})()}
										</motion.div>
									))}
								</motion.div>

								{/* Center Circle */}
								<div className="absolute inset-1/4 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl">
									<motion.div
										animate={{ scale: [1, 1.1, 1] }}
										transition={{ duration: 2, repeat: Infinity }}
									>
										<Shield className="h-16 w-16 text-white" />
									</motion.div>
								</div>

								{/* Decorative Rings */}
								<div className="absolute inset-0 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-full opacity-50" />
								<div className="absolute inset-8 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-full opacity-50" />
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Timeline Section */}
			<section className="py-20 bg-gray-50 dark:bg-gray-800">
				<div className="container mx-auto px-4">
					<motion.div
						className="text-center mb-16"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
					>
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
							<Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />
							<span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
								{t('timeline.label')}
							</span>
						</div>
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
							{t('timeline.title')}
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
							{t('timeline.subtitle')}
						</p>
					</motion.div>

					<div className="relative max-w-4xl mx-auto">
						{/* Timeline Line */}
						<div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full" />

						{timeline.map((item, index) => (
							<motion.div
								key={index}
								className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
								initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.2 }}
							>
								{/* Content */}
								<div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
									<motion.div
										className="p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700"
										whileHover={{ scale: 1.02, y: -5 }}
									>
										<span className="text-sm font-bold text-blue-600 dark:text-blue-400">{item.year}</span>
										<h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">{item.title}</h3>
										<p className="text-gray-600 dark:text-gray-400 mt-2">{item.description}</p>
									</motion.div>
								</div>

								{/* Center Icon */}
								<div className="w-2/12 flex justify-center">
									<motion.div
										className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg z-10"
										whileHover={{ scale: 1.2 }}
									>
										<item.icon className="h-6 w-6 text-white" />
									</motion.div>
								</div>

								{/* Empty Space */}
								<div className="w-5/12" />
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Technologies Section */}
			<section className="py-20 bg-white dark:bg-gray-900">
				<div className="container mx-auto px-4">
					<motion.div
						className="text-center mb-16"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
					>
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
							<Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							<span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
								{t('tech.label')}
							</span>
						</div>
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
							{t('tech.title')}
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
							{t('tech.subtitle')}
						</p>
					</motion.div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
						{technologies.map((tech, index) => (
							<motion.div
								key={index}
								className="group relative p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.1 }}
								whileHover={{ y: -10 }}
							>
								{/* Gradient Background on Hover */}
								<div className={`absolute inset-0 bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

								<motion.div
									className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tech.color} flex items-center justify-center mb-6 shadow-lg`}
									whileHover={{ rotate: 10, scale: 1.1 }}
								>
									<tech.icon className="h-8 w-8 text-white" />
								</motion.div>

								<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{tech.name}</h3>
								<p className="text-gray-600 dark:text-gray-400">
									{t(`tech.${tech.name.toLowerCase().replace(/[^a-z]/g, '')}`)}
								</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Academic Support Section */}
			<section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
				<div className="container mx-auto px-4">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<motion.div
							className="order-2 lg:order-1 space-y-8"
							initial={{ opacity: 0, x: -50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
						>
							<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
								<GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
								<span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
									{t('academic.label')}
								</span>
							</div>

							<h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
								{t('academic.title')}
							</h2>

							<p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
								{t('academic.description')}
							</p>

							{/* Professor Card */}
							<motion.div
								className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700"
								whileHover={{ scale: 1.02 }}
							>
								<div className="flex items-start gap-6">
									<div className="relative">
										<div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
											<GraduationCap className="h-10 w-10 text-white" />
										</div>
										<div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
									</div>
									<div className="flex-1">
										<h3 className="text-xl font-bold text-gray-900 dark:text-white">
											{t('academic.professor')}
										</h3>
										<p className="text-purple-600 dark:text-purple-400 font-medium">
											{t('academic.university')}
										</p>
										<p className="text-gray-600 dark:text-gray-400 mt-2">
											{t('academic.specialization')}
										</p>
										<div className="flex gap-2 mt-4">
											<Badge variant="outline" className="border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300">
												<Award className="h-3 w-3 mr-1" />
												{t('academic.expertise1')}
											</Badge>
											<Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300">
												<BookOpen className="h-3 w-3 mr-1" />
												{t('academic.expertise2')}
											</Badge>
										</div>
									</div>
								</div>
							</motion.div>
						</motion.div>

						{/* Visual */}
						<motion.div
							className="order-1 lg:order-2"
							initial={{ opacity: 0, x: 50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
						>
							<div className="relative">
								{/* Main Card */}
								<motion.div
									className="relative z-10 p-8 rounded-3xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-2xl"
									whileHover={{ rotate: 2 }}
								>
									<div className="grid grid-cols-2 gap-4">
										{[
											{ icon: BookOpen, label: t('academic.stat1'), value: '50+' },
											{ icon: Users, label: t('academic.stat2'), value: '1000+' },
											{ icon: Award, label: t('academic.stat3'), value: '25+' },
											{ icon: Globe, label: t('academic.stat4'), value: '15+' },
										].map((stat, i) => (
											<motion.div
												key={i}
												className="p-4 rounded-xl bg-white/10 backdrop-blur-sm"
												whileHover={{ scale: 1.05 }}
											>
												<stat.icon className="h-6 w-6 text-white/80 mb-2" />
												<div className="text-2xl font-bold text-white">{stat.value}</div>
												<div className="text-sm text-white/70">{stat.label}</div>
											</motion.div>
										))}
									</div>
								</motion.div>

								{/* Decorative Elements */}
								<div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 blur-2xl" />
								<div className="absolute -bottom-4 -left-4 w-32 h-32 bg-pink-400 rounded-full opacity-20 blur-2xl" />
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="relative py-24 overflow-hidden">
				{/* Animated Background */}
				<div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
					<motion.div
						className="absolute inset-0"
						animate={{
							background: [
								'linear-gradient(45deg, #2563eb, #7c3aed, #db2777)',
								'linear-gradient(45deg, #7c3aed, #db2777, #2563eb)',
								'linear-gradient(45deg, #db2777, #2563eb, #7c3aed)',
								'linear-gradient(45deg, #2563eb, #7c3aed, #db2777)',
							],
						}}
						transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
					/>
				</div>

				{/* Floating Elements */}
				<div className="absolute inset-0 overflow-hidden">
					{[...Array(20)].map((_, i) => (
						<motion.div
							key={i}
							className="absolute w-2 h-2 bg-white/20 rounded-full"
							style={{
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 100}%`,
							}}
							animate={{
								y: [-20, 20, -20],
								opacity: [0.2, 0.5, 0.2],
							}}
							transition={{
								duration: 3 + Math.random() * 2,
								delay: Math.random() * 2,
								repeat: Infinity,
							}}
						/>
					))}
				</div>

				<div className="container mx-auto px-4 relative z-10">
					<motion.div
						className="text-center max-w-3xl mx-auto"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
					>
						<motion.div
							className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6"
							whileHover={{ scale: 1.05 }}
						>
							<Heart className="h-5 w-5 text-white" />
							<span className="text-sm font-semibold text-white">{t('cta.badge')}</span>
						</motion.div>

						<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
							{t('cta.title')}
						</h2>
						<p className="text-xl text-white/90 mb-10">
							{t('cta.subtitle')}
						</p>

						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Link href="/assessment/1">
								<Button
									size="lg"
									variant="secondary"
									className="text-lg px-10 py-7 gap-3 shadow-xl hover:shadow-2xl transition-all"
								>
									<Zap className="h-6 w-6" />
									{t('cta.assessButton')}
									<ArrowRight className="h-6 w-6" />
								</Button>
							</Link>
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-900 text-white py-12">
				<div className="container mx-auto px-4">
					<div className="text-center space-y-4">
						<div className="flex items-center justify-center gap-2">
							<Shield className="h-8 w-8 text-blue-400" />
							<span className="text-2xl font-bold">QuakeWise</span>
						</div>
						<p className="text-gray-400 max-w-xl mx-auto">
							{t('footer.disclaimer')}
						</p>
						<p className="text-sm text-gray-500">
							{t('footer.copyright')}
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
