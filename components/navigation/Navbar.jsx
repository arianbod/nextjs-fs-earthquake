// components/navigation/Navbar.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton, useUser } from '@clerk/nextjs';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import {
	Menu,
	X,
	HomeIcon,
	InfoIcon,
	LayoutDashboard,
	History,
	Play,
	ChevronDown,
	Sparkles,
	Clock,
	CheckCircle2,
	Zap,
	Building2,
	Bell,
	GitCompareArrows,
	Shield,
	Briefcase,
	ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TooltipProvider } from '@/components/ui/tooltip';
import AssessmentSteps from '@/components/AssessmentSteps';
import { getLastDraftAssessment, getDashboardStats } from '@/lib/actions/assessment';

const Navbar = () => {
	const pathname = usePathname();
	const router = useRouter();
	const { user, isLoaded, isSignedIn } = useUser();
	const [draftAssessment, setDraftAssessment] = useState(null);
	const [stats, setStats] = useState(null);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	const t = useTranslations('Navigation');
	const tGreeting = useTranslations('Greeting');
	const tSteps = useTranslations('Steps');

	const isAssessmentPath = pathname.includes('/assessment/');
	const currentStepMatch = pathname.match(/\/assessment\/(\d+)/);
	const currentStep = currentStepMatch ? parseInt(currentStepMatch[1]) : 0;

	// Helper function to get translated step name
	const getStepName = (stepNumber) => {
		const stepKeys = ['location', 'photos', 'confirmDetails', 'extraDetails'];
		return tSteps(`names.${stepKeys[stepNumber - 1]}`);
	};

	// Track scroll for navbar style
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 10);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Load draft assessment and stats
	useEffect(() => {
		if (isSignedIn) {
			loadUserData();
		}
	}, [isSignedIn]);

	const loadUserData = async () => {
		try {
			const [draftResult, statsResult] = await Promise.all([
				getLastDraftAssessment().catch(() => null),
				getDashboardStats().catch(() => null),
			]);

			if (draftResult?.success && draftResult.assessment) {
				setDraftAssessment(draftResult.assessment);
			}
			if (statsResult?.success && statsResult.stats) {
				setStats(statsResult.stats);
			}
		} catch (error) {
			console.error('Error loading user data:', error);
		}
	};

	// Navigation links
	const mainNavLinks = [
		{ href: '/', label: t('home'), icon: HomeIcon, showAlways: true },
		{ href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard, requiresAuth: true },
		{ href: '/portfolio', label: t('portfolio'), icon: Briefcase, requiresAuth: true },
		{ href: '/safety-hub', label: t('safetyHub'), icon: Shield, showAlways: true },
	];

	const moreNavLinks = [
		{ href: '/alerts', label: t('alerts'), icon: Bell, requiresAuth: true },
		{ href: '/compare', label: t('compare'), icon: GitCompareArrows, requiresAuth: true },
		{ href: '/history', label: t('assessments'), icon: History, requiresAuth: true },
		{ href: '/about', label: t('about'), icon: InfoIcon, showAlways: true },
	];

	const allNavLinks = [...mainNavLinks, ...moreNavLinks];

	const filteredMainLinks = mainNavLinks.filter(
		(link) => link.showAlways || (link.requiresAuth && isSignedIn)
	);

	const filteredMoreLinks = moreNavLinks.filter(
		(link) => link.showAlways || (link.requiresAuth && isSignedIn)
	);

	const filteredAllLinks = allNavLinks.filter(
		(link) => link.showAlways || (link.requiresAuth && isSignedIn)
	);

	// Quick resume handler
	const handleQuickResume = () => {
		if (draftAssessment) {
			const step = Math.min(draftAssessment.currentStep || 1, 4);
			router.push(`/assessment/${step}?id=${draftAssessment.id}`);
			setMobileMenuOpen(false);
		}
	};

	// Greeting
	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return tGreeting('morning');
		if (hour < 18) return tGreeting('afternoon');
		return tGreeting('evening');
	};

	return (
		<TooltipProvider>
			<nav
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
					scrolled
						? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg shadow-black/5'
						: 'bg-white/60 dark:bg-gray-900/60 backdrop-blur-md'
				}`}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						{/* Logo */}
						<Link href="/" className="flex items-center gap-2.5 group shrink-0">
							<motion.div
								className="relative w-9 h-9 sm:w-10 sm:h-10"
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<Image
									src="/images/logo.png"
									alt="QuakeWise"
									fill
									className="object-contain"
								/>
							</motion.div>
							<div className="flex flex-col">
								<span className="font-bold text-lg sm:text-xl tracking-tight text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
									QuakeWise
								</span>
								{isAssessmentPath && (
									<span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium hidden sm:block">
										{tSteps('stepOf', { current: currentStep, total: AssessmentSteps.length })}
									</span>
								)}
							</div>
						</Link>

						{/* Desktop Navigation */}
						<div className="hidden lg:flex items-center gap-1">
							{filteredMainLinks.map((link) => {
								const isActive = pathname === link.href;
								const Icon = link.icon;

								return (
									<Link key={link.href} href={link.href}>
										<Button
											variant="ghost"
											size="sm"
											className={`h-9 px-3 text-sm font-medium transition-all ${
												isActive
													? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
													: 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
											}`}
										>
											<Icon className="h-4 w-4 mr-1.5" />
											{link.label}
											{link.href === '/dashboard' && stats?.inProgress > 0 && (
												<Badge className="ml-1.5 h-5 px-1.5 text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
													{stats.inProgress}
												</Badge>
											)}
										</Button>
									</Link>
								);
							})}

							{/* More Dropdown */}
							{filteredMoreLinks.length > 0 && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											className="h-9 px-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
										>
											{t('more')}
											<ChevronDown className="h-3.5 w-3.5 ml-1" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-48">
										{filteredMoreLinks.map((link) => {
											const Icon = link.icon;
											const isActive = pathname === link.href;
											return (
												<DropdownMenuItem key={link.href} asChild>
													<Link
														href={link.href}
														className={`flex items-center gap-2 ${isActive ? 'text-blue-600' : ''}`}
													>
														<Icon className="h-4 w-4" />
														{link.label}
													</Link>
												</DropdownMenuItem>
											);
										})}
									</DropdownMenuContent>
								</DropdownMenu>
							)}
						</div>

						{/* Right Side */}
						<div className="flex items-center gap-2 sm:gap-3">
							{/* CTA Button - Desktop */}
							<div className="hidden sm:block">
								{isSignedIn ? (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												size="sm"
												className="h-9 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
											>
												<Sparkles className="h-4 w-4 mr-1.5" />
												<span className="hidden md:inline">
													{draftAssessment ? t('continue') : t('newAssessment')}
												</span>
												<span className="md:hidden">{t('start')}</span>
												<ChevronDown className="h-3.5 w-3.5 ml-1.5" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-56">
											{draftAssessment && (
												<>
													<DropdownMenuItem
														onClick={handleQuickResume}
														className="flex flex-col items-start py-3 cursor-pointer"
													>
														<div className="flex items-center gap-2 text-blue-600 font-medium">
															<Play className="h-4 w-4" />
															{t('continueAssessment')}
														</div>
														<span className="text-xs text-muted-foreground mt-1 ml-6">
															{t('step', { current: draftAssessment.currentStep || 1, total: AssessmentSteps.length })}
														</span>
													</DropdownMenuItem>
													<DropdownMenuSeparator />
												</>
											)}
											<DropdownMenuItem asChild>
												<Link href="/assessment/1" className="flex items-center gap-2">
													<Sparkles className="h-4 w-4 text-blue-500" />
													{t('startNewAssessment')}
												</Link>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								) : isLoaded ? (
									<Link href="/assessment/1">
										<Button
											size="sm"
											className="h-9 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25"
										>
											<Sparkles className="h-4 w-4 mr-1.5" />
											{t('startAssessment')}
										</Button>
									</Link>
								) : null}
							</div>

							{/* Divider */}
							<div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-gray-700" />

							{/* Settings Group */}
							<div className="flex items-center gap-1">
								<LanguageToggle />
								<ThemeToggle />
							</div>

							{/* User Section */}
							{isSignedIn && user ? (
								<div className="hidden md:flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
									<div className="text-right hidden lg:block">
										<p className="text-xs text-gray-500 dark:text-gray-400">{getGreeting()}</p>
										<p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[100px]">
											{user.firstName || 'User'}
										</p>
									</div>
									<UserButton
										afterSignOutUrl="/"
										appearance={{
											elements: {
												avatarBox: 'w-8 h-8',
											},
										}}
									/>
								</div>
							) : isLoaded ? (
								<div className="hidden md:block">
									<Link href="/sign-in">
										<Button variant="ghost" size="sm" className="h-9">
											{t('signIn')}
										</Button>
									</Link>
								</div>
							) : null}

							{/* Mobile User */}
							<div className="md:hidden">
								{isSignedIn && <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />}
							</div>

							{/* Mobile Menu Button */}
							<Button
								variant="ghost"
								size="sm"
								className="lg:hidden h-9 w-9 p-0"
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							>
								<AnimatePresence mode="wait">
									{mobileMenuOpen ? (
										<motion.div
											key="close"
											initial={{ rotate: -90, opacity: 0 }}
											animate={{ rotate: 0, opacity: 1 }}
											exit={{ rotate: 90, opacity: 0 }}
											transition={{ duration: 0.15 }}
										>
											<X className="h-5 w-5" />
										</motion.div>
									) : (
										<motion.div
											key="menu"
											initial={{ rotate: 90, opacity: 0 }}
											animate={{ rotate: 0, opacity: 1 }}
											exit={{ rotate: -90, opacity: 0 }}
											transition={{ duration: 0.15 }}
										>
											<Menu className="h-5 w-5" />
										</motion.div>
									)}
								</AnimatePresence>
							</Button>
						</div>
					</div>
				</div>

				{/* Assessment Progress Bar */}
				{isAssessmentPath && (
					<div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
							<div className="flex items-center gap-2 py-2 overflow-x-auto scrollbar-hide">
								{AssessmentSteps.slice(0, 4).map((step, index) => {
									const stepNumber = index + 1;
									const isActive = currentStep === stepNumber;
									const isComplete = currentStep > stepNumber;

									return (
										<React.Fragment key={stepNumber}>
											<Link
												href={`/assessment/${stepNumber}`}
												className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
													isActive
														? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
														: isComplete
														? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
														: 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
												}`}
											>
												<span
													className={`w-5 h-5 flex items-center justify-center rounded-full text-[11px] font-semibold ${
														isComplete
															? 'bg-green-500 text-white'
															: isActive
															? 'bg-blue-500 text-white'
															: 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
													}`}
												>
													{isComplete ? <CheckCircle2 className="h-3 w-3" /> : stepNumber}
												</span>
												<span className="hidden sm:inline">{getStepName(stepNumber)}</span>
											</Link>
											{index < 3 && (
												<div
													className={`w-8 sm:w-12 h-0.5 rounded-full shrink-0 ${
														isComplete
															? 'bg-green-400 dark:bg-green-500'
															: 'bg-gray-200 dark:bg-gray-700'
													}`}
												/>
											)}
										</React.Fragment>
									);
								})}
							</div>
						</div>
					</div>
				)}
			</nav>

			{/* Spacer for fixed navbar */}
			<div className={`${isAssessmentPath ? 'h-28 sm:h-[104px]' : 'h-16'}`} />

			{/* Mobile Menu Overlay */}
			<AnimatePresence>
				{mobileMenuOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
							onClick={() => setMobileMenuOpen(false)}
						/>

						{/* Menu Panel */}
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ type: 'spring', damping: 25, stiffness: 300 }}
							className="fixed top-16 left-0 right-0 z-40 lg:hidden"
						>
							<div className="bg-white dark:bg-gray-900 shadow-xl border-b border-gray-200 dark:border-gray-800 max-h-[calc(100vh-4rem)] overflow-y-auto">
								{/* Quick Resume */}
								{isSignedIn && draftAssessment && (
									<div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-100 dark:border-blue-800">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
												<Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium text-gray-900 dark:text-white truncate">
													{t('continueAssessment')}
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">
													{t('step', { current: draftAssessment.currentStep || 1, total: AssessmentSteps.length })}
												</p>
											</div>
											<Button
												size="sm"
												onClick={handleQuickResume}
												className="shrink-0 bg-blue-600 hover:bg-blue-700"
											>
												<Play className="h-4 w-4 mr-1" />
												{t('resume')}
											</Button>
										</div>
									</div>
								)}

								{/* Navigation Links */}
								<div className="p-2">
									{filteredAllLinks.map((link, index) => {
										const isActive = pathname === link.href;
										const Icon = link.icon;

										return (
											<motion.div
												key={link.href}
												initial={{ opacity: 0, x: -10 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: index * 0.03 }}
											>
												<Link
													href={link.href}
													onClick={() => setMobileMenuOpen(false)}
													className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
														isActive
															? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
															: 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
													}`}
												>
													<Icon className="h-5 w-5" />
													<span className="font-medium">{link.label}</span>
													{link.href === '/dashboard' && stats?.inProgress > 0 && (
														<Badge className="ml-auto bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
															{stats.inProgress}
														</Badge>
													)}
													{isActive && (
														<div className="ml-auto w-2 h-2 rounded-full bg-blue-500" />
													)}
												</Link>
											</motion.div>
										);
									})}
								</div>

								{/* CTA Section */}
								<div className="p-4 border-t border-gray-100 dark:border-gray-800">
									<Link
										href="/assessment/1"
										onClick={() => setMobileMenuOpen(false)}
									>
										<Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">
											<Sparkles className="h-5 w-5 mr-2" />
											{t('startNewAssessment')}
											<ArrowRight className="h-4 w-4 ml-2" />
										</Button>
									</Link>
								</div>

								{/* Stats Footer */}
								{isSignedIn && stats && (
									<div className="px-4 pb-4">
										<div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
											<div className="text-center">
												<p className="text-xl font-bold text-blue-600 dark:text-blue-400">
													{stats.totalCompleted || 0}
												</p>
												<p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
													{t('stats.completed')}
												</p>
											</div>
											<div className="text-center border-x border-gray-200 dark:border-gray-700">
												<p className="text-xl font-bold text-amber-600 dark:text-amber-400">
													{stats.inProgress || 0}
												</p>
												<p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
													{t('stats.inProgress')}
												</p>
											</div>
											<div className="text-center">
												<p className="text-xl font-bold text-green-600 dark:text-green-400">
													{stats.averageScore ? Math.round(stats.averageScore) : '--'}
												</p>
												<p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
													{t('stats.avgScore')}
												</p>
											</div>
										</div>
									</div>
								)}

								{/* Sign In for guests */}
								{!isSignedIn && isLoaded && (
									<div className="p-4 border-t border-gray-100 dark:border-gray-800">
										<Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
											<Button variant="outline" className="w-full">
												{t('signIn')}
											</Button>
										</Link>
									</div>
								)}
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</TooltipProvider>
	);
};

export default Navbar;
