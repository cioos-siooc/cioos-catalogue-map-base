'use client';

import { useState} from 'react';
import LeftMenu from "@/components/LeftMenu";
import dynamic from "next/dynamic";


export default function Home() {
  
  const [center] = useState([47.485, -62.48]); // Default center
  const [bounds, setBounds] = useState(null);

    const Map = dynamic(() => import('@/components/Map'), { ssr: false });


  const handleListItemClick = (selectedItem) => {
    setBounds(selectedItem.spatial);
  };


  return (
    <div className="relative w-screen gap-16 font-[family-name:var(--font-geist-sans)]">
     
      <main>
        <LeftMenu onItemClick={handleListItemClick}/>        
        <div className="md:ml-64">
          <Map center={center} bounds={bounds} />
        </div>
      </main>

    </div>
  );
}
