import React from 'react';
import Link from 'next/link';
import Data from '@/utils/Data.json';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserInput } from '@/context/UserInputContext';

const photos = [
	{
		id: '1',
		url: '/images/building-types/RC.webp',
		description: 'Reinforced Concrete',
	},
	{
		id: '2',
		url: '/images/building-types/SS.png',
		description: 'Steel Structure',
	},
	{
		id: '3',
		url: '/images/building-types/T.png',
		description: 'Timber Structure',
	},
	{
		id: '4',
		url: '/images/building-types/SL.webp',
		description: 'Skylife Structure',
	},
	{
		id: '5',
		url: '/images/building-types/M.png',
		description: 'Masonry Structure',
	},
];

const StructuralSystemStep = ({ onNext }) => {
	const { userInput, updateUserInput } = useUserInput();

	const stepThreeData = Data.steps.find((step) => step.step === 3);

	const handleSelectionChange = (id) => {
		updateUserInput({ structuralSystem: id });
	};

	return (
		<div className='max-w-4xl mx-auto p-5 flex flex-col gap-4'>
			{/* <Progress value={40} /> */}

			<h1 className='text-3xl font-bold text-center mb-6'>
				{stepThreeData.title}
			</h1>
			<p className='text-lg mx-auto text-center'>{stepThreeData.description}</p>
			<div className='flex flex-wrap place-content-center md:grid-cols-2 gap-6'>
				{photos.map((photo) => (
					<label
						key={photo.id}
						className='block'>
						<input
							type='radio'
							name='photoOption'
							value={photo.id}
							checked={userInput.structuralSystem === photo.id}
							onChange={() => handleSelectionChange(photo.id)}
							className='hidden'
						/>
						<div
							className={`cursor-pointer p-4 border-8 transition-all w-64 ${
								userInput.structuralSystem === photo.id
									? 'border-blue-500 scale-110'
									: 'border-transparent'
							} rounded-lg`}>
							<Image
								src={photo.url}
								alt={photo.description}
								width={500}
								height={300}
								objectFit='cover'
								className='rounded-md'
							/>
							<h6 className='bg-gray-800 text-white text-center rounded-lg py-1 mt-2'>
								{photo.description}
							</h6>
						</div>
					</label>
				))}
			</div>
			<div className='flex justify-center mt-6'>
				<Button
					onClick={onNext}
					className='text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-150'>
					Next Step
				</Button>
			</div>
		</div>
	);
};

export default StructuralSystemStep;
