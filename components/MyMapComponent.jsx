// MyMapComponent.js
'use client';
import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
	width: '100%',
	height: '400px',
};

export function MyMapComponent({ latitude, longitude }) {
	return (
		<div className='rounded-3xl overflow-hidden w-full text-center flex justify-center'>
			<LoadScript
				googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
				<GoogleMap
					mapContainerStyle={containerStyle}
					center={{ lat: latitude, lng: longitude }}
					zoom={16}>
					<Marker
						position={{ lat: latitude, lng: longitude }}
						draggable
					/>
				</GoogleMap>
			</LoadScript>
		</div>
	);
}
