import React, { useState } from 'react';
import Link from 'next/link';
import Data from '@/utils/Data.json';
import Option1 from '@/assets/stepFour/1.png';
import Option2 from '@/assets/stepFour/2.png';
import Option3 from '@/assets/stepFour/3.png';
import Option4 from '@/assets/stepFour/4.png';
import Image from 'next/image';
import { Button } from './ui/button';
import { Progress } from '@/components/ui/progress';

const photos = [
	{
		id: '1',
		url: '/images/building-types/RC.webp',
		description: 'Description for photo 1',
	},
	{
		id: '2',
		url: '/images/building-types/SS.png',
		description: 'Description for photo 2',
	},
	{
		id: '3',
		url: '/images/building-types/T.png',
		description: 'Description for photo 3',
	},
	{
		id: '4',
		url: '/images/building-types/SL.webp',
		description: 'Description for photo 4',
	},
	{
		id: '5',
		url: '/images/building-types/M.png',
		description: 'Description for photo 4',
	},
];

const Four = () => {
	const [selectedPhoto, setSelectedPhoto] = useState('');

	const stepThreeData = Data.steps.find((step) => step.step === 3);

	const handleSelectionChange = (e) => {
		setSelectedPhoto(e.target.value);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log('Selected photo:', selectedPhoto);
	};

	return (
		<div className='max-w-4xl mx-auto p-5 flex flex-col gap-4'>
			<Progress value={40} />

			<h1 className='text-3xl font-bold text-center mb-6'>
				{stepThreeData.title}
			</h1>
			<p className='text-lg mx-auto text-center'>{stepThreeData.description}</p>
			<form
				onSubmit={handleSubmit}
				className='flex flex-wrap place-content-center md:grid-cols-2 gap-6'>
				{photos.map((photo) => (
					<label
						key={photo.id}
						className='block'>
						<input
							type='radio'
							name='photoOption'
							value={photo.id}
							checked={selectedPhoto === photo.id}
							onChange={handleSelectionChange}
							className='hidden'
						/>
						<div
							className={`cursor-pointer p-4 border-8 transition-all w-64 ${
								selectedPhoto === photo.id
									? 'border-blue-500 scale-110'
									: 'border-transparent'
							} rounded-lg`}>
							<Image
								src={photo.url}
								alt={photo.description}
								width={500} // Specify width
								height={300} // Specify height to maintain aspect ratio
								objectFit='cover' // Cover to ensure the image covers the area nicely
								className='rounded-md'
							/>
						</div>
					</label>
				))}
			</form>
			<div className='flex justify-center mt-6'>
				<Link
					href='/4'
					passHref>
					<Button className=' text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-150'>
						Next Step
					</Button>
				</Link>
			</div>
		</div>
	);
};

export default Four;
