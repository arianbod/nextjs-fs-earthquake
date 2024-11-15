import React from 'react';
import Link from 'next/link';
import Data from '@/utils/Data.json';
import { Button } from './ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserInput } from '@/context/UserInputContext';

const Two = () => {
	const { userInput, updateUserInput } = useUserInput();

	const handleChange = (e) => {
		const { name, value } = e.target;
		updateUserInput({ [name]: value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// You can perform any additional actions here before moving to the next step
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
				className='flex justify-between flex-col'>
				{stepTwoData.inputs.map((input, index) =>
					input.type === 'select' ? (
						<div
							key={index}
							className='flex flex-col'>
							<label className='text-sm font-medium text-gray-400'>
								{input.label}
							</label>
							<select
								name={input.label.replace(/\s+/g, '').toLowerCase()}
								value={userInput[input.label.replace(/\s+/g, '').toLowerCase()]}
								onChange={handleChange}
								className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white text-black rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'>
								{input.options.map((option) => (
									<option
										key={option}
										value={option}>
										{option}
									</option>
								))}
							</select>
							<p className='flex gap-4'>
								{input.description}
								<Link
									href={input.url}
									className='text-blue-500 text-sm'>
									Learn more
								</Link>
							</p>
						</div>
					) : (
						<div
							key={index}
							className='flex flex-col'>
							<label className='text-sm font-medium text-gray-500'>
								{input.label}
							</label>
							<input
								type='number'
								name={input.label.replace(/\s+/g, '').toLowerCase()}
								value={userInput[input.label.replace(/\s+/g, '').toLowerCase()]}
								onChange={handleChange}
								min={0}
								className='mt-1 block w-full py-2 px-3 border border-gray-300 text-black bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
							/>
							<p className='flex gap-4 justify-between'>
								{input.description}
								{input.url && (
									<Link
										href={input.url}
										className='text-blue-500 text-sm'>
										Learn more
									</Link>
								)}
							</p>
						</div>
					)
				)}
				<div className='flex place-content-center'>
					<Link
						href='/3'
						passHref>
						<Button className='inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
							Next Step
						</Button>
					</Link>
				</div>
			</form>
		</div>
	);
};

export default Two;
