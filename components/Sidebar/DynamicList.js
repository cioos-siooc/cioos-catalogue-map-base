'use client';   
import {useState } from 'react';


const DynamicList = ({ onItemClick, onItemDoubleClick }) => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const catalogueUrl = 'https://catalogue.ogsl.ca';
  const baseQuery = 'projects=*baseline*';
  let url = `${catalogueUrl}/api/3/action/package_search?q=${baseQuery}`;


  let done = false;
  // Fetch data from an API
  fetch(url) // Example API
    .then((response) => response.json())
    .then(async (data)  => {
      const awaitRes = await data;
      if(!done){
        done = true;
        setItems(awaitRes.result.results);
      }
    })
    .catch((err) => setError(err.message));

  if (error) return <p>Error: {error}</p>;
  if (!items.length) return <p>Loading...</p>;
    

  return (
    <ul id="sidebar">
      {items.map((item) => (
        <li onClick={() => onItemClick(item)} 
            onDoubleClick={() => onItemDoubleClick(item)} 
            key={item.id}>{item.title}</li> // Dynamically create <li> items
      ))}
    </ul>
  );
};

export default DynamicList;
