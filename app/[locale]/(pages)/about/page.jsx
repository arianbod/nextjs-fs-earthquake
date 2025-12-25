// app/(pages)/about/page.jsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
	ArrowLeft,
	ArrowRight,
	Shield,
	GraduationCap,
	Target,
	Lightbulb,
	Users,
	Building,
	MapPin,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AboutPage() {
	const t = useTranslations('About');
	return (
		<div className='min-h-screen'>
			{/* Hero Section */}
			<section className='bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 pt-16 pb-24'>
				<div className='container mx-auto px-4'>
					<div className='text-center max-w-4xl mx-auto'>
						<div className='inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6'>
							<Shield className='h-6 w-6 text-blue-600 dark:text-blue-400' />
						</div>
						<h1 className='text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white'>
							{t('title')}
						</h1>
						<p className='text-xl text-gray-700 dark:text-gray-300 mb-8'>
							{t('mission.description')}
						</p>
					</div>
				</div>
			</section>

			{/* Mission Section */}
			<section className='py-16 bg-white dark:bg-gray-900'>
				<div className='container mx-auto px-4'>
					<div className='grid md:grid-cols-2 gap-12 items-center'>
						<div>
							<div className='relative rounded-2xl overflow-hidden shadow-lg'>
								<Image
									src='/images/mission-image.jpg'
									alt={t('missionImage.alt')}
									width={600}
									height={400}
									className='w-full h-auto object-cover'
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end'>
									<div className='p-6 text-white'>
										<h3 className='text-xl font-semibold'>
											{t('missionImage.title')}
										</h3>
										<p className='text-sm text-white/80'>
											{t('missionImage.subtitle')}
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className='space-y-6'>
							<div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium'>
								<Target className='h-4 w-4' />
								<span>{t('mission.label')}</span>
							</div>

							<h2 className='text-3xl font-bold text-gray-900 dark:text-white'>
								{t('mission.title')}
							</h2>
							<p className='text-lg text-gray-700 dark:text-gray-300'>
								{t('mission.description')}
							</p>

							<div className='border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-r-md'>
								<p className='text-gray-700 dark:text-gray-300 italic'>
									"{t('mission.vision')}"
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Objectives Section */}
			<section className='py-16 bg-gray-50 dark:bg-gray-800'>
				<div className='container mx-auto px-4'>
					<div className='text-center mb-12'>
						<div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-4'>
							<Lightbulb className='h-4 w-4' />
							<span>{t('objectives.label')}</span>
						</div>
						<h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>
							{t('objectives.title')}
						</h2>
						<p className='text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto'>
							{t('objectives.subtitle')}
						</p>
					</div>

					<div className='grid md:grid-cols-3 gap-8 max-w-5xl mx-auto'>
						{[1, 2, 3].map((index) => (
							<div
								key={index}
								className='bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow'>
								<div className='rounded-full bg-blue-100 dark:bg-blue-900/30 w-12 h-12 flex items-center justify-center mb-4'>
									<span className='text-blue-600 dark:text-blue-400 font-bold text-xl'>
										{index}
									</span>
								</div>
								<h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-3'>
									{t(`objectives.objective${index}.title`)}
								</h3>
								<p className='text-gray-600 dark:text-gray-400'>
									{t(`objectives.objective${index}.description`)}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Academic Support */}
			<section className='py-16 bg-white dark:bg-gray-900'>
				<div className='container mx-auto px-4'>
					<div className='grid md:grid-cols-2 gap-12 items-center'>
						<div className='order-2 md:order-1'>
							<div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4'>
								<GraduationCap className='h-4 w-4' />
								<span>{t('academic.label')}</span>
							</div>

							<h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>
								{t('academic.title')}
							</h2>

							<p className='text-lg text-gray-700 dark:text-gray-300 mb-6'>
								{t('academic.description')}
							</p>

							<div className='bg-gray-100 dark:bg-gray-800 p-6 rounded-xl'>
								<div className='flex items-start space-x-4'>
									<div className='relative w-16 h-16 rounded-full overflow-hidden border-2 border-blue-200 dark:border-blue-800'>
										<Image
											src='/images/professor.jpg'
											alt={t('academic.professor')}
											fill
											className='object-cover'
										/>
									</div>
									<div>
										<h3 className='font-bold text-gray-900 dark:text-white'>
											{t('academic.professor')}
										</h3>
										<p className='text-gray-600 dark:text-gray-400 text-sm'>
											{t('academic.university')}
										</p>
										<p className='text-gray-600 dark:text-gray-400 text-sm mt-2'>
											{t('academic.specialization')}
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className='order-1 md:order-2'>
							<div className='grid grid-cols-2 gap-4'>
								<div className='aspect-square rounded-xl overflow-hidden shadow-lg'>
									<Image
										src='/images/academic-support-1.jpg'
										alt={t('academic.imageAlt1')}
										width={300}
										height={300}
										className='w-full h-full object-cover'
									/>
								</div>
								<div className='aspect-square rounded-xl overflow-hidden shadow-lg'>
									<Image
										src='/images/academic-support-2.jpg'
										alt={t('academic.imageAlt2')}
										width={300}
										height={300}
										className='w-full h-full object-cover'
									/>
								</div>
								<div className='col-span-2 aspect-video rounded-xl overflow-hidden shadow-lg'>
									<Image
										src='/images/academic-support-3.jpg'
										alt={t('academic.imageAlt3')}
										width={600}
										height={300}
										className='w-full h-full object-cover'
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className='py-16 bg-gray-50 dark:bg-gray-800'>
				<div className='container mx-auto px-4'>
					<div className='text-center mb-12'>
						<h2 className='text-3xl font-bold mb-4 text-gray-900 dark:text-white'>
							{t('features.title')}
						</h2>
						<p className='text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto'>
							{t('features.subtitle')}
						</p>
					</div>

					<div className='grid md:grid-cols-3 gap-8'>
						<div className='bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700'>
							<MapPin className='h-8 w-8 text-blue-600 dark:text-blue-400 mb-4' />
							<h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-3'>
								{t('features.feature1.title')}
							</h3>
							<p className='text-gray-600 dark:text-gray-400'>
								{t('features.feature1.description')}
							</p>
						</div>

						<div className='bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700'>
							<Building className='h-8 w-8 text-blue-600 dark:text-blue-400 mb-4' />
							<h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-3'>
								{t('features.feature2.title')}
							</h3>
							<p className='text-gray-600 dark:text-gray-400'>
								{t('features.feature2.description')}
							</p>
						</div>

						<div className='bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700'>
							<Users className='h-8 w-8 text-blue-600 dark:text-blue-400 mb-4' />
							<h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-3'>
								{t('features.feature3.title')}
							</h3>
							<p className='text-gray-600 dark:text-gray-400'>
								{t('features.feature3.description')}
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className='py-16 bg-blue-600 dark:bg-blue-800'>
				<div className='container mx-auto px-4 text-center'>
					<h2 className='text-3xl font-bold mb-6 text-white'>
						{t('cta.title')}
					</h2>
					<p className='text-xl text-blue-100 mb-8 max-w-2xl mx-auto'>
						{t('cta.subtitle')}
					</p>
					<div className='flex flex-col sm:flex-row gap-4 justify-center'>
						<Link href='/'>
							<Button
								variant='outline'
								className='text-lg border-white text-white hover:bg-white/10'>
								<ArrowLeft className='mr-2 h-5 w-5' /> {t('cta.backButton')}
							</Button>
						</Link>
						<Link href='/assessment/1'>
							<Button
								variant='secondary'
								className='text-lg'>
								{t('cta.assessButton')} <ArrowRight className='ml-2 h-5 w-5' />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			<footer className='bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8'>
				<div className='container mx-auto px-4 text-center'>
					<p className='font-semibold text-gray-700 dark:text-gray-300'>
						{t('footer.title')}
					</p>
					<p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
						{t('footer.disclaimer')}
					</p>
				</div>
			</footer>
		</div>
	);
}
