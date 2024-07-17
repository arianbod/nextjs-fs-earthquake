import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Data from '@/utils/Data.json';
import { MyMapComponent } from './MyMapComponent';
import { Button } from './ui/button';
import { Progress } from '@/components/ui/progress';

const One = () => {
	const [locationPermission, setLocationPermission] = useState(null);
	const [locationData, setLocationData] = useState(null);
	const [province, setProvince] = useState('');
	const [city, setCity] = useState('');
	const provinces = ['Province 1', 'Province 2', 'Province 3'];
	const cities = ['City 1', 'City 2', 'City 3'];

	const requestLocationPermission = async () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setLocationPermission(true);
					setLocationData(position.coords);
				},
				() => {
					setLocationPermission(false);
				}
			);
		} else {
			setLocationPermission(false);
		}
	};

	useEffect(() => {
		requestLocationPermission();
	}, []);

	return (
		<div className='max-w-4xl mx-auto p-4 gap-6 flex flex-col'>
			<Progress value={10} />

			<h1 className='text-3xl font-bold text-center mb-4'>
				{Data.steps[0].title}
			</h1>
			<p className='text-lg text-gray-700 mb-6'>{Data.steps[0].description}</p>
			<p className='text-lg text-gray-700'>*{Data.steps[0].info}</p>
			{locationData && (
				<div className='flex w-full bg-white shadow-md rounded-lg place-content-center place-items-center'>
					<div className='mt-4 w-full'>
						<MyMapComponent
							latitude={parseFloat(locationData.latitude)}
							longitude={parseFloat(locationData.longitude)}
						/>
					</div>
				</div>
			)}
			{locationPermission === false && (
				<p className='text-xl font-bold text-center text-red-500 mb-6'>
					{Data.steps[0].error}
				</p>
			)}
			<div className='flex justify-center'>
				<Link
					href='/2'
					passHref>
					{locationPermission === true && (
						<Button className='hover:bg-zinc-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-150'>
							Next
						</Button>
					)}
				</Link>
			</div>
		</div>
	);
};

export default One;
