'use client';
import React, { useState, useEffect } from 'react';
import { useUserInput } from '@/context/UserInputContext';
import EnhancedCertificate from '@/components/EnhancedCertificate';
import SafetyCalculator from '@/components/SafetyCalculator';

const ResultPage = () => {
	const { userInput } = useUserInput();
	const [safetyResult, setSafetyResult] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		try {
			const calculator = new SafetyCalculator();
			const result = calculator.calculateSafety(userInput);
			setSafetyResult(result);
		} catch (err) {
			console.error('Error calculating safety score:', err);
			setError('An error occurred while calculating the safety score.');
		}
	}, [userInput]);

	const handleDownload = () => {
		window.print();
	};

	if (error) {
		return <div className='text-red-500'>{error}</div>;
	}

	if (!safetyResult) {
		return <div>Calculating safety score...</div>;
	}

	const passingScore = 70;
	const isPassingScore = safetyResult.overallScore >= passingScore;

	return (
		<div className='min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 text-black'>
			{isPassingScore ? (
				<EnhancedCertificate
					score={safetyResult}
					userInput={userInput}
				/>
			) : (
				<div className='bg-white border border-red-500 p-8 max-w-2xl mx-auto my-8'>
					<h2 className='text-2xl font-bold text-red-600 mb-4'>
						Safety Concerns Identified
					</h2>
					<p className='mb-4'>
						Based on the provided information, we've identified some safety
						concerns with your building.
					</p>
					<ul className='list-disc list-inside mb-4'>
						<li>
							Overall Safety Score:{' '}
							{Number(safetyResult?.overallScore || 0).toFixed(2)}%
						</li>
						<li>
							Structural Integrity:{' '}
							{Number(safetyResult?.structuralIntegrity || 0).toFixed(2)}%
						</li>
						<li>Earthquake Impact: {safetyResult?.earthquakeImpact}</li>
						<li>Interpretation: {safetyResult?.interpretation}</li>
					</ul>
					<p className='mb-4'>
						We recommend consulting with a structural engineer for a more
						detailed assessment and to discuss potential improvements to enhance
						your building's safety.
					</p>
					<p className='font-bold'>
						For expert consultation, please call:{' '}
						<span className='text-blue-600'>054-512-351233</span>
					</p>
				</div>
			)}
			<div className='flex justify-center mt-8 no-print'>
				<button
					onClick={handleDownload}
					className='bg-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 transition-colors'>
					Download {isPassingScore ? 'Certificate' : 'Report'}
				</button>
			</div>
		</div>
	);
};

export default ResultPage;
