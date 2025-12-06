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
	HomeIcon,
	InfoIcon,
	BarChart4,
	HelpCircle,
	LayoutDashboard,
	History,
	Play,
	ChevronDown,
	Sparkles,
	Clock,
	CheckCircle2,
	AlertCircle,
	ArrowRight,
	Zap,
	Building2,
	TrendingUp,
	Bell,
	GitCompareArrows,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import AssessmentSteps from '@/components/AssessmentSteps';
import { getLastDraftAssessment, getDashboardStats } from '@/lib/actions/assessment';

const Navbar = () => {
	const pathname = usePathname();
	const router = useRouter();
	const { user, isLoaded, isSignedIn } = useUser();
	const [draftAssessment, setDraftAssessment] = useState(null);
	const [stats, setStats] = useState(null);
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [showQuickStats, setShowQuickStats] = useState(false);

	const t = useTranslations('Navigation');
	const tGreeting = useTranslations('Greeting');

	const isAssessmentPath = pathname.includes('/assessment/');
	const currentStepMatch = pathname.match(/\/assessment\/(\d+)/);
	const currentStep = currentStepMatch ? parseInt(currentStepMatch[1]) : 0;

	// Load draft assessment and stats on mount
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

	// Navigation links with smart ordering
	const navLinks = [
		{ href: '/', label: t('home'), icon: HomeIcon, showAlways: true },
		{ href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard, requiresAuth: true },
		{ href: '/alerts', label: t('alerts'), icon: Bell, requiresAuth: true },
		{ href: '/compare', label: t('compare'), icon: GitCompareArrows, requiresAuth: true },
		{ href: '/history', label: t('assessments'), icon: History, requiresAuth: true },
		{ href: '/about', label: t('about'), icon: InfoIcon, showAlways: true },
	];

	const filteredNavLinks = navLinks.filter(
		(link) => link.showAlways || (link.requiresAuth && isSignedIn)
	);

	// Quick resume handler
	const handleQuickResume = () => {
		if (draftAssessment) {
			const step = Math.min(draftAssessment.currentStep || 1, 4);
			router.push(`/assessment/${step}?id=${draftAssessment.id}`);
		}
	};

	// Greeting based on time of day
	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return tGreeting('morning');
		if (hour < 18) return tGreeting('afternoon');
		return tGreeting('evening');
	};

	return (
		<TooltipProvider>
			<nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 shadow-sm backdrop-blur-md">
				<div className="container mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-2">
					<div className="flex items-center justify-between">
						{/* Logo and Title */}
						<Link href="/" className="flex items-center space-x-2 group">
							<motion.div
								className="relative w-8 h-8"
								whileHover={{ rotate: [0, -10, 10, 0] }}
								transition={{ duration: 0.5 }}
							>
								<Image
									src="/images/logo.png"
									alt="QuakeWise"
									fill
									className="object-contain"
								/>
							</motion.div>
							<span className="font-bold text-xl hidden sm:inline-block group-hover:text-blue-600 transition-colors">
								QuakeWise
							</span>
							{isAssessmentPath && (
								<motion.div
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									className="hidden sm:flex items-center ml-4 text-sm text-gray-600 dark:text-gray-400"
								>
									<span className="mx-2">|</span>
									<span className="flex items-center gap-1">
										<Zap className="w-3 h-3 text-blue-500" />
										Step {currentStep}/{AssessmentSteps.length}
									</span>
								</motion.div>
							)}
						</Link>

						{/* Desktop Navigation */}
						<div className="hidden md:flex items-center space-x-1">
							{filteredNavLinks.map((link) => {
								const isActive = pathname === link.href;
								const Icon = link.icon;

								return (
									<Link key={link.href} href={link.href}>
										<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
											<Button
												variant={isActive ? 'default' : 'ghost'}
												size="sm"
												className={`text-sm gap-1.5 transition-all ${
													isActive
														? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
														: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
												}`}
											>
												<Icon className="h-4 w-4" />
												<span>{link.label}</span>
												{link.href === '/dashboard' && stats?.inProgress > 0 && (
													<Badge
														variant="secondary"
														className="ml-1 h-5 px-1.5 text-xs bg-amber-100 text-amber-700"
													>
														{stats.inProgress}
													</Badge>
												)}
											</Button>
										</motion.div>
									</Link>
								);
							})}

							{/* Start/Continue Assessment Button */}
							{isSignedIn && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
											<Button
												size="sm"
												className="ml-2 gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md"
											>
												<Sparkles className="h-4 w-4" />
												<span className="hidden lg:inline">
													{draftAssessment ? t('continue') : t('newAssessment')}
												</span>
												<span className="lg:hidden">{t('start')}</span>
												<ChevronDown className="h-3 w-3" />
											</Button>
										</motion.div>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-64">
										<DropdownMenuLabel className="flex items-center gap-2">
											<Building2 className="h-4 w-4" />
											{t('assessmentOptions')}
										</DropdownMenuLabel>
										<DropdownMenuSeparator />

										{/* Resume Draft */}
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
														{t('resumeStep', { step: draftAssessment.currentStep || 1, total: AssessmentSteps.length })}
													</span>
													{draftAssessment.location?.city && (
														<span className="text-xs text-muted-foreground ml-6">
															{draftAssessment.location.city}
														</span>
													)}
												</DropdownMenuItem>
												<DropdownMenuSeparator />
											</>
										)}

										{/* New Assessment */}
										<DropdownMenuItem asChild>
											<Link
												href="/assessment/1"
												className="flex items-center gap-2 py-2 cursor-pointer"
											>
												<Sparkles className="h-4 w-4 text-emerald-500" />
												<span>{t('startAssessment')}</span>
											</Link>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							)}

							{!isSignedIn && isLoaded && (
								<Link href="/assessment/1">
									<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
										<Button
											size="sm"
											className="ml-2 gap-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
										>
											<Sparkles className="h-4 w-4" />
											{t('startAssessment')}
										</Button>
									</motion.div>
								</Link>
							)}
						</div>

						{/* Right Side Actions */}
						<div className="flex items-center space-x-2">
							{/* Quick Stats Indicator (Desktop) */}
							{isSignedIn && stats && (
								<Tooltip>
									<TooltipTrigger asChild>
										<motion.button
											className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
											onClick={() => router.push('/dashboard')}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											<TrendingUp className="h-4 w-4 text-blue-500" />
											<span className="text-sm font-medium">{stats.totalCompleted || 0}</span>
										</motion.button>
									</TooltipTrigger>
									<TooltipContent>
										<p>{t('completedAssessments', { count: stats.totalCompleted || 0 })}</p>
									</TooltipContent>
								</Tooltip>
							)}

							{/* Help Button */}
							<Tooltip>
								<TooltipTrigger asChild>
									<Link href="/about" className="hidden md:flex">
										<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
											<Button
												variant="ghost"
												size="icon"
												className="transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
											>
												<HelpCircle className="h-5 w-5" />
											</Button>
										</motion.div>
									</Link>
								</TooltipTrigger>
								<TooltipContent>
									<p>{t('help')}</p>
								</TooltipContent>
							</Tooltip>

							<LanguageToggle />
							<ThemeToggle />

							{/* User Button with greeting */}
							{isSignedIn && user && (
								<div className="hidden lg:flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
									<span className="text-xs text-muted-foreground">{getGreeting()}</span>
									<UserButton afterSignOutUrl="/" />
								</div>
							)}

							{!isSignedIn && isLoaded && (
								<div className="hidden md:flex">
									<Link href="/sign-in">
										<Button variant="outline" size="sm">
											{t('signIn')}
										</Button>
									</Link>
								</div>
							)}

							<div className="lg:hidden">
								<UserButton afterSignOutUrl="/" />
							</div>

							{/* Mobile Menu */}
							<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
								<SheetTrigger asChild className="md:hidden">
									<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
										<Button variant="ghost" size="icon" className="transition-colors">
											<Menu className="h-5 w-5" />
											<span className="sr-only">Open menu</span>
										</Button>
									</motion.div>
								</SheetTrigger>
								<SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
									<div className="flex flex-col h-full">
										{/* Mobile Header */}
										<div className="p-6 border-b border-gray-200 dark:border-gray-700">
											<div className="flex items-center gap-3">
												<div className="relative w-10 h-10">
													<Image
														src="/images/logo.png"
														alt="QuakeWise"
														fill
														className="object-contain"
													/>
												</div>
												<div>
													<span className="font-bold text-xl block">QuakeWise</span>
													{isSignedIn && user && (
														<span className="text-xs text-muted-foreground">
															{getGreeting()}, {user.firstName || 'there'}
														</span>
													)}
												</div>
											</div>
										</div>

										{/* Quick Resume Card */}
										{isSignedIn && draftAssessment && (
											<div className="p-4 mx-4 mt-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
												<p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2 flex items-center gap-1">
													<Clock className="h-3 w-3" />
													{t('continueWhereLeft')}
												</p>
												<SheetClose asChild>
													<Button
														size="sm"
														className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
														onClick={handleQuickResume}
													>
														<Play className="h-4 w-4" />
														{t('resumeStepButton', { step: draftAssessment.currentStep || 1 })}
													</Button>
												</SheetClose>
											</div>
										)}

										{/* Mobile Navigation */}
										<div className="flex-1 overflow-y-auto p-4">
											<div className="space-y-1">
												{filteredNavLinks.map((link, index) => {
													const isActive = pathname === link.href;
													const Icon = link.icon;

													return (
														<motion.div
															key={link.href}
															initial={{ opacity: 0, x: -20 }}
															animate={{ opacity: 1, x: 0 }}
															transition={{ delay: index * 0.05 }}
														>
															<SheetClose asChild>
																<Link href={link.href}>
																	<Button
																		variant={isActive ? 'default' : 'ghost'}
																		className={`w-full justify-start text-sm gap-3 ${
																			isActive
																				? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
																				: ''
																		}`}
																	>
																		<Icon className="h-4 w-4" />
																		<span>{link.label}</span>
																		{link.href === '/dashboard' && stats?.inProgress > 0 && (
																			<Badge
																				variant="secondary"
																				className="ml-auto h-5 px-1.5 text-xs"
																			>
																				{stats.inProgress}
																			</Badge>
																		)}
																	</Button>
																</Link>
															</SheetClose>
														</motion.div>
													);
												})}
											</div>

											{/* Start New Assessment */}
											<div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
												<SheetClose asChild>
													<Link href="/assessment/1">
														<Button className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
															<Sparkles className="h-4 w-4" />
															{t('startNewAssessment')}
														</Button>
													</Link>
												</SheetClose>
											</div>

											{/* Assessment Steps (when in assessment) */}
											{isAssessmentPath && (
												<div className="mt-6">
													<h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
														{t('assessmentProgress')}
													</h3>
													<div className="space-y-1">
														{AssessmentSteps.slice(0, 4).map((step, index) => {
															const stepNumber = index + 1;
															const isActive = currentStep === stepNumber;
															const isComplete = currentStep > stepNumber;

															return (
																<SheetClose key={stepNumber} asChild>
																	<Link href={`/assessment/${stepNumber}`}>
																		<Button
																			variant={isActive ? 'secondary' : 'ghost'}
																			size="sm"
																			className="w-full justify-start text-sm gap-2"
																		>
																			<span
																				className={`w-5 h-5 flex items-center justify-center rounded-full text-xs ${
																					isComplete
																						? 'bg-green-500 text-white'
																						: isActive
																						? 'bg-blue-500 text-white'
																						: 'bg-gray-200 dark:bg-gray-700'
																				}`}
																			>
																				{isComplete ? (
																					<CheckCircle2 className="h-3 w-3" />
																				) : (
																					stepNumber
																				)}
																			</span>
																			<span className="truncate">{step.title}</span>
																		</Button>
																	</Link>
																</SheetClose>
															);
														})}
													</div>
												</div>
											)}
										</div>

										{/* Mobile Stats Footer */}
										{isSignedIn && stats && (
											<div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
												<div className="grid grid-cols-3 gap-2 text-center">
													<div>
														<p className="text-lg font-bold text-blue-600">
															{stats.totalCompleted || 0}
														</p>
														<p className="text-xs text-muted-foreground">Completed</p>
													</div>
													<div>
														<p className="text-lg font-bold text-amber-600">
															{stats.inProgress || 0}
														</p>
														<p className="text-xs text-muted-foreground">In Progress</p>
													</div>
													<div>
														<p className="text-lg font-bold text-emerald-600">
															{stats.averageScore ? Math.round(stats.averageScore) : '--'}%
														</p>
														<p className="text-xs text-muted-foreground">Avg Score</p>
													</div>
												</div>
											</div>
										)}

										{/* Mobile Help */}
										<div className="p-4 border-t border-gray-200 dark:border-gray-700">
											<SheetClose asChild>
												<Link href="/about">
													<Button variant="outline" className="w-full gap-2">
														<HelpCircle className="h-4 w-4" />
														{t('help')}
													</Button>
												</Link>
											</SheetClose>
										</div>
									</div>
								</SheetContent>
							</Sheet>
						</div>
					</div>
				</div>

				{/* Progress indicator for assessment pages (sticky under navbar) */}
				{isAssessmentPath && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className="hidden md:block border-t border-gray-100 dark:border-gray-800"
					>
						<div className="container mx-auto px-4">
							<div className="flex items-center gap-1 py-2">
								{AssessmentSteps.slice(0, 4).map((step, index) => {
									const stepNumber = index + 1;
									const isActive = currentStep === stepNumber;
									const isComplete = currentStep > stepNumber;

									return (
										<React.Fragment key={stepNumber}>
											<Link
												href={`/assessment/${stepNumber}`}
												className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all ${
													isActive
														? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
														: isComplete
														? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
														: 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
												}`}
											>
												<span
													className={`w-4 h-4 flex items-center justify-center rounded-full text-[10px] ${
														isComplete
															? 'bg-green-500 text-white'
															: isActive
															? 'bg-blue-500 text-white'
															: 'bg-gray-300 dark:bg-gray-600'
													}`}
												>
													{isComplete ? <CheckCircle2 className="h-2.5 w-2.5" /> : stepNumber}
												</span>
												<span className="hidden lg:inline">{step.title}</span>
											</Link>
											{index < 3 && (
												<div
													className={`flex-1 h-0.5 mx-1 rounded ${
														isComplete
															? 'bg-green-400'
															: currentStep > stepNumber
															? 'bg-blue-400'
															: 'bg-gray-200 dark:bg-gray-700'
													}`}
												/>
											)}
										</React.Fragment>
									);
								})}
							</div>
						</div>
					</motion.div>
				)}
			</nav>
		</TooltipProvider>
	);
};

export default Navbar;
