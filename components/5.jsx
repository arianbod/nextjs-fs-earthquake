import React, { useState } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import Data from '@/utils/Data.json';
import { Progress } from '@/components/ui/progress';

const StepFive = () => {
	// State to hold form values
	const [formData, setFormData] = useState({
		typeOfEarthquake: '',
		typeOfSoil: '',
		designRegulation: '',
		numberOfStories: 0,
	});

	// Handle change in form inputs
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	// Handle form submission
	const handleSubmit = (e) => {
		e.preventDefault();
		console.log(formData);
		// Process the data here or move to the next step
	};

	// Get the step data from your JSON data
	const stepData = Data.steps.find((step) => step.step === 5);

	return (
		<div className='max-w-4xl mx-auto p-5'>
			<Progress value={48} />

			<h1 className='text-2xl font-bold mb-4'>{stepData.title}</h1>
			<p className='mb-6'>{stepData.description}</p>
			<form
				onSubmit={handleSubmit}
				className='grid gap-y-4'>
				{stepData.inputs.map((input) =>
					input.type === 'select' ? (
						<div
							key={input.label}
							className='flex flex-col'>
							<label className='text-gray-700 font-medium mb-2'>
								{input.label}
							</label>
							<select
								name={input.label.replace(/\s+/g, '').toLowerCase()}
								value={formData[input.label.replace(/\s+/g, '').toLowerCase()]}
								onChange={handleChange}
								className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'>
								{input.options.map((option) => (
									<option
										key={option}
										value={option}>
										{option}
									</option>
								))}
							</select>
						</div>
					) : (
						<div
							key={input.label}
							className='flex flex-col'>
							<label className='text-gray-700 font-medium mb-2'>
								{input.label}
							</label>
							<input
								type='number'
								name={input.label.replace(/\s+/g, '').toLowerCase()}
								value={formData[input.label.replace(/\s+/g, '').toLowerCase()]}
								onChange={handleChange}
								min={0}
								className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
							/>
						</div>
					)
				)}
				<div>
					{/* <Button
						type='submit'
						className='mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'>
						Submit
					</Button> */}
				</div>
			</form>
			<Link
				href='/6'
				passHref>
				<Button className='inline-block hover:bg-zinc-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4'>
					Next Step
				</Button>
			</Link>
		</div>
	);
};

export default StepFive;
