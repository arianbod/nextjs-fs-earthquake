// components/steps/IrregularityStep.jsx
import React from 'react';
import Link from 'next/link';
import Data from '@/utils/Data.json';
import { Button } from '@/components/ui/button';
import { useUserInput } from '@/context/UserInputContext';
import {
	Check,
	X,
	ArrowLeft,
	ArrowRight,
	AlertTriangle,
	HelpCircle,
	Info,
} from 'lucide-react';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';

const IrregularityStep = ({ onNext }) => {
	const { userInput, updateUserInput } = useUserInput();
	const stepFourData = Data.steps.find((step) => step.step === 4);

	const handleSelectionChange = (hasIrregularity) => {
		updateUserInput({ hasIrregularity });
	};

	// Example irregularity types (you can customize these)
	const irregularityTypes = [
		{
			id: 'vertical',
			title: 'Vertical Irregularity',
			description:
				'Building has significant height variations or setbacks between floors',
			image: '/images/vertical-irregularity.jpg',
		},
		{
			id: 'plan',
			title: 'Plan Irregularity',
			description:
				'Building has an irregular floor plan (L-shaped, U-shaped, etc.)',
			image: '/images/plan-irregularity.jpg',
		},
		{
			id: 'mass',
			title: 'Mass Irregularity',
			description:
				'Building has uneven distribution of mass across different floors',
			image: '/images/mass-irregularity.jpg',
		},
	];

	return (
		<div className='max-w-4xl mx-auto'>
			<div className='text-center mb-8'>
				<div className='inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4'>
					<AlertTriangle className='h-6 w-6 text-blue-600 dark:text-blue-400' />
				</div>
				<h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
					{stepFourData.title}
				</h1>
				<p className='text-lg text-gray-600 dark:text-gray-300 mb-2'>
					{stepFourData.description}
				</p>
				<div className='inline-flex items-center bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-sm px-3 py-1 rounded-full'>
					<Info className='h-4 w-4 mr-1' />
					Irregularities may affect a building's seismic performance
				</div>
			</div>

			<Card className='shadow-md border border-gray-200 dark:border-gray-700 mb-8'>
				<CardHeader className='pb-4'>
					<CardTitle className='text-xl flex items-center gap-2'>
						Building Irregularity Assessment
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant='ghost'
										size='icon'
										className='h-6 w-6'>
										<HelpCircle className='h-4 w-4 text-gray-400' />
									</Button>
								</TooltipTrigger>
								<TooltipContent className='max-w-xs'>
									<p>
										Building irregularities can significantly impact how a
										structure responds during an earthquake
									</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</CardTitle>
					<CardDescription>
						Does your building have any structural irregularities?
					</CardDescription>
				</CardHeader>

				<CardContent>
					<div className='space-y-6'>
						{/* Selection buttons */}
						<div className='grid grid-cols-2 gap-4'>
							<Button
								variant={
									userInput.hasIrregularity === true ? 'default' : 'outline'
								}
								className={`h-20 ${
									userInput.hasIrregularity === true
										? 'border-2 border-blue-600 dark:border-blue-500'
										: ''
								}`}
								onClick={() => handleSelectionChange(true)}>
								<div className='flex flex-col items-center'>
									<div
										className={`rounded-full p-1 mb-2 ${
											userInput.hasIrregularity === true
												? 'bg-blue-100 text-blue-600'
												: 'bg-gray-100 text-gray-500'
										}`}>
										<Check className='h-5 w-5' />
									</div>
									<span>Yes, there is irregularity</span>
								</div>
							</Button>

							<Button
								variant={
									userInput.hasIrregularity === false ? 'default' : 'outline'
								}
								className={`h-20 ${
									userInput.hasIrregularity === false
										? 'border-2 border-blue-600 dark:border-blue-500'
										: ''
								}`}
								onClick={() => handleSelectionChange(false)}>
								<div className='flex flex-col items-center'>
									<div
										className={`rounded-full p-1 mb-2 ${
											userInput.hasIrregularity === false
												? 'bg-blue-100 text-blue-600'
												: 'bg-gray-100 text-gray-500'
										}`}>
										<X className='h-5 w-5' />
									</div>
									<span>No irregularity</span>
								</div>
							</Button>
						</div>

						{/* Irregularity types - shown when "Yes" is selected */}
						{userInput.hasIrregularity === true && (
							<div className='border-t pt-6 mt-6'>
								<h3 className='font-medium text-gray-900 dark:text-white mb-4'>
									Common Irregularity Types:
								</h3>
								<div className='grid md:grid-cols-3 gap-4'>
									{irregularityTypes.map((type) => (
										<div
											key={type.id}
											className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg'>
											<h4 className='font-medium text-gray-900 dark:text-white mb-2'>
												{type.title}
											</h4>
											<p className='text-sm text-gray-600 dark:text-gray-400'>
												{type.description}
											</p>
										</div>
									))}
								</div>

								<div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4 flex items-start'>
									<Info className='h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0' />
									<div className='ml-3'>
										<p className='text-sm text-blue-800 dark:text-blue-300'>
											Structural irregularities can significantly impact a
											building's seismic performance. Our assessment will take
											this into account.
										</p>
									</div>
								</div>
							</div>
						)}

						{/* Information when "No" is selected */}
						{userInput.hasIrregularity === false && (
							<div className='bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mt-4 flex items-start'>
								<Check className='h-5 w-5 text-green-600 mt-0.5 flex-shrink-0' />
								<div className='ml-3'>
									<p className='text-sm text-green-800 dark:text-green-300'>
										Regular building structures typically perform better during
										earthquakes. This is a positive factor in your assessment.
									</p>
								</div>
							</div>
						)}
					</div>
				</CardContent>

				<CardFooter className='flex justify-between pt-4 border-t'>
					<Link href='/assessment/3'>
						<Button
							variant='outline'
							className='gap-2'>
							<ArrowLeft className='h-4 w-4' /> Previous
						</Button>
					</Link>

					<Button
						onClick={onNext}
						className='gap-2'
						disabled={userInput.hasIrregularity === undefined}>
						Next <ArrowRight className='h-4 w-4' />
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
};

export default IrregularityStep;
