'use client';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../../app/globals.css';
import DynamicList from "@/components/Sidebar"; 
import L from 'leaflet';

function Map(){

    

    return(
        <div id="container">
            <div id="records-list" className="sidebar collapsed">
                <DynamicList/>
            </div>
            <MapContainer id="map" center={[48.443432, -62.55]} zoom={5} style={{height: '600', width:'1000'}} scrollWheelZoom={true}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
            </MapContainer>
        </div>
    )
}

export default Map;