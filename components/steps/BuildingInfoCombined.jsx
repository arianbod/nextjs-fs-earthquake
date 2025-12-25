// components/steps/BuildingInfoCombined.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useUserInput } from '@/context/UserInputContext';
import {
	Building2, Layers, Calendar, ArrowRight, Check, Pencil,
	ChevronDown, ChevronUp
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

const mapAiBuildingType = (aiType) => {
	if (!aiType) return null;
	const lower = aiType.toLowerCase();
	if (lower.includes('timber') || lower.includes('wood')) return 'timber';
	if (lower.includes('steel') && !lower.includes('reinforc')) return 'steel';
	if (lower.includes('reinforced') || lower.includes('concrete') || lower.includes('rc')) return 'reinforced-concrete';
	if (lower.includes('masonry') || lower.includes('brick') || lower.includes('stone')) return 'masonry';
	if (lower.includes('mixed') || lower.includes('hybrid')) return 'mixed';
	return null;
};

const BuildingInfoCombined = ({ onNext }) => {
	const { userInput, updateUserInput } = useUserInput();
	const t = useTranslations('Steps.buildingInfo');
	const tSteps = useTranslations('Steps');
	const [mode, setMode] = useState('confirm'); // confirm, edit
	const [showAdvanced, setShowAdvanced] = useState(false);

	const hasAiData = userInput.aiAnalysisData || userInput.aiAnalysisComplete;

	const buildingTypes = [
		{ value: 'reinforced-concrete', label: t('reinforcedConcrete') },
		{ value: 'steel', label: t('steel') },
		{ value: 'masonry', label: t('masonry') },
		{ value: 'timber', label: t('timber') },
		{ value: 'mixed', label: t('mixed') },
	];

	// Get AI suggestions
	const getAiData = () => {
		const data = {};
		if (userInput.aiAnalysisData) {
			const ai = userInput.aiAnalysisData;
			const rawType = ai.buildingType || ai.buildingCharacteristics?.type;
			data.buildingType = mapAiBuildingType(rawType);
			data.numberOfStories = ai.numberOfStories || ai.buildingCharacteristics?.stories;
			data.constructionPeriod = ai.constructionPeriod || ai.buildingCharacteristics?.constructionPeriod;
			if (data.constructionPeriod) {
				const match = data.constructionPeriod.match(/\d{4}/);
				if (match) data.yearOfConstruction = match[0];
			}
		}
		if (userInput.numberOfStories && !data.numberOfStories) {
			data.numberOfStories = userInput.numberOfStories;
		}
		return data;
	};

	const aiData = getAiData();

	// Auto-apply AI data on mount
	useEffect(() => {
		if (hasAiData && !userInput.aiDataApplied) {
			const data = getAiData();
			if (Object.keys(data).length > 0) {
				updateUserInput({ ...data, aiDataApplied: true });
			}
		}
	}, []);

	const handleChange = (field, value) => {
		updateUserInput({ [field]: value });
	};

	const handleConfirm = () => {
		onNext();
	};

	const isValid = userInput.buildingType && userInput.numberOfStories;
	const displayStories = userInput.numberOfStories || aiData.numberOfStories || '?';
	const displayType = buildingTypes.find(t => t.value === (userInput.buildingType || aiData.buildingType))?.label || 'Unknown';
	const displayYear = userInput.yearOfConstruction || aiData.yearOfConstruction || '?';

	return (
		<div className="min-h-[60vh] flex flex-col">
			{/* AI CONFIRMATION MODE */}
			{hasAiData && mode === 'confirm' && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex-1 flex flex-col items-center justify-center px-4 py-8"
				>
					{/* Success icon */}
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ type: "spring", stiffness: 300 }}
						className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 shadow-xl shadow-violet-500/30"
					>
						<Check className="w-10 h-10 text-white" strokeWidth={3} />
					</motion.div>

					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
					>
						{t('aiDetected')}
					</motion.h1>

					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
						className="text-gray-500 dark:text-gray-400 mb-8"
					>
						{t('doesThisLookRight')}
					</motion.p>

					{/* Detection card */}
					<motion.div
						initial={{ y: 30, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.3 }}
						className="w-full max-w-sm bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-6 mb-8"
					>
						<div className="grid grid-cols-3 gap-4 text-center">
							<div>
								<Layers className="w-6 h-6 mx-auto mb-2 text-violet-500" />
								<div className="text-2xl font-bold text-gray-900 dark:text-white">
									{displayStories}
								</div>
								<div className="text-xs text-gray-500 uppercase">{t('stories')}</div>
							</div>
							<div>
								<Building2 className="w-6 h-6 mx-auto mb-2 text-violet-500" />
								<div className="text-sm font-bold text-gray-900 dark:text-white">
									{displayType.split(' ')[0]}
								</div>
								<div className="text-xs text-gray-500 uppercase">{t('type')}</div>
							</div>
							<div>
								<Calendar className="w-6 h-6 mx-auto mb-2 text-violet-500" />
								<div className="text-lg font-bold text-gray-900 dark:text-white">
									{displayYear}
								</div>
								<div className="text-xs text-gray-500 uppercase">{t('built')}</div>
							</div>
						</div>
					</motion.div>

					{/* Action buttons */}
					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.4 }}
						className="w-full max-w-sm space-y-3"
					>
						<Button
							onClick={handleConfirm}
							disabled={!isValid}
							size="lg"
							className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 shadow-xl shadow-violet-500/25"
						>
							<Check className="w-5 h-5" />
							{t('looksRight')}
						</Button>
						<button
							onClick={() => setMode('edit')}
							className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center gap-1.5 py-2"
						>
							<Pencil className="w-3.5 h-3.5" />
							{t('editDetails')}
						</button>
					</motion.div>
				</motion.div>
			)}

			{/* EDIT MODE (or no AI data) */}
			{(!hasAiData || mode === 'edit') && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex-1 flex flex-col p-4"
				>
					{/* Header */}
					<div className="text-center mb-6">
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25"
						>
							<Building2 className="w-8 h-8 text-white" />
						</motion.div>
						<h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
							{t('title')}
						</h1>
						<p className="text-sm text-gray-500">
							{hasAiData ? t('subtitleCorrect') : t('subtitle')}
						</p>
					</div>

					{/* Form */}
					<div className="space-y-4 mb-6">
						{/* Building Type */}
						<div>
							<label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
								{t('buildingType')}
							</label>
							<Select
								value={userInput.buildingType || ''}
								onValueChange={(v) => handleChange('buildingType', v)}
							>
								<SelectTrigger className="h-12">
									<SelectValue placeholder={t('selectType')} />
								</SelectTrigger>
								<SelectContent>
									{buildingTypes.map((type) => (
										<SelectItem key={type.value} value={type.value}>
											{type.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Stories */}
						<div>
							<label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
								{t('numberOfStories')}
							</label>
							<Input
								type="number"
								min="1"
								max="100"
								placeholder={t('storiesPlaceholder')}
								value={userInput.numberOfStories || ''}
								onChange={(e) => handleChange('numberOfStories', e.target.value)}
								className="h-12"
							/>
						</div>

						{/* Year */}
						<div>
							<label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
								{t('yearBuilt')}
							</label>
							<Input
								type="number"
								min="1900"
								max={new Date().getFullYear()}
								placeholder={t('yearPlaceholder')}
								value={userInput.yearOfConstruction || ''}
								onChange={(e) => handleChange('yearOfConstruction', e.target.value)}
								className="h-12"
							/>
						</div>

						{/* Advanced toggle */}
						<button
							onClick={() => setShowAdvanced(!showAdvanced)}
							className="flex items-center justify-between w-full py-2 text-sm text-gray-500 hover:text-gray-700"
						>
							<span>{t('moreOptions')}</span>
							{showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
						</button>

						<AnimatePresence>
							{showAdvanced && (
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: 'auto', opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									className="space-y-4 overflow-hidden"
								>
									{/* Modifications */}
									<div>
										<label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
											{t('structuralModifications')}
										</label>
										<div className="flex gap-3">
											{[
												{ value: 'no', label: t('no') },
												{ value: 'yes', label: t('yes') }
											].map((option) => (
												<button
													key={option.value}
													onClick={() => handleChange('hasModifications', option.value)}
													className={`flex-1 py-3 rounded-xl border-2 transition-all ${
														userInput.hasModifications === option.value
															? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
															: 'border-gray-200 dark:border-gray-700'
													}`}
												>
													<span>{option.label}</span>
												</button>
											))}
										</div>
									</div>

									{/* Basement */}
									<div>
										<label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
											{t('basementFloors')}
										</label>
										<Input
											type="number"
											min="0"
											max="10"
											placeholder="0"
											value={userInput.numberOfBasement || ''}
											onChange={(e) => handleChange('numberOfBasement', e.target.value)}
											className="h-12"
										/>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Actions */}
					<div className="mt-auto space-y-3">
						<Button
							onClick={onNext}
							disabled={!isValid}
							size="lg"
							className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 shadow-xl shadow-violet-500/25"
						>
							{t('continue')}
							<ArrowRight className="w-5 h-5" />
						</Button>
						{hasAiData && (
							<button
								onClick={() => setMode('confirm')}
								className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
							>
								{t('backToSummary')}
							</button>
						)}
					</div>
				</motion.div>
			)}

			{/* Footer nav */}
			<div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 dark:border-gray-800">
				<Link href="/assessment/2" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
					{t('back')}
				</Link>
				<span className="text-xs text-gray-400">{tSteps('stepOf', { current: 3, total: 4 })}</span>
			</div>
		</div>
	);
};

export default BuildingInfoCombined;
