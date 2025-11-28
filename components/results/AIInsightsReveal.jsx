'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Brain, Building2, Layers, Calendar, Zap, Shield, AlertTriangle,
	CheckCircle2, Sparkles, Eye, Target
} from 'lucide-react';

/**
 * AIInsightsReveal - Dramatic reveal of AI analysis findings
 * Shows what the AI detected from photos with typewriter effects
 */
export function AIInsightsReveal({ aiData, userInput, delay = 0 }) {
	const [phase, setPhase] = useState('hidden'); // hidden, analyzing, revealing, complete
	const [visibleInsights, setVisibleInsights] = useState([]);

	// Extract AI findings
	const getInsights = () => {
		const insights = [];
		const ai = aiData || userInput?.aiAnalysisData || {};

		if (ai.buildingType || ai.buildingCharacteristics?.type) {
			insights.push({
				id: 'type',
				icon: Building2,
				label: 'Structure Type',
				value: ai.buildingType || ai.buildingCharacteristics?.type,
				confidence: ai.confidence || 85,
				color: 'violet'
			});
		}

		if (ai.numberOfStories || ai.buildingCharacteristics?.stories) {
			insights.push({
				id: 'stories',
				icon: Layers,
				label: 'Stories Detected',
				value: `${ai.numberOfStories || ai.buildingCharacteristics?.stories} floors`,
				confidence: ai.storiesConfidence || 90,
				color: 'blue'
			});
		}

		if (ai.constructionPeriod || ai.buildingCharacteristics?.constructionPeriod) {
			insights.push({
				id: 'era',
				icon: Calendar,
				label: 'Construction Era',
				value: ai.constructionPeriod || ai.buildingCharacteristics?.constructionPeriod,
				confidence: ai.eraConfidence || 75,
				color: 'amber'
			});
		}

		if (ai.structuralSystem || ai.buildingCharacteristics?.structuralSystem) {
			insights.push({
				id: 'structural',
				icon: Zap,
				label: 'Structural System',
				value: ai.structuralSystem || ai.buildingCharacteristics?.structuralSystem,
				confidence: ai.structuralConfidence || 80,
				color: 'emerald'
			});
		}

		if (ai.condition || ai.buildingCharacteristics?.condition) {
			insights.push({
				id: 'condition',
				icon: Shield,
				label: 'Condition',
				value: ai.condition || ai.buildingCharacteristics?.condition,
				confidence: ai.conditionConfidence || 70,
				color: 'cyan'
			});
		}

		// Add detected vulnerabilities if any
		if (ai.vulnerabilities?.length > 0 || ai.concerns?.length > 0) {
			const issues = ai.vulnerabilities || ai.concerns || [];
			insights.push({
				id: 'vulnerabilities',
				icon: AlertTriangle,
				label: 'Detected Issues',
				value: `${issues.length} potential concern${issues.length > 1 ? 's' : ''}`,
				confidence: 95,
				color: 'rose',
				isWarning: true
			});
		}

		return insights;
	};

	const insights = getInsights();

	// Animation sequence
	useEffect(() => {
		if (insights.length === 0) return;

		const timer1 = setTimeout(() => setPhase('analyzing'), delay);
		const timer2 = setTimeout(() => setPhase('revealing'), delay + 1500);

		return () => {
			clearTimeout(timer1);
			clearTimeout(timer2);
		};
	}, [delay, insights.length]);

	// Reveal insights one by one
	useEffect(() => {
		if (phase !== 'revealing') return;

		insights.forEach((_, idx) => {
			setTimeout(() => {
				setVisibleInsights(prev => [...prev, idx]);
				if (idx === insights.length - 1) {
					setTimeout(() => setPhase('complete'), 500);
				}
			}, idx * 400);
		});
	}, [phase, insights.length]);

	if (insights.length === 0) return null;

	const colorClasses = {
		violet: { bg: 'bg-violet-500', ring: 'ring-violet-500/30', text: 'text-violet-500' },
		blue: { bg: 'bg-blue-500', ring: 'ring-blue-500/30', text: 'text-blue-500' },
		amber: { bg: 'bg-amber-500', ring: 'ring-amber-500/30', text: 'text-amber-500' },
		emerald: { bg: 'bg-emerald-500', ring: 'ring-emerald-500/30', text: 'text-emerald-500' },
		cyan: { bg: 'bg-cyan-500', ring: 'ring-cyan-500/30', text: 'text-cyan-500' },
		rose: { bg: 'bg-rose-500', ring: 'ring-rose-500/30', text: 'text-rose-500' },
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: delay / 1000 }}
			className="w-full"
		>
			{/* Header */}
			<div className="flex items-center gap-3 mb-6">
				<motion.div
					animate={phase === 'analyzing' ? {
						scale: [1, 1.1, 1],
						rotate: [0, 5, -5, 0]
					} : {}}
					transition={{ duration: 0.5, repeat: phase === 'analyzing' ? Infinity : 0 }}
					className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
				>
					<Brain className="w-5 h-5 text-white" />
				</motion.div>
				<div>
					<h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
						AI Analysis
						{phase === 'complete' && (
							<motion.span
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								className="text-emerald-500"
							>
								<CheckCircle2 className="w-4 h-4" />
							</motion.span>
						)}
					</h3>
					<p className="text-xs text-gray-500">
						{phase === 'analyzing' && 'Processing visual data...'}
						{phase === 'revealing' && 'Extracting insights...'}
						{phase === 'complete' && `${insights.length} characteristics identified`}
						{phase === 'hidden' && 'Preparing analysis...'}
					</p>
				</div>
			</div>

			{/* Analyzing animation */}
			<AnimatePresence mode="wait">
				{phase === 'analyzing' && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="flex items-center justify-center py-8"
					>
						<div className="relative">
							{/* Scanning circles */}
							<motion.div
								animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
								transition={{ duration: 1.5, repeat: Infinity }}
								className="absolute inset-0 rounded-full border-2 border-violet-400"
								style={{ width: 80, height: 80, marginLeft: -40, marginTop: -40, left: '50%', top: '50%' }}
							/>
							<motion.div
								animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
								transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
								className="absolute inset-0 rounded-full border-2 border-purple-400"
								style={{ width: 80, height: 80, marginLeft: -40, marginTop: -40, left: '50%', top: '50%' }}
							/>
							<Eye className="w-8 h-8 text-violet-500" />
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Insights grid */}
			{(phase === 'revealing' || phase === 'complete') && (
				<div className="grid grid-cols-2 gap-3">
					{insights.map((insight, idx) => {
						const colors = colorClasses[insight.color];
						const isVisible = visibleInsights.includes(idx);

						return (
							<motion.div
								key={insight.id}
								initial={{ opacity: 0, scale: 0.8, y: 20 }}
								animate={isVisible ? { opacity: 1, scale: 1, y: 0 } : {}}
								transition={{ type: 'spring', stiffness: 300, damping: 25 }}
								className={`relative overflow-hidden rounded-2xl p-4 ${
									insight.isWarning
										? 'bg-rose-50 dark:bg-rose-900/20'
										: 'bg-gray-50 dark:bg-gray-800/50'
								}`}
							>
								{/* Icon */}
								<div className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center mb-3`}>
									<insight.icon className="w-4 h-4 text-white" />
								</div>

								{/* Label */}
								<p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
									{insight.label}
								</p>

								{/* Value with typewriter effect */}
								<motion.p
									initial={{ width: 0 }}
									animate={isVisible ? { width: '100%' } : {}}
									transition={{ duration: 0.5, delay: 0.2 }}
									className={`font-semibold text-sm truncate ${
										insight.isWarning ? 'text-rose-600' : 'text-gray-900 dark:text-white'
									}`}
								>
									{insight.value}
								</motion.p>

								{/* Confidence bar */}
								{isVisible && (
									<div className="mt-2">
										<div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
											<motion.div
												initial={{ width: 0 }}
												animate={{ width: `${insight.confidence}%` }}
												transition={{ duration: 0.8, delay: 0.3 }}
												className={`h-full ${colors.bg}`}
											/>
										</div>
										<p className="text-[10px] text-gray-400 mt-1">
											{insight.confidence}% confidence
										</p>
									</div>
								)}

								{/* Shine effect on reveal */}
								{isVisible && (
									<motion.div
										initial={{ x: '-100%', opacity: 0.5 }}
										animate={{ x: '200%', opacity: 0 }}
										transition={{ duration: 0.6 }}
										className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
									/>
								)}
							</motion.div>
						);
					})}
				</div>
			)}

			{/* Complete sparkle */}
			{phase === 'complete' && (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}
					className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500"
				>
					<Sparkles className="w-4 h-4 text-amber-500" />
					<span>Analysis complete</span>
				</motion.div>
			)}
		</motion.div>
	);
}

export default AIInsightsReveal;
