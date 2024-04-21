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
import { nanoid } from 'nanoid';
const id = nanoid();
const photos = [
	{ id: '1', url: Option1, description: 'Description for photo 1' },
	{ id: '2', url: Option2, description: 'Description for photo 2' },
	{ id: '3', url: Option3, description: 'Description for photo 3' },
	{ id: '4', url: Option4, description: 'Description for photo 4' },
];

const Four = () => {
	const [selectedPhoto, setSelectedPhoto] = useState('');

	const stepFourData = Data.steps.find((step) => step.step === 9);

	const handleSelectionChange = (e) => {
		setSelectedPhoto(e.target.value);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log('Selected photo:', selectedPhoto);
	};

	return (
		<div className='max-w-4xl mx-auto p-5 flex flex-col gap-4 place-items-center place-content-center'>
			<Progress value={40} />

			<h1 className='text-3xl font-bold text-center mb-6'>
				{stepFourData.title}
			</h1>
			<p className='text-lg mx-auto text-center'>{stepFourData.description}</p>
			<form
				onSubmit={handleSubmit}
				className='flex place-content-center flex-wrap md:grid-cols-2 gap-6'>
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
			<div className='flex place-content-center place-items-center w-full mt-6'>
				<Link
					href={`/result/${id}`}
					passHref>
					<Button variant=''>Analyze</Button>
				</Link>
			</div>
		</div>
	);
};

export default Four;
