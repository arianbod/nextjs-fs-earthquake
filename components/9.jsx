import React, { useState } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import Data from '@/utils/Data.json';
import Image from 'next/image';
import { nanoid } from 'nanoid';
import { Progress } from '@/components/ui/progress';

const id = nanoid();
const Nine = () => {
	const [selectedPhoto, setSelectedPhoto] = useState('');
	const [imagePreview, setImagePreview] = useState(null);

	const stepNineData = Data.steps.find((step) => step.step === 9);

	const handleSelectionChange = (e) => {
		setSelectedPhoto(e.target.value);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log('Selected photo:', selectedPhoto);
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div>
			<Progress value={90} />

			<h1 className='text-2xl'>{stepNineData.title}</h1>
			<p>{stepNineData.description}</p>
			<form onSubmit={handleSubmit}>
				<div className='grid grid-cols-2 gap-4'>
					{/* Assuming you have other content here */}
				</div>
				<div className='mt-8'>
					<h2 className='text-lg mb-2'>Upload a Photo</h2>
					<label className='block w-full border-2 border-dashed border-gray-300 p-6 rounded-md text-center cursor-pointer hover:bg-gray-50'>
						{imagePreview ? (
							<Image
								src={imagePreview}
								alt='Preview'
								className='mx-auto max-h-40'
							/>
						) : (
							<div>
								<p className='text-gray-700'>
									Drag and drop your image here or{' '}
									<span className='text-blue-500 underline'>browse</span>
								</p>
							</div>
						)}
						<input
							type='file'
							className='hidden'
							onChange={handleImageChange}
							accept='image/*'
						/>
					</label>
				</div>
				{/* <Button type='submit'>Submit</Button> */}
			</form>
			<Link
				href={`/result/${id}`}
				passHref>
				<Button variant=''>Submit</Button>
			</Link>
		</div>
	);
};

export default Nine;
