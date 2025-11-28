// components/steps/OptionalDetailsStep.jsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUserInput } from '@/context/UserInputContext';
import {
	ArrowRight, ChevronDown, Ruler, Building2, Weight, Sparkles, Check
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const OptionalDetailsStep = ({ onNext }) => {
	const { userInput, updateUserInput } = useUserInput();
	const [expandedSection, setExpandedSection] = useState(null);
	const [completedSections, setCompletedSections] = useState({});

	const handleChange = (field, value) => {
		updateUserInput({ [field]: value });
	};

	const toggleSection = (id) => {
		setExpandedSection(expandedSection === id ? null : id);
	};

	const markDone = (id) => {
		setCompletedSections(prev => ({ ...prev, [id]: true }));
		setExpandedSection(null);
	};

	const completedCount = Object.values(completedSections).filter(Boolean).length;

	const sections = [
		{
			id: 'dimensions',
			icon: Ruler,
			title: 'Dimensions',
			subtitle: 'Building size',
			content: (
				<div className="space-y-3">
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="text-xs text-gray-500 mb-1 block">Length (m)</label>
							<Input
								type="number"
								placeholder="20"
								value={userInput.buildingLength || ''}
								onChange={(e) => handleChange('buildingLength', e.target.value)}
							/>
						</div>
						<div>
							<label className="text-xs text-gray-500 mb-1 block">Width (m)</label>
							<Input
								type="number"
								placeholder="15"
								value={userInput.buildingWidth || ''}
								onChange={(e) => handleChange('buildingWidth', e.target.value)}
							/>
						</div>
					</div>
					<div>
						<label className="text-xs text-gray-500 mb-1 block">Floor height (m)</label>
						<Input
							type="number"
							step="0.1"
							placeholder="3.0"
							value={userInput.floorHeight || ''}
							onChange={(e) => handleChange('floorHeight', e.target.value)}
						/>
					</div>
					<button
						onClick={() => markDone('dimensions')}
						className="w-full py-2 text-sm text-violet-600 hover:text-violet-700 flex items-center justify-center gap-1"
					>
						<Check className="w-4 h-4" /> Done
					</button>
				</div>
			)
		},
		{
			id: 'neighbors',
			icon: Building2,
			title: 'Neighbors',
			subtitle: 'Adjacent buildings',
			content: (
				<div className="space-y-3">
					<Select
						value={userInput.adjacentBuildingRisk || ''}
						onValueChange={(v) => handleChange('adjacentBuildingRisk', v)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select situation" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">Standalone (no neighbors)</SelectItem>
							<SelectItem value="similar">Similar height neighbors</SelectItem>
							<SelectItem value="taller">Taller building nearby</SelectItem>
							<SelectItem value="shorter">Shorter building nearby</SelectItem>
						</SelectContent>
					</Select>
					<div>
						<label className="text-xs text-gray-500 mb-1 block">Gap distance (m)</label>
						<Input
							type="number"
							step="0.1"
							placeholder="2.5"
							value={userInput.separationDistance || ''}
							onChange={(e) => handleChange('separationDistance', e.target.value)}
						/>
					</div>
					<button
						onClick={() => markDone('neighbors')}
						className="w-full py-2 text-sm text-violet-600 hover:text-violet-700 flex items-center justify-center gap-1"
					>
						<Check className="w-4 h-4" /> Done
					</button>
				</div>
			)
		},
		{
			id: 'loads',
			icon: Weight,
			title: 'Extra loads',
			subtitle: 'Rooftop items',
			content: (
				<div className="space-y-3">
					{[
						{ id: 'waterTank', label: 'Water tank' },
						{ id: 'solarPanels', label: 'Solar panels' },
						{ id: 'heavyEquipment', label: 'Heavy equipment' },
						{ id: 'roofGarden', label: 'Roof garden' },
					].map((item) => (
						<div key={item.id} className="flex items-center gap-3">
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
							<label htmlFor={item.id} className="text-sm cursor-pointer">
								{item.label}
							</label>
						</div>
					))}
					<button
						onClick={() => markDone('loads')}
						className="w-full py-2 text-sm text-violet-600 hover:text-violet-700 flex items-center justify-center gap-1"
					>
						<Check className="w-4 h-4" /> Done
					</button>
				</div>
			)
		}
	];

	return (
		<div className="min-h-[60vh] flex flex-col">
			{/* Hero section */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex-1 flex flex-col items-center justify-center px-4 py-8"
			>
				{/* Icon */}
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ type: "spring", stiffness: 300 }}
					className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-xl shadow-amber-500/30"
				>
					<Sparkles className="w-10 h-10 text-white" />
				</motion.div>

				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
				>
					Ready for results!
				</motion.h1>

				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
					className="text-gray-500 dark:text-gray-400 mb-8 text-center"
				>
					Add details for more accuracy, or skip ahead
				</motion.p>

				{/* Get Results button */}
				<motion.div
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="w-full max-w-sm mb-8"
				>
					<Button
						onClick={onNext}
						size="lg"
						className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 shadow-xl shadow-amber-500/25"
					>
						Get Results
						<ArrowRight className="w-5 h-5" />
					</Button>
				</motion.div>

				{/* Optional sections */}
				<motion.div
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.4 }}
					className="w-full max-w-sm"
				>
					<p className="text-xs text-gray-400 text-center mb-3 uppercase tracking-wide">
						Optional: add more details
					</p>

					<div className="space-y-2">
						{sections.map((section) => (
							<div
								key={section.id}
								className={`rounded-xl overflow-hidden transition-all ${
									completedSections[section.id]
										? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
										: 'bg-gray-50 dark:bg-gray-800'
								}`}
							>
								<button
									onClick={() => toggleSection(section.id)}
									className="w-full px-4 py-3 flex items-center justify-between"
								>
									<div className="flex items-center gap-3">
										{completedSections[section.id] ? (
											<div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
												<Check className="w-4 h-4 text-white" />
											</div>
										) : (
											<div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
												<section.icon className="w-4 h-4 text-gray-500" />
											</div>
										)}
										<div className="text-left">
											<p className="font-medium text-sm text-gray-900 dark:text-white">
												{section.title}
											</p>
											<p className="text-xs text-gray-500">{section.subtitle}</p>
										</div>
									</div>
									<ChevronDown
										className={`w-4 h-4 text-gray-400 transition-transform ${
											expandedSection === section.id ? 'rotate-180' : ''
										}`}
									/>
								</button>

								<AnimatePresence>
									{expandedSection === section.id && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: 'auto', opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											className="px-4 pb-4 overflow-hidden"
										>
											{section.content}
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						))}
					</div>

					{completedCount > 0 && (
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="text-center text-sm text-green-600 mt-3"
						>
							{completedCount} of {sections.length} added
						</motion.p>
					)}
				</motion.div>
			</motion.div>

			{/* Footer */}
			<div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 dark:border-gray-800">
				<Link href="/assessment/3" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
					Back
				</Link>
				<span className="text-xs text-gray-400">Final step (optional)</span>
			</div>
		</div>
	);
};

export default OptionalDetailsStep;
