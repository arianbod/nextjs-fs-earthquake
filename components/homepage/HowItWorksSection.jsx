// components/homepage/HowItWorksSection.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from '@/components/ui/card';
import {
	AlertTriangle,
	ShieldCheck,
	Building,
	BarChart4,
	Clock,
	CheckCircle2,
	ChevronRight,
	ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const HowItWorksSection = () => {
	const [buildingAge, setBuildingAge] = useState([30]);
	const [structuralCondition, setStructuralCondition] = useState([70]);
	const [seismicZone, setSeismicZone] = useState([50]);
	const [riskScore, setRiskScore] = useState(0);
	const [riskLevel, setRiskLevel] = useState('');
	const [riskColor, setRiskColor] = useState('');

	useEffect(() => {
		// Calculate risk score based on parameters
		const score = calculateRiskScore(
			buildingAge[0],
			structuralCondition[0],
			seismicZone[0]
		);
		setRiskScore(score);

		// Determine risk level and color
		if (score >= 80) {
			setRiskLevel('High Risk');
			setRiskColor('text-red-600 dark:text-red-400');
		} else if (score >= 50) {
			setRiskLevel('Moderate Risk');
			setRiskColor('text-amber-600 dark:text-amber-400');
		} else {
			setRiskLevel('Low Risk');
			setRiskColor('text-green-600 dark:text-green-400');
		}
	}, [buildingAge, structuralCondition, seismicZone]);

	const calculateRiskScore = (age, condition, zone) => {
		// Simple weighted calculation for demonstration
		const ageScore = (age / 100) * 35; // 35% weight
		const conditionScore = ((100 - condition) / 100) * 40; // 40% weight
		const zoneScore = (zone / 100) * 25; // 25% weight

		return Math.round(ageScore + conditionScore + zoneScore);
	};

	// Step components with more detailed information
	const steps = [
		{
			number: 1,
			title: 'Input Building Details',
			description:
				"Provide information about your building's location, structure type, and age.",
			icon: <Building className='w-6 h-6 text-blue-600 dark:text-blue-400' />,
		},
		{
			number: 2,
			title: 'AI-Powered Analysis',
			description:
				'Our algorithm analyzes your building data against seismic standards and risk factors.',
			icon: <BarChart4 className='w-6 h-6 text-blue-600 dark:text-blue-400' />,
		},
		{
			number: 3,
			title: 'Get Detailed Results',
			description:
				'Receive a comprehensive report with safety score and recommendations.',
			icon: (
				<CheckCircle2 className='w-6 h-6 text-blue-600 dark:text-blue-400' />
			),
		},
	];

	return (
		<section className='py-16 bg-white dark:bg-gray-900 overflow-hidden relative'>
			{/* Background decoration */}
			<div className='absolute -top-24 -right-24 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full opacity-20 blur-3xl'></div>
			<div className='absolute -bottom-24 -left-24 w-96 h-96 bg-green-200 dark:bg-green-900/20 rounded-full opacity-20 blur-3xl'></div>

			<div className='container mx-auto px-4'>
				<div className='text-center mb-12'>
					<h2 className='text-3xl font-bold mb-4 text-gray-900 dark:text-white'>
						How It Works
					</h2>
					<p className='text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
						Our simple 3-step process provides accurate earthquake risk
						assessment for your building
					</p>
				</div>

				{/* Step Process */}
				<div className='max-w-5xl mx-auto mb-16'>
					<div className='grid md:grid-cols-3 gap-8'>
						{steps.map((step) => (
							<div
								key={step.number}
								className='relative'>
								<div className='flex flex-col items-center'>
									{/* Step number with connecting line */}
									<div className='relative'>
										<div className='flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 z-10 border-4 border-white dark:border-gray-900'>
											{step.icon}
										</div>
										{step.number < steps.length && (
											<div className='absolute top-1/2 left-full h-0.5 w-full bg-blue-200 dark:bg-blue-800 -translate-y-1/2 md:block hidden'></div>
										)}
									</div>

									{/* Step content */}
									<div className='text-center mt-4'>
										<h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
											{step.title}
										</h3>
										<p className='text-gray-600 dark:text-gray-400'>
											{step.description}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className='grid lg:grid-cols-2 gap-12'>
					{/* Interactive Risk Simulator */}
					<div className=''>
						<Card className='border border-gray-200 dark:border-gray-700 shadow-lg'>
							<CardHeader>
								<CardTitle className='flex items-center gap-2 text-xl'>
									<BarChart4 className='w-5 h-5 text-blue-600 dark:text-blue-400' />
									Interactive Risk Simulator
								</CardTitle>
								<CardDescription>
									Adjust the parameters to see how different factors affect your
									building's risk assessment
								</CardDescription>
							</CardHeader>

							<CardContent className='space-y-6'>
								<div className='space-y-4'>
									<div>
										<div className='flex justify-between mb-2'>
											<label className='text-sm font-medium text-gray-600 dark:text-gray-300'>
												Building Age (Years)
											</label>
											<span className='text-sm font-semibold'>
												{buildingAge}
											</span>
										</div>
										<Slider
											value={buildingAge}
											onValueChange={setBuildingAge}
											max={100}
											step={1}
											className='w-full'
										/>
										<div className='flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1'>
											<span>New</span>
											<span>50 years</span>
											<span>100+ years</span>
										</div>
									</div>

									<div>
										<div className='flex justify-between mb-2'>
											<label className='text-sm font-medium text-gray-600 dark:text-gray-300'>
												Structural Condition Score
											</label>
											<span className='text-sm font-semibold'>
												{structuralCondition}
											</span>
										</div>
										<Slider
											value={structuralCondition}
											onValueChange={setStructuralCondition}
											max={100}
											step={1}
											className='w-full'
										/>
										<div className='flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1'>
											<span>Poor</span>
											<span>Average</span>
											<span>Excellent</span>
										</div>
									</div>

									<div>
										<div className='flex justify-between mb-2'>
											<label className='text-sm font-medium text-gray-600 dark:text-gray-300'>
												Seismic Zone Risk
											</label>
											<span className='text-sm font-semibold'>
												{seismicZone}
											</span>
										</div>
										<Slider
											value={seismicZone}
											onValueChange={setSeismicZone}
											max={100}
											step={1}
											className='w-full'
										/>
										<div className='flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1'>
											<span>Low</span>
											<span>Medium</span>
											<span>High</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Results Panel */}
					<div className=''>
						<Card
							className={`border border-gray-200 dark:border-gray-700 shadow-lg h-full ${
								riskScore >= 80
									? 'bg-red-50 dark:bg-red-900/10'
									: riskScore >= 50
									? 'bg-amber-50 dark:bg-amber-900/10'
									: 'bg-green-50 dark:bg-green-900/10'
							}`}>
							<CardHeader>
								<CardTitle className='flex items-center gap-2 text-xl'>
									{riskScore >= 80 ? (
										<AlertTriangle className='w-5 h-5 text-red-600 dark:text-red-400' />
									) : riskScore >= 50 ? (
										<AlertTriangle className='w-5 h-5 text-amber-600 dark:text-amber-400' />
									) : (
										<ShieldCheck className='w-5 h-5 text-green-600 dark:text-green-400' />
									)}
									Assessment Result
								</CardTitle>
								<CardDescription>
									Based on the parameters you've adjusted
								</CardDescription>
							</CardHeader>

							<CardContent className='space-y-6'>
								<div className='text-center space-y-2'>
									{/* Circular progress indicator */}
									<div className='relative inline-flex'>
										<svg
											className='w-40 h-40'
											viewBox='0 0 100 100'>
											<circle
												className='text-gray-200 dark:text-gray-700'
												strokeWidth='10'
												stroke='currentColor'
												fill='transparent'
												r='40'
												cx='50'
												cy='50'
											/>
											<circle
												className={`${
													riskScore >= 80
														? 'text-red-500 dark:text-red-400'
														: riskScore >= 50
														? 'text-amber-500 dark:text-amber-400'
														: 'text-green-500 dark:text-green-400'
												}`}
												strokeWidth='10'
												strokeDasharray={`${riskScore * 2.51} 251.2`}
												strokeLinecap='round'
												stroke='currentColor'
												fill='transparent'
												r='40'
												cx='50'
												cy='50'
												transform='rotate(-90 50 50)'
											/>
										</svg>
										<div className='absolute inset-0 flex items-center justify-center flex-col'>
											<span className={`text-3xl font-bold ${riskColor}`}>
												{riskScore}
											</span>
											<span className={`text-sm font-medium ${riskColor}`}>
												Risk Score
											</span>
										</div>
									</div>

									<div className={`text-2xl font-bold ${riskColor}`}>
										{riskLevel}
									</div>
								</div>

								<div className='space-y-3'>
									<h4 className='font-medium text-gray-900 dark:text-white'>
										Risk Factors:
									</h4>
									<ul className='space-y-2'>
										<li className='flex items-start gap-2'>
											<ChevronRight className='w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5' />
											<div>
												<span className='font-medium'>Building Age:</span>{' '}
												<span
													className={`${
														buildingAge[0] > 50
															? 'text-red-600 dark:text-red-400'
															: buildingAge[0] > 30
															? 'text-amber-600 dark:text-amber-400'
															: 'text-green-600 dark:text-green-400'
													}`}>
													{buildingAge[0] > 50
														? 'High'
														: buildingAge[0] > 30
														? 'Moderate'
														: 'Low'}{' '}
													Impact
												</span>
											</div>
										</li>

										<li className='flex items-start gap-2'>
											<ChevronRight className='w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5' />
											<div>
												<span className='font-medium'>
													Structural Condition:
												</span>{' '}
												<span
													className={`${
														structuralCondition[0] < 60
															? 'text-red-600 dark:text-red-400'
															: structuralCondition[0] < 80
															? 'text-amber-600 dark:text-amber-400'
															: 'text-green-600 dark:text-green-400'
													}`}>
													{structuralCondition[0] < 60
														? 'High'
														: structuralCondition[0] < 80
														? 'Moderate'
														: 'Low'}{' '}
													Impact
												</span>
											</div>
										</li>

										<li className='flex items-start gap-2'>
											<ChevronRight className='w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5' />
											<div>
												<span className='font-medium'>Seismic Risk:</span>{' '}
												<span
													className={`${
														seismicZone[0] > 70
															? 'text-red-600 dark:text-red-400'
															: seismicZone[0] > 40
															? 'text-amber-600 dark:text-amber-400'
															: 'text-green-600 dark:text-green-400'
													}`}>
													{seismicZone[0] > 70
														? 'High'
														: seismicZone[0] > 40
														? 'Moderate'
														: 'Low'}{' '}
													Impact
												</span>
											</div>
										</li>
									</ul>
								</div>
							</CardContent>

							<CardFooter className='pt-4 pb-6'>
								<Link
									href='/assessment/1'
									className='w-full'>
									<Button className='w-full gap-2'>
										Start Real Assessment <ArrowRight className='w-4 h-4' />
									</Button>
								</Link>
							</CardFooter>
						</Card>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HowItWorksSection;
