import React, { useState } from 'react';
import Link from 'next/link';
import Data from '@/utils/Data.json';
import { Button } from './ui/button';
import { Progress } from '@/components/ui/progress';

const Two = () => {
	const [formData, setFormData] = useState({
		typeOfEarthquake: '',
		typeOfSoil: '',
		designRegulation: '',
		numberOfStories: 0,
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log(formData);
	};

	const stepTwoData = Data.steps.find((step) => step.step === 2);

	return (
		<div className='max-w-4xl mx-auto p-5'>
			<Progress value={20} />

			<h1 className='text-3xl font-bold text-center mb-4'>
				{stepTwoData.title}
			</h1>
			<p className='text-lg mb-6'>{stepTwoData.description}</p>
			<form
				onSubmit={handleSubmit}
				className='grid grid-cols-1 gap-6'>
				{stepTwoData.inputs.map((input, index) =>
					input.type === 'select' ? (
						<div
							key={index}
							className='flex flex-col'>
							<label className='text-sm font-medium text-gray-700'>
								{input.label}
							</label>
							<select
								name={input.label.replace(/\s+/g, '').toLowerCase()}
								value={formData[input.label.replace(/\s+/g, '').toLowerCase()]}
								onChange={handleChange}
								className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'>
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
									className='text-blue-500'>
									Learn more
								</Link>
							</p>
						</div>
					) : (
						<div
							key={index}
							className='flex flex-col'>
							<label className='text-sm font-medium text-gray-700'>
								{input.label}
							</label>
							<input
								type='number'
								name={input.label.replace(/\s+/g, '').toLowerCase()}
								value={formData[input.label.replace(/\s+/g, '').toLowerCase()]}
								onChange={handleChange}
								min={0}
								className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
							/>
							<p className='flex gap-4'>
								{input.description}
								<Link
									href={input.url}
									className='text-blue-500'>
									Learn more
								</Link>
							</p>
						</div>
					)
				)}
				<div className='flex justify-end'>
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
