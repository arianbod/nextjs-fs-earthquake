// components/navbar/Navbar.jsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import {
	Menu,
	X,
	HomeIcon,
	InfoIcon,
	BarChart4,
	Building,
	HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AssessmentSteps from '@/components/AssessmentSteps';

const Navbar = () => {
	const pathname = usePathname();
	const isAssessmentPath = pathname.includes('/assessment/');
	const currentStepMatch = pathname.match(/\/assessment\/(\d+)/);
	const currentStep = currentStepMatch ? parseInt(currentStepMatch[1]) : 0;

	// Navigation links
	const navLinks = [
		{ href: '/', label: 'Home', icon: <HomeIcon className='h-4 w-4' /> },
		{ href: '/about', label: 'About', icon: <InfoIcon className='h-4 w-4' /> },
		{
			href: '/assessment/1',
			label: 'Start Assessment',
			icon: <BarChart4 className='h-4 w-4' />,
		},
	];

	return (
		<nav className='sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm'>
			<div className='container mx-auto px-4 py-3'>
				<div className='flex items-center justify-between'>
					{/* Logo and Title - visible on all screens */}
					<Link
						href='/'
						className='flex items-center space-x-2'>
						<div className='relative w-8 h-8'>
							<Image
								src='/images/logo.png'
								alt='QuakeWise'
								fill
								className='object-contain'
							/>
						</div>
						<span className='font-bold text-xl hidden sm:inline-block'>
							QuakeWise
						</span>
						{isAssessmentPath && (
							<div className='hidden sm:flex items-center ml-4 text-sm text-gray-600 dark:text-gray-400'>
								<span>•</span>
								<span className='ml-2'>
									Step {currentStep} of {AssessmentSteps.length}
								</span>
							</div>
						)}
					</Link>

					{/* Desktop Navigation - hidden on mobile */}
					<div className='hidden md:flex items-center space-x-1'>
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}>
								<Button
									variant={pathname === link.href ? 'default' : 'ghost'}
									size='sm'
									className='text-sm'>
									{link.icon}
									<span className='ml-1'>{link.label}</span>
								</Button>
							</Link>
						))}
					</div>

					{/* Right Side Actions */}
					<div className='flex items-center space-x-2'>
						<Link
							href='/about'
							className='hidden md:flex'>
							<Button
								variant='ghost'
								size='icon'
								title='Help'>
								<HelpCircle className='h-5 w-5' />
							</Button>
						</Link>

						<ThemeToggle />

						<UserButton afterSignOutUrl='/' />

						{/* Mobile Menu */}
						<Sheet>
							<SheetTrigger
								asChild
								className='md:hidden'>
								<Button
									variant='ghost'
									size='icon'>
									<Menu className='h-5 w-5' />
									<span className='sr-only'>Open menu</span>
								</Button>
							</SheetTrigger>
							<SheetContent
								side='left'
								className='w-[250px] sm:w-[300px]'>
								<div className='flex flex-col h-full py-6'>
									{/* Mobile Logo */}
									<div className='flex items-center mb-6'>
										<div className='relative w-8 h-8 mr-2'>
											<Image
												src='/images/logo.png'
												alt='QuakeWise'
												fill
												className='object-contain'
											/>
										</div>
										<span className='font-bold text-xl'>QuakeWise</span>
									</div>

									{/* Mobile Navigation */}
									<div className='space-y-1'>
										{navLinks.map((link) => (
											<Link
												key={link.href}
												href={link.href}>
												<Button
													variant={pathname === link.href ? 'default' : 'ghost'}
													className='w-full justify-start text-base'>
													{link.icon}
													<span className='ml-2'>{link.label}</span>
												</Button>
											</Link>
										))}
									</div>

									{/* Mobile Assessment Steps */}
									{isAssessmentPath && (
										<div className='mt-6 flex-1 overflow-y-auto'>
											<h3 className='font-medium text-sm mb-2'>
												Assessment Steps
											</h3>
											<div className='space-y-1'>
												{AssessmentSteps.map((step, index) => {
													const stepNumber = index + 1;
													const isActive = currentStep === stepNumber;

													return (
														<Link
															key={stepNumber}
															href={`/assessment/${stepNumber}`}>
															<Button
																variant={isActive ? 'secondary' : 'ghost'}
																className='w-full justify-start text-sm'>
																<span className='w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-xs mr-2'>
																	{stepNumber}
																</span>
																{step.title}
															</Button>
														</Link>
													);
												})}
											</div>
										</div>
									)}

									{/* Mobile Help Link */}
									<div className='mt-auto pt-4 border-t border-gray-200 dark:border-gray-700'>
										<Link href='/about'>
											<Button
												variant='outline'
												className='w-full justify-start'>
												<HelpCircle className='h-4 w-4 mr-2' />
												Help & Support
											</Button>
										</Link>
									</div>
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
