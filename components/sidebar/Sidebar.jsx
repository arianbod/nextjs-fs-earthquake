'use client';
import React from 'react';
import Logo from '@/assets/main.png';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import {
	HomeIcon,
	ClipboardList,
	PlusCircle,
	MessageCircle,
	Info,
	ChevronLeft,
	Settings,
} from 'lucide-react';

const Sidebar = () => {
	const pathname = usePathname();

	// New navigation structure
	const mainLinks = [
		{ href: '/dashboard', icon: <HomeIcon size={18} />, label: 'Dashboard' },
		{
			href: '/assessments',
			icon: <ClipboardList size={18} />,
			label: 'My Assessments',
		},
		{
			href: '/start-assessment',
			icon: <PlusCircle size={18} />,
			label: 'New Assessment',
		},
		{ href: '/chat', icon: <MessageCircle size={18} />, label: 'AI Assistant' },
	];

	const secondaryLinks = [
		{ href: '/about', icon: <Info size={18} />, label: 'About' },
		{ href: '/settings', icon: <Settings size={18} />, label: 'Settings' },
	];

	// Check if current path is in an assessment flow
	const isInAssessment = pathname.includes('/assessment/new/');

	return (
		<aside className='py-4 px-6 bg-muted h-full flex flex-col'>
			<div className='flex-none'>
				<Link href='/dashboard'>
					<div className='flex items-center mb-8'>
						<Image
							src={Logo}
							alt='Earthquake Assessment'
							className='rounded-full w-12 h-12'
						/>
						<div className='ml-3 font-medium text-sm'>
							Earthquake
							<br />
							Impact Assessment
						</div>
					</div>
				</Link>
			</div>

			<div className='flex-1'>
				{isInAssessment ? (
					// Assessment navigation with back button
					<div className='flex flex-col gap-y-2'>
						<Button
							asChild
							variant='outline'
							className='justify-start mb-4'>
							<Link href='/assessments'>
								<ChevronLeft
									size={16}
									className='mr-2'
								/>
								<span>Back to Assessments</span>
							</Link>
						</Button>

						<div className='py-2 px-3 bg-primary/10 rounded-md'>
							<h3 className='font-medium mb-2'>Assessment Steps</h3>
							<div className='ml-2 flex flex-col gap-y-1.5'>
								<AssessmentStepLink
									active={pathname.includes('/location')}
									completed={true}
									href='/assessment/new/location'
									label='1. Location'
								/>
								<AssessmentStepLink
									active={pathname.includes('/building')}
									completed={
										pathname.includes('/structure') ||
										pathname.includes('/irregularity')
									}
									href='/assessment/new/building'
									label='2. Building Info'
								/>
								<AssessmentStepLink
									active={pathname.includes('/structure')}
									completed={pathname.includes('/irregularity')}
									href='/assessment/new/structure'
									label='3. Structure'
								/>
								{/* Add more assessment steps */}
							</div>
						</div>
					</div>
				) : (
					// Main navigation
					<div className='space-y-1'>
						{mainLinks.map(({ href, icon, label }) => (
							<Button
								key={href}
								asChild
								variant={pathname === href ? 'default' : 'ghost'}
								className='w-full justify-start'>
								<Link
									href={href}
									className='flex items-center gap-x-2'>
									{icon}
									<span>{label}</span>
								</Link>
							</Button>
						))}
					</div>
				)}
			</div>

			<div className='flex-none mt-auto pt-4 border-t border-border/30'>
				{secondaryLinks.map(({ href, icon, label }) => (
					<Button
						key={href}
						asChild
						variant='ghost'
						className='w-full justify-start'>
						<Link
							href={href}
							className='flex items-center gap-x-2'>
							{icon}
							<span className='text-sm'>{label}</span>
						</Link>
					</Button>
				))}
			</div>
		</aside>
	);
};

// Helper component for assessment steps in sidebar
const AssessmentStepLink = ({ active, completed, href, label }) => {
	return (
		<Link
			href={href}
			className='block'>
			<div
				className={`
        py-1.5 px-2 rounded text-sm flex items-center
        ${active ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/5'}
        ${completed && !active ? 'text-muted-foreground' : ''}
      `}>
				<div
					className={`
          w-4 h-4 rounded-full mr-2 flex items-center justify-center
          ${completed ? 'bg-green-500' : 'border border-current'}
        `}>
					{completed && <span className='text-white text-[10px]'>✓</span>}
				</div>
				{label}
			</div>
		</Link>
	);
};

export default Sidebar;
