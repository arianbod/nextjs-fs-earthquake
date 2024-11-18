import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Data from '@/utils/Data.json';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { useUserInput } from '@/context/UserInputContext';

const SpecificConditionStep = ({ onNext }) => {
	const { userInput, updateUserInput } = useUserInput();
	const [imagePreview, setImagePreview] = useState(null);

	const stepSevenData = Data.steps.find((step) => step.step === 7);

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
				updateUserInput({ specificCondition: reader.result });
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className='flex flex-col place-content-center gap-8 place-items-center'>
			{/* <Progress value={65} /> */}

			<h1 className='text-2xl'>{stepSevenData.title}</h1>
			<p>{stepSevenData.description}</p>
			<div className='mt-8'>
				<h2 className='text-lg mb-2'>Upload a Photo</h2>
				<label className='block w-full border-2 border-dashed border-gray-300 p-6 rounded-md text-center cursor-pointer hover:bg-gray-50'>
					{imagePreview ? (
						<Image
							src={imagePreview}
							alt='Preview'
							width={500}
							height={500}
							className='mx-auto max-h-40 max-w-full max-h-screen'
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
			<Button onClick={onNext}>Next Step</Button>
		</div>
	);
};

export default SpecificConditionStep;
