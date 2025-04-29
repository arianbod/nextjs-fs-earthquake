// components/steps/StructuralSystemStep.jsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Data from '@/utils/Data.json';
import { Button } from '@/components/ui/button';
import { InfoIcon, HelpCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useUserInput } from '@/context/UserInputContext';
import { Card, CardContent } from '@/components/ui/card';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';

const buildingTypes = [
	{
		id: '1',
		url: '/images/building-types/RC.webp',
		title: 'Reinforced Concrete',
		description:
			'Buildings with structural elements made of reinforced concrete',
		info: 'Commonly used in apartment buildings, offices, and commercial structures.',
	},
	{
		id: '2',
		url: '/images/building-types/SS.png',
		title: 'Steel Structure',
		description: 'Buildings with a steel framework',
		info: 'Common in skyscrapers, industrial buildings, and warehouses.',
	},
	{
		id: '3',
		url: '/images/building-types/T.png',
		title: 'Timber Structure',
		description: 'Buildings with wooden structural elements',
		info: 'Typically found in residential homes and historical buildings.',
	},
	{
		id: '4',
		url: '/images/building-types/SL.webp',
		title: 'Skylife Structure',
		description: 'Lightweight prefabricated building systems',
		info: 'Used in modern residential and commercial construction.',
	},
	{
		id: '5',
		url: '/images/building-types/M.png',
		title: 'Masonry Structure',
		description:
			'Buildings constructed from individual units of brick, stone, or concrete blocks',
		info: 'Common in older residential buildings and historical structures.',
	},
];

const StructuralSystemStep = ({ onNext }) => {
	const { userInput, updateUserInput } = useUserInput();
	const stepData = Data.steps.find((step) => step.step === 3);

	const handleSelectionChange = (id) => {
		updateUserInput({ structuralSystem: id });
	};

	return (
		<div className='max-w-5xl mx-auto p-5'>
			<div className='mb-8 text-center'>
				<h1 className='text-3xl font-bold mb-3'>{stepData.title}</h1>
				<p className='text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
					{stepData.description}
				</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
				{buildingTypes.map((type) => (
					<Card
						key={type.id}
						className={`cursor-pointer transition-all hover:shadow-md ${
							userInput.structuralSystem === type.id
								? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-lg transform scale-[1.02]'
								: 'border border-gray-200 dark:border-gray-700'
						}`}
						onClick={() => handleSelectionChange(type.id)}>
						<CardContent className='p-4'>
							<div className='relative w-full h-48 mb-4 rounded-md overflow-hidden'>
								<Image
									src={type.url}
									alt={type.title}
									fill
									className='object-cover'
								/>
							</div>
							<div className='flex items-center justify-between mb-2'>
								<h3 className='font-semibold text-lg'>{type.title}</h3>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant='ghost'
												size='icon'
												className='h-8 w-8'>
												<HelpCircle className='h-4 w-4' />
											</Button>
										</TooltipTrigger>
										<TooltipContent className='max-w-xs'>
											<p>{type.info}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
							<p className='text-sm text-gray-600 dark:text-gray-400'>
								{type.description}
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			{userInput.structuralSystem && (
				<div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start space-x-3 mb-8'>
					<InfoIcon className='h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0' />
					<div>
						<h4 className='font-medium text-blue-800 dark:text-blue-300'>
							Selected:{' '}
							{
								buildingTypes.find((t) => t.id === userInput.structuralSystem)
									?.title
							}
						</h4>
						<p className='text-sm text-blue-700 dark:text-blue-400 mt-1'>
							You've selected a{' '}
							{buildingTypes
								.find((t) => t.id === userInput.structuralSystem)
								?.title.toLowerCase()}{' '}
							building. This will help us provide the most accurate earthquake
							risk assessment.
						</p>
					</div>
				</div>
			)}

			<div className='flex justify-between mt-8'>
				<Link href='/assessment/2'>
					<Button
						variant='outline'
						className='gap-1'>
						<ArrowLeft className='h-4 w-4' /> Previous
					</Button>
				</Link>
				<Button
					onClick={onNext}
					className='gap-1'
					disabled={!userInput.structuralSystem}>
					Next <ArrowRight className='h-4 w-4' />
				</Button>
			</div>
		</div>
	);
};

export default StructuralSystemStep;
