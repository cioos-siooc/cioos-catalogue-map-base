'use client';

import Map from "@/components/Map";
import { useState} from 'react';


 

export default function Home() {

  const [center] = useState([47.485, -62.48]); // Default center

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">

      </header>
      
      <main className="flex flex-col gap-[16px] row-start-2 items-center sm:items-start">
       
        <div id="map" style={{height: '850', width:'1000'}}>
            <Map center={center}/>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}
