import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Data from '@/utils/Data.json';
import { MyMapComponent } from '@/components/MyMapComponent';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserInput } from '@/context/UserInputContext';

const LocationStep = ({ onNext }) => {
	const { userInput, updateUserInput } = useUserInput();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const requestLocationPermission = () => {
		setIsLoading(true);
		setError(null);
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					updateUserInput({
						location: {
							latitude: position.coords.latitude,
							longitude: position.coords.longitude,
						},
					});
					setIsLoading(false);
				},
				(err) => {
					console.error('Error getting location:', err);
					setError(
						"Unable to access location. Please ensure you've given permission."
					);
					setIsLoading(false);
				},
				{ timeout: 10000, maximumAge: 0 }
			);
		} else {
			setError('Geolocation is not supported by this browser.');
			setIsLoading(false);
		}
	};

	useEffect(() => {
		requestLocationPermission();
	}, []);

	return (
		<div className='max-w-4xl mx-auto p-4 gap-6 flex flex-col'>
			{/* <Progress value={10} /> */}
			<h1 className='text-3xl font-bold text-center mb-4'>
				{Data.steps[0].title}
			</h1>
			<p className='text-lg text-gray-700 mb-6'>{Data.steps[0].description}</p>
			<p className='text-lg text-gray-700'>*{Data.steps[0].info}</p>

			{isLoading ? (
				<p className='text-xl font-bold text-center text-blue-500 mb-6'>
					Loading location...
				</p>
			) : error ? (
				<div>
					<p className='text-xl font-bold text-center text-red-500 mb-6'>
						{error}
					</p>
					<Button
						onClick={requestLocationPermission}
						className='mx-auto block'>
						Retry Location Access
					</Button>
				</div>
			) : userInput.location ? (
				<div className='flex w-full bg-white shadow-md rounded-lg place-content-center place-items-center'>
					<div className='mt-4 w-full'>
						<MyMapComponent
							latitude={userInput.location.latitude}
							longitude={userInput.location.longitude}
						/>
					</div>
				</div>
			) : (
				<p className='text-xl font-bold text-center text-red-500 mb-6'>
					{Data.steps[0].error}
				</p>
			)}

			<div className='flex justify-center'>
				<Button
					onClick={onNext}
					disabled={!userInput.location}
					className='hover:bg-zinc-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-150'>
					Next
				</Button>
			</div>
		</div>
	);
};

export default LocationStep;
