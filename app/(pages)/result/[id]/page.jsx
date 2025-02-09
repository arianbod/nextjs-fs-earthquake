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
			console.log('Current userInput:', userInput); // Debug log
			const calculator = new SafetyCalculator();
			const result = calculator.calculateSafety(userInput);
			console.log('Calculated result:', result); // Debug log
			setSafetyResult(result);
		} catch (err) {
			console.error('Error calculating safety score:', err);
			setError('An error occurred while calculating the safety score.');
		}
	}, [userInput]);

	// Add debug output
	if (!userInput || Object.keys(userInput).length === 0) {
		return (
			<div>No input data available. Please complete the assessment form.</div>
		);
	}

	if (error) {
		return <div className='text-red-500'>{error}</div>;
	}

	if (!safetyResult) {
		return <div>Calculating safety score...</div>;
	}

	const passingScore = 70;
	const isPassingScore = parseFloat(safetyResult.overallScore) >= passingScore;

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
						Based on the provided information, we&apos;ve identified some safety
						concerns with your building.
					</p>
					<ul className='list-disc list-inside mb-4'>
						<li>Overall Safety Score: {safetyResult?.overallScore}%</li>
						<li>Structural Integrity: {safetyResult?.structuralIntegrity}%</li>
						<li>Earthquake Impact: {safetyResult?.earthquakeImpact}</li>
						<li>Interpretation: {safetyResult?.interpretation}</li>
					</ul>
					<p className='mb-4'>
						We recommend consulting with a structural engineer for a more
						detailed assessment and to discuss potential improvements to enhance
						your building&apos;s safety.
					</p>
					<p className='font-bold'>
						For expert consultation, please call:{' '}
						<span className='text-blue-600'>054-512-351233</span>
					</p>
				</div>
			)}
			<div className='flex justify-center mt-8 no-print'>
				<button
					onClick={() => window.print()}
					className='bg-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 transition-colors'>
					Download {isPassingScore ? 'Certificate' : 'Report'}
				</button>
			</div>
		</div>
	);
};

export default ResultPage;
