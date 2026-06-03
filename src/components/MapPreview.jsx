import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const MapUpdater = ({ center, markers }) => {
    const map = useMap();
    useEffect(() => {
        if (markers.length > 0) {
            const bounds = L.latLngBounds(markers.map(m => m.position));
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, markers, map]);
    return null;
};

const MapPreview = ({ sourceCoords, destinationCoords }) => {
    const [markers, setMarkers] = useState([]);
    const [polylineCoords, setPolylineCoords] = useState([]);
    const [exactDistance, setExactDistance] = useState(null);

    useEffect(() => {
        const newMarkers = [];
        const newCoords = [];

        if (sourceCoords) {
            const src = [parseFloat(sourceCoords.lat), parseFloat(sourceCoords.lon)];
            newMarkers.push({ position: src, label: "Source" });
            newCoords.push(src);
        }

        if (destinationCoords) {
            const dest = [parseFloat(destinationCoords.lat), parseFloat(destinationCoords.lon)];
            newMarkers.push({ position: dest, label: "Destination" });
            newCoords.push(dest);
        }

        setMarkers(newMarkers);

        if (newCoords.length === 2 && sourceCoords && destinationCoords) {
            // Fetch precise route for polyline from OSRM
            const fetchRoute = async () => {
                try {
                    // Using routing.openstreetmap.de for faster route retrieval
                    const osrmUrl = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${sourceCoords.lon},${sourceCoords.lat};${destinationCoords.lon},${destinationCoords.lat}?overview=full&geometries=geojson`;
                    const response = await fetch(osrmUrl);
                    const data = await response.json();
                    if (data.code === 'Ok' && data.routes.length > 0) {
                        const routeCoords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]); // GeoJSON is [lon, lat], Leaflet is [lat, lon]
                        setPolylineCoords(routeCoords);
                        setExactDistance((data.routes[0].distance / 1000).toFixed(1));
                    } else {
                        setPolylineCoords(newCoords); // fallback to straight line
                        setExactDistance(null);
                    }
                } catch (e) {
                    console.error("OSRM Route Error", e);
                    setPolylineCoords(newCoords);
                }
            };
            fetchRoute();
        } else {
            setPolylineCoords([]);
        }

    }, [sourceCoords, destinationCoords]);

    const defaultCenter = [20.5937, 78.9629]; // Center of India
    const centerPosition = markers.length > 0 ? markers[0].position : defaultCenter;

    return (
        <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', zIndex: 0 }}>
            {exactDistance && sourceCoords && destinationCoords && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    color: '#a855f7',
                    border: '1px solid currentColor'
                }}>
                    Driving Distance: {exactDistance} km
                </div>
            )}
            <MapContainer
                center={centerPosition}
                zoom={markers.length > 0 ? 10 : 4}
                style={{ width: '100%', height: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
                />
                <MapUpdater center={centerPosition} markers={markers} />

                {markers.map((marker, idx) => (
                    <Marker key={idx} position={marker.position}>
                        <Popup>{marker.label}</Popup>
                    </Marker>
                ))}

                {polylineCoords.length > 0 && (
                    <Polyline positions={polylineCoords} color="#a855f7" weight={4} opacity={0.7} />
                )}
            </MapContainer>
        </div>
    );
};

export default MapPreview;
