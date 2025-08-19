// components/steps/BuildingInfoStep.jsx
import React from 'react';
import Link from 'next/link';
import Data from '@/utils/Data.json';
import { Button } from '@/components/ui/button';
import { useUserInput } from '@/context/UserInputContext';
import { Badge } from '@/components/ui/badge';
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

	// Enhanced form structure with Turkish seismic data
	const formFields = [
		{
			label: "Type of Earthquake",
			name: "typeOfEarthquake",
			type: "select",
			options: [
				{ value: "Zone 1 (Low)", label: "Zone 1 (Low)", description: "Low seismic activity region" },
				{ value: "Zone 2 (Moderate)", label: "Zone 2 (Moderate)", description: "Moderate seismic activity region" },
				{ value: "Zone 3 (High)", label: "Zone 3 (High)", description: "High seismic activity region" },
				{ value: "Zone 4 (Very High)", label: "Zone 4 (Very High)", description: "Very high seismic activity region" }
			],
			description: "Seismic zones according to Turkish seismic hazard map",
			icon: "earthquake",
			info: "Turkey is divided into 4 seismic zones based on expected earthquake magnitude and frequency."
		},
		{
			label: "Type of Soil",
			name: "typeOfSoil",
			type: "select", 
			options: [
				{ value: "ZA", label: "ZA - Rock", description: "Solid rock formations" },
				{ value: "ZB", label: "ZB - Very Dense", description: "Very dense sand/gravel, dense clay" },
				{ value: "ZC", label: "ZC - Dense", description: "Dense sand/gravel, medium dense clay" },
				{ value: "ZD", label: "ZD - Medium Dense", description: "Medium dense sand/gravel, soft clay" },
				{ value: "ZE", label: "ZE - Soft", description: "Soft sand/clay with high plasticity" }
			],
			description: "Soil classification according to Turkish Building Earthquake Code (TBDY)",
			icon: "soil",
			info: "Soil type significantly affects earthquake ground motion amplification."
		},
		{
			label: "Design Regulation",
			name: "designRegulation",
			type: "select",
			options: [
				{ value: "Before 1975", label: "Before 1975", description: "Pre-modern seismic codes" },
				{ value: "1975-1998", label: "1975-1998", description: "First generation seismic codes" },
				{ value: "1998-2007", label: "1998-2007", description: "Modern seismic codes" },
				{ value: "2007-2018", label: "2007-2018", description: "Improved seismic codes" },
				{ value: "After 2018 (TBDY)", label: "After 2018 (TBDY)", description: "Current Turkish Building Earthquake Code" }
			],
			description: "Building design regulation period according to Turkish standards",
			icon: "regulation",
			info: "Later regulations incorporate better understanding of earthquake engineering principles."
		},
		{
			label: "Number of Stories",
			name: "numberOfStories",
			type: "number",
			description: "Total number of floors including ground floor",
			icon: "stories",
			info: "Include all floors above ground level. Basement levels are counted separately.",
			min: 1,
			max: 50
		},
		{
			label: "Year of Construction",
			name: "yearOfConstruction", 
			type: "number",
			description: "When construction of the building started",
			icon: "year",
			info: "Construction year helps determine applicable building codes and expected deterioration.",
			min: 1900,
			max: new Date().getFullYear()
		}
	];

	const isFormValid = formFields.every(field => {
		const value = userInput[field.name];
		return value && (field.type !== 'number' || !isNaN(value));
	});

	return (
		<div className='max-w-5xl mx-auto'>
			<div className='text-center mb-8'>
				<div className='inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4'>
					<Building className='h-6 w-6 text-blue-600 dark:text-blue-400' />
				</div>
				<h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
					Building Information
				</h1>
				<p className='text-lg text-gray-600 dark:text-gray-300'>
					Provide details about your building's characteristics and construction
				</p>
				<div className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
					<p className='text-sm text-blue-700 dark:text-blue-300'>
						<Info className='inline h-4 w-4 mr-1' />
						All information is based on Turkish Building Earthquake Code (TBDY) standards
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className='space-y-6'>
				<div className='grid lg:grid-cols-2 gap-6'>
					{formFields.map((field, index) => (
						<Card key={field.name} className='shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow'>
							<CardHeader className='pb-3'>
								<CardTitle className='text-lg flex items-center gap-2'>
									{getEnhancedInputIcon(field.icon)}
									{field.label}
									
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button variant='ghost' size='icon' className='h-6 w-6 ml-1'>
													<HelpCircle className='h-4 w-4 text-gray-400' />
												</Button>
											</TooltipTrigger>
											<TooltipContent className='max-w-xs'>
												<p>{field.info}</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</CardTitle>
								<p className='text-sm text-gray-600 dark:text-gray-400'>{field.description}</p>
							</CardHeader>
							<CardContent>
								{field.type === 'select' ? (
									<div className='space-y-3'>
										<Select
											value={userInput[field.name] || ''}
											onValueChange={(value) => handleChange(field.name, value)}
										>
											<SelectTrigger className='w-full'>
												<SelectValue placeholder={`Select ${field.label}`} />
											</SelectTrigger>
											<SelectContent>
												{field.options.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														<div className='flex flex-col items-start'>
															<span className='font-medium'>{option.label}</span>
															<span className='text-xs text-gray-500'>{option.description}</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										
										{/* Display selected option description */}
										{userInput[field.name] && (
											<div className='mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs'>
												<Badge variant='secondary' className='mr-2'>Selected</Badge>
												{field.options.find(opt => opt.value === userInput[field.name])?.description}
											</div>
										)}
									</div>
								) : (
									<div className='space-y-2'>
										<Input
											type='number'
											placeholder={`Enter ${field.label.toLowerCase()}`}
											value={userInput[field.name] || ''}
											onChange={(e) => handleChange(field.name, e.target.value)}
											min={field.min}
											max={field.max}
										/>
										<div className='text-xs text-gray-500 dark:text-gray-400 flex items-start'>
											<Info className='h-3 w-3 mr-1 mt-0.5 flex-shrink-0' />
											{field.info}
										</div>
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

// Enhanced helper function to get icons for input fields
function getEnhancedInputIcon(iconType) {
	switch (iconType) {
		case 'earthquake':
			return <Layers className='h-4 w-4 text-red-500' />;
		case 'soil':
			return <Layers className='h-4 w-4 text-amber-500' />;
		case 'regulation':
			return <Building className='h-4 w-4 text-purple-500' />;
		case 'stories':
			return <Layers className='h-4 w-4 text-green-500' />;
		case 'year':
			return <Calendar className='h-4 w-4 text-blue-500' />;
		default:
			return <Info className='h-4 w-4 text-gray-500' />;
	}
}

// Legacy helper function for backward compatibility
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
