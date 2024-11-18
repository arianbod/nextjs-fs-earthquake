import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { useUserInput } from '@/context/UserInputContext';
import { Input } from '@/components/ui/input';
import Data from '@/utils/Data.json';

const PlanDefinitionStep = ({ onNext }) => {
	const { userInput, updateUserInput } = useUserInput();

	const handleChange = (e) => {
		const { name, value } = e.target;
		updateUserInput({ [name]: value });
	};

	const handleArrayChange = (e, row, col, type) => {
		const newArray = [...(userInput[type] || [[]])];
		newArray[row] = newArray[row] || [];
		newArray[row][col] = e.target.value;
		updateUserInput({ [type]: newArray });
	};

	const addRow = () => {
		updateUserInput({
			dimensions: [...(userInput.dimensions || [[]]), ['']],
			crossSections: [...(userInput.crossSections || [[]]), ['']],
		});
	};

	const addColumn = () => {
		updateUserInput({
			dimensions: (userInput.dimensions || [[]]).map((row) => [...row, '']),
			crossSections: (userInput.crossSections || [[]]).map((row) => [
				...row,
				'',
			]),
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onNext();
	};

	const stepFiveData = Data.steps.find((step) => step.step === 5);

	return (
		<div className='max-w-4xl mx-auto p-5'>
			{/* <Progress value={48} /> */}

			<h1 className='text-2xl font-bold mb-4'>{stepFiveData.title}</h1>
			<p className='mb-6'>{stepFiveData.description}</p>
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
						<Input
							type='text'
							name={field}
							value={userInput[field] || ''}
							onChange={handleChange}
							className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
						/>
					</div>
				))}
				<Image
					src='/images/axes.png'
					width={200}
					height={200}
					alt='axes'
					className='rounded-lg mx-auto'
				/>
				{(userInput.dimensions || [[]]).map((row, rowIndex) => (
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
								<Input
									type='text'
									value={userInput.dimensions[rowIndex][colIndex] || ''}
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
								<Input
									type='text'
									value={userInput.crossSections[rowIndex][colIndex] || ''}
									onChange={(e) =>
										handleArrayChange(e, rowIndex, colIndex, 'crossSections')
									}
									className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
								/>
							</div>
						))}
					</div>
				))}
				<div className='flex justify-between'>
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
					<Button
						type='submit'
						className='inline-block hover:bg-zinc-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4'>
						Next Step
					</Button>
				</div>
			</form>
		</div>
	);
};

export default PlanDefinitionStep;
