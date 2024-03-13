import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
	width: '400px',
	height: '400px',
};

export function MyMapComponent({ latitude, longitude }) {
	const lat = parseFloat(latitude);
	const lng = parseFloat(longitude);
	return (
		<LoadScript googleMapsApiKey='AIzaSyBTTqyrTzlquPmc7HZfNHDGy0i31gbP5l8'>
			<GoogleMap
				mapContainerStyle={containerStyle}
				center={{ lat, lng }}
				zoom={16}>
				{/* Child components, like markers */}
				<Marker position={{ lat, lng }} />
			</GoogleMap>
		</LoadScript>
	);
}
