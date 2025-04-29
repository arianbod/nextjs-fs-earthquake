// components/steps/PlanDefinitionStep.jsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Data from '@/utils/Data.json';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserInput } from '@/context/UserInputContext';
import {
	ArrowLeft,
	ArrowRight,
	Plus,
	Grid,
	Ruler,
	Info,
	X,
	HelpCircle,
} from 'lucide-react';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';

const PlanDefinitionStep = ({ onNext }) => {
	const { userInput, updateUserInput } = useUserInput();
	const stepFiveData = Data.steps.find((step) => step.step === 5);

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
			dimensions: [...(userInput.dimensions || [[]]), []],
			crossSections: [...(userInput.crossSections || [[]]), []],
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

	const removeRow = (index) => {
		if ((userInput.dimensions || []).length <= 1) return;

		const newDimensions = [...(userInput.dimensions || [[]])];
		const newCrossSections = [...(userInput.crossSections || [[]])];

		newDimensions.splice(index, 1);
		newCrossSections.splice(index, 1);

		updateUserInput({
			dimensions: newDimensions,
			crossSections: newCrossSections,
		});
	};

	const removeColumn = (index) => {
		if ((userInput.dimensions || [[]])[0].length <= 1) return;

		const newDimensions = (userInput.dimensions || [[]]).map((row) => {
			const newRow = [...row];
			newRow.splice(index, 1);
			return newRow;
		});

		const newCrossSections = (userInput.crossSections || [[]]).map((row) => {
			const newRow = [...row];
			newRow.splice(index, 1);
			return newRow;
		});

		updateUserInput({
			dimensions: newDimensions,
			crossSections: newCrossSections,
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onNext();
	};

	// Ensure we have at least a 1x1 grid
	if (!userInput.dimensions || userInput.dimensions.length === 0) {
		updateUserInput({
			dimensions: [['']],
			crossSections: [['']],
		});
	}

	const isFormValid =
		userInput.numberOfStories &&
		userInput.height &&
		userInput.dimensions &&
		userInput.dimensions.length > 0 &&
		userInput.dimensions.every((row) => row.length > 0) &&
		userInput.crossSections &&
		userInput.crossSections.length > 0 &&
		userInput.crossSections.every((row) => row.length > 0);

	return (
		<div className='max-w-5xl mx-auto'>
			<div className='text-center mb-8'>
				<div className='inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4'>
					<Grid className='h-6 w-6 text-blue-600 dark:text-blue-400' />
				</div>
				<h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
					{stepFiveData.title}
				</h1>
				<p className='text-lg text-gray-600 dark:text-gray-300'>
					{stepFiveData.description}
				</p>
			</div>

			<form
				onSubmit={handleSubmit}
				className='space-y-8'>
				{/* Basic Building Metrics */}
				<div className='grid md:grid-cols-2 gap-6'>
					<Card className='shadow-sm border border-gray-200 dark:border-gray-700'>
						<CardHeader className='pb-3'>
							<CardTitle className='text-lg flex items-center gap-2'>
								<Ruler className='h-4 w-4 text-blue-600 dark:text-blue-400' />
								Number of Stories
							</CardTitle>
						</CardHeader>
						<CardContent>
							<Input
								type='number'
								name='numberOfStories'
								value={userInput.numberOfStories || ''}
								onChange={handleChange}
								placeholder='Enter number of stories'
								min='1'
								max='100'
								className='w-full'
							/>
							<div className='text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-start'>
								<Info className='h-3 w-3 mr-1 mt-0.5 flex-shrink-0' />
								Include all floors above ground, including basements if used as
								living space
							</div>
						</CardContent>
					</Card>

					<Card className='shadow-sm border border-gray-200 dark:border-gray-700'>
						<CardHeader className='pb-3'>
							<CardTitle className='text-lg flex items-center gap-2'>
								<Ruler className='h-4 w-4 text-blue-600 dark:text-blue-400' />
								Building Height (meters)
							</CardTitle>
						</CardHeader>
						<CardContent>
							<Input
								type='number'
								name='height'
								value={userInput.height || ''}
								onChange={handleChange}
								placeholder='Enter building height in meters'
								min='1'
								max='1000'
								step='0.1'
								className='w-full'
							/>
							<div className='text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-start'>
								<Info className='h-3 w-3 mr-1 mt-0.5 flex-shrink-0' />
								Total height from ground level to the top of the building
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Building Axes Image */}
				<Card className='shadow-sm border border-gray-200 dark:border-gray-700'>
					<CardHeader className='pb-3'>
						<CardTitle className='text-lg flex items-center gap-2'>
							<Grid className='h-4 w-4 text-blue-600 dark:text-blue-400' />
							Building Plan Reference
						</CardTitle>
						<CardDescription>
							Use this reference image to understand the building axes
						</CardDescription>
					</CardHeader>
					<CardContent className='flex justify-center'>
						<div className='relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700'>
							<Image
								src='/images/axes.png'
								width={400}
								height={300}
								alt='Building axes reference'
								className='object-contain'
							/>
						</div>
					</CardContent>
				</Card>

				{/* Grid Editor */}
				<Card className='shadow-md border border-gray-200 dark:border-gray-700'>
					<CardHeader>
						<CardTitle className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<Grid className='h-5 w-5 text-blue-600 dark:text-blue-400' />
								Building Grid Definition
							</div>
							<div className='flex items-center gap-2'>
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={addColumn}
									className='gap-1'>
									<Plus className='h-3 w-3' /> Add Column
								</Button>
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={addRow}
									className='gap-1'>
									<Plus className='h-3 w-3' /> Add Row
								</Button>
							</div>
						</CardTitle>
						<CardDescription>
							Define your building's structural grid dimensions and column
							cross-sections
						</CardDescription>
					</CardHeader>

					<CardContent>
						<div className='overflow-x-auto'>
							<table className='w-full border-collapse'>
								<thead>
									<tr>
										<th className='p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium'>
											Grid
										</th>
										{(userInput.dimensions?.[0] || []).map((_, colIndex) => (
											<th
												key={colIndex}
												className='p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium'>
												<div className='flex items-center justify-between'>
													<span>Column {colIndex + 1}</span>
													{(userInput.dimensions?.[0] || []).length > 1 && (
														<Button
															type='button'
															variant='ghost'
															size='icon'
															onClick={() => removeColumn(colIndex)}
															className='h-6 w-6 text-gray-400 hover:text-red-500'>
															<X className='h-3 w-3' />
														</Button>
													)}
												</div>
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{(userInput.dimensions || [[]]).map((row, rowIndex) => (
										<React.Fragment key={rowIndex}>
											<tr>
												<td className='p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium'>
													<div className='flex items-center justify-between'>
														<span>Row {rowIndex + 1}</span>
														{(userInput.dimensions || []).length > 1 && (
															<Button
																type='button'
																variant='ghost'
																size='icon'
																onClick={() => removeRow(rowIndex)}
																className='h-6 w-6 text-gray-400 hover:text-red-500'>
																<X className='h-3 w-3' />
															</Button>
														)}
													</div>
												</td>
												{row.map((_, colIndex) => (
													<td
														key={colIndex}
														className='p-2 border border-gray-200 dark:border-gray-700'>
														<div className='space-y-2'>
															<div className='flex items-center'>
																<label className='text-xs font-medium text-gray-500 dark:text-gray-400 mr-2'>
																	Dimension (m):
																</label>
																<TooltipProvider>
																	<Tooltip>
																		<TooltipTrigger asChild>
																			<Button
																				variant='ghost'
																				size='icon'
																				className='h-4 w-4'>
																				<HelpCircle className='h-3 w-3 text-gray-400' />
																			</Button>
																		</TooltipTrigger>
																		<TooltipContent>
																			<p className='text-xs'>
																				Distance in meters
																			</p>
																		</TooltipContent>
																	</Tooltip>
																</TooltipProvider>
															</div>
															<Input
																type='text'
																value={
																	userInput.dimensions?.[rowIndex]?.[
																		colIndex
																	] || ''
																}
																onChange={(e) =>
																	handleArrayChange(
																		e,
																		rowIndex,
																		colIndex,
																		'dimensions'
																	)
																}
																placeholder='e.g., 4.5'
																className='w-full text-sm'
															/>
														</div>
														<div className='mt-3 space-y-2'>
															<div className='flex items-center'>
																<label className='text-xs font-medium text-gray-500 dark:text-gray-400 mr-2'>
																	Cross-Section (cm):
																</label>
																<TooltipProvider>
																	<Tooltip>
																		<TooltipTrigger asChild>
																			<Button
																				variant='ghost'
																				size='icon'
																				className='h-4 w-4'>
																				<HelpCircle className='h-3 w-3 text-gray-400' />
																			</Button>
																		</TooltipTrigger>
																		<TooltipContent>
																			<p className='text-xs'>
																				Column width × height in centimeters
																			</p>
																		</TooltipContent>
																	</Tooltip>
																</TooltipProvider>
															</div>
															<Input
																type='text'
																value={
																	userInput.crossSections?.[rowIndex]?.[
																		colIndex
																	] || ''
																}
																onChange={(e) =>
																	handleArrayChange(
																		e,
																		rowIndex,
																		colIndex,
																		'crossSections'
																	)
																}
																placeholder='e.g., 30×40'
																className='w-full text-sm'
															/>
														</div>
													</td>
												))}
											</tr>
										</React.Fragment>
									))}
								</tbody>
							</table>
						</div>

						<div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-6'>
							<h4 className='font-medium text-gray-900 dark:text-white mb-2 flex items-center'>
								<Info className='h-4 w-4 mr-2 text-blue-600' />
								How to Fill the Grid
							</h4>
							<ul className='space-y-2 text-sm text-gray-600 dark:text-gray-400'>
								<li>
									• <span className='font-medium'>Dimensions:</span> Enter the
									distance between columns in meters (e.g., 4.5)
								</li>
								<li>
									• <span className='font-medium'>Cross-Sections:</span> Enter
									column dimensions in width × height format in centimeters
									(e.g., 30×40)
								</li>
								<li>
									• Add more rows or columns to match your building's structural
									grid
								</li>
							</ul>
						</div>
					</CardContent>

					<CardFooter className='flex justify-between pt-4 border-t'>
						<Link href='/assessment/4'>
							<Button
								variant='outline'
								className='gap-2'>
								<ArrowLeft className='h-4 w-4' /> Previous
							</Button>
						</Link>

						<Button
							type='submit'
							disabled={!isFormValid}
							className='gap-2'>
							Next <ArrowRight className='h-4 w-4' />
						</Button>
					</CardFooter>
				</Card>
			</form>
		</div>
	);
};

export default PlanDefinitionStep;
