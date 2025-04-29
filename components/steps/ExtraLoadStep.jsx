// components/steps/ExtraLoadStep.jsx
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Data from '@/utils/Data.json';
import { Button } from '@/components/ui/button';
import { useUserInput } from '@/context/UserInputContext';
import {
	ArrowLeft,
	ArrowRight,
	ImageIcon,
	Weight,
	Camera,
	Info,
	X,
	CheckCircle2,
} from 'lucide-react';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const ExtraLoadStep = ({ onNext }) => {
	const { userInput, updateUserInput } = useUserInput();
	const [imagePreview, setImagePreview] = useState(userInput.extraLoad || null);
	const [isDragging, setIsDragging] = useState(false);
	const [hasExtraLoad, setHasExtraLoad] = useState(
		userInput.hasExtraLoad === undefined ? null : userInput.hasExtraLoad
	);

	const stepEightData = Data.steps.find((step) => step.step === 8);

	// Common extra loads that users might have
	const extraLoadTypes = [
		{
			name: 'Water Tanks',
			description: 'Rooftop water storage tanks add significant weight',
		},
		{
			name: 'HVAC Equipment',
			description: 'Heavy air conditioning or ventilation units',
		},
		{
			name: 'Solar Panels',
			description: 'Solar panel arrays add both weight and wind loads',
		},
		{
			name: 'Additional Floors',
			description: 'Floors added after original construction',
		},
	];

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
				updateUserInput({ extraLoad: reader.result });
			};
			reader.readAsDataURL(file);
		}
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = (e) => {
		e.preventDefault();
		setIsDragging(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			const file = e.dataTransfer.files[0];
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
				updateUserInput({ extraLoad: reader.result });
			};
			reader.readAsDataURL(file);
		}
	};

	const removeImage = () => {
		setImagePreview(null);
		updateUserInput({ extraLoad: null });
	};

	const handleExtraLoadChange = (value) => {
		const boolValue = value === 'yes';
		setHasExtraLoad(boolValue);
		updateUserInput({ hasExtraLoad: boolValue });
	};

	return (
		<div className='max-w-4xl mx-auto'>
			<div className='text-center mb-8'>
				<div className='inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4'>
					<Weight className='h-6 w-6 text-blue-600 dark:text-blue-400' />
				</div>
				<h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
					{stepEightData.title}
				</h1>
				<p className='text-lg text-gray-600 dark:text-gray-300'>
					{stepEightData.description}
				</p>
			</div>

			<Card className='shadow-md border border-gray-200 dark:border-gray-700 mb-8'>
				<CardHeader className='pb-4'>
					<CardTitle className='text-xl flex items-center gap-2'>
						<Weight className='h-5 w-5 text-blue-600 dark:text-blue-400' />
						Additional Structural Loads
					</CardTitle>
					<CardDescription>
						Does your building have any additional loads not part of the
						original design?
					</CardDescription>
				</CardHeader>

				<CardContent>
					<div className='space-y-6'>
						{/* Extra Load Selection */}
						<RadioGroup
							value={
								hasExtraLoad === null ? undefined : hasExtraLoad ? 'yes' : 'no'
							}
							onValueChange={handleExtraLoadChange}
							className='grid grid-cols-2 gap-4 pt-2'>
							<div>
								<RadioGroupItem
									value='yes'
									id='option-yes'
									className='peer sr-only'
								/>
								<Label
									htmlFor='option-yes'
									className='flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer'>
									<Weight className='mb-3 h-6 w-6 text-amber-500' />
									<div className='space-y-1 text-center'>
										<p className='text-sm font-medium leading-none'>Yes</p>
										<p className='text-sm text-muted-foreground'>
											The building has extra loads
										</p>
									</div>
								</Label>
							</div>

							<div>
								<RadioGroupItem
									value='no'
									id='option-no'
									className='peer sr-only'
								/>
								<Label
									htmlFor='option-no'
									className='flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 [&:has([data-state=checked])]:border-green-500 cursor-pointer'>
									<CheckCircle2 className='mb-3 h-6 w-6 text-green-500' />
									<div className='space-y-1 text-center'>
										<p className='text-sm font-medium leading-none'>No</p>
										<p className='text-sm text-muted-foreground'>
											No additional loads
										</p>
									</div>
								</Label>
							</div>
						</RadioGroup>

						{/* Conditional content based on selection */}
						{hasExtraLoad && (
							<>
								<div className='bg-amber-50 dark:bg-amber-900/20 rounded-lg p-5 border border-amber-200 dark:border-amber-800'>
									<div className='flex items-start'>
										<Info className='h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0' />
										<div className='ml-3'>
											<h3 className='text-sm font-medium text-amber-800 dark:text-amber-300'>
												Common Extra Loads
											</h3>
											<p className='mt-1 text-sm text-amber-700 dark:text-amber-400'>
												Additional loads not accounted for in the original
												design can impact seismic performance.
											</p>
											<div className='mt-3 grid grid-cols-1 md:grid-cols-2 gap-3'>
												{extraLoadTypes.map((type, index) => (
													<div
														key={index}
														className='flex items-start space-x-2'>
														<Weight className='h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0' />
														<div>
															<span className='text-xs font-medium text-amber-800 dark:text-amber-300'>
																{type.name}:
															</span>
															<p className='text-xs text-amber-700 dark:text-amber-400'>
																{type.description}
															</p>
														</div>
													</div>
												))}
											</div>
										</div>
									</div>
								</div>

								{/* Image Upload Area */}
								<div>
									<h3 className='text-lg font-medium text-gray-900 dark:text-white mb-3'>
										Upload a Photo (Optional)
									</h3>
									<div
										className={`border-2 ${
											isDragging
												? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
												: 'border-dashed border-gray-300 dark:border-gray-600'
										} rounded-lg p-8 transition-colors duration-200`}
										onDragOver={handleDragOver}
										onDragLeave={handleDragLeave}
										onDrop={handleDrop}>
										{imagePreview ? (
											<div className='relative'>
												<div className='relative rounded-lg overflow-hidden max-h-[300px] mx-auto'>
													<Image
														src={imagePreview}
														alt='Extra load'
														width={600}
														height={400}
														className='mx-auto object-contain max-h-[300px]'
													/>
												</div>
												<button
													onClick={removeImage}
													className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors'>
													<X className='h-5 w-5' />
												</button>
											</div>
										) : (
											<div className='text-center py-6'>
												<Camera className='h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4' />
												<p className='text-gray-700 dark:text-gray-300 mb-4'>
													Drag and drop an image of the extra load or{' '}
													<label className='text-blue-600 dark:text-blue-400 cursor-pointer underline hover:text-blue-800 dark:hover:text-blue-300'>
														browse
														<input
															type='file'
															className='hidden'
															onChange={handleImageChange}
															accept='image/*'
														/>
													</label>
												</p>
												<p className='text-sm text-gray-500 dark:text-gray-400'>
													Supported formats: JPG, PNG, GIF (max 5MB)
												</p>
											</div>
										)}
									</div>
								</div>
							</>
						)}

						{hasExtraLoad === false && (
							<div className='bg-green-50 dark:bg-green-900/20 rounded-lg p-5 border border-green-200 dark:border-green-800'>
								<div className='flex items-start'>
									<CheckCircle2 className='h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0' />
									<div className='ml-3'>
										<h3 className='text-sm font-medium text-green-800 dark:text-green-300'>
											No Additional Loads
										</h3>
										<p className='mt-1 text-sm text-green-700 dark:text-green-400'>
											Buildings without additional loads typically perform
											better during earthquakes as they maintain their original
											design specifications.
										</p>
									</div>
								</div>
							</div>
						)}
					</div>
				</CardContent>

				<CardFooter className='flex justify-between pt-4 border-t'>
					<Link href='/assessment/7'>
						<Button
							variant='outline'
							className='gap-2'>
							<ArrowLeft className='h-4 w-4' /> Previous
						</Button>
					</Link>

					<Button
						onClick={onNext}
						disabled={hasExtraLoad === null}
						className='gap-2'>
						Next <ArrowRight className='h-4 w-4' />
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
};

export default ExtraLoadStep;
