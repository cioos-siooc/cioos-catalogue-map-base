'use client';
import { useState } from 'react';
import 'leaflet/dist/leaflet.css';
import '../../app/globals.css';
import { MapContainer, Polygon, TileLayer, useMap } from "react-leaflet";
import DynamicList from "@/components/Sidebar";
import Canvas from "@/components/Canvas";
import L from 'leaflet';


const FitBounds = ({ bounds }) => {

    const map = useMap();
    if (bounds) {
        ClearMap({map});
        console.log('BOUNDS 2 :: ' + JSON.stringify(bounds.coordinates));

        var polygon = L.geoJSON(bounds, {color: 'red'}).addTo(map);
        
        map.fitBounds(polygon.getBounds(), {
            animate: true,
            padding: [50, 50],
            maxZoom: 10
        });
    }

    return null;
  };

  const ClearMap = ({map}) => {
    map.eachLayer((layer) => {
        if (layer instanceof L.Polygon) {
            map.removeLayer(layer);
        }
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }

    });


    return null;
  };
function Map({center}){

    const [bounds, setBounds] = useState(null);
    const catalogueUrl = 'https://catalogue.ogsl.ca';

    console.log('MAP INIT :: ');

    const handleListItemClick = (selectedItem) => {
        setBounds(selectedItem.spatial);
        console.log('SPATIAL :: ' + JSON.stringify(selectedItem.spatial.coordinates));
      };

      const handleListItemDoubleClick = (selectedItem) => {
        window.open(`${catalogueUrl}/dataset/${selectedItem.name}`);
      };

    return(

        <div id="container" className="flex ... z-20"> 
            <div id="records-list" className="flex-none w-1/5 bg-gray-100 dark:bg-gray-900 overflow-y-auto overflow-x-auto">
                <Canvas onItemClick={handleListItemClick} onItemDoubleClick={handleListItemDoubleClick}/>
            </div>
            <div className="flex-grow">
                {center && (
              
                <MapContainer className="h-screen w-full"
                    center={center} zoom={6} 
                    scrollWheelZoom={true}
                    boundsOptions={{ padding: [1, 1] }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                  {bounds && <FitBounds bounds={bounds} />}
                </MapContainer>
            )}
            </div>
        </div>

    )
}

export default Map;