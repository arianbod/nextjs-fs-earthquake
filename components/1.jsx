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
		<div className='max-w-4xl mx-auto p-4'>
			<Progress value={10} />

			<h1 className='text-3xl font-bold text-center mb-4'>
				{Data.steps[0].title}
			</h1>
			<p className='text-lg text-gray-700 mb-6'>{Data.steps[0].description}</p>
			{locationData && (
				<div className='grid grid-cols-1 md:grid-cols-2 bg-white shadow-md rounded-lg p-4 mb-6'>
					<div>
						<p className='font-semibold text-md'>Your location data:</p>
						<p className='text-gray-600'>Latitude: {locationData.latitude}</p>
						<p className='text-gray-600'>Longitude: {locationData.longitude}</p>
					</div>
					<div className='mt-4'>
						<MyMapComponent
							latitude={parseFloat(locationData.latitude)}
							longitude={parseFloat(locationData.longitude)}
						/>
					</div>
				</div>
			)}
			{locationPermission === false && (
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
					<div className='mb-4'>
						<label className='block text-gray-700 text-sm font-bold mb-2'>
							Province
						</label>
						<select
							value={province}
							onChange={(e) => setProvince(e.target.value)}
							className='block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'>
							{provinces.map((prov) => (
								<option
									key={prov}
									value={prov}>
									{prov}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className='block text-gray-700 text-sm font-bold mb-2'>
							City
						</label>
						<select
							value={city}
							onChange={(e) => setCity(e.target.value)}
							className='block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'>
							{cities.map((ct) => (
								<option
									key={ct}
									value={ct}>
									{ct}
								</option>
							))}
						</select>
					</div>
				</div>
			)}
			<div className='flex justify-center'>
				<Link
					href='/2'
					passHref>
					<Button className='hover:bg-zinc-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-150'>
						Next
					</Button>
				</Link>
			</div>
		</div>
	);
};

export default One;
