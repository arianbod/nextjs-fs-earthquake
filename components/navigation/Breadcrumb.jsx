// components/navigation/Breadcrumb.jsx
'use client';

import Link from 'next/link';
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import AssessmentSteps from '@/components/AssessmentSteps';

const Breadcrumb = ({ currentStep }) => {
	if (!currentStep) return null;

	const stepInfo = AssessmentSteps[currentStep - 1];
	if (!stepInfo) return null;

	return (
		<nav className='flex items-center text-sm py-2'>
			<ol className='flex items-center space-x-1 flex-wrap'>
				<li className='flex items-center'>
					<Link
						href='/'
						className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'>
						<Home className='h-4 w-4' />
						<span className='sr-only'>Home</span>
					</Link>
				</li>
				<li className='flex items-center'>
					<ChevronRight className='h-4 w-4 text-gray-400' />
				</li>
				<li>
					<Link
						href='/assessment/1'
						className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'>
						Assessment
					</Link>
				</li>
				<li className='flex items-center'>
					<ChevronRight className='h-4 w-4 text-gray-400' />
				</li>
				<li className='text-gray-900 dark:text-white font-medium'>
					Step {currentStep}: {stepInfo.title}
				</li>
			</ol>
		</nav>
	);
};

export default Breadcrumb;
