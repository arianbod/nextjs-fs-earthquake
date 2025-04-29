// components/sidebar/Sidebar.jsx
'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AssessmentSteps from '@/components/AssessmentSteps';
import {
	HomeIcon,
	InfoIcon,
	FileText,
	Settings,
	LayoutDashboard,
	MessageSquare,
	BarChart4,
	Building,
	MapPin,
	CheckCircle2,
} from 'lucide-react';

const Sidebar = ({ currentStep = 0 }) => {
	const pathname = usePathname();
	const isAssessmentActive = pathname.includes('/assessment/');
	const isResultActive = pathname.includes('/result/');

	// Main navigation links
	const mainLinks = [
		{
			href: '/',
			icon: <HomeIcon className='h-5 w-5' />,
			label: 'Home',
			description: 'Back to homepage',
		},
		{
			href: '/about',
			icon: <InfoIcon className='h-5 w-5' />,
			label: 'About',
			description: 'Learn about QuakeWise',
		},
		{
			href: '/assessment/1',
			icon: <BarChart4 className='h-5 w-5' />,
			label: 'Assessment',
			description: 'Start building assessment',
		},
	];

	// Assessment steps with icons
	const assessmentIcons = {
		1: <MapPin className='h-4 w-4' />,
		2: <Building className='h-4 w-4' />,
		3: <FileText className='h-4 w-4' />,
		4: <Settings className='h-4 w-4' />,
		5: <LayoutDashboard className='h-4 w-4' />,
		6: <MessageSquare className='h-4 w-4' />,
		7: <CheckCircle2 className='h-4 w-4' />,
		8: <BarChart4 className='h-4 w-4' />,
		9: <Building className='h-4 w-4' />,
	};

	return (
		<div className='h-full py-6 px-4 flex flex-col'>
			{/* Logo */}
			<Link
				href='/'
				className='block mb-8'>
				<div className='flex justify-center'>
					<div className='relative w-32 h-32'>
						<Image
							src='/images/logo.png'
							alt='QuakeWise Logo'
							fill
							className='object-contain p-2'
							priority
						/>
					</div>
				</div>
			</Link>

			{/* Main Navigation */}
			<div className='mb-8'>
				<h3 className='text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-2 px-2'>
					Main Navigation
				</h3>
				<nav className='space-y-1'>
					{mainLinks.map(({ href, icon, label, description }) => {
						const isActive =
							href === '/'
								? pathname === '/'
								: href === '/about'
								? pathname === '/about'
								: href === '/assessment/1'
								? isAssessmentActive || isResultActive
								: pathname === href;

						return (
							<Link
								href={href}
								key={href}>
								<div
									className={`flex items-center space-x-3 px-2 py-2 rounded-md text-sm group transition-colors
									${
										isActive
											? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200'
											: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
									}`}>
									<div
										className={`p-1 rounded-md ${
											isActive
												? 'bg-blue-100 dark:bg-blue-800'
												: 'bg-gray-100 dark:bg-gray-800'
										}`}>
										{icon}
									</div>
									<div>
										<div className='font-medium'>{label}</div>
										<div className='text-xs text-gray-500 dark:text-gray-400'>
											{description}
										</div>
									</div>
								</div>
							</Link>
						);
					})}
				</nav>
			</div>

			{/* Assessment Steps */}
			{isAssessmentActive && (
				<div className='flex-1 overflow-y-auto'>
					<h3 className='text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-2 px-2'>
						Assessment Steps
					</h3>
					<div className='space-y-1'>
						{AssessmentSteps.map((step, index) => {
							const stepNumber = index + 1;
							const isStepActive = pathname === `/assessment/${stepNumber}`;
							const isCompleted = currentStep > stepNumber;
							const icon = assessmentIcons[stepNumber] || (
								<FileText className='h-4 w-4' />
							);

							return (
								<Link
									href={`/assessment/${stepNumber}`}
									key={stepNumber}>
									<div
										className={`flex items-center px-2 py-2 rounded-md text-sm transition-colors
										${
											isStepActive
												? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200'
												: isCompleted
												? 'text-green-700 dark:text-green-400'
												: 'text-gray-500 dark:text-gray-400'
										}`}>
										<div
											className={`w-6 h-6 flex items-center justify-center rounded-full mr-2
											${
												isStepActive
													? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
													: isCompleted
													? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
													: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
											}`}>
											{isCompleted ? (
												<CheckCircle2 className='h-4 w-4' />
											) : (
												<span>{stepNumber}</span>
											)}
										</div>
										{step.title}
									</div>
								</Link>
							);
						})}
					</div>
				</div>
			)}

			{/* User Guide */}
			<div className='mt-auto pt-4 border-t border-gray-200 dark:border-gray-700'>
				<Link href='/about'>
					<div className='bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg'>
						<h4 className='font-medium text-blue-700 dark:text-blue-300 text-sm'>
							Need Help?
						</h4>
						<p className='text-xs text-gray-600 dark:text-gray-400 mt-1'>
							Check our user guide for detailed instructions
						</p>
					</div>
				</Link>
			</div>
		</div>
	);
};

export default Sidebar;
