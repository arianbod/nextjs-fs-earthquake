// components/steps/ManipulationReviewStep.jsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Data from '@/utils/Data.json';
import { Button } from '@/components/ui/button';
import { useUserInput } from '@/context/UserInputContext';
import {
	ArrowLeft,
	ArrowRight,
	Pencil,
	CheckCircle2,
	Info,
	AlertTriangle,
} from 'lucide-react';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';

const ManipulationReviewStep = ({ onNext }) => {
	const { userInput, updateUserInput } = useUserInput();
	const stepSixData = Data.steps.find((step) => step.step === 6);

	const options = [
		{
			id: 1,
			url: '/images/no-manipulation.jpeg',
			title: 'Original Structure',
			description: 'Building without any structural modifications',
			value: false,
		},
		{
			id: 2,
			url: '/images/manipulated.png',
			title: 'Modified Structure',
			description: 'Building has undergone structural modifications',
			value: true,
		},
	];

	const handleManipulationChange = (manipulated) => {
		updateUserInput({ manipulated });
	};

	return (
		<div className='max-w-4xl mx-auto'>
			<div className='text-center mb-8'>
				<div className='inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4'>
					<Pencil className='h-6 w-6 text-blue-600 dark:text-blue-400' />
				</div>
				<h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
					{stepSixData.title}
				</h1>
				<p className='text-lg text-gray-600 dark:text-gray-300'>
					{stepSixData.description}
				</p>
			</div>

			<Card className='shadow-md border border-gray-200 dark:border-gray-700 mb-8'>
				<CardHeader className='pb-4'>
					<CardTitle className='text-xl flex items-center gap-2'>
						<Pencil className='h-5 w-5 text-blue-600 dark:text-blue-400' />
						Building Modification Status
					</CardTitle>
					<CardDescription>
						Select the option that best describes your building's current state
					</CardDescription>
				</CardHeader>

				<CardContent>
					<div className='grid md:grid-cols-2 gap-6'>
						{options.map((option) => (
							<div
								key={option.id}
								onClick={() => handleManipulationChange(option.value)}
								className={`group cursor-pointer rounded-xl overflow-hidden transition-all duration-200 ${
									userInput.manipulated === option.value
										? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-md transform scale-[1.02]'
										: 'border border-gray-200 dark:border-gray-700 hover:shadow-md'
								}`}>
								<div className='relative h-48 w-full overflow-hidden'>
									<Image
										src={option.url}
										fill
										alt={option.description}
										className='object-cover transition-transform duration-200 group-hover:scale-105'
									/>
									{userInput.manipulated === option.value && (
										<div className='absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1'>
											<CheckCircle2 className='h-5 w-5' />
										</div>
									)}
								</div>

								<div className='p-4 bg-white dark:bg-gray-800'>
									<h3 className='font-semibold text-lg text-gray-900 dark:text-white mb-1'>
										{option.title}
									</h3>
									<p className='text-gray-600 dark:text-gray-400 text-sm'>
										{option.description}
									</p>
								</div>
							</div>
						))}
					</div>

					{userInput.manipulated === true && (
						<div className='mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4'>
							<div className='flex items-start'>
								<AlertTriangle className='h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0' />
								<div className='ml-3'>
									<h3 className='text-sm font-medium text-amber-800 dark:text-amber-300'>
										Important Note
									</h3>
									<p className='mt-1 text-sm text-amber-700 dark:text-amber-400'>
										Structural modifications can significantly impact your
										building's seismic performance. These may include:
									</p>
									<ul className='mt-2 text-sm text-amber-700 dark:text-amber-400 list-disc list-inside'>
										<li>Adding or removing load-bearing walls</li>
										<li>Modifying column or beam dimensions</li>
										<li>Adding floors or extensions</li>
										<li>Changing the building's original design</li>
									</ul>
								</div>
							</div>
						</div>
					)}

					{userInput.manipulated === false && (
						<div className='mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4'>
							<div className='flex items-start'>
								<CheckCircle2 className='h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0' />
								<div className='ml-3'>
									<h3 className='text-sm font-medium text-green-800 dark:text-green-300'>
										Original Structure
									</h3>
									<p className='mt-1 text-sm text-green-700 dark:text-green-400'>
										Buildings that maintain their original structural design
										generally perform as intended during seismic events. This is
										a positive factor in your assessment.
									</p>
								</div>
							</div>
						</div>
					)}

					{userInput.manipulated === undefined && (
						<div className='mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
							<div className='flex items-start'>
								<Info className='h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0' />
								<div className='ml-3'>
									<p className='text-sm text-blue-800 dark:text-blue-300'>
										Please select one of the options above to continue with your
										assessment.
									</p>
								</div>
							</div>
						</div>
					)}
				</CardContent>

				<CardFooter className='flex justify-between pt-4 border-t'>
					<Link href='/assessment/5'>
						<Button
							variant='outline'
							className='gap-2'>
							<ArrowLeft className='h-4 w-4' /> Previous
						</Button>
					</Link>

					<Button
						onClick={onNext}
						disabled={userInput.manipulated === undefined}
						className='gap-2'>
						Next <ArrowRight className='h-4 w-4' />
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
};

export default ManipulationReviewStep;
