'use client';   
import { useEffect, useState } from 'react';
import { useMap} from 'react-leaflet';

const DynamicList = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const catalogueUrl = 'https://catalogue.ogsl.ca';
  const baseQuery = 'projects=*baseline*';
  let url = `${catalogueUrl}/api/3/action/package_search?q=${baseQuery}`;

  const map = useMap();

  const handleClick = (item) => {
    map.fitBounds(L.geoJSON(item.spatial).getBounds());
    setCenter(coords);
  };

  useEffect(() => {
    // Fetch data from an API
    fetch(url) // Example API
      .then((response) => response.json())
      .then(async (data)  => {
        const awaitRes = await data;
        setItems(awaitRes.result.results);})
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!items.length) return <p>Loading...</p>;
    

  return (
    <ul id="sidebar">
      {items.map((item) => (
        <li onClick={() => handleClick(item)} key={item.id}>{item.title}</li> // Dynamically create <li> items
      ))}
    </ul>
  );
};

export default DynamicList;
