'use client';
import { useState } from 'react';
import 'leaflet/dist/leaflet.css';
import '../app/globals.css';
import { MapContainer, Polygon, TileLayer, useMap } from "react-leaflet";
import dynamic from 'next/dynamic';
import L from 'leaflet';

const RightMenu = dynamic(() => import('./RightMenu'), {ssr: false})

const FitBounds = ({ bounds }) => {

    const map = useMap();
    if (bounds) {
        ClearMap({map});
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

        <div id="container" className="flex w-screen">

            <div className="fixed top-0 right-0 z-1000">
                <RightMenu onItemClick={handleListItemClick} onItemDoubleClick={handleListItemDoubleClick}/>
            </div>

            <div className="flex-1">
                {center && (
              
                <MapContainer className="h-screen w-screen"
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