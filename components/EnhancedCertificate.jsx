// components/EnhancedCertificate.jsx
import React from 'react';
import Data from '@/utils/Data.json';
import { Shield, CheckCircle2, Calendar, Building, MapPin } from 'lucide-react';

const EnhancedCertificate = ({ score, userInput }) => {
	const getValue = (key) => {
		const lowerKey = key.toLowerCase();
		return userInput[key] || userInput[lowerKey] || 'N/A';
	};

	// Current date formatting
	const currentDate = new Date();
	const formattedDate = new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}).format(currentDate);

	// Certificate number generation
	const certificateNumber = `QW-${currentDate.getFullYear()}-${Math.floor(
		Math.random() * 100000
	)
		.toString()
		.padStart(5, '0')}`;

	return (
		<div className='bg-white print:bg-white border-8 border-double border-gray-300 p-8 max-w-2xl mx-auto rounded-lg shadow-lg certificate-container'>
			{/* Header */}
			<div className='text-center border-b-2 border-gray-200 pb-6 mb-6'>
				<div className='flex items-center justify-center mb-4'>
					<Shield className='w-12 h-12 text-blue-600 mr-4' />
					<h1 className='text-3xl font-bold text-gray-900'>QuakeWise</h1>
				</div>
				<h2 className='text-2xl text-blue-600 font-semibold'>
					Certificate of Seismic Safety Assessment
				</h2>
			</div>

			{/* Main Content */}
			<div className='space-y-6 mb-8'>
				<p className='text-center text-lg text-gray-700 mb-6'>
					This is to certify that the building located at{' '}
					<span className='font-semibold'>
						{userInput.location
							? `Latitude: ${userInput.location.latitude.toFixed(
									6
							  )}, Longitude: ${userInput.location.longitude.toFixed(6)}`
							: 'the specified location'}
					</span>
					, has been thoroughly analyzed by the QuakeWise assessment system.
				</p>

				{/* Assessment Results */}
				<div className='bg-gray-50 p-6 rounded-lg border border-gray-200'>
					<h3 className='text-xl font-bold text-gray-800 mb-4 flex items-center'>
						<CheckCircle2 className='w-6 h-6 text-green-600 mr-2' />
						Assessment Results
					</h3>
					<div className='grid md:grid-cols-2 gap-6'>
						<div>
							<div className='space-y-3'>
								<div className='flex justify-between items-center border-b pb-2'>
									<span className='text-gray-600'>Overall Safety Score:</span>
									<span className='font-bold text-green-600'>
										{Number(score.overallScore || 0).toFixed(2)}%
									</span>
								</div>
								<div className='flex justify-between items-center border-b pb-2'>
									<span className='text-gray-600'>Structural Integrity:</span>
									<span className='font-semibold'>
										{Number(score.structuralIntegrity || 0).toFixed(2)}%
									</span>
								</div>
								<div className='flex justify-between items-center border-b pb-2'>
									<span className='text-gray-600'>Earthquake Impact:</span>
									<span className='font-semibold'>
										{score.earthquakeImpact}
									</span>
								</div>
								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>Building Type:</span>
									<span className='font-semibold'>{score.buildingType}</span>
								</div>
							</div>
						</div>
						<div>
							<div className='space-y-3'>
								<div className='flex justify-between items-center border-b pb-2'>
									<span className='text-gray-600'>Type of Earthquake:</span>
									<span className='font-semibold'>
										{getValue('typeOfEarthquake')}
									</span>
								</div>
								<div className='flex justify-between items-center border-b pb-2'>
									<span className='text-gray-600'>Soil Type:</span>
									<span className='font-semibold'>
										{getValue('typeOfSoil')}
									</span>
								</div>
								<div className='flex justify-between items-center border-b pb-2'>
									<span className='text-gray-600'>Design Regulation:</span>
									<span className='font-semibold'>
										{getValue('designRegulation')}
									</span>
								</div>
								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>Number of Stories:</span>
									<span className='font-semibold'>
										{getValue('numberOfStories')}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Interpretation */}
				<div className='bg-blue-50 p-6 rounded-lg border border-blue-200'>
					<h3 className='text-xl font-bold text-blue-800 mb-2'>
						Professional Interpretation
					</h3>
					<p className='text-blue-700'>{score.interpretation}</p>
				</div>
			</div>

			{/* Footer */}
			<div className='border-t-2 border-gray-200 pt-6'>
				<div className='flex flex-col sm:flex-row justify-between mb-6'>
					<div>
						<p className='text-gray-700'>
							<span className='font-semibold'>Certificate Number:</span>{' '}
							{certificateNumber}
						</p>
						<p className='text-gray-700'>
							<span className='font-semibold'>Date of Issuance:</span>{' '}
							{formattedDate}
						</p>
						<p className='text-gray-700'>
							<span className='font-semibold'>Valid Until:</span>{' '}
							{new Date(
								currentDate.setFullYear(currentDate.getFullYear() + 2)
							).toLocaleDateString()}
						</p>
					</div>
					<div className='mt-4 sm:mt-0'>
						<p className='text-gray-700'>
							<span className='font-semibold'>Assessed By:</span> QuakeWise AI
							Assessment System
						</p>
						<p className='text-gray-700'>
							<span className='font-semibold'>Verified By:</span> Prof. Hamid F
							Ghatte
						</p>
					</div>
				</div>

				<div className='flex justify-between mt-8 pt-4 border-t border-gray-200'>
					<div>
						<div className='border-t-2 border-black pt-2 flex items-center'>
							<Shield className='w-5 h-5 mr-2 text-blue-700' />
							<span className='font-semibold'>Authorized Signature</span>
						</div>
					</div>
					<div>
						<div className='border-t-2 border-black pt-2 text-center'>
							<span className='font-semibold'>Official Seal of QuakeWise</span>
						</div>
					</div>
				</div>

				<div className='mt-8 text-center text-xs text-gray-500'>
					<p>
						This certificate is based on the information provided and serves as
						a general assessment.
					</p>
					<p>
						For a comprehensive structural analysis, please consult with a
						licensed professional engineer.
					</p>
				</div>
			</div>
		</div>
	);
};

export default EnhancedCertificate;
