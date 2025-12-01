'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Calculator,
	Wrench,
	DollarSign,
	ChevronDown,
	ChevronUp,
	Building2,
	Shield,
	TrendingUp,
	Info,
	AlertTriangle,
	CheckCircle2,
	Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

/**
 * RetrofitCostCalculator - Estimates retrofit costs based on building deficiencies
 * Uses Turkey-specific cost data and building assessment results
 */

// Turkey retrofit cost data (in TRY - Turkish Lira) per square meter
const RETROFIT_COSTS_TRY = {
	// Structural strengthening costs per m2
	structural: {
		columnJacketing: { min: 2500, max: 4500, label: 'Column Jacketing' },
		beamStrengthening: { min: 2000, max: 3500, label: 'Beam Strengthening' },
		foundationRepair: { min: 3500, max: 6000, label: 'Foundation Repair' },
		wallAddition: { min: 1800, max: 3000, label: 'Shear Wall Addition' },
		bracingSystem: { min: 1500, max: 2800, label: 'Steel Bracing System' },
	},
	// Non-structural improvements per m2
	nonStructural: {
		facadeRetrofit: { min: 800, max: 1500, label: 'Facade Retrofit' },
		roofRepair: { min: 600, max: 1200, label: 'Roof Strengthening' },
		connectionUpgrade: { min: 500, max: 900, label: 'Connection Upgrades' },
	},
	// Fixed costs (not per m2)
	fixed: {
		engineeringAssessment: { min: 25000, max: 50000, label: 'Engineering Assessment' },
		permits: { min: 10000, max: 30000, label: 'Permits & Documentation' },
		projectManagement: { percent: 0.08, label: 'Project Management (8%)' },
	}
};

// Exchange rate approximation (for display purposes)
const TRY_TO_USD = 0.031;
const TRY_TO_EUR = 0.028;

export function RetrofitCostCalculator({
	safetyResult,
	userInput,
	className
}) {
	const t = useTranslations('Retrofit');
	const [expanded, setExpanded] = useState(false);
	const [currency, setCurrency] = useState('TRY');

	// Calculate building area
	const buildingArea = useMemo(() => {
		const length = parseFloat(userInput?.buildingLength) || 20;
		const width = parseFloat(userInput?.buildingWidth) || 15;
		const stories = parseInt(userInput?.numberOfStories) || 1;
		return length * width * stories;
	}, [userInput]);

	// Determine required retrofits based on safety score
	const requiredRetrofits = useMemo(() => {
		const score = parseFloat(safetyResult?.overallScore || 0);
		const structuralScore = parseFloat(safetyResult?.structuralIntegrity || 0);
		const buildingAge = userInput?.yearOfConstruction
			? new Date().getFullYear() - parseInt(userInput.yearOfConstruction)
			: 30;

		const retrofits = [];

		// Critical structural issues (score < 50)
		if (score < 50) {
			retrofits.push({ key: 'columnJacketing', priority: 'critical', category: 'structural' });
			retrofits.push({ key: 'foundationRepair', priority: 'critical', category: 'structural' });
			retrofits.push({ key: 'wallAddition', priority: 'critical', category: 'structural' });
		}
		// Major issues (score 50-70)
		else if (score < 70) {
			retrofits.push({ key: 'columnJacketing', priority: 'high', category: 'structural' });
			retrofits.push({ key: 'beamStrengthening', priority: 'high', category: 'structural' });
			if (buildingAge > 30) {
				retrofits.push({ key: 'wallAddition', priority: 'medium', category: 'structural' });
			}
		}
		// Moderate issues (score 70-80)
		else if (score < 80) {
			if (structuralScore < 75) {
				retrofits.push({ key: 'beamStrengthening', priority: 'medium', category: 'structural' });
			}
			retrofits.push({ key: 'bracingSystem', priority: 'medium', category: 'structural' });
		}

		// Age-based non-structural retrofits
		if (buildingAge > 25) {
			retrofits.push({ key: 'facadeRetrofit', priority: 'low', category: 'nonStructural' });
			retrofits.push({ key: 'connectionUpgrade', priority: 'medium', category: 'nonStructural' });
		}
		if (buildingAge > 35) {
			retrofits.push({ key: 'roofRepair', priority: 'medium', category: 'nonStructural' });
		}

		return retrofits;
	}, [safetyResult, userInput]);

	// Calculate costs
	const costBreakdown = useMemo(() => {
		let totalMin = 0;
		let totalMax = 0;
		const items = [];

		// Calculate per-area costs
		requiredRetrofits.forEach(({ key, priority, category }) => {
			const costData = RETROFIT_COSTS_TRY[category][key];
			if (costData) {
				const areaFactor = category === 'structural' ? buildingArea : buildingArea * 0.3;
				const min = costData.min * areaFactor;
				const max = costData.max * areaFactor;
				totalMin += min;
				totalMax += max;
				items.push({
					label: costData.label,
					min,
					max,
					priority,
					category
				});
			}
		});

		// Add fixed costs
		const { engineeringAssessment, permits, projectManagement } = RETROFIT_COSTS_TRY.fixed;
		totalMin += engineeringAssessment.min + permits.min;
		totalMax += engineeringAssessment.max + permits.max;

		items.push({
			label: engineeringAssessment.label,
			min: engineeringAssessment.min,
			max: engineeringAssessment.max,
			priority: 'required',
			category: 'fixed'
		});

		items.push({
			label: permits.label,
			min: permits.min,
			max: permits.max,
			priority: 'required',
			category: 'fixed'
		});

		// Add project management (percentage of total)
		const pmMin = totalMin * projectManagement.percent;
		const pmMax = totalMax * projectManagement.percent;
		totalMin += pmMin;
		totalMax += pmMax;

		items.push({
			label: projectManagement.label,
			min: pmMin,
			max: pmMax,
			priority: 'required',
			category: 'fixed'
		});

		return {
			items,
			totalMin,
			totalMax,
			averageTotal: (totalMin + totalMax) / 2
		};
	}, [requiredRetrofits, buildingArea]);

	// Currency conversion
	const convertCurrency = (amount) => {
		switch (currency) {
			case 'USD':
				return amount * TRY_TO_USD;
			case 'EUR':
				return amount * TRY_TO_EUR;
			default:
				return amount;
		}
	};

	// Format currency
	const formatCurrency = (amount) => {
		const converted = convertCurrency(amount);
		const symbols = { TRY: '₺', USD: '$', EUR: '€' };
		return `${symbols[currency]}${converted.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
	};

	// Get priority color
	const getPriorityColor = (priority) => {
		switch (priority) {
			case 'critical': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600', badge: 'bg-red-500' };
			case 'high': return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600', badge: 'bg-orange-500' };
			case 'medium': return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600', badge: 'bg-yellow-500' };
			case 'low': return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600', badge: 'bg-green-500' };
			default: return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600', badge: 'bg-gray-500' };
		}
	};

	// Calculate ROI
	const roi = useMemo(() => {
		const score = parseFloat(safetyResult?.overallScore || 0);
		const avgCost = costBreakdown.averageTotal;

		// Estimated property value increase (5-15% based on score improvement)
		const propertyValueIncrease = avgCost * (score < 70 ? 1.5 : 1.2);

		// Insurance savings (15-25% annual reduction)
		const annualInsuranceSavings = avgCost * 0.03;

		// Payback period in years
		const paybackYears = avgCost / (annualInsuranceSavings + propertyValueIncrease / 10);

		return {
			propertyValueIncrease,
			annualInsuranceSavings,
			paybackYears: Math.min(paybackYears, 20),
			tenYearSavings: annualInsuranceSavings * 10 + propertyValueIncrease
		};
	}, [costBreakdown, safetyResult]);

	// Don't show if score is already high
	const score = parseFloat(safetyResult?.overallScore || 0);
	if (score >= 85 && requiredRetrofits.length === 0) {
		return null;
	}

	return (
		<div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${className}`}>
			{/* Header */}
			<div
				className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
				onClick={() => setExpanded(!expanded)}
			>
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
						<Calculator className="w-5 h-5 text-blue-600" />
					</div>
					<div>
						<h3 className="font-semibold text-gray-900 dark:text-white">
							{t('title')}
						</h3>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{t('estimatedCost')}: {formatCurrency(costBreakdown.totalMin)} - {formatCurrency(costBreakdown.totalMax)}
						</p>
					</div>
				</div>
				<Button variant="ghost" size="sm">
					{expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
				</Button>
			</div>

			<AnimatePresence>
				{expanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="overflow-hidden"
					>
						{/* Currency Selector */}
						<div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
							<div className="flex items-center gap-2">
								<DollarSign className="w-4 h-4 text-gray-500" />
								<span className="text-sm text-gray-600 dark:text-gray-400">{t('currency')}:</span>
								<div className="flex gap-1">
									{['TRY', 'USD', 'EUR'].map((curr) => (
										<button
											key={curr}
											onClick={() => setCurrency(curr)}
											className={`px-3 py-1 text-sm rounded-lg transition-colors ${currency === curr
												? 'bg-blue-500 text-white'
												: 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
												}`}
										>
											{curr}
										</button>
									))}
								</div>
							</div>
						</div>

						{/* Building Info */}
						<div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
							<div className="flex items-center gap-2 mb-2">
								<Building2 className="w-4 h-4 text-gray-500" />
								<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
									{t('buildingDetails')}
								</span>
							</div>
							<div className="grid grid-cols-2 gap-3 text-sm">
								<div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2">
									<span className="text-gray-500">{t('totalArea')}:</span>
									<span className="ml-2 font-medium text-gray-900 dark:text-white">
										{buildingArea.toLocaleString()} m²
									</span>
								</div>
								<div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2">
									<span className="text-gray-500">{t('safetyScore')}:</span>
									<span className="ml-2 font-medium text-gray-900 dark:text-white">
										{Math.round(score)}%
									</span>
								</div>
							</div>
						</div>

						{/* Cost Breakdown */}
						<div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
							<div className="flex items-center gap-2 mb-3">
								<Wrench className="w-4 h-4 text-gray-500" />
								<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
									{t('costBreakdown')}
								</span>
							</div>
							<div className="space-y-2">
								{costBreakdown.items.map((item, index) => {
									const colors = getPriorityColor(item.priority);
									return (
										<motion.div
											key={index}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.05 }}
											className={`flex items-center justify-between p-3 rounded-lg ${colors.bg}`}
										>
											<div className="flex items-center gap-2">
												{item.priority === 'critical' && <AlertTriangle className={`w-4 h-4 ${colors.text}`} />}
												{item.priority === 'high' && <AlertTriangle className={`w-4 h-4 ${colors.text}`} />}
												{item.priority === 'medium' && <Info className={`w-4 h-4 ${colors.text}`} />}
												{item.priority === 'low' && <CheckCircle2 className={`w-4 h-4 ${colors.text}`} />}
												{item.priority === 'required' && <Shield className={`w-4 h-4 ${colors.text}`} />}
												<span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
											</div>
											<span className="text-sm font-medium text-gray-900 dark:text-white">
												{formatCurrency(item.min)} - {formatCurrency(item.max)}
											</span>
										</motion.div>
									);
								})}
							</div>

							{/* Total */}
							<div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
								<div className="flex items-center justify-between">
									<span className="font-semibold text-blue-800 dark:text-blue-300">{t('totalEstimate')}</span>
									<span className="text-xl font-bold text-blue-600">
										{formatCurrency(costBreakdown.totalMin)} - {formatCurrency(costBreakdown.totalMax)}
									</span>
								</div>
							</div>
						</div>

						{/* ROI Analysis */}
						<div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
							<div className="flex items-center gap-2 mb-3">
								<TrendingUp className="w-4 h-4 text-gray-500" />
								<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
									{t('roiAnalysis')}
								</span>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
									<div className="text-lg font-bold text-green-600">
										{formatCurrency(roi.propertyValueIncrease)}
									</div>
									<div className="text-xs text-green-700 dark:text-green-400">{t('propertyIncrease')}</div>
								</div>
								<div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
									<div className="text-lg font-bold text-emerald-600">
										{formatCurrency(roi.annualInsuranceSavings)}/yr
									</div>
									<div className="text-xs text-emerald-700 dark:text-emerald-400">{t('insuranceSavings')}</div>
								</div>
								<div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3 text-center">
									<div className="text-lg font-bold text-teal-600 flex items-center justify-center gap-1">
										<Clock className="w-4 h-4" />
										{roi.paybackYears.toFixed(1)} {t('years')}
									</div>
									<div className="text-xs text-teal-700 dark:text-teal-400">{t('paybackPeriod')}</div>
								</div>
								<div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-3 text-center">
									<div className="text-lg font-bold text-cyan-600">
										{formatCurrency(roi.tenYearSavings)}
									</div>
									<div className="text-xs text-cyan-700 dark:text-cyan-400">{t('tenYearBenefit')}</div>
								</div>
							</div>
						</div>

						{/* Disclaimer */}
						<div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-amber-50 dark:bg-amber-900/20">
							<div className="flex items-start gap-2">
								<Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
								<p className="text-xs text-amber-700 dark:text-amber-400">
									{t('disclaimer')}
								</p>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export default RetrofitCostCalculator;
