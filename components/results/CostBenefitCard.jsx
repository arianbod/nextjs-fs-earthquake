import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Shield, AlertTriangle, Calculator, Info } from 'lucide-react';

const CostBenefitCard = ({ safetyResult, userInput }) => {
	const overallScore = parseFloat(safetyResult?.overallScore || 0);
	const isPassingScore = overallScore >= 70;
	const numberOfStories = parseInt(userInput?.numberOfStories || 3);
	const yearOfConstruction = parseInt(userInput?.yearOfConstruction || 2000);
	
	// Calculate estimated building area (rough estimate)
	const estimatedArea = numberOfStories * 150; // 150 sqm per floor average
	
	// Cost calculations in Turkish Lira (TL)
	const calculateCosts = () => {
		if (isPassingScore) {
			// Building passes - show benefits
			return {
				type: 'benefits',
				insuranceDiscount: {
					amount: estimatedArea * 15, // 15 TL per sqm discount annually
					description: 'Annual earthquake insurance discount'
				},
				propertyValueIncrease: {
					amount: estimatedArea * 500, // 500 TL per sqm value increase
					description: 'Estimated property value increase'
				},
				certificationBenefits: {
					amount: 5000, // Fixed certification benefits
					description: 'Regulatory compliance benefits'
				},
				totalBenefits: 0
			};
		} else {
			// Building needs improvement
			const scoreDifference = 70 - overallScore;
			const retrofitIntensity = scoreDifference > 20 ? 'major' : scoreDifference > 10 ? 'moderate' : 'minor';
			
			let retrofitCostPerSqm;
			switch (retrofitIntensity) {
				case 'major':
					retrofitCostPerSqm = 800; // Major structural work
					break;
				case 'moderate':
					retrofitCostPerSqm = 400; // Moderate improvements
					break;
				default:
					retrofitCostPerSqm = 200; // Minor improvements
			}
			
			const retrofitCost = estimatedArea * retrofitCostPerSqm;
			const annualInsuranceSavings = estimatedArea * 25; // Higher savings after retrofit
			const paybackPeriod = Math.ceil(retrofitCost / annualInsuranceSavings);
			
			return {
				type: 'improvements',
				retrofitCost: {
					amount: retrofitCost,
					description: `${retrofitIntensity.charAt(0).toUpperCase() + retrofitIntensity.slice(1)} retrofit work`
				},
				annualSavings: {
					amount: annualInsuranceSavings,
					description: 'Annual insurance savings after retrofit'
				},
				propertyValueIncrease: {
					amount: estimatedArea * 300,
					description: 'Property value increase after retrofit'
				},
				paybackPeriod: {
					years: paybackPeriod,
					description: 'Time to recover investment through savings'
				}
			};
		}
	};

	const costData = calculateCosts();
	
	// Calculate totals
	if (costData.type === 'benefits') {
		costData.totalBenefits = 
			costData.insuranceDiscount.amount + 
			costData.propertyValueIncrease.amount + 
			costData.certificationBenefits.amount;
	}

	// Format currency
	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('tr-TR', {
			style: 'currency',
			currency: 'TRY',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Calculator className="w-5 h-5 text-green-600" />
					{isPassingScore ? 'Economic Benefits Analysis' : 'Cost-Benefit Analysis'}
				</CardTitle>
				<CardDescription>
					{isPassingScore 
						? 'Financial advantages of your building\'s safety compliance'
						: 'Investment analysis for improving earthquake safety'
					}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{isPassingScore ? (
						// Benefits for passing buildings
						<>
							{/* Benefits Overview */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
									<Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
									<div className="text-2xl font-bold text-green-600">
										{formatCurrency(costData.insuranceDiscount.amount)}
									</div>
									<div className="text-sm text-green-700 dark:text-green-300">
										Annual Insurance Savings
									</div>
								</div>
								
								<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
									<TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
									<div className="text-2xl font-bold text-blue-600">
										{formatCurrency(costData.propertyValueIncrease.amount)}
									</div>
									<div className="text-sm text-blue-700 dark:text-blue-300">
										Property Value Increase
									</div>
								</div>
								
								<div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-center">
									<DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
									<div className="text-2xl font-bold text-purple-600">
										{formatCurrency(costData.totalBenefits)}
									</div>
									<div className="text-sm text-purple-700 dark:text-purple-300">
										Total Economic Benefits
									</div>
								</div>
							</div>

							{/* Detailed Benefits */}
							<div className="space-y-4">
								<h4 className="font-semibold text-gray-800 dark:text-gray-200">
									Certification Benefits
								</h4>
								<div className="space-y-3">
									<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
										<span className="text-gray-700 dark:text-gray-300">Insurance Eligibility</span>
										<span className="text-green-600 font-semibold">✓ Qualified</span>
									</div>
									<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
										<span className="text-gray-700 dark:text-gray-300">Earthquake Insurance Discount</span>
										<span className="text-green-600 font-semibold">15-25%</span>
									</div>
									<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
										<span className="text-gray-700 dark:text-gray-300">Regulatory Compliance</span>
										<span className="text-green-600 font-semibold">✓ Compliant</span>
									</div>
									<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
										<span className="text-gray-700 dark:text-gray-300">Resale Value Premium</span>
										<span className="text-green-600 font-semibold">5-10%</span>
									</div>
								</div>
							</div>
						</>
					) : (
						// Cost-benefit for buildings needing improvement
						<>
							{/* Cost Overview */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
									<AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
									<div className="text-2xl font-bold text-red-600">
										{formatCurrency(costData.retrofitCost.amount)}
									</div>
									<div className="text-sm text-red-700 dark:text-red-300">
										Estimated Retrofit Cost
									</div>
								</div>
								
								<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
									<TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
									<div className="text-2xl font-bold text-green-600">
										{costData.paybackPeriod.years} years
									</div>
									<div className="text-sm text-green-700 dark:text-green-300">
										Investment Payback Period
									</div>
								</div>
							</div>

							{/* ROI Analysis */}
							<div className="space-y-4">
								<h4 className="font-semibold text-gray-800 dark:text-gray-200">
									Return on Investment Analysis
								</h4>
								<div className="space-y-3">
									<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
										<span className="text-gray-700 dark:text-gray-300">Annual Insurance Savings</span>
										<span className="text-green-600 font-semibold">
											{formatCurrency(costData.annualSavings.amount)}
										</span>
									</div>
									<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
										<span className="text-gray-700 dark:text-gray-300">Property Value Increase</span>
										<span className="text-blue-600 font-semibold">
											{formatCurrency(costData.propertyValueIncrease.amount)}
										</span>
									</div>
									<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
										<span className="text-gray-700 dark:text-gray-300">10-Year Savings</span>
										<span className="text-green-600 font-semibold">
											{formatCurrency(costData.annualSavings.amount * 10)}
										</span>
									</div>
									<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
										<span className="text-gray-700 dark:text-gray-300">Net 10-Year Benefit</span>
										<span className="text-purple-600 font-semibold">
											{formatCurrency(
												(costData.annualSavings.amount * 10) + 
												costData.propertyValueIncrease.amount - 
												costData.retrofitCost.amount
											)}
										</span>
									</div>
								</div>
							</div>

							{/* Financing Options */}
							<div className="space-y-4">
								<h4 className="font-semibold text-gray-800 dark:text-gray-200">
									Potential Financing Options
								</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									<div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
										<h5 className="font-medium text-blue-800 dark:text-blue-300">Government Grants</h5>
										<p className="text-sm text-blue-600 dark:text-blue-400">
											Up to 50% coverage for seismic retrofitting
										</p>
									</div>
									<div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
										<h5 className="font-medium text-green-800 dark:text-green-300">Low-Interest Loans</h5>
										<p className="text-sm text-green-600 dark:text-green-400">
											Special rates for earthquake safety improvements
										</p>
									</div>
								</div>
							</div>
						</>
					)}

					{/* Disclaimer */}
					<div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
						<div className="flex items-start gap-2">
							<Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
							<div>
								<h5 className="font-medium text-amber-800 dark:text-amber-300 mb-1">
									Important Disclaimer
								</h5>
								<p className="text-sm text-amber-700 dark:text-amber-400">
									These are estimated costs and benefits based on industry averages and may vary significantly 
									based on actual building conditions, local contractors, material costs, and insurance policies. 
									Consult with professionals for accurate quotes and assessments.
								</p>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default CostBenefitCard;