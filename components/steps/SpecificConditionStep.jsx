// components/steps/SpecificConditionStep.jsx
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Data from '@/utils/Data.json';
import { Button } from '@/components/ui/button';
import { useUserInput } from '@/context/UserInputContext';
import {
	ArrowLeft,
	ArrowRight,
	Upload,
	ImageIcon,
	Camera,
	FileWarning,
	Info,
	AlertTriangle,
	X,
} from 'lucide-react';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';

const SpecificConditionStep = ({ onNext }) => {
	const { userInput, updateUserInput } = useUserInput();
	const [imagePreview, setImagePreview] = useState(
		userInput.specificCondition || null
	);
	const [isDragging, setIsDragging] = useState(false);
	const stepSevenData = Data.steps.find((step) => step.step === 7);

	// Common structural issues that users might photograph
	const commonIssues = [
		{
			name: 'Foundation Cracks',
			description:
				'Cracks in the foundation can indicate settlement or structural issues',
		},
		{
			name: 'Column Damage',
			description:
				'Damage to structural columns can significantly impact seismic performance',
		},
		{
			name: 'Wall Cracks',
			description:
				'Significant cracks in walls may indicate structural problems',
		},
		{
			name: 'Exposed Rebar',
			description: 'Visible reinforcement bars suggest concrete deterioration',
		},
	];

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
				updateUserInput({ specificCondition: reader.result });
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
				updateUserInput({ specificCondition: reader.result });
			};
			reader.readAsDataURL(file);
		}
	};

	const removeImage = () => {
		setImagePreview(null);
		updateUserInput({ specificCondition: null });
	};

	return (
		<div className='max-w-4xl mx-auto'>
			<div className='text-center mb-8'>
				<div className='inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4'>
					<Camera className='h-6 w-6 text-blue-600 dark:text-blue-400' />
				</div>
				<h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
					{stepSevenData.title}
				</h1>
				<p className='text-lg text-gray-600 dark:text-gray-300'>
					{stepSevenData.description}
				</p>
			</div>

			<Card className='shadow-md border border-gray-200 dark:border-gray-700 mb-8'>
				<CardHeader className='pb-4'>
					<CardTitle className='text-xl flex items-center gap-2'>
						<Camera className='h-5 w-5 text-blue-600 dark:text-blue-400' />
						Structural Condition Photo
					</CardTitle>
					<CardDescription>
						Upload a photo of any specific structural condition or issue in your
						building
					</CardDescription>
				</CardHeader>

				<CardContent>
					<div className='space-y-6'>
						{/* Image Upload Area */}
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
									<div className='relative rounded-lg overflow-hidden max-h-[400px] mx-auto'>
										<Image
											src={imagePreview}
											alt='Specific condition'
											width={600}
											height={400}
											className='mx-auto object-contain max-h-[400px]'
										/>
									</div>
									<button
										onClick={removeImage}
										className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors'>
										<X className='h-5 w-5' />
									</button>
								</div>
							) : (
								<div className='text-center py-8'>
									<ImageIcon className='h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4' />
									<p className='text-gray-700 dark:text-gray-300 mb-4'>
										Drag and drop an image here or{' '}
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

						{/* Information Card */}
						<div className='bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800'>
							<div className='flex items-start'>
								<Info className='h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0' />
								<div className='ml-3'>
									<h3 className='text-sm font-medium text-blue-800 dark:text-blue-300'>
										What to Photograph
									</h3>
									<p className='mt-1 text-sm text-blue-700 dark:text-blue-400'>
										If your building has any specific structural issues or
										damage, please upload a clear photo. This helps us better
										assess your building's condition.
									</p>
									<div className='mt-3 grid grid-cols-1 md:grid-cols-2 gap-3'>
										{commonIssues.map((issue, index) => (
											<div
												key={index}
												className='flex items-start space-x-2'>
												<AlertTriangle className='h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0' />
												<div>
													<span className='text-xs font-medium text-blue-800 dark:text-blue-300'>
														{issue.name}:
													</span>
													<p className='text-xs text-blue-700 dark:text-blue-400'>
														{issue.description}
													</p>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Skip Notice */}
						<div className='text-center text-sm text-gray-600 dark:text-gray-400'>
							<p>
								If there are no specific structural conditions to report, you
								can proceed to the next step.
							</p>
						</div>
					</div>
				</CardContent>

				<CardFooter className='flex justify-between pt-4 border-t'>
					<Link href='/assessment/6'>
						<Button
							variant='outline'
							className='gap-2'>
							<ArrowLeft className='h-4 w-4' /> Previous
						</Button>
					</Link>

					<Button
						onClick={onNext}
						className='gap-2'>
						Next <ArrowRight className='h-4 w-4' />
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
};

export default SpecificConditionStep;
