import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
	width: '100%',
	height: '400px',
};

export function MyMapComponent({ latitude, longitude }) {
	const lat = parseFloat(latitude);
	const lng = parseFloat(longitude);
	return (
		<div className='rounded-3xl overflow-hidden w-full text-center flex place-content-center'>
			<LoadScript googleMapsApiKey='AIzaSyBTTqyrTzlquPmc7HZfNHDGy0i31gbP5l8'>
				<GoogleMap
					mapContainerStyle={containerStyle}
					center={{ lat, lng }}
					zoom={16}>
					{/* Child components, like markers */}
					<Marker
						position={{ lat, lng }}
						draggable
					/>
				</GoogleMap>
			</LoadScript>
		</div>
	);
}
