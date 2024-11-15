import React from 'react';
import { useRouter } from 'next/navigation';
import Data from '@/utils/Data.json';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserInput } from '@/context/UserInputContext';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const BuildingInfoStep = ({ onNext }) => {
	const router = useRouter();
	const { userInput, updateUserInput } = useUserInput();

	const handleChange = (name, value) => {
		updateUserInput({ [name]: value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onNext();
	};

	const stepTwoData = Data.steps.find((step) => step.step === 2);

	return (
		<div className='max-w-4xl mx-auto p-5 text-center'>
			<Progress value={20} />
			<h1 className='text-3xl font-bold text-center mb-4'>
				{stepTwoData.title}
			</h1>
			<p className='text-lg mb-6'>{stepTwoData.description}</p>
			<form
				onSubmit={handleSubmit}
				className='flex flex-col gap-4'>
				{stepTwoData.inputs.map((input, index) =>
					input.type === 'select' ? (
						<div
							key={index}
							className='flex flex-col'>
							<label className='text-sm font-medium text-gray-400'>
								{input.label}
							</label>
							<Select
								onValueChange={(value) =>
									handleChange(
										input.label.replace(/\s+/g, '').toLowerCase(),
										value
									)
								}
								value={
									userInput[input.label.replace(/\s+/g, '').toLowerCase()]
								}>
								<SelectTrigger className='mt-1'>
									<SelectValue placeholder={`Select ${input.label}`} />
								</SelectTrigger>
								<SelectContent>
									{input.options.map((option) => (
										<SelectItem
											key={option}
											value={option}>
											{option}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					) : (
						<div
							key={index}
							className='flex flex-col'>
							<label className='text-sm font-medium text-gray-500'>
								{input.label}
							</label>
							<Input
								type='number'
								name={input.label.replace(/\s+/g, '').toLowerCase()}
								value={
									userInput[input.label.replace(/\s+/g, '').toLowerCase()] || ''
								}
								onChange={(e) =>
									handleChange(
										input.label.replace(/\s+/g, '').toLowerCase(),
										e.target.value
									)
								}
								min={0}
								className='mt-1'
							/>
						</div>
					)
				)}
				<div className='flex justify-center mt-6'>
					<Button
						type='submit'
						className='inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
						Next Step
					</Button>
				</div>
			</form>
		</div>
	);
};

export default BuildingInfoStep;
