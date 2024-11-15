import React from 'react';
import Data from '@/utils/Data.json';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserInput } from '@/context/UserInputContext';

const photos = [
	{
		id: '2',
		url: '/images/Neighbours/1.png',
		description: 'Description for photo 2',
	},
	{
		id: '3',
		url: '/images/Neighbours/2.png',
		description: 'Description for photo 3',
	},
	{
		id: '1',
		url: '/images/Neighbours/3.png',
		description: 'Description for photo 1',
	},
	{
		id: '4',
		url: '/images/Neighbours/4.png',
		description: 'Description for photo 4',
	},
];

const NeighborBuildingsStep = ({ onNext }) => {
	const { userInput, updateUserInput } = useUserInput();

	const stepNineData = Data.steps.find((step) => step.step === 9);

	const handleSelectionChange = (id) => {
		updateUserInput({ neighborBuildings: id });
	};

	return (
		<div className='max-w-4xl mx-auto p-5 flex flex-col gap-4 place-items-center place-content-center'>
			<Progress value={90} />

			<h1 className='text-3xl font-bold text-center mb-6'>
				{stepNineData.title}
			</h1>
			<p className='text-lg mx-auto text-center'>{stepNineData.description}</p>
			<div className='flex place-content-center flex-wrap md:grid-cols-2 gap-6'>
				{photos.map((photo) => (
					<label
						key={photo.id}
						className='block'>
						<input
							type='radio'
							name='photoOption'
							value={photo.id}
							checked={userInput.neighborBuildings === photo.id}
							onChange={() => handleSelectionChange(photo.id)}
							className='hidden'
						/>
						<div
							className={`cursor-pointer p-4 border-8 transition-all w-64 ${
								userInput.neighborBuildings === photo.id
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
						</div>
					</label>
				))}
			</div>
			<div className='flex place-content-center place-items-center w-full mt-6'>
				<Button
					onClick={onNext}
					variant=''>
					Analyze
				</Button>
			</div>
		</div>
	);
};

export default NeighborBuildingsStep;
