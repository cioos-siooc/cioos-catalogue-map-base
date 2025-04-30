"use client";

import { useState, useEffect } from "react";
import { Sidebar, TopBanner } from "@/components/LeftMenu";
import dynamic from "next/dynamic";
import ModalAPropos from "@/components/ModalAPropos";
import config from "./config";

export default function Home() {
  const [center] = useState([47.485, -62.48]); // Default center
  const [bounds, setBounds] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [lang, setLang] = useState(config.default_language);
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage");
    const browserLanguage = navigator.language.split("-")[0];
    const initialLanguage =
      savedLanguage || browserLanguage || config.default_language;
    setLang(initialLanguage);
  }, []);

  useEffect(() => {
    localStorage.setItem("preferredLanguage", lang);
  }, [lang]);

  const Map = dynamic(() => import("@/components/Map"), { ssr: false });

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
    <div className="h-screen flex flex-col">
      <header className="md:hidden">
        <TopBanner />
      </header>
      <div className="h-screen flex flex-1">
        <aside className="hidden md:block w-sm h-screen overflow-auto">
          <Sidebar
            onInfoClick={onInfoClick}
            onItemClick={handleListItemClick}
            lang={lang}
            setLang={setLang}
          />
        </aside>
        <main className="z-20 flex-1 h-full w-full">
          <Map center={center} bounds={bounds} />
        </main>
      </div>
    </div>
  );
}
