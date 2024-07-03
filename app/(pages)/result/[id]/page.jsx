'use client';
import React from 'react';
import Data from '@/utils/Data.json';

const ResultPage = ({ params }) => {
	const id = params.id;
	const { title, text, description } = Data.results;

	const handleDownload = () => {
		window.print();
	};

	return (
		<div className='min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8'>
			<div className='max-w-4xl w-full bg-white shadow-lg rounded-lg p-8'>
				<div className='text-center'>
					<h1 className='text-4xl font-bold text-blue-600 mb-4 print-title'>
						{title}
					</h1>
					<h2 className='text-2xl text-gray-700 mb-6 print-header'>{text}</h2>
					<p className='text-lg text-gray-600 mb-8'>{description}</p>
					<div className='flex justify-center mt-8 no-print'>
						<button
							onClick={handleDownload}
							className='bg-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 transition-colors'>
							Download Detailed Report
						</button>
					</div>
				</div>
				<div className='mt-8'>
					<h3 className='text-xl font-semibold text-gray-800 mb-4'>Summary</h3>
					<div className='bg-gray-50 p-4 rounded-lg shadow-inner print-summary'>
						<ul className='list-disc list-inside'>
							<li>Structural integrity: 94%</li>
							<li>Estimated impact of a moderate earthquake: Low risk</li>
							<li>Recommendations for improvements</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ResultPage;
