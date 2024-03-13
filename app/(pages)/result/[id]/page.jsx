'use client';
import React, { useEffect } from 'react';
import { redirect } from 'next/navigation';
import Data from '@/utils/Data.json';
const page = ({ params }) => {
	const id = params.id;
	const { title, text, description } = Data.results; // Adjusted to use dynamic data based on id

	return (
		<div className='min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 sm:px-2 lg:px-8'>
			<div className='max-w-3xl bg-white shadow overflow-hidden sm:rounded-lg p-8'>
				<h1 className='text-5xl font-bold text-center text-gray-900 capitalize mb-8'>
					{title}
				</h1>
				<h2 className='text-xl text-gray-700 mb-2'>{text}</h2>
				<p className='text-md text-gray-600'>{description}</p>
			</div>
		</div>
	);
};

export default page;
