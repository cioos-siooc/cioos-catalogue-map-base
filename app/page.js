'use client';

import Map from "@/components/Map";
import { useState} from 'react';
import Footer from "@/components/Footer";
import Image from 'next/image';
import DrawerExample from "@/components/Drawer";


export default function Home() {
  

  const [center] = useState([47.485, -62.48]); // Default center

  return (
    <div className="relative w-screen gap-16 font-[family-name:var(--font-geist-sans)]">
     
      <main>
        <div className="fixed top-0 right-0 z-60">
             <DrawerExample/>
        </div>
        <div className="relative z-30">
            <Map center={center}/>
        </div>

        <div className="fixed bottom-20 w-full z-50">	
          <Footer />
        </div>
      </main>

    </div>
  );
}
