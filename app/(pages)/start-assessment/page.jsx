'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
	AlertTriangle,
	Info,
	MapPin,
	Building,
	Home,
	Briefcase, // ← replaced Office
	Building2,
	Factory,
	School,
	BookOpen,
} from 'lucide-react';
import { nanoid } from 'nanoid';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';

const StartAssessmentPage = () => {
	const router = useRouter();
	const [buildingType, setBuildingType] = useState('residential');
	const [buildingName, setBuildingName] = useState('');

	const handleStart = () => {
		const assessmentId = nanoid();
		router.push(`/assessment/new/location?id=${assessmentId}`);
	};

	return (
		<div className='container py-8 max-w-4xl'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold mb-2'>Start New Assessment</h1>
				<p className='text-muted-foreground'>
					Begin a new earthquake risk assessment for your building
				</p>
			</div>

			{/* Introduction Card */}
			<Card className='mb-8'>
				<CardHeader className='pb-3'>
					<CardTitle>About the Assessment Process</CardTitle>
					<CardDescription>
						This assessment will guide you through collecting key information
						about your building to evaluate its earthquake risk level.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='flex items-start gap-4'>
						<div className='flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900'>
							<Info
								size={18}
								className='text-blue-600 dark:text-blue-300'
							/>
						</div>
						<div>
							<p className='mb-4'>
								The assessment has multiple steps and will take approximately
								15-20 minutes to complete. You'll need information about:
							</p>

							<ul className='list-disc list-inside space-y-1 mb-4'>
								<li>Your building's location and soil conditions</li>
								<li>
									Building specifications (year built, number of floors, etc.)
								</li>
								<li>Structural system and any irregularities</li>
								<li>Building dimensions and layout</li>
								<li>Neighboring structures</li>
							</ul>

							<div className='bg-amber-50 border border-amber-200 rounded-md p-4 dark:bg-amber-950 dark:border-amber-800'>
								<div className='flex items-start'>
									<AlertTriangle
										size={18}
										className='text-amber-600 mr-2 mt-0.5 flex-shrink-0 dark:text-amber-400'
									/>
									<p className='text-amber-800 text-sm dark:text-amber-200'>
										This assessment provides an initial risk evaluation and is
										not a substitute for a professional structural engineering
										inspection. For critical safety decisions, consult with a
										qualified engineer.
									</p>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Building Type Selection */}
			<Card className='mb-8'>
				<CardHeader>
					<CardTitle>Building Information</CardTitle>
					<CardDescription>
						Enter basic information about the building you want to assess
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='space-y-6'>
						<div>
							<Label htmlFor='building-name'>Building Name or Identifier</Label>
							<Input
								id='building-name'
								placeholder='e.g., My Home, Office Building, etc.'
								className='mt-1'
								value={buildingName}
								onChange={(e) => setBuildingName(e.target.value)}
							/>
							<p className='text-xs text-muted-foreground mt-1'>
								This name will be used to identify your assessment
							</p>
						</div>

						<div>
							<Label className='mb-2 block'>Building Type</Label>
							<RadioGroup
								defaultValue='residential'
								value={buildingType}
								onValueChange={setBuildingType}
								className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								<BuildingTypeOption
									value='residential'
									icon={<Home size={24} />}
									label='Residential'
									description='Single-family homes, apartments, condos'
									checked={buildingType === 'residential'}
								/>

								<BuildingTypeOption
									value='commercial'
									icon={<Briefcase size={24} />}
									label='Commercial'
									description='Office buildings, retail spaces'
									checked={buildingType === 'commercial'}
								/>

								<BuildingTypeOption
									value='institutional'
									icon={<School size={24} />}
									label='Institutional'
									description='Schools, hospitals, government'
									checked={buildingType === 'institutional'}
								/>

								<BuildingTypeOption
									value='industrial'
									icon={<Factory size={24} />}
									label='Industrial'
									description='Factories, warehouses, plants'
									checked={buildingType === 'industrial'}
								/>

								<BuildingTypeOption
									value='highrise'
									icon={<Building2 size={24} />}
									label='High-Rise'
									description='Tall buildings (10+ floors)'
									checked={buildingType === 'highrise'}
								/>

								<BuildingTypeOption
									value='other'
									icon={<Building size={24} />}
									label='Other'
									description='Other building types'
									checked={buildingType === 'other'}
								/>
							</RadioGroup>
						</div>
					</div>
				</CardContent>
				<CardFooter className='flex justify-between pt-2'>
					<Button
						variant='outline'
						asChild>
						<Link href='/dashboard'>Cancel</Link>
					</Button>
					<Button
						onClick={handleStart}
						disabled={!buildingName.trim()}>
						Start Assessment
					</Button>
				</CardFooter>
			</Card>

			{/* FAQ Section */}
			<Card>
				<CardHeader>
					<CardTitle>Frequently Asked Questions</CardTitle>
				</CardHeader>
				<CardContent>
					<Accordion
						type='single'
						collapsible
						className='w-full'>
						<AccordionItem value='item-1'>
							<AccordionTrigger>
								How long will this assessment take?
							</AccordionTrigger>
							<AccordionContent>
								The assessment typically takes 15-20 minutes to complete if you
								have all the required information about your building. You can
								save your progress and return later.
							</AccordionContent>
						</AccordionItem>

						<AccordionItem value='item-2'>
							<AccordionTrigger>
								What information do I need to have ready?
							</AccordionTrigger>
							<AccordionContent>
								You’ll need to know your building’s location, year of
								construction, number of stories, structural system type, and
								basic dimensions. Photos of the building are helpful but
								optional.
							</AccordionContent>
						</AccordionItem>

						<AccordionItem value='item-3'>
							<AccordionTrigger>
								Can I save my progress and return later?
							</AccordionTrigger>
							<AccordionContent>
								Yes, you can save your progress at any point during the
								assessment and return to complete it later. Your saved
								assessments will appear in the “My Assessments” section.
							</AccordionContent>
						</AccordionItem>

						<AccordionItem value='item-4'>
							<AccordionTrigger>
								How accurate is this assessment?
							</AccordionTrigger>
							<AccordionContent>
								This tool provides an initial risk estimation based on the
								information you provide. It’s a useful starting point, but for
								critical safety decisions, we recommend consulting with a
								qualified structural engineer for a professional assessment.
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</CardContent>
			</Card>
		</div>
	);
};

// Helper component for building type selection
const BuildingTypeOption = ({ value, icon, label, description, checked }) => {
	return (
		<label
			htmlFor={`building-type-${value}`}
			className={`
        flex flex-col items-center bg-card border rounded-lg p-4 cursor-pointer
        ${checked ? 'border-primary' : 'border-border'}
        hover:border-primary hover:bg-muted/40 transition-colors
      `}>
			<RadioGroupItem
				value={value}
				id={`building-type-${value}`}
				className='sr-only'
			/>
			<div
				className={`
          w-12 h-12 rounded-full flex items-center justify-center mb-3
          ${
						checked
							? 'bg-primary/10 text-primary'
							: 'bg-muted text-muted-foreground'
					}
        `}>
				{icon}
			</div>
			<h3 className='font-medium text-center'>{label}</h3>
			<p className='text-xs text-muted-foreground text-center mt-1'>
				{description}
			</p>
		</label>
	);
};

export default StartAssessmentPage;
