'use client';

import { useState} from 'react';
import LeftMenu from "@/components/LeftMenu";
import dynamic from "next/dynamic";
import ModalAPropos from "@/components/ModalAPropos";


export default function Home() {
  
  const [center] = useState([47.485, -62.48]); // Default center
  const [bounds, setBounds] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const Map = dynamic(() => import('@/components/Map'), { ssr: false });


  const handleListItemClick = (selectedItem) => {
    setBounds(selectedItem.spatial);
  };

  const onInfoClick = () => {
    console.log("INFO CLICKED");
    setShowModal(true);
};
const handleCloseModal = () => {
    setShowModal(false);
};



  return (
    <div className="gap-16 font-[family-name:var(--font-geist-sans)]">
     
      <main>
        <LeftMenu onInfoClick={onInfoClick} onItemClick={handleListItemClick}/>        
        <div className="md:ml-64">
          <Map center={center} bounds={bounds} />
        </div>
        <div className="z-60 bg-white flex justify-center items-center 
                  w-3xl h-3xl rounded-md border-solid border-black">
            <ModalAPropos show={showModal} onClose={handleCloseModal} />
        </div>

      </main>

    </div>
  );
}
