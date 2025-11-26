// components/steps/BuildingInfoCombined.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useUserInput } from '@/context/UserInputContext';
import {
	Building,
	Layers,
	Calendar,
	ArrowRight,
	ArrowLeft,
	CheckCircle2,
	Sparkles,
	ChevronDown,
	HelpCircle
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';
import Link from 'next/link';

/**
 * BuildingInfoCombined - Single form combining building type, stories, year, modifications
 *
 * Combines old steps 4 (BuildingInfo), 5 (StructuralSystem), and 6 (Irregularity)
 * into one clean, simple form with AI suggestions.
 */

// Building types as simple options (not cards)
const buildingTypes = [
	{ value: 'reinforced-concrete', label: 'Reinforced Concrete', description: 'Concrete with steel reinforcement' },
	{ value: 'steel', label: 'Steel Structure', description: 'Steel frame construction' },
	{ value: 'masonry', label: 'Masonry/Brick', description: 'Brick, stone, or block construction' },
	{ value: 'timber', label: 'Timber/Wood', description: 'Wooden frame construction' },
	{ value: 'mixed', label: 'Mixed Construction', description: 'Combination of materials' },
];

const BuildingInfoCombined = ({ onNext, onBack }) => {
	const { userInput, updateUserInput } = useUserInput();
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [aiSuggestionAccepted, setAiSuggestionAccepted] = useState(false);

	// Check if we have AI-detected data from photo analysis or location
	const hasAiData = userInput.aiAnalysisData || userInput.aiAnalysisComplete;
	const hasLocationData = userInput.streetViewData || userInput.structuralNotes;

	// Generate AI suggestion from ALL collected data
	const getAiSuggestion = () => {
		const suggestions = {};

		// From AI photo analysis (primary source)
		if (userInput.aiAnalysisData) {
			const data = userInput.aiAnalysisData;

			// Direct fields from AI
			if (data.buildingType) suggestions.buildingType = data.buildingType;
			if (data.numberOfStories) suggestions.numberOfStories = data.numberOfStories;
			if (data.structuralSystem) suggestions.structuralSystem = data.structuralSystem;
			if (data.constructionPeriod) suggestions.constructionPeriod = data.constructionPeriod;
			if (data.materialCondition) suggestions.materialCondition = data.materialCondition;

			// From buildingCharacteristics nested object
			if (data.buildingCharacteristics) {
				const chars = data.buildingCharacteristics;
				if (chars.stories && !suggestions.numberOfStories) suggestions.numberOfStories = chars.stories;
				if (chars.structuralSystem && !suggestions.buildingType) suggestions.buildingType = chars.structuralSystem;
				if (chars.constructionPeriod) {
					const match = chars.constructionPeriod.match(/\d{4}/);
					if (match) suggestions.yearOfConstruction = match[0];
				}
			}
		}

		// From street view AI analysis (secondary)
		if (userInput.streetViewData?.analysis?.estimatedCharacteristics) {
			const sv = userInput.streetViewData.analysis.estimatedCharacteristics;
			if (sv.estimatedType && !suggestions.buildingType) suggestions.buildingType = sv.estimatedType;
			if (sv.ageEstimationContext && !suggestions.constructionPeriod) suggestions.constructionPeriod = sv.ageEstimationContext;
		}

		// From location-based detection (fallback)
		if (userInput.numberOfStories && !suggestions.numberOfStories) {
			suggestions.numberOfStories = userInput.numberOfStories;
		}
		if (userInput.buildingType && !suggestions.buildingType) {
			suggestions.buildingType = userInput.buildingType;
		}

		return Object.keys(suggestions).length > 0 ? suggestions : null;
	};

	const aiSuggestion = getAiSuggestion();

	// Auto-apply AI suggestions on mount if available
	useEffect(() => {
		if (aiSuggestion && !aiSuggestionAccepted && !userInput.aiSuggestionApplied) {
			// Auto-fill form with AI data
			updateUserInput({
				...aiSuggestion,
				aiSuggestionApplied: true
			});
		}
	}, []);

	// Accept AI suggestion (explicit confirmation)
	const acceptAiSuggestion = () => {
		if (aiSuggestion) {
			updateUserInput({
				...aiSuggestion,
				aiSuggestionAccepted: true
			});
			setAiSuggestionAccepted(true);
		}
	};

	// Handle form field changes
	const handleChange = (field, value) => {
		updateUserInput({ [field]: value });
	};

	// Validate form
	const isValid = userInput.buildingType && userInput.numberOfStories;

	// Check if AI has populated the data
	const hasAiPopulatedData = hasAiData && (userInput.buildingType || userInput.numberOfStories);

	return (
		<div className="max-w-xl mx-auto">
			{/* Header */}
			<div className="text-center mb-6">
				<div className="inline-flex items-center justify-center p-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
					{hasAiPopulatedData ? (
						<CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
					) : (
						<Building className="h-6 w-6 text-green-600 dark:text-green-400" />
					)}
				</div>
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
					{hasAiPopulatedData ? 'Confirm Building Details' : 'Tell us about your building'}
				</h1>
				<p className="text-gray-600 dark:text-gray-400">
					{hasAiPopulatedData
						? 'We detected these details from your photos - please verify'
						: 'A few quick questions for an accurate assessment'
					}
				</p>
			</div>

			<Card className="shadow-sm">
				<CardContent className="pt-6 space-y-6">
					{/* AI Suggestion Box (if available) */}
					{aiSuggestion && !aiSuggestionAccepted && (
						<div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
							<div className="flex items-start gap-3">
								<Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
								<div className="flex-1">
									<h3 className="font-medium text-purple-900 dark:text-purple-200 mb-1">
										AI Detected Your Building
									</h3>
									<p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
										Based on location and photos, we detected:
										{aiSuggestion.numberOfStories && ` ${aiSuggestion.numberOfStories} stories`}
										{aiSuggestion.buildingType && `, ${aiSuggestion.buildingType}`}
										{aiSuggestion.yearOfConstruction && `, built ~${aiSuggestion.yearOfConstruction}`}
									</p>
									<div className="flex gap-2">
										<Button
											size="sm"
											onClick={acceptAiSuggestion}
											className="bg-purple-600 hover:bg-purple-700"
										>
											<CheckCircle2 className="h-4 w-4 mr-1" />
											Accept
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => setAiSuggestionAccepted(true)}
										>
											Edit Manually
										</Button>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Building Type */}
					<div className="space-y-2">
						<Label htmlFor="buildingType" className="flex items-center gap-2">
							Building Type
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger>
										<HelpCircle className="h-4 w-4 text-gray-400" />
									</TooltipTrigger>
									<TooltipContent>
										<p className="max-w-xs">Select the main structural material of your building</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</Label>
						<Select
							value={userInput.buildingType || ''}
							onValueChange={(value) => handleChange('buildingType', value)}
						>
							<SelectTrigger id="buildingType">
								<SelectValue placeholder="Select building type" />
							</SelectTrigger>
							<SelectContent>
								{buildingTypes.map((type) => (
									<SelectItem key={type.value} value={type.value}>
										<div className="flex flex-col">
											<span>{type.label}</span>
											<span className="text-xs text-gray-500">{type.description}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Number of Stories */}
					<div className="space-y-2">
						<Label htmlFor="numberOfStories" className="flex items-center gap-2">
							<Layers className="h-4 w-4 text-gray-500" />
							Number of Stories
						</Label>
						<Input
							id="numberOfStories"
							type="number"
							min="1"
							max="100"
							placeholder="e.g., 4"
							value={userInput.numberOfStories || ''}
							onChange={(e) => handleChange('numberOfStories', e.target.value)}
							className="w-full"
						/>
					</div>

					{/* Year Built */}
					<div className="space-y-2">
						<Label htmlFor="yearOfConstruction" className="flex items-center gap-2">
							<Calendar className="h-4 w-4 text-gray-500" />
							Year Built (approximate)
						</Label>
						<Input
							id="yearOfConstruction"
							type="number"
							min="1900"
							max={new Date().getFullYear()}
							placeholder="e.g., 2005"
							value={userInput.yearOfConstruction || ''}
							onChange={(e) => handleChange('yearOfConstruction', e.target.value)}
							className="w-full"
						/>
					</div>

					{/* Modifications Question */}
					<div className="space-y-2">
						<Label className="flex items-center gap-2">
							Any structural modifications?
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger>
										<HelpCircle className="h-4 w-4 text-gray-400" />
									</TooltipTrigger>
									<TooltipContent>
										<p className="max-w-xs">Additions, floor removals, or major renovations</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</Label>
						<RadioGroup
							value={userInput.hasModifications || 'no'}
							onValueChange={(value) => handleChange('hasModifications', value)}
							className="flex gap-4"
						>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="no" id="mod-no" />
								<Label htmlFor="mod-no" className="font-normal cursor-pointer">No</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="yes" id="mod-yes" />
								<Label htmlFor="mod-yes" className="font-normal cursor-pointer">Yes</Label>
							</div>
						</RadioGroup>
					</div>

					{/* Advanced Options (collapsed by default) */}
					<Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
						<CollapsibleTrigger asChild>
							<Button variant="ghost" className="w-full justify-between px-0 hover:bg-transparent">
								<span className="text-sm text-gray-500">
									Advanced options (optional)
								</span>
								<ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
							</Button>
						</CollapsibleTrigger>
						<CollapsibleContent className="space-y-4 pt-4">
							{/* Irregularity */}
							<div className="space-y-2">
								<Label>Plan Shape Irregularity</Label>
								<Select
									value={userInput.planIrregularity || ''}
									onValueChange={(value) => handleChange('planIrregularity', value)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select if applicable" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="regular">Regular (rectangular)</SelectItem>
										<SelectItem value="l-shaped">L-Shaped</SelectItem>
										<SelectItem value="u-shaped">U-Shaped</SelectItem>
										<SelectItem value="irregular">Irregular/Complex</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Basement */}
							<div className="space-y-2">
								<Label htmlFor="numberOfBasement">Basement Floors</Label>
								<Input
									id="numberOfBasement"
									type="number"
									min="0"
									max="10"
									placeholder="e.g., 1"
									value={userInput.numberOfBasement || ''}
									onChange={(e) => handleChange('numberOfBasement', e.target.value)}
								/>
							</div>
						</CollapsibleContent>
					</Collapsible>
				</CardContent>

				<CardFooter className="flex justify-between border-t pt-4">
					<Link href="/assessment/2">
						<Button variant="outline" className="gap-1">
							<ArrowLeft className="h-4 w-4" /> Back to Photos
						</Button>
					</Link>
					<Button
						onClick={onNext}
						disabled={!isValid}
						className="gap-2"
					>
						{hasAiPopulatedData ? 'Confirm & Continue' : 'Continue'} <ArrowRight className="h-4 w-4" />
					</Button>
				</CardFooter>
			</Card>

			{/* Progress indicator */}
			<p className="text-center text-xs text-gray-500 mt-4">
				Step 3 of 4
			</p>
		</div>
	);
};

export default BuildingInfoCombined;
