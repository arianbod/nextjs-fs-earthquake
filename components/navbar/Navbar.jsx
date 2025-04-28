'use client';
import React from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import ModeToggle from './ThemeToggle';
import NavbarDropdown from './NavbarDropdown';
import { usePathname } from 'next/navigation';
import { ChevronLeft, Save, Headphones, MicOff, Mic } from 'lucide-react';

const Navbar = () => {
	const pathname = usePathname();
	const [voiceAssistant, setVoiceAssistant] = React.useState(false);

	// Check if we're in assessment flow
	const isInAssessment = pathname.includes('/assessment/new/');
	const isReviewOrResult =
		pathname.includes('/review') || pathname.includes('/result');

	// Get current step name from path
	const getStepName = () => {
		if (!isInAssessment) return '';

		const stepMap = {
			location: 'Location',
			building: 'Building Information',
			structure: 'Structural System',
			irregularity: 'Irregularities',
			plan: 'Building Plan',
			manipulation: 'Manipulation Review',
			conditions: 'Specific Conditions',
			loads: 'Extra Loads',
			neighbors: 'Neighboring Buildings',
			review: 'Final Review',
		};

		const currentStep = pathname.split('/').pop();
		return stepMap[currentStep] || 'Assessment';
	};

	const toggleVoiceAssistant = () => {
		setVoiceAssistant(!voiceAssistant);
		// Here you would integrate with Gemini voice API
	};

	return (
		<nav className='sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
			<div className='flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8'>
				{/* Left side: Context-aware navigation */}
				<div className='flex items-center gap-x-4'>
					<NavbarDropdown />

					{isInAssessment && (
						<div className='hidden md:flex items-center'>
							<h1 className='text-lg font-semibold'>{getStepName()}</h1>
						</div>
					)}
				</div>

				{/* Right side: Actions and user profile */}
				<div className='flex items-center gap-x-3'>
					{isInAssessment && (
						<>
							<Button
								variant='outline'
								size='sm'
								onClick={toggleVoiceAssistant}
								className='hidden md:flex items-center gap-x-1'>
								{voiceAssistant ? <MicOff size={16} /> : <Mic size={16} />}
								<span>{voiceAssistant ? 'Disable' : 'Enable'} Voice</span>
							</Button>

							<Button
								variant='outline'
								size='icon'
								onClick={toggleVoiceAssistant}
								className='md:hidden'>
								{voiceAssistant ? <MicOff size={16} /> : <Mic size={16} />}
							</Button>

							{!isReviewOrResult && (
								<Button
									size='sm'
									className='hidden md:flex items-center gap-x-1'>
									<Save size={16} />
									<span>Save Progress</span>
								</Button>
							)}
						</>
					)}

					<ModeToggle />
					<UserButton afterSignOutUrl='/' />
				</div>
			</div>

			{/* Mobile step name */}
			{isInAssessment && (
				<div className='md:hidden px-4 pb-3'>
					<h1 className='text-lg font-semibold'>{getStepName()}</h1>
				</div>
			)}
		</nav>
	);
};

export default Navbar;
