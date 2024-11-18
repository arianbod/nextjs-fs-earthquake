import React from 'react';
import Data from '@/utils/Data.json';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserInput } from '@/context/UserInputContext';

const IrregularityStep = ({ onNext }) => {
	const { userInput, updateUserInput } = useUserInput();

	const stepFourData = Data.steps.find((step) => step.step === 4);

	const handleSelectionChange = (hasIrregularity) => {
		updateUserInput({ hasIrregularity });
	};

	return (
		<div className='max-w-4xl mx-auto p-5'>
			{/* <Progress value={40} /> */}

			<h1 className='text-3xl font-bold text-center mb-6'>
				{stepFourData.title}
			</h1>
			<p className='text-lg mb-6'>{stepFourData.description}</p>

			<div className='flex justify-center space-x-4'>
				<Button
					onClick={() => handleSelectionChange(true)}
					className={userInput.hasIrregularity ? 'bg-blue-500' : ''}>
					Yes, there is irregularity
				</Button>
				<Button
					onClick={() => handleSelectionChange(false)}
					className={userInput.hasIrregularity === false ? 'bg-blue-500' : ''}>
					No irregularity
				</Button>
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

export default IrregularityStep;
