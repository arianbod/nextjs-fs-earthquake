'use client';
import React from 'react';
import Data from '@/utils/Data.json';
import Image from 'next/image';

const ResultPage = ({ params }) => {
	const id = params.id;
	const { title, text, description } = Data.results;

	const handleDownload = () => {
		window.print();
	};

	return (
		<div className='min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 text-black'>
			<div className='certificate-container'>
				<div className='certificate-header'>
					{/* <Image
						src='/logo.png'
						alt='Deprem Platform'
						width={100}
						height={100}
						style={{ maxWidth: '150px', margin: '0 auto' }}
					/> */}
					<p>Deprem Platform</p>
				</div>
				<div className='certificate-title'>
					Certificate of Safety and Analysis
				</div>
				<div className='certificate-body'>
					<p>
						This is to certify that this building, has been thoroughly analyzed
						by the Deprem Platform.
					</p>
					<p>According to our assessment:</p>
					<ul className='list-disc list-inside'>
						<li>Structural integrity: 94%</li>
						<li>Estimated impact of a moderate earthquake: Low risk</li>
						<li>Recommendations for improvements</li>
					</ul>
					<p>
						This certificate is issued to confirm the safety and structural
						analysis performed by the Deprem Platform.
					</p>
				</div>
				<div className='certificate-footer'>
					<p>Date of Issuance: {Date()}</p>
					<div className='certificate-signature '>
						<div>
							<p>__________________________</p>
							<p>Authorized Signature</p>
						</div>
						<div>
							<p>__________________________</p>
							<p>Seal of Deprem Platform</p>
						</div>
					</div>
				</div>
				<div className='flex justify-center mt-8 no-print'>
					<button
						onClick={handleDownload}
						className='bg-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 transition-colors'>
						Download Certificate Report
					</button>
				</div>
			</div>
		</div>
	);
};

export default ResultPage;
