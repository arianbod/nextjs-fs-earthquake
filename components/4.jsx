import React from 'react';
import Link from 'next/link';
import Data from '@/utils/Data.json';
import Image from 'next/image';
import { Button } from './ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserInput } from '@/context/UserInputContext';

const photos = [
	{
		id: '1',
		url: '/images/irregularity/horizontal-irregularity.png',
		description: 'Horizontal Irregularity',
	},
	{
		id: '2',
		url: '/images/irregularity/natural-slope-irregularity.png',
		description: 'Natural Slope Irregularity',
	},
	{
		id: '3',
		url: '/images/irregularity/slabs-irregularity.png',
		description: 'Slabs Irregularity',
	},
	{
		id: '4',
		url: '/images/irregularity/vertical-irregularity.png',
		description: 'Vertical Irregularity',
	},
];

const Four = () => {
	const { userInput, updateUserInput } = useUserInput();

	const stepFourData = Data.steps.find((step) => step.step === 4);

	const handleSelectionChange = (id) => {
		updateUserInput({ irregularity: id });
	};

	return (
		<div className='max-w-4xl mx-auto p-5 flex flex-col gap-4'>
			<Progress value={40} />

			<h1 className='text-3xl font-bold text-center mb-6'>
				{stepFourData.title}
			</h1>
			<p className='text-lg mx-auto text-center'>{stepFourData.description}</p>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				{photos.map((photo) => (
					<label
						key={photo.id}
						className='block'>
						<input
							type='radio'
							name='photoOption'
							value={photo.id}
							checked={userInput.irregularity === photo.id}
							onChange={() => handleSelectionChange(photo.id)}
							className='hidden'
						/>
						<div
							className={`cursor-pointer p-4 border-8 transition-all w-64 ${
								userInput.irregularity === photo.id
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
							<h6 className='bg-gray-800 text-white text-center rounded-lg py-1'>
								{photo.description}
							</h6>
						</div>
					</label>
				))}
			</div>
			<div className='flex justify-center mt-6'>
				<Link
					href='/5'
					passHref>
					<Button className='text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-150'>
						Next Step
					</Button>
				</Link>
			</div>
		</div>
	);
};

export default Four;
