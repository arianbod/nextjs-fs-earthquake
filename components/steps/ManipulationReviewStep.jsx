import React from 'react';
import { Button } from '@/components/ui/button';
import Data from '@/utils/Data.json';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { useUserInput } from '@/context/UserInputContext';

const ManipulationReviewStep = ({ onNext }) => {
	const { userInput, updateUserInput } = useUserInput();
	const stepSixData = Data.steps.find((step) => step.step === 6);

	const options = [
		{
			id: 1,
			url: '/images/no-manipulation.jpeg',
			description: 'Without Manipulation',
		},
		{ id: 2, url: '/images/manipulated.png', description: 'Manipulated' },
	];

	const handleManipulationChange = (manipulated) => {
		updateUserInput({ manipulated });
	};

	return (
		<div className='flex flex-col place-items-center gap-8'>
			{/* <Progress value={55} /> */}

			<h1 className='text-2xl'>{stepSixData.title}</h1>
			<p>{stepSixData.description}</p>

			<div className='flex gap-8 text-center'>
				{options.map((option) => (
					<div
						key={option.id}
						onClick={() => handleManipulationChange(option.id === 2)}
						className={`hover:scale-110 transition-all rounded-3xl p-4 flex flex-col gap-4 ${
							(userInput.manipulated && option.id === 2) ||
							(!userInput.manipulated && option.id === 1)
								? 'border-8 border-blue-500'
								: ''
						}`}>
						<Image
							src={option.url}
							width={200}
							height={200}
							alt={option.description}
							className='rounded-lg w-36 mx-auto h-36'
						/>
						<span>{option.description}</span>
					</div>
				))}
			</div>
			<Button onClick={onNext}>Next Step</Button>
		</div>
	);
};

export default ManipulationReviewStep;
