// Enhanced MyMapComponent.js with advanced features
'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { 
	GoogleMap, 
	LoadScript, 
	Marker, 
	InfoWindow,
	Circle,
	DrawingManager,
	StreetViewPanorama
} from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
	MapPin, 
	Layers, 
	Satellite, 
	Navigation, 
	Camera,
	Building,
	AlertTriangle
} from 'lucide-react';

const containerStyle = {
	width: '100%',
	height: '400px',
};

const libraries = ['drawing', 'geometry', 'places'];

export function MyMapComponent({ 
	latitude, 
	longitude, 
	onLocationChange,
	showSeismicData = false,
	showStreetView = false,
	enableDrawing = false,
	seismicZoneInfo = null
}) {
	const [map, setMap] = useState(null);
	const [marker, setMarker] = useState({ lat: latitude, lng: longitude });
	const [showInfo, setShowInfo] = useState(false);
	const [mapType, setMapType] = useState('roadmap');
	const [showStreetViewPanel, setShowStreetViewPanel] = useState(false);
	const [nearbyPlaces, setNearbyPlaces] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	// Map options with enhanced features
	const mapOptions = {
		disableDefaultUI: false,
		zoomControl: true,
		mapTypeControl: true,
		scaleControl: true,
		streetViewControl: true,
		rotateControl: true,
		fullscreenControl: true,
		mapTypeId: mapType,
		styles: mapType === 'roadmap' ? [
			{
				featureType: 'poi.business',
				elementType: 'labels',
				stylers: [{ visibility: 'on' }]
			}
		] : undefined
	};

	// Drawing manager options
	const drawingManagerOptions = {
		drawingControl: enableDrawing,
		drawingControlOptions: {
			position: window.google?.maps?.ControlPosition?.TOP_CENTER,
			drawingModes: window.google?.maps?.drawing ? [
				window.google.maps.drawing.OverlayType.CIRCLE,
				window.google.maps.drawing.OverlayType.POLYGON,
				window.google.maps.drawing.OverlayType.RECTANGLE,
			] : [],
		},
		circleOptions: {
			fillColor: 'rgba(255, 0, 0, 0.1)',
			fillOpacity: 0.1,
			strokeWeight: 2,
			strokeColor: '#ff0000',
		},
	};

	// Handle marker drag
	const onMarkerDragEnd = useCallback((e) => {
		const newPosition = {
			lat: e.latLng.lat(),
			lng: e.latLng.lng()
		};
		setMarker(newPosition);
		
		if (onLocationChange) {
			onLocationChange(newPosition.lat, newPosition.lng);
		}
	}, [onLocationChange]);

	// Handle map click
	const onMapClick = useCallback((e) => {
		const newPosition = {
			lat: e.latLng.lat(),
			lng: e.latLng.lng()
		};
		setMarker(newPosition);
		
		if (onLocationChange) {
			onLocationChange(newPosition.lat, newPosition.lng);
		}
	}, [onLocationChange]);

	// Load nearby places
	const loadNearbyPlaces = useCallback(async () => {
		if (!map || !window.google?.maps?.places) return;

		setIsLoading(true);
		const service = new window.google.maps.places.PlacesService(map);
		
		const request = {
			location: new window.google.maps.LatLng(marker.lat, marker.lng),
			radius: 500,
			types: ['hospital', 'fire_station', 'police', 'school', 'university']
		};

		service.nearbySearch(request, (results, status) => {
			if (status === window.google.maps.places.PlacesServiceStatus.OK) {
				setNearbyPlaces(results.slice(0, 10));
			}
			setIsLoading(false);
		});
	}, [map, marker]);

	// Update marker when props change
	useEffect(() => {
		setMarker({ lat: latitude, lng: longitude });
	}, [latitude, longitude]);

	// Load nearby places when marker changes
	useEffect(() => {
		if (map && showSeismicData) {
			loadNearbyPlaces();
		}
	}, [map, marker, showSeismicData, loadNearbyPlaces]);

	return (
		<div className="space-y-4">
			{/* Map Controls */}
			<div className="flex flex-wrap gap-2 justify-between items-center">
				<div className="flex gap-2">
					<Button
						variant={mapType === 'roadmap' ? 'default' : 'outline'}
						size="sm"
						onClick={() => setMapType('roadmap')}
					>
						<Navigation className="h-4 w-4 mr-1" />
						Road
					</Button>
					<Button
						variant={mapType === 'satellite' ? 'default' : 'outline'}
						size="sm"
						onClick={() => setMapType('satellite')}
					>
						<Satellite className="h-4 w-4 mr-1" />
						Satellite
					</Button>
					<Button
						variant={mapType === 'hybrid' ? 'default' : 'outline'}
						size="sm"
						onClick={() => setMapType('hybrid')}
					>
						<Layers className="h-4 w-4 mr-1" />
						Hybrid
					</Button>
				</div>
				
				<div className="flex gap-2">
					{showStreetView && (
						<Button
							variant={showStreetViewPanel ? 'default' : 'outline'}
							size="sm"
							onClick={() => setShowStreetViewPanel(!showStreetViewPanel)}
						>
							<Camera className="h-4 w-4 mr-1" />
							Street View
						</Button>
					)}
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowInfo(!showInfo)}
					>
						<Building className="h-4 w-4 mr-1" />
						Info
					</Button>
				</div>
			</div>

			{/* Main Map Container */}
			<div className="rounded-lg overflow-hidden border">
				<LoadScript
					googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
					libraries={libraries}
				>
					<GoogleMap
						mapContainerStyle={containerStyle}
						center={marker}
						zoom={16}
						options={mapOptions}
						onLoad={setMap}
						onClick={onMapClick}
					>
						{/* Main building marker */}
						<Marker
							position={marker}
							draggable={true}
							onDragEnd={onMarkerDragEnd}
							icon={{
								url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
									<svg width="30" height="40" xmlns="http://www.w3.org/2000/svg">
										<path d="M15 0C6.7 0 0 6.7 0 15c0 15 15 25 15 25s15-10 15-25C30 6.7 23.3 0 15 0z" fill="#dc2626"/>
										<circle cx="15" cy="15" r="8" fill="white"/>
										<circle cx="15" cy="15" r="5" fill="#dc2626"/>
									</svg>
								`),
								...(window.google?.maps && {
									scaledSize: new window.google.maps.Size(30, 40),
									anchor: new window.google.maps.Point(15, 40)
								})
							}}
						>
							{showInfo && (
								<InfoWindow onCloseClick={() => setShowInfo(false)}>
									<div className="p-2 max-w-xs">
										<h3 className="font-semibold mb-2">Building Location</h3>
										<div className="space-y-1 text-sm">
											<div>
												<strong>Coordinates:</strong><br />
												{marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
											</div>
											{seismicZoneInfo && (
												<div>
													<strong>Seismic Zone:</strong><br />
													<Badge variant="outline" className="mt-1">
														{seismicZoneInfo.zone} - {seismicZoneInfo.riskLevel}
													</Badge>
												</div>
											)}
										</div>
									</div>
								</InfoWindow>
							)}
						</Marker>

						{/* Seismic risk circle */}
						{showSeismicData && seismicZoneInfo && (
							<Circle
								center={marker}
								radius={seismicZoneInfo.nearestFaultDistance * 1000} // Convert km to meters
								options={{
									fillColor: seismicZoneInfo.zone === 'Zone 4' ? '#ef4444' : 
											  seismicZoneInfo.zone === 'Zone 3' ? '#f97316' :
											  seismicZoneInfo.zone === 'Zone 2' ? '#eab308' : '#22c55e',
									fillOpacity: 0.1,
									strokeColor: seismicZoneInfo.zone === 'Zone 4' ? '#ef4444' : 
											   seismicZoneInfo.zone === 'Zone 3' ? '#f97316' :
											   seismicZoneInfo.zone === 'Zone 2' ? '#eab308' : '#22c55e',
									strokeOpacity: 0.4,
									strokeWeight: 2,
								}}
							/>
						)}

						{/* Nearby safety-related places */}
						{showSeismicData && nearbyPlaces.map((place) => (
							<Marker
								key={place.place_id}
								position={place.geometry.location}
								icon={{
									url: getPlaceIcon(place.types[0]),
									...(window.google?.maps && {
										scaledSize: new window.google.maps.Size(20, 20)
									})
								}}
								title={place.name}
							/>
						))}

						{/* Drawing Manager */}
						{enableDrawing && (
							<DrawingManager
								options={drawingManagerOptions}
							/>
						)}
					</GoogleMap>
				</LoadScript>
			</div>

			{/* Street View Panel */}
			{showStreetViewPanel && (
				<Card>
					<CardContent className="p-4">
						<div className="h-64 rounded-lg overflow-hidden">
							<LoadScript
								googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
							>
								<StreetViewPanorama
									position={marker}
									visible={true}
									options={{
										addressControl: false,
										showRoadLabels: false,
										enableCloseButton: false
									}}
								/>
							</LoadScript>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Nearby Places Info */}
			{showSeismicData && nearbyPlaces.length > 0 && (
				<Card>
					<CardContent className="p-4">
						<h4 className="font-medium mb-3 flex items-center gap-2">
							<AlertTriangle className="h-4 w-4 text-amber-500" />
							Nearby Safety Infrastructure
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
							{nearbyPlaces.slice(0, 6).map((place) => (
								<div key={place.place_id} className="flex items-center gap-2 text-sm">
									<div className="w-4 h-4 flex-shrink-0">
										<img 
											src={getPlaceIcon(place.types[0])} 
											alt={place.types[0]}
											className="w-full h-full"
										/>
									</div>
									<div className="truncate">
										<div className="font-medium">{place.name}</div>
										<div className="text-gray-500 text-xs capitalize">
											{place.types[0].replace(/_/g, ' ')}
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Location Info */}
			<div className="text-sm text-gray-600 dark:text-gray-400 text-center">
				📍 Click anywhere on the map or drag the marker to update the building location
			</div>
		</div>
	);
}

// Helper function to get place icons
function getPlaceIcon(placeType) {
	const iconMap = {
		hospital: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
			<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc2626">
				<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
			</svg>
		`),
		fire_station: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
			<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444">
				<circle cx="12" cy="12" r="10"/>
			</svg>
		`),
		police: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
			<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6">
				<circle cx="12" cy="12" r="10"/>
			</svg>
		`),
		school: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
			<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#22c55e">
				<circle cx="12" cy="12" r="10"/>
			</svg>
		`),
		university: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
			<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#8b5cf6">
				<circle cx="12" cy="12" r="10"/>
			</svg>
		`)
	};
	
	return iconMap[placeType] || iconMap.hospital;
}
