// app/(pages)/about/page.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from '@/components/ui/card';
import {
	ArrowRight,
	Shield,
	GraduationCap,
	Target,
	Lightbulb,
	Users,
	Building,
	MapPin,
	Globe,
	Cpu,
	BarChart3,
	CheckCircle2,
	Brain,
	Zap,
	Award,
	BookOpen,
	ChevronRight,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AboutPage() {
	const t = useTranslations('About');

	const stats = [
		{ value: '50K+', label: t('stats.assessments'), icon: Building },
		{ value: '95%', label: t('stats.accuracy'), icon: Target },
		{ value: '120+', label: t('stats.countries'), icon: Globe },
		{ value: '24/7', label: t('stats.availability'), icon: Zap },
	];

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

	const technologies = [
		{
			icon: Brain,
			name: 'AI/ML',
			description: t('tech.aiml'),
		},
		{
			icon: BarChart3,
			name: t('tech.seismicLabel') || 'Seismic Data',
			description: t('tech.seismicdata'),
		},
		{
			icon: MapPin,
			name: t('tech.gisLabel') || 'GIS Mapping',
			description: t('tech.gismapping'),
		},
		{
			icon: Cpu,
			name: t('tech.realtimeLabel') || 'Real-time',
			description: t('tech.realtimeanalysis'),
		},
	];

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="py-16 bg-white dark:bg-gray-900 overflow-hidden relative">
				{/* Background decoration - matching homepage style */}
				<div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full opacity-20 blur-3xl" />
				<div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full opacity-20 blur-3xl" />

				<div className="container mx-auto px-4 relative z-10">
					<div className="text-center max-w-3xl mx-auto">
						<div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
							<Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
						</div>
						<h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
							{t('title')}
						</h1>
						<p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
							{t('mission.description')}
						</p>
						<Link href="/assessment/1">
							<Button size="lg" className="gap-2">
								{t('cta.assessButton')} <ArrowRight className="w-4 h-4" />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-12 bg-gray-50 dark:bg-gray-800">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
						{stats.map((stat, index) => (
							<div
								key={index}
								className="text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
							>
								<stat.icon className="h-8 w-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
								<div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
									{stat.value}
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Mission Section */}
			<section className="py-16 bg-white dark:bg-gray-900">
				<div className="container mx-auto px-4">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<div>
							<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
								<Target className="h-4 w-4" />
								<span>{t('mission.label')}</span>
							</div>
							<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
								{t('mission.title')}
							</h2>
							<p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
								{t('mission.description')}
							</p>
							<div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
								<p className="text-gray-700 dark:text-gray-300 italic">
									"{t('mission.vision')}"
								</p>
							</div>
						</div>

						<Card className="border border-gray-200 dark:border-gray-700">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
									{t('objectives.title')}
								</CardTitle>
								<CardDescription>{t('objectives.subtitle')}</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{[1, 2, 3].map((num) => (
									<div key={num} className="flex items-start gap-3">
										<div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm flex-shrink-0">
											{num}
										</div>
										<div>
											<h4 className="font-medium text-gray-900 dark:text-white">
												{t(`objectives.objective${num}.title`)}
											</h4>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												{t(`objectives.objective${num}.description`)}
											</p>
										</div>
									</div>
								))}
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-16 bg-gray-50 dark:bg-gray-800 overflow-hidden relative">
				<div className="absolute -top-24 -left-24 w-96 h-96 bg-green-200 dark:bg-green-900/20 rounded-full opacity-20 blur-3xl" />

				<div className="container mx-auto px-4 relative z-10">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
							{t('features.title')}
						</h2>
						<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
							{t('features.subtitle')}
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{features.map((feature, index) => (
							<Card key={index} className="border border-gray-200 dark:border-gray-700">
								<CardContent className="pt-6">
									<div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
										<feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
									</div>
									<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
										{feature.title}
									</h3>
									<p className="text-gray-600 dark:text-gray-400">
										{feature.description}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Technology Section */}
			<section className="py-16 bg-white dark:bg-gray-900">
				<div className="container mx-auto px-4">
					<div className="text-center mb-12">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
							<Cpu className="h-4 w-4" />
							<span>{t('tech.label')}</span>
						</div>
						<h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
							{t('tech.title')}
						</h2>
						<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
							{t('tech.subtitle')}
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
						{technologies.map((tech, index) => (
							<div
								key={index}
								className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
							>
								<div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 mb-4">
									<tech.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
								</div>
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
									{tech.name}
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									{tech.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Academic Support Section */}
			<section className="py-16 bg-gray-50 dark:bg-gray-800 overflow-hidden relative">
				<div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full opacity-20 blur-3xl" />

				<div className="container mx-auto px-4 relative z-10">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<div className="order-2 lg:order-1">
							<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
								<GraduationCap className="h-4 w-4" />
								<span>{t('academic.label')}</span>
							</div>
							<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
								{t('academic.title')}
							</h2>
							<p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
								{t('academic.description')}
							</p>

							<Card className="border border-gray-200 dark:border-gray-700">
								<CardContent className="pt-6">
									<div className="flex items-start gap-4">
										<div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex-shrink-0">
											<GraduationCap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
										</div>
										<div>
											<h3 className="font-bold text-gray-900 dark:text-white">
												{t('academic.professor')}
											</h3>
											<p className="text-purple-600 dark:text-purple-400 text-sm font-medium">
												{t('academic.university')}
											</p>
											<p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
												{t('academic.specialization')}
											</p>
											<div className="flex flex-wrap gap-2 mt-3">
												<span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
													<Award className="w-3 h-3" />
													{t('academic.expertise1')}
												</span>
												<span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
													<BookOpen className="w-3 h-3" />
													{t('academic.expertise2')}
												</span>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						<div className="order-1 lg:order-2">
							<div className="grid grid-cols-2 gap-4">
								{[
									{ icon: BookOpen, label: t('academic.stat1'), value: '50+' },
									{ icon: Users, label: t('academic.stat2'), value: '1000+' },
									{ icon: Award, label: t('academic.stat3'), value: '25+' },
									{ icon: Globe, label: t('academic.stat4'), value: '15+' },
								].map((stat, index) => (
									<div
										key={index}
										className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-center"
									>
										<stat.icon className="w-6 h-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
										<div className="text-2xl font-bold text-gray-900 dark:text-white">
											{stat.value}
										</div>
										<p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-16 bg-blue-600 dark:bg-blue-800">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl font-bold mb-6 text-white">
						{t('cta.title')}
					</h2>
					<p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
						{t('cta.subtitle')}
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link href="/">
							<Button variant="outline" className="border-white text-white hover:bg-white/10">
								{t('cta.backButton')}
							</Button>
						</Link>
						<Link href="/assessment/1">
							<Button variant="secondary" className="gap-2">
								{t('cta.assessButton')} <ArrowRight className="w-4 h-4" />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8">
				<div className="container mx-auto px-4 text-center">
					<p className="font-semibold text-gray-700 dark:text-gray-300">
						{t('footer.title')}
					</p>
					<p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">
						{t('footer.disclaimer')}
					</p>
					<p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
						{t('footer.copyright')}
					</p>
				</div>
			</footer>
		</div>
	);
}
