'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../app/globals.css';

function Map({center}){
    const mapRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current) {
          // Initialize the map
          mapRef.current = L.map('map').setView(center, 6);
    
          // Add a tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
          }).addTo(mapRef.current);
        } else {
          // Update the map center
          mapRef.current.setView(center, 6);
        }
      }, [center]);
    

    return(

        /*<MapContainer id="map" center={center} zoom={5} style={{height: '600', width:'1000'}} scrollWheelZoom={true}>
            <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
        </MapContainer>*/
        <div id="map" style={{ height: '100vh', width: '100%' }}></div>

    )
}

export default Map;