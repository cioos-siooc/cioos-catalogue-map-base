'use client';

import Map from "@/components/Map";
import { useState} from 'react';
import Footer from "@/components/Footer";

export default function Home() {
  

  const [center] = useState([47.485, -62.48]); // Default center

  return (
    <div className="h-full items-center justify-items-center gap-16 font-[family-name:var(--font-geist-sans)]">
      <header id="header" className="relative grid text-white bg-[#00adef] w-full p-5 top=0 gap-[12px] flex-wrap">
        <h1 className="text-[32px] font-bold text-left">OGSL Map</h1>
        <div>
          <p className="place-content-center justify-center text-center text-[24px]" >Catalogue cartographique</p>
        </div>

      </header>
      
      <main className="relative"> 
       
        <div className="absolute inset-0 z-40">
            <Map center={center}/>
        </div>

        <div className="fixed bottom-20 w-full z-50">	
          <Footer />
        </div>
      </main>




    </div>
  );
}
