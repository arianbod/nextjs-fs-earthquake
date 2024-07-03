import React, { useState } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

const StepFive = () => {
	// State to hold form values
	const [formData, setFormData] = useState({
		typeOfEarthquake: '',
		typeOfSoil: '',
		designRegulation: '',
		numberOfStories: 0,
		height: 0,
		dimensions: [['']],
		crossSections: [['']],
	});

	// Handle change in form inputs
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	// Handle dimension and cross-section change
	const handleArrayChange = (e, row, col, type) => {
		const newArray = [...formData[type]];
		newArray[row][col] = e.target.value;
		setFormData((prevState) => ({
			...prevState,
			[type]: newArray,
		}));
	};

	// Handle adding a new row
	const addRow = () => {
		setFormData((prevState) => ({
			...prevState,
			dimensions: [
				...prevState.dimensions,
				Array(prevState.dimensions[0].length).fill(''),
			],
			crossSections: [
				...prevState.crossSections,
				Array(prevState.crossSections[0].length).fill(''),
			],
		}));
	};

	// Handle adding a new column
	const addColumn = () => {
		setFormData((prevState) => ({
			...prevState,
			dimensions: prevState.dimensions.map((row) => [...row, '']),
			crossSections: prevState.crossSections.map((row) => [...row, '']),
		}));
	};

	// Handle form submission
	const handleSubmit = (e) => {
		e.preventDefault();
		console.log(formData);
		// Process the data here or move to the next step
	};

	// Function to generate building plan
	// const generateBuildingPlan = () => {
	// 	const rows = [];
	// 	for (let i = 0; i < formData.dimensions.length; i++) {
	// 		const columns = [];
	// 		for (let j = 0; j < formData.dimensions[i].length; j++) {
	// 			columns.push(
	// 				<div
	// 					key={`${i}-${j}`}
	// 					className='border border-gray-500 p-2 text-center'>
	// 					{`Dim: ${formData.dimensions[i][j]} | Cross: ${formData.crossSections[i][j]}`}
	// 				</div>
	// 			);
	// 		}
	// 		rows.push(
	// 			<div
	// 				key={i}
	// 				className='flex justify-center'>
	// 				{columns}
	// 			</div>
	// 		);
	// 	}
	// 	return rows;
	// };

	return (
		<div className='max-w-4xl mx-auto p-5'>
			<Progress value={48} />

			<h1 className='text-2xl font-bold mb-4'>Step 5: Building Plan</h1>
			<p className='mb-6'>
				Please provide the dimensions and cross-sections for each section of
				your building plan.
			</p>
			<form
				onSubmit={handleSubmit}
				className='grid gap-y-4'>
				{['numberOfStories', 'height'].map((field) => (
					<div
						key={field}
						className='flex flex-col'>
						<label className='text-gray-700 font-medium mb-2'>
							{field.replace(/([A-Z])/g, ' $1').trim()}
						</label>
						<input
							type='text'
							name={field}
							value={formData[field]}
							onChange={handleChange}
							className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
						/>
					</div>
				))}
				{formData.dimensions.map((row, rowIndex) => (
					<div
						key={rowIndex}
						className='flex'>
						{row.map((_, colIndex) => (
							<div
								key={colIndex}
								className='flex flex-col'>
								<label className='text-gray-700 font-medium mb-2'>
									Dimension (Row {rowIndex + 1}, Col {colIndex + 1})
									<span
										className='text-gray-500 ml-2'
										title='Dimension in meters'>
										?
									</span>
								</label>
								<input
									type='text'
									value={formData.dimensions[rowIndex][colIndex]}
									onChange={(e) =>
										handleArrayChange(e, rowIndex, colIndex, 'dimensions')
									}
									className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
								/>
								<label className='text-gray-700 font-medium mb-2'>
									Cross-Section (Row {rowIndex + 1}, Col {colIndex + 1})
									<span
										className='text-gray-500 ml-2'
										title='Cross-section dimensions in centimeters'>
										?
									</span>
								</label>
								<input
									type='text'
									value={formData.crossSections[rowIndex][colIndex]}
									onChange={(e) =>
										handleArrayChange(e, rowIndex, colIndex, 'crossSections')
									}
									className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
								/>
							</div>
						))}
					</div>
				))}
				<div className='flex space-x-4 mt-4'>
					<Button
						type='button'
						onClick={addRow}
						className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'>
						Add Row
					</Button>
					<Button
						type='button'
						onClick={addColumn}
						className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'>
						Add Column
					</Button>
				</div>
				<div>
					<Link
						href='/6'
						passHref>
						<Button className='inline-block hover:bg-zinc-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4'>
							Next Step
						</Button>
					</Link>
					{/* <Button
						type='submit'
						className='mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'>
						Submit
					</Button> */}
				</div>
			</form>
		</div>
	);
};

export default StepFive;
