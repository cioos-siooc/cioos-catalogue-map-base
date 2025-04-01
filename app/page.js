'use client';

import Map from "@/components/Map";
import { useState} from 'react';
import Footer from "@/components/Footer";
import Image from 'next/image';
import DrawerExample from "@/components/Drawer";


export default function Home() {
  

  const [center] = useState([47.485, -62.48]); // Default center

  return (
    <div className="gap-16 font-[family-name:var(--font-geist-sans)]">
      <header id="header" className="relative grid grid-cols-3 text-white bg-[#00adef] w-full pt-5 top=0 gap-[12px]">
        <div className="col-span-1">
          <a id="headerImg" href="//ogsl.ca">
            <img id="headerimgsrc" className="pl-10 pt-5" src="components/Images/OGSL_NoTag_White.png"/>
            <Image 
              src="/components/Images/OGSL_NoTag_White.png" // Replace with your image path
              alt="" 
              width={48} 
              height={48} 
              className="rounded-full"
            />
          </a>
        </div>

        <div className="col-span-1 col-start-2" >
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
