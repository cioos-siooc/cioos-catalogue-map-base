import { useEffect } from 'react';
import L from 'leaflet';

const MapDynamic = ({center, bounds}) => {

  useEffect(() => {
    // Initialize the map on page load
    
    const map = L.map('map').setView(center, 6); // Set initial view (lat, lon, zoom)
    map.scrollWheelZoom.enabled(); // Enable scroll zoom
    // Add a tile layer (you can customize the URL for different tile providers)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    if((bounds)){
      var polygon = L.geoJSON(bounds, {color: 'red'}).addTo(map);
        
        map.fitBounds(polygon.getBounds(), {
            animate: true,
            padding: [50, 50],
            maxZoom: 10
        });
  }

    // Example marker
    //L.marker([51.505, -0.09]).addTo(map).bindPopup('A marker!').openPopup();
    return () => {
      // Cleanup map on component unmount
      map.remove();
    };
  }, []);

  return <div id="map" style={{ height: '100vh', width: '100%' }}></div>;
};

export default MapDynamic;
