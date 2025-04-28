'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
	DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
	AlignLeft,
	HomeIcon,
	ClipboardList,
	PlusCircle,
	MessageCircle,
	Info,
	Settings,
	ChevronLeft,
} from 'lucide-react';

const NavbarDropdown = () => {
	const pathname = usePathname();

	// Check if we're in assessment flow
	const isInAssessment = pathname.includes('/assessment/new/');

	// Main navigation links
	const mainLinks = [
		{ href: '/dashboard', icon: <HomeIcon size={16} />, label: 'Dashboard' },
		{
			href: '/assessments',
			icon: <ClipboardList size={16} />,
			label: 'My Assessments',
		},
		{
			href: '/start-assessment',
			icon: <PlusCircle size={16} />,
			label: 'New Assessment',
		},
		{ href: '/chat', icon: <MessageCircle size={16} />, label: 'AI Assistant' },
	];

	// Secondary navigation links
	const secondaryLinks = [
		{ href: '/about', icon: <Info size={16} />, label: 'About' },
		{ href: '/settings', icon: <Settings size={16} />, label: 'Settings' },
	];

	// Assessment steps links (only shown when in assessment flow)
	const assessmentSteps = [
		{ href: '/assessment/new/location', label: '1. Location' },
		{ href: '/assessment/new/building', label: '2. Building Information' },
		{ href: '/assessment/new/structure', label: '3. Structural System' },
		{ href: '/assessment/new/irregularity', label: '4. Irregularities' },
		{ href: '/assessment/new/plan', label: '5. Building Plan' },
		{ href: '/assessment/new/manipulation', label: '6. Manipulation Review' },
		{ href: '/assessment/new/conditions', label: '7. Specific Conditions' },
		{ href: '/assessment/new/loads', label: '8. Extra Loads' },
		{ href: '/assessment/new/neighbors', label: '9. Neighboring Buildings' },
		{ href: '/assessment/new/review', label: 'Final Review' },
	];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant='outline'
					size='icon'
					className='lg:hidden'>
					<AlignLeft size={18} />
					<span className='sr-only'>Open menu</span>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align='start'
				className='w-56'>
				{isInAssessment ? (
					// Assessment-specific dropdown
					<>
						<DropdownMenuItem asChild>
							<Link
								href='/assessments'
								className='flex items-center gap-x-2'>
								<ChevronLeft size={16} />
								<span>Back to Assessments</span>
							</Link>
						</DropdownMenuItem>

						<DropdownMenuSeparator />
						<DropdownMenuLabel>Assessment Steps</DropdownMenuLabel>

						{assessmentSteps.map((step) => (
							<DropdownMenuItem
								key={step.href}
								asChild>
								<Link
									href={step.href}
									className={`w-full ${
										pathname === step.href ? 'font-medium' : ''
									}`}>
									{step.label}
								</Link>
							</DropdownMenuItem>
						))}
					</>
				) : (
					// Regular navigation dropdown
					<>
						{mainLinks.map((link) => (
							<DropdownMenuItem
								key={link.href}
								asChild>
								<Link
									href={link.href}
									className={`flex items-center gap-x-2 w-full ${
										pathname === link.href ? 'font-medium' : ''
									}`}>
									{link.icon}
									<span>{link.label}</span>
								</Link>
							</DropdownMenuItem>
						))}

						<DropdownMenuSeparator />

						{secondaryLinks.map((link) => (
							<DropdownMenuItem
								key={link.href}
								asChild>
								<Link
									href={link.href}
									className={`flex items-center gap-x-2 w-full ${
										pathname === link.href ? 'font-medium' : ''
									}`}>
									{link.icon}
									<span>{link.label}</span>
								</Link>
							</DropdownMenuItem>
						))}
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default NavbarDropdown;
