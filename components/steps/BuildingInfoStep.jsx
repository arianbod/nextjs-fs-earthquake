// components/steps/BuildingInfoStep.jsx
import React from 'react';
import Link from 'next/link';
import Data from '@/utils/Data.json';
import { Button } from '@/components/ui/button';
import { useUserInput } from '@/context/UserInputContext';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
	ArrowLeft,
	ArrowRight,
	Building,
	Calendar,
	Layers,
	HelpCircle,
	Info,
} from 'lucide-react';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';

const BuildingInfoStep = ({ onNext }) => {
	const { userInput, updateUserInput } = useUserInput();

	const handleChange = (name, value) => {
		updateUserInput({ [name]: value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onNext();
	};

	const stepTwoData = Data.steps.find((step) => step.step === 2);
	const isFormValid =
		userInput.typeofsoil &&
		userInput.typeofsoil.length > 0 &&
		userInput.designregulation &&
		userInput.designregulation.length > 0 &&
		userInput.typeofsoil &&
		userInput.typeofsoil.length > 0 &&
		userInput.numberofstories &&
		userInput.yearofconstruction;

	return (
		<div className='max-w-4xl mx-auto'>
			<div className='text-center mb-8'>
				<div className='inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4'>
					<Building className='h-6 w-6 text-blue-600 dark:text-blue-400' />
				</div>
				<h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
					{stepTwoData.title}
				</h1>
				<p className='text-lg text-gray-600 dark:text-gray-300'>
					{stepTwoData.description}
				</p>
			</div>

			<form
				onSubmit={handleSubmit}
				className='space-y-8'>
				<div className='grid md:grid-cols-2 gap-6'>
					{stepTwoData.inputs.map((input, index) => (
						<Card
							key={index}
							className='shadow-sm border border-gray-200 dark:border-gray-700'>
							<CardHeader className='pb-3'>
								<CardTitle className='text-lg flex items-center gap-2'>
									{getInputIcon(input.label)}
									{input.label}

									{input.url && (
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant='ghost'
														size='icon'
														className='h-6 w-6 ml-1'>
														<HelpCircle className='h-4 w-4 text-gray-400' />
													</Button>
												</TooltipTrigger>
												<TooltipContent className='max-w-xs'>
													<p>Click for more information about {input.label}</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									)}
								</CardTitle>
							</CardHeader>
							<CardContent>
								{input.type === 'select' ? (
									<Select
										value={
											userInput[input.label.replace(/\s+/g, '').toLowerCase()]
										}
										onValueChange={(value) =>
											handleChange(
												input.label.replace(/\s+/g, '').toLowerCase(),
												value
											)
										}>
										<SelectTrigger className='w-full'>
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
								) : (
									<div className='space-y-2'>
										<Input
											type='number'
											placeholder={`Enter ${input.label.toLowerCase()}`}
											value={
												userInput[
													input.label.replace(/\s+/g, '').toLowerCase()
												] || ''
											}
											onChange={(e) =>
												handleChange(
													input.label.replace(/\s+/g, '').toLowerCase(),
													e.target.value
												)
											}
											min={input.label.includes('Year') ? 1900 : 0}
											max={
												input.label.includes('Year')
													? new Date().getFullYear()
													: undefined
											}
										/>
										{input.label.includes('Stories') && (
											<div className='text-xs text-gray-500 dark:text-gray-400 flex items-start'>
												<Info className='h-3 w-3 mr-1 mt-0.5 flex-shrink-0' />
												Include all floors above ground, including basements and
												attics if used as living space
											</div>
										)}
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>

				{!isFormValid && (
					<div className='bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start'>
						<Info className='h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0' />
						<div className='ml-3'>
							<h3 className='text-sm font-medium text-amber-800 dark:text-amber-300'>
								Complete all fields
							</h3>
							<p className='text-sm text-amber-700 dark:text-amber-400 mt-1'>
								Please fill in all the building information fields to proceed to
								the next step.
							</p>
						</div>
					</div>
				)}

				<div className='flex justify-between pt-4'>
					<Link href='/assessment/1'>
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
				</div>
			</form>
		</div>
	);
};

// Helper function to get icons for input fields
function getInputIcon(label) {
	const labelLower = label.toLowerCase();

	if (labelLower.includes('earthquake')) {
		return <Layers className='h-4 w-4 text-blue-500' />;
	} else if (labelLower.includes('soil')) {
		return <Layers className='h-4 w-4 text-amber-500' />;
	} else if (
		labelLower.includes('design') ||
		labelLower.includes('regulation')
	) {
		return <Building className='h-4 w-4 text-purple-500' />;
	} else if (labelLower.includes('stories')) {
		return <Layers className='h-4 w-4 text-green-500' />;
	} else if (
		labelLower.includes('year') ||
		labelLower.includes('construction')
	) {
		return <Calendar className='h-4 w-4 text-red-500' />;
	}

	return <Info className='h-4 w-4 text-gray-500' />;
}

export default BuildingInfoStep;
