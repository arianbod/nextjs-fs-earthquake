'use client';
import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from '@/components/ui/card';
import { AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

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
			setRiskColor('text-red-500');
		} else if (score >= 50) {
			setRiskLevel('Moderate Risk');
			setRiskColor('text-yellow-500');
		} else {
			setRiskLevel('Low Risk');
			setRiskColor('text-green-500');
		}
	}, [buildingAge, structuralCondition, seismicZone]);

	const calculateRiskScore = (age, condition, zone) => {
		// Simple weighted calculation for demonstration
		const ageScore = (age / 100) * 35; // 35% weight
		const conditionScore = ((100 - condition) / 100) * 40; // 40% weight
		const zoneScore = (zone / 100) * 25; // 25% weight

		return Math.round(ageScore + conditionScore + zoneScore);
	};

	return (
		<section className='space-y-8 py-12'>
			<div className='text-center'>
				<h2 className='text-3xl font-bold mb-4'>How It Works</h2>
				<p className='text-xl mb-8'>
					Adjust the parameters below to see how different factors affect
					building risk assessment
				</p>
			</div>

			<div className='grid md:grid-cols-2 gap-8'>
				<div className='space-y-8'>
					<Card className='p-6 h-full'>
						<CardHeader className='pb-4'>
							<CardTitle className='text-lg flex items-center gap-2'>
								<HelpCircle className='w-5 h-5' />
								Building Parameters
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-6'>
							<div className='space-y-4'>
								<label className='block text-sm font-medium'>
									Building Age (Years): {buildingAge}
								</label>
								<Slider
									value={buildingAge}
									onValueChange={setBuildingAge}
									max={100}
									step={1}
									className='w-full'
								/>

								<label className='block text-sm font-medium mt-6'>
									Structural Condition Score: {structuralCondition}
								</label>
								<Slider
									value={structuralCondition}
									onValueChange={setStructuralCondition}
									max={100}
									step={1}
									className='w-full'
								/>

								<label className='block text-sm font-medium mt-6'>
									Seismic Zone Risk: {seismicZone}
								</label>
								<Slider
									value={seismicZone}
									onValueChange={setSeismicZone}
									max={100}
									step={1}
									className='w-full'
								/>
							</div>
						</CardContent>
					</Card>
				</div>

				<div>
					<Card className='p-6 h-full'>
						<CardHeader className='pb-4'>
							<CardTitle className='text-lg flex items-center gap-2'>
								{riskScore >= 80 ? (
									<AlertTriangle className='w-5 h-5 text-red-500' />
								) : (
									<ShieldCheck className='w-5 h-5 text-green-500' />
								)}
								Assessment Result
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-6'>
							<div className='text-center space-y-4'>
								<div className='text-4xl font-bold'>{riskScore}/100</div>
								<div className={`text-2xl font-semibold ${riskColor}`}>
									{riskLevel}
								</div>
								<div className='mt-8 text-gray-600 dark:text-gray-300'>
									<h4 className='font-semibold mb-2'>Risk Factors:</h4>
									<ul className='text-left space-y-2'>
										<li>
											• Building Age:{' '}
											{buildingAge > 50
												? 'High'
												: buildingAge > 30
												? 'Moderate'
												: 'Low'}{' '}
											Impact
										</li>
										<li>
											• Structural Condition:{' '}
											{structuralCondition < 60
												? 'High'
												: structuralCondition < 80
												? 'Moderate'
												: 'Low'}{' '}
											Impact
										</li>
										<li>
											• Seismic Risk:{' '}
											{seismicZone > 70
												? 'High'
												: seismicZone > 40
												? 'Moderate'
												: 'Low'}{' '}
											Impact
										</li>
									</ul>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
};

export default HowItWorksSection;
