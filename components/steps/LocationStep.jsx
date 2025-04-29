// components/steps/LocationStep.jsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Data from '@/utils/Data.json';
import { MyMapComponent } from '@/components/MyMapComponent';
import { Button } from '@/components/ui/button';
import { useUserInput } from '@/context/UserInputContext';
import {
	MapPin,
	AlertTriangle,
	Loader2,
	ArrowRight,
	Info,
	LocateFixed,
} from 'lucide-react';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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

	const stepOneData = Data.steps.find((step) => step.step === 1);

	return (
		<div className='max-w-4xl mx-auto'>
			<div className='text-center mb-8'>
				<div className='inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4'>
					<MapPin className='h-6 w-6 text-blue-600 dark:text-blue-400' />
				</div>
				<h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
					{stepOneData.title}
				</h1>
				<p className='text-lg text-gray-600 dark:text-gray-300'>
					{stepOneData.description}
				</p>
			</div>

			<Card className='shadow-md border border-gray-200 dark:border-gray-700'>
				<CardHeader className='pb-4'>
					<CardTitle className='text-xl flex items-center gap-2'>
						<LocateFixed className='h-5 w-5 text-blue-600 dark:text-blue-400' />
						Building Location
					</CardTitle>
					<CardDescription>
						We need to know your building's location to analyze local seismic
						conditions
					</CardDescription>
				</CardHeader>

				<CardContent>
					{isLoading ? (
						<div className='space-y-4'>
							<div className='flex justify-center items-center py-8'>
								<div className='text-center'>
									<Loader2 className='h-10 w-10 text-blue-500 animate-spin mx-auto mb-4' />
									<p className='text-lg font-medium text-gray-900 dark:text-white'>
										Getting your location...
									</p>
									<p className='text-gray-500 dark:text-gray-400 max-w-md'>
										We're accessing your device's location to provide accurate
										seismic analysis
									</p>
								</div>
							</div>
							<Skeleton className='h-[400px] w-full rounded-lg' />
						</div>
					) : error ? (
						<div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 my-4'>
							<div className='flex items-start'>
								<AlertTriangle className='h-6 w-6 text-red-600 dark:text-red-400 mt-0.5' />
								<div className='ml-3'>
									<h3 className='text-lg font-medium text-red-800 dark:text-red-300'>
										Location Access Error
									</h3>
									<p className='mt-2 text-red-700 dark:text-red-300'>{error}</p>
									<p className='mt-2 text-red-700 dark:text-red-300'>
										We need your location to provide accurate seismic risk
										assessment. Please enable location access in your browser
										settings.
									</p>
									<Button
										onClick={requestLocationPermission}
										className='mt-4'
										variant='outline'>
										<LocateFixed className='mr-2 h-4 w-4' />
										Try Again
									</Button>
								</div>
							</div>
						</div>
					) : userInput.location ? (
						<div className='space-y-4'>
							<div className='rounded-lg overflow-hidden h-[400px] border border-gray-200 dark:border-gray-700'>
								<MyMapComponent
									latitude={userInput.location.latitude}
									longitude={userInput.location.longitude}
								/>
							</div>

							<div className='flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400'>
								<Info className='h-4 w-4 mt-0.5 flex-shrink-0' />
								<p>{stepOneData.info}</p>
							</div>

							<div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg'>
								<div className='font-medium text-gray-900 dark:text-white mb-1'>
									Location Details:
								</div>
								<div className='grid grid-cols-2 gap-2 text-sm'>
									<div className='text-gray-600 dark:text-gray-400'>
										Latitude:
									</div>
									<div className='font-mono'>
										{userInput.location.latitude.toFixed(6)}
									</div>
									<div className='text-gray-600 dark:text-gray-400'>
										Longitude:
									</div>
									<div className='font-mono'>
										{userInput.location.longitude.toFixed(6)}
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 my-4 text-center'>
							<AlertTriangle className='h-10 w-10 text-yellow-500 mx-auto mb-4' />
							<h3 className='text-lg font-medium text-yellow-800 dark:text-yellow-300'>
								Location Required
							</h3>
							<p className='mt-2 text-yellow-700 dark:text-yellow-400'>
								{stepOneData.error}
							</p>
							<Button
								onClick={requestLocationPermission}
								className='mt-4'>
								<LocateFixed className='mr-2 h-4 w-4' />
								Allow Location Access
							</Button>
						</div>
					)}
				</CardContent>

				<CardFooter className='flex justify-end pt-4 border-t'>
					<Button
						onClick={onNext}
						disabled={!userInput.location}
						className='gap-2'>
						Next <ArrowRight className='h-4 w-4' />
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
};

export default LocationStep;
