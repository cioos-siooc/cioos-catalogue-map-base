'use client';

import { useState} from 'react';
import { LeftMenu, TopBanner } from "@/components/LeftMenu";
import dynamic from "next/dynamic";


export default function Home() {
  
  const [center] = useState([47.485, -62.48]); // Default center
  const [bounds, setBounds] = useState(null);

    const Map = dynamic(() => import('@/components/Map'), { ssr: false });


  const handleListItemClick = (selectedItem) => {
    setBounds(selectedItem.spatial);
  };


  return (
    <div className="h-screen flex flex-col">
      <header className="md:hidden">
        <TopBanner />
      </header>
      <div className="h-screen flex flex-1">
        <aside className="hidden md:block w-sm h-screen overflow-auto">
          <LeftMenu onItemClick={handleListItemClick} />
        </aside>
        <main className="flex-1 h-full w-full">
          <Map center={center} bounds={bounds} />
        </main>
      </div>
    </div>
  );
}
