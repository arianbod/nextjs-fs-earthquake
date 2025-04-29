// components/steps/NeighborBuildingsStep.jsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Data from '@/utils/Data.json';
import { Button } from '@/components/ui/button';
import { useUserInput } from '@/context/UserInputContext';
import {
	ArrowLeft,
	ArrowRight,
	Building,
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

const neighborBuildings = [
	{
		id: '1',
		url: '/images/Neighbours/3.png',
		title: 'Standalone Building',
		description: 'Building with no adjacent structures',
		details:
			'A standalone building with sufficient distance from neighboring structures',
	},
	{
		id: '2',
		url: '/images/Neighbours/1.png',
		title: 'Adjacent Buildings - Same Height',
		description: 'Building shares walls with others of similar height',
		details:
			'Buildings of similar height that share common walls or are closely spaced',
	},
	{
		id: '3',
		url: '/images/Neighbours/2.png',
		title: 'Adjacent Buildings - Different Heights',
		description: 'Building shares walls with taller/shorter structures',
		details:
			'Buildings of different heights that share common walls or are closely spaced',
	},
	{
		id: '4',
		url: '/images/Neighbours/4.png',
		title: 'Corner Building',
		description: 'Building located at an intersection',
		details:
			'A corner building that shares walls on two sides and has two exposed facades',
	},
];

const NeighborBuildingsStep = ({ onNext }) => {
	const { userInput, updateUserInput } = useUserInput();
	const stepNineData = Data.steps.find((step) => step.step === 9);

	const handleSelectionChange = (id) => {
		updateUserInput({ neighborBuildings: id });
	};

	// Helper to get the selected building info
	const getSelectedBuilding = () => {
		return neighborBuildings.find(
			(building) => building.id === userInput.neighborBuildings
		);
	};

	return (
		<div className='max-w-4xl mx-auto'>
			<div className='text-center mb-8'>
				<div className='inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4'>
					<Building className='h-6 w-6 text-blue-600 dark:text-blue-400' />
				</div>
				<h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
					{stepNineData.title}
				</h1>
				<p className='text-lg text-gray-600 dark:text-gray-300'>
					{stepNineData.description}
				</p>
			</div>

			<Card className='shadow-md border border-gray-200 dark:border-gray-700 mb-8'>
				<CardHeader className='pb-4'>
					<CardTitle className='text-xl flex items-center gap-2'>
						<Building className='h-5 w-5 text-blue-600 dark:text-blue-400' />
						Building Configuration
					</CardTitle>
					<CardDescription>
						Select the option that best describes your building's relationship
						to neighboring structures
					</CardDescription>
				</CardHeader>

				<CardContent>
					<div className='space-y-6'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							{neighborBuildings.map((building) => (
								<div
									key={building.id}
									onClick={() => handleSelectionChange(building.id)}
									className={`group cursor-pointer rounded-xl overflow-hidden transition-all duration-200 ${
										userInput.neighborBuildings === building.id
											? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-md transform scale-[1.02]'
											: 'border border-gray-200 dark:border-gray-700 hover:shadow-md'
									}`}>
									<div className='relative h-48 overflow-hidden'>
										<Image
											src={building.url}
											alt={building.title}
											fill
											className='object-cover transition-transform duration-200 group-hover:scale-105'
										/>
										{userInput.neighborBuildings === building.id && (
											<div className='absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1'>
												<CheckCircle2 className='h-5 w-5' />
											</div>
										)}
									</div>

									<div className='p-4 bg-white dark:bg-gray-800'>
										<h3 className='font-semibold text-lg text-gray-900 dark:text-white mb-1'>
											{building.title}
										</h3>
										<p className='text-gray-600 dark:text-gray-400 text-sm'>
											{building.description}
										</p>
									</div>
								</div>
							))}
						</div>

						{/* Info box based on selection */}
						{userInput.neighborBuildings && (
							<div
								className={`rounded-lg p-5 border ${
									userInput.neighborBuildings === '1'
										? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
										: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
								}`}>
								<div className='flex items-start'>
									{userInput.neighborBuildings === '1' ? (
										<CheckCircle2 className='h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0' />
									) : (
										<AlertTriangle className='h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0' />
									)}
									<div className='ml-3'>
										<h3 className='text-sm font-medium'>
											{getSelectedBuilding()?.title}
										</h3>
										<p className='mt-1 text-sm'>
											{getSelectedBuilding()?.details}
										</p>
										<p className='mt-2 text-sm font-medium'>
											{userInput.neighborBuildings === '1'
												? 'This configuration generally performs well during earthquakes due to independence from other structures.'
												: 'This configuration may affect seismic behavior due to interaction with neighboring buildings.'}
										</p>
									</div>
								</div>
							</div>
						)}

						{!userInput.neighborBuildings && (
							<div className='bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800'>
								<div className='flex items-start'>
									<Info className='h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0' />
									<div className='ml-3'>
										<p className='text-sm text-blue-800 dark:text-blue-300'>
											The way your building interacts with neighboring
											structures can significantly impact its behavior during
											earthquakes. Please select the option that best represents
											your building's situation.
										</p>
									</div>
								</div>
							</div>
						)}

						<div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-5'>
							<h3 className='font-medium text-gray-900 dark:text-white mb-2'>
								Why This Matters
							</h3>
							<p className='text-sm text-gray-600 dark:text-gray-400'>
								The proximity and relationship to neighboring buildings affects
								how a structure responds during an earthquake:
							</p>
							<ul className='mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400'>
								<li>
									• Buildings of different heights may pound against each other
								</li>
								<li>
									• Shared walls can transmit seismic forces between buildings
								</li>
								<li>• Corner buildings may experience torsional effects</li>
								<li>• Standalone buildings have more freedom of movement</li>
							</ul>
						</div>
					</div>
				</CardContent>

				<CardFooter className='flex justify-between pt-4 border-t'>
					<Link href='/assessment/8'>
						<Button
							variant='outline'
							className='gap-2'>
							<ArrowLeft className='h-4 w-4' /> Previous
						</Button>
					</Link>

					<Button
						onClick={onNext}
						disabled={!userInput.neighborBuildings}
						className='gap-2'>
						Complete Assessment <ArrowRight className='h-4 w-4' />
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
};

export default NeighborBuildingsStep;
