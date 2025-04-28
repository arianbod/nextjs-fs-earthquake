'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { MyMapComponent } from '@/components/MyMapComponent';
import {
	MapPin,
	Info,
	Crosshair,
	Search,
	Volume,
	VolumeX,
	ArrowRight,
	Loader2,
} from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';

// Sample voice assistant messages
const voiceInstructions = [
	"Welcome to the location step. This is where we'll identify where your building is located.",
	'First, allow location access or enter your address to find your building on the map.',
	'You can fine-tune the location by dragging the marker on the map.',
	'This information helps us determine the seismic zone and soil conditions in your area.',
];

const LocationPage = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const assessmentId = searchParams.get('id');
	const mapRef = useRef(null);

	// State
	const [locationPermission, setLocationPermission] = useState(null);
	const [locationData, setLocationData] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [address, setAddress] = useState('');
	const [soilType, setSoilType] = useState('');
	const [voiceAssistant, setVoiceAssistant] = useState(false);
	const [voiceMessageIndex, setVoiceMessageIndex] = useState(0);
	const [voicePlaying, setVoicePlaying] = useState(false);

	// Request location permission
	const requestLocationPermission = async () => {
		setIsLoading(true);
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setLocationPermission(true);
					setLocationData({
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
					});
					setIsLoading(false);
				},
				() => {
					setLocationPermission(false);
					setIsLoading(false);
					toast.error(
						'Unable to access your location. Please enter your address manually.'
					);
				}
			);
		} else {
			setLocationPermission(false);
			setIsLoading(false);
			toast.error(
				'Geolocation is not supported by your browser. Please enter your address manually.'
			);
		}
	};

	// Search address
	const handleAddressSearch = () => {
		if (!address.trim()) return;
		setIsLoading(true);
		setTimeout(() => {
			// Simulated coords
			setLocationData({ latitude: 40.7128, longitude: -74.006 });
			setLocationPermission(true);
			setIsLoading(false);
		}, 1000);
	};

	// Handle marker drag
	const handleMarkerDrag = (lat, lng) => {
		setLocationData({ latitude: lat, longitude: lng });
	};

	// Toggle voice assistant
	const toggleVoiceAssistant = () => {
		setVoiceAssistant(!voiceAssistant);
		if (!voiceAssistant) {
			setVoiceMessageIndex(0);
			setVoicePlaying(true);
		} else {
			setVoicePlaying(false);
		}
	};

	// Voice assistant playback simulation
	useEffect(() => {
		if (
			voiceAssistant &&
			voicePlaying &&
			voiceMessageIndex < voiceInstructions.length
		) {
			const timer = setTimeout(() => {
				setVoiceMessageIndex((i) => i + 1);
			}, 5000);
			return () => clearTimeout(timer);
		}
		if (voiceMessageIndex >= voiceInstructions.length) {
			setVoicePlaying(false);
		}
	}, [voiceAssistant, voicePlaying, voiceMessageIndex]);

	// Handle form submission
	const handleNext = () => {
		router.push(`/assessment/new/building?id=${assessmentId}`);
	};

	useEffect(() => {
		requestLocationPermission();
	}, []);

	return (
		<div className='container py-6 max-w-4xl'>
			{/* Progress indicator */}
			<div className='mb-6'>
				<div className='flex items-center justify-between mb-2'>
					<h2 className='text-sm font-medium'>Step 1 of 10</h2>
					<span className='text-sm text-muted-foreground'>10% Complete</span>
				</div>
				<Progress
					value={10}
					className='h-2'
				/>
			</div>

			{/* Step heading */}
			<div className='mb-6'>
				<h1 className='text-2xl font-bold mb-2'>Building Location</h1>
				<p className='text-muted-foreground'>
					Identify where your building is located to assess local seismic risk
					factors
				</p>
			</div>

			{/* Voice assistant banner */}
			{voiceAssistant && (
				<Card className='mb-6 bg-primary/5 border-primary/20'>
					<CardContent className='p-4'>
						<div className='flex items-start gap-3'>
							<div className='flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
								{voicePlaying ? (
									<Volume
										size={18}
										className='text-primary animate-pulse'
									/>
								) : (
									<Volume
										size={18}
										className='text-primary'
									/>
								)}
							</div>
							<div>
								<p className='font-medium mb-1'>Voice Assistant</p>
								<p className='text-sm'>
									{voiceMessageIndex < voiceInstructions.length
										? voiceInstructions[voiceMessageIndex]
										: "I'm ready to help. Ask me any questions about this step."}
								</p>
							</div>
							<Button
								variant='ghost'
								size='icon'
								onClick={toggleVoiceAssistant}
								className='ml-auto flex-shrink-0'>
								<VolumeX size={18} />
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Main content */}
			<div className='space-y-6'>
				{/* Location finder */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<MapPin className='h-5 w-5' /> Find Your Location
						</CardTitle>
						<CardDescription>
							Use your current location or search for an address
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{/* Address search */}
							<div>
								<Label htmlFor='address'>Address</Label>
								<div className='flex gap-2 mt-1'>
									<Input
										id='address'
										placeholder='Enter building address'
										value={address}
										onChange={(e) => setAddress(e.target.value)}
										className='flex-1'
									/>
									<Button
										onClick={handleAddressSearch}
										disabled={isLoading}>
										{isLoading ? (
											<Loader2 className='h-4 w-4 animate-spin' />
										) : (
											<Search className='h-4 w-4' />
										)}
										<span className='ml-2 hidden sm:inline'>Search</span>
									</Button>
								</div>
							</div>

							{/* Map section */}
							<div className='relative min-h-[300px] lg:min-h-[400px] rounded-md overflow-hidden border'>
								{!locationPermission && !locationData ? (
									<div className='absolute inset-0 flex flex-col items-center justify-center bg-muted/20 p-4'>
										{isLoading ? (
											<div className='text-center'>
												<Loader2 className='h-8 w-8 animate-spin mx-auto mb-4 text-primary' />
												<p>Detecting your location...</p>
											</div>
										) : (
											<div className='text-center'>
												<Crosshair className='h-8 w-8 mx-auto mb-4 text-muted-foreground' />
												<h3 className='font-medium mb-2'>
													We need your location
												</h3>
												<p className='text-sm text-muted-foreground mb-4'>
													Allow location access or search for your address to
													continue
												</p>
												<Button onClick={requestLocationPermission}>
													{isLoading ? (
														<Loader2 className='h-4 w-4 animate-spin mr-2' />
													) : (
														<MapPin className='h-4 w-4 mr-2' />
													)}
													Use My Location
												</Button>
											</div>
										)}
									</div>
								) : locationData ? (
									<MyMapComponent
										latitude={locationData.latitude}
										longitude={locationData.longitude}
										onMarkerDrag={handleMarkerDrag}
										ref={mapRef}
									/>
								) : (
									<div className='absolute inset-0 flex items-center justify-center bg-muted/20'>
										<p className='text-muted-foreground'>
											Unable to access location
										</p>
									</div>
								)}
							</div>

							{/* Location details */}
							{locationData && (
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div>
										<Label htmlFor='latitude'>Latitude</Label>
										<Input
											id='latitude'
											value={locationData.latitude.toFixed(6)}
											readOnly
										/>
									</div>
									<div>
										<Label htmlFor='longitude'>Longitude</Label>
										<Input
											id='longitude'
											value={locationData.longitude.toFixed(6)}
											readOnly
										/>
									</div>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Soil conditions */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Info className='h-5 w-5' /> Soil Conditions
						</CardTitle>
						<CardDescription>
							Select the soil type at your building location
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							<div>
								<Label htmlFor='soil-type'>Soil Type</Label>
								<Select
									value={soilType}
									onValueChange={setSoilType}>
									<SelectTrigger
										id='soil-type'
										className='mt-1'>
										<SelectValue placeholder='Select soil type' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='ZA'>ZA - Rock</SelectItem>
										<SelectItem value='ZB'>ZB - Very Dense Soil</SelectItem>
										<SelectItem value='ZC'>ZC - Dense Soil</SelectItem>
										<SelectItem value='ZD'>ZD - Stiff Soil</SelectItem>
										<SelectItem value='ZE'>ZE - Soft Soil</SelectItem>
									</SelectContent>
								</Select>
								<p className='text-xs text-muted-foreground mt-1'>
									If you're unsure, consult local geological surveys or soil
									reports.
								</p>
							</div>

							<div className='bg-blue-50 border border-blue-200 rounded-md p-4 dark:bg-blue-950 dark:border-blue-800'>
								<div className='flex items-start'>
									<Info
										size={18}
										className='text-blue-600 mr-2 mt-0.5 flex-shrink-0 dark:text-blue-400'
									/>
									<p className='text-blue-800 text-sm dark:text-blue-200'>
										Soil type affects how earthquake waves propagate. Softer
										soils typically amplify shaking compared to hard rock.
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Navigation buttons */}
			<div className='mt-8 flex justify-between'>
				<Button
					variant='outline'
					asChild>
					<Link href='/start-assessment'>Back</Link>
				</Button>

				<div className='flex gap-2'>
					<Button
						variant={voiceAssistant ? 'default' : 'outline'}
						size='icon'
						onClick={toggleVoiceAssistant}
						className='rounded-full'
						title={
							voiceAssistant
								? 'Disable voice assistant'
								: 'Enable voice assistant'
						}>
						{voiceAssistant ? <Volume size={18} /> : <VolumeX size={18} />}
					</Button>

					<Button
						onClick={handleNext}
						disabled={!locationData || !soilType}
						className='gap-1'>
						Next Step
						<ArrowRight size={16} />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default LocationPage;
