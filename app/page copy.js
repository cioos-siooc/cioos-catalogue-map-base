'use client';
import Map from "@/components/Map";
import { useState} from 'react';
import Footer from "@/components/Footer";
import Image from 'next/image';
import DrawerExample from "@/components/RightMenu";
import LeftMenu from "@/components/LeftMenu";
import MapDynamic from "@/components/MapDynamic";


export default function Home() {
  

  const [center] = useState([47.485, -62.48]); // Default center
  const [selectedLeftMenu, setSelectedLeftMenu] = useState('');

  const handleLeftMenuSelect = (param) => {
    setSelectedLeftMenu(param); // Update the selected state with the parameter from Sidebar
  };

  return (
    <div className="relative w-screen gap-16 font-[family-name:var(--font-geist-sans)]">
     
      <main>

        <div className="fixed left-10 z-50"> 
            <LeftMenu onItemClick={handleLeftMenuSelect}/>
        </div>
        
        <div className="relative z-30">
            <Map center={center}/>
            
        </div>
      </main>

    </div>
  );
}
