// components/steps/OptionalDetailsStep.jsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUserInput } from '@/context/UserInputContext';
import {
	ArrowRight,
	ArrowLeft,
	ChevronDown,
	Ruler,
	Building2,
	Weight,
	FileImage,
	CheckCircle2,
	SkipForward
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
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

/**
 * OptionalDetailsStep - Accordion-style optional details
 *
 * Combines old steps 7-11 into collapsible sections.
 * All optional - user can skip entirely for faster assessment.
 * Better data = more accurate results.
 */

const OptionalDetailsStep = ({ onNext, onBack }) => {
	const { userInput, updateUserInput } = useUserInput();
	const [openSections, setOpenSections] = useState({});
	const [completedSections, setCompletedSections] = useState({});

	const toggleSection = (section) => {
		setOpenSections(prev => ({
			...prev,
			[section]: !prev[section]
		}));
	};

	const markSectionComplete = (section) => {
		setCompletedSections(prev => ({
			...prev,
			[section]: true
		}));
		setOpenSections(prev => ({
			...prev,
			[section]: false
		}));
	};

	const handleChange = (field, value) => {
		updateUserInput({ [field]: value });
	};

	// Count completed sections
	const completedCount = Object.values(completedSections).filter(Boolean).length;

	// Section configurations
	const sections = [
		{
			id: 'dimensions',
			icon: Ruler,
			title: 'Building Dimensions',
			description: 'Length, width, and floor heights',
			content: (
				<div className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="buildingLength">Length (m)</Label>
							<Input
								id="buildingLength"
								type="number"
								placeholder="e.g., 20"
								value={userInput.buildingLength || ''}
								onChange={(e) => handleChange('buildingLength', e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="buildingWidth">Width (m)</Label>
							<Input
								id="buildingWidth"
								type="number"
								placeholder="e.g., 15"
								value={userInput.buildingWidth || ''}
								onChange={(e) => handleChange('buildingWidth', e.target.value)}
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="floorHeight">Typical Floor Height (m)</Label>
						<Input
							id="floorHeight"
							type="number"
							step="0.1"
							placeholder="e.g., 3.0"
							value={userInput.floorHeight || ''}
							onChange={(e) => handleChange('floorHeight', e.target.value)}
						/>
					</div>
					<Button
						size="sm"
						variant="outline"
						onClick={() => markSectionComplete('dimensions')}
						className="w-full"
					>
						<CheckCircle2 className="h-4 w-4 mr-2" />
						Done with dimensions
					</Button>
				</div>
			)
		},
		{
			id: 'neighbors',
			icon: Building2,
			title: 'Neighboring Buildings',
			description: 'Adjacent structures that may affect your building',
			content: (
				<div className="space-y-4">
					<div className="space-y-2">
						<Label>Adjacent building situation</Label>
						<Select
							value={userInput.adjacentBuildingRisk || ''}
							onValueChange={(value) => handleChange('adjacentBuildingRisk', value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select situation" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">No adjacent buildings (standalone)</SelectItem>
								<SelectItem value="similar">Similar height neighbors</SelectItem>
								<SelectItem value="taller">Taller building nearby</SelectItem>
								<SelectItem value="shorter">Shorter building nearby</SelectItem>
								<SelectItem value="gap">Small gap between buildings</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="separationDistance">Separation distance (m)</Label>
						<Input
							id="separationDistance"
							type="number"
							step="0.1"
							placeholder="e.g., 2.5"
							value={userInput.separationDistance || ''}
							onChange={(e) => handleChange('separationDistance', e.target.value)}
						/>
					</div>
					<Button
						size="sm"
						variant="outline"
						onClick={() => markSectionComplete('neighbors')}
						className="w-full"
					>
						<CheckCircle2 className="h-4 w-4 mr-2" />
						Done with neighbors
					</Button>
				</div>
			)
		},
		{
			id: 'loads',
			icon: Weight,
			title: 'Extra Loads',
			description: 'Water tanks, solar panels, heavy equipment',
			content: (
				<div className="space-y-4">
					<div className="space-y-3">
						<Label>Check all that apply:</Label>
						<div className="space-y-2">
							{[
								{ id: 'waterTank', label: 'Rooftop water tank' },
								{ id: 'solarPanels', label: 'Solar panels' },
								{ id: 'heavyEquipment', label: 'Heavy mechanical equipment' },
								{ id: 'roofGarden', label: 'Roof garden/terrace' },
								{ id: 'signage', label: 'Large signage/billboards' },
							].map((item) => (
								<div key={item.id} className="flex items-center space-x-2">
									<Checkbox
										id={item.id}
										checked={userInput.extraLoads?.[item.id] || false}
										onCheckedChange={(checked) => {
											handleChange('extraLoads', {
												...userInput.extraLoads,
												[item.id]: checked
											});
										}}
									/>
									<Label htmlFor={item.id} className="font-normal cursor-pointer">
										{item.label}
									</Label>
								</div>
							))}
						</div>
					</div>
					<Button
						size="sm"
						variant="outline"
						onClick={() => markSectionComplete('loads')}
						className="w-full"
					>
						<CheckCircle2 className="h-4 w-4 mr-2" />
						Done with extra loads
					</Button>
				</div>
			)
		},
		{
			id: 'plans',
			icon: FileImage,
			title: 'Upload Floor Plans',
			description: 'Optional: architectural or structural plans',
			content: (
				<div className="space-y-4">
					<div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
						<FileImage className="h-10 w-10 text-gray-400 mx-auto mb-3" />
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
							Drag and drop floor plans here
						</p>
						<p className="text-xs text-gray-500">
							PDF, JPG, or PNG up to 10MB
						</p>
						<Button variant="outline" size="sm" className="mt-3">
							Browse Files
						</Button>
					</div>
					<p className="text-xs text-gray-500 text-center">
						Floor plans help us analyze structural layout more accurately
					</p>
					<Button
						size="sm"
						variant="outline"
						onClick={() => markSectionComplete('plans')}
						className="w-full"
					>
						<CheckCircle2 className="h-4 w-4 mr-2" />
						Skip plans for now
					</Button>
				</div>
			)
		}
	];

	return (
		<div className="max-w-xl mx-auto">
			{/* Header */}
			<div className="text-center mb-6">
				<div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
					<Ruler className="h-6 w-6 text-blue-600 dark:text-blue-400" />
				</div>
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
					Additional Details
				</h1>
				<p className="text-gray-600 dark:text-gray-400">
					Optional - more details = more accurate results
				</p>
			</div>

			<Card className="shadow-sm">
				<CardContent className="pt-6 space-y-3">
					{/* Skip all button */}
					<Button
						variant="outline"
						className="w-full mb-4 gap-2"
						onClick={onNext}
					>
						<SkipForward className="h-4 w-4" />
						Skip all and get results
					</Button>

					<div className="text-center text-xs text-gray-500 mb-4">
						Or expand sections below for more accuracy
					</div>

					{/* Accordion sections */}
					{sections.map((section) => (
						<Collapsible
							key={section.id}
							open={openSections[section.id]}
							onOpenChange={() => toggleSection(section.id)}
						>
							<CollapsibleTrigger asChild>
								<div
									className={`
										flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors
										${completedSections[section.id]
											? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
											: 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
										}
									`}
								>
									<div className="flex items-center gap-3">
										{completedSections[section.id] ? (
											<CheckCircle2 className="h-5 w-5 text-green-500" />
										) : (
											<section.icon className="h-5 w-5 text-gray-500" />
										)}
										<div>
											<p className="font-medium text-gray-900 dark:text-white text-sm">
												{section.title}
											</p>
											<p className="text-xs text-gray-500">
												{section.description}
											</p>
										</div>
									</div>
									<ChevronDown
										className={`h-5 w-5 text-gray-400 transition-transform ${
											openSections[section.id] ? 'rotate-180' : ''
										}`}
									/>
								</div>
							</CollapsibleTrigger>
							<CollapsibleContent className="pt-4 px-4 pb-2">
								{section.content}
							</CollapsibleContent>
						</Collapsible>
					))}

					{/* Completion status */}
					{completedCount > 0 && (
						<div className="text-center text-sm text-green-600 dark:text-green-400 pt-4">
							{completedCount} of {sections.length} sections completed
						</div>
					)}
				</CardContent>

				<CardFooter className="flex justify-between border-t pt-4">
					<Link href="/assessment/3">
						<Button variant="outline" className="gap-1">
							<ArrowLeft className="h-4 w-4" /> Back
						</Button>
					</Link>
					<Button onClick={onNext} className="gap-2">
						Get Results <ArrowRight className="h-4 w-4" />
					</Button>
				</CardFooter>
			</Card>

			{/* Progress indicator */}
			<p className="text-center text-xs text-gray-500 mt-4">
				Step 4 of 4 (optional)
			</p>
		</div>
	);
};

export default OptionalDetailsStep;
