// EnhancedCertificate.js
import React from 'react';
import Data from '@/utils/Data.json';
const EnhancedCertificate = ({ score, userInput }) => {
	const getValue = (key) => {
		const lowerKey = key.toLowerCase();
		return userInput[key] || userInput[lowerKey] || 'N/A';
	};

	return (
		<div className='bg-white border-8 border-double border-gray-300 p-8 max-w-2xl mx-auto my-8 text-center'>
			<h1 className='text-3xl font-bold mb-4'>QuakeWise</h1>
			<h2 className='text-2xl text-blue-600 font-semibold mb-6'>
				Certificate of Safety and Analysis
			</h2>

			<p className='mb-4'>
				This is to certify that the building located at{' '}
				{userInput.location
					? `Lat: ${userInput.location.latitude}, Lng: ${userInput.location.longitude}`
					: 'the specified location'}
				, has been thoroughly analyzed by the QuakeWise.
			</p>

			<div className='mb-6'>
				<h3 className='text-xl font-bold mb-2'>According to our assessment:</h3>
				<ul className='list-disc list-inside'>
					<li>
						Overall Safety Score: {Number(score.overallScore || 0).toFixed(2)}%
					</li>
					<li>
						Structural Integrity:{' '}
						{Number(score.structuralIntegrity || 0).toFixed(2)}%
					</li>
					<li>Earthquake Impact: {score.earthquakeImpact}</li>
					<li>Interpretation: {score.interpretation}</li>
					<li>Building Type: {score.buildingType}</li>
				</ul>
			</div>

			<div className='mb-6'>
				<h3 className='text-xl font-bold mb-2'>Building Details:</h3>
				<ul className='list-disc list-inside'>
					<li>Type of Earthquake considered: {getValue('typeOfEarthquake')}</li>
					<li>Soil Type: {getValue('typeOfSoil')}</li>
					<li>Design Regulation: {getValue('designRegulation')}</li>
					<li>Number of Stories: {getValue('numberOfStories')}</li>
					<li>Year of Construction: {getValue('yearOfConstruction')}</li>
				</ul>
			</div>

			<p className='mb-6'>
				This certificate is issued to confirm the safety and structural analysis
				performed by the QuakeWise.
			</p>

			<div className='mt-8'>
				<p>Date of Issuance: {new Date().toLocaleDateString()}</p>
				<div className='flex justify-between mt-8'>
					<div>
						<div className='border-t-2 border-black pt-2'>
							Authorized Signature
						</div>
					</div>
					<div>
						<div className='border-t-2 border-black pt-2'>
							Seal of QuakeWise
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EnhancedCertificate;
