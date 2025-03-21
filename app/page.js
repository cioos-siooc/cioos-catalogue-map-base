'use client';
import DynamicList from "@/components/Sidebar";
import Map from "@/components/Map";
import { useState , useRef } from 'react';

 

export default function Home() {

  const [center, setBounds] = useState([47.485, -62.48]); // Default center
  const mapRef = useRef();

  const handleLocationClick = (coords) => {

    const map = mapRef.current;
    console.log(" maps : ", map);
    if (map) {
      map.fitBounds([coords.spatial]);
    }
    
    setBounds(coords.spatial);
  };


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
       
            
        <div id="container"> 
            <div id="records-list" className="sidebar collapsed">
                <DynamicList onLocationClick={handleLocationClick}/>
            </div>

            <div id="map" style={{height: '850', width:'1000'}}>
              <Map center={center}/>
            </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}
