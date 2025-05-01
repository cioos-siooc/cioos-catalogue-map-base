"use client";

import { useState, useContext, useEffect} from "react";
import { Sidebar, TopBanner } from "@/components/LeftMenu";
import { DatasetDetails } from "@/components/DatasetDetails";
import { DrawerContext } from "../app/context/DrawerContext";

import dynamic from "next/dynamic";
import config from "./config";


export default function Home() {
  const [center] = useState([47.485, -62.48]); // Default center
  const [bounds, setBounds] = useState(null);
  const [lang, setLang] = useState(config.default_language);

  const[dataSetInfo, setDatasetInfo] = useState(null);
  const {isDrawerOpen, closeDrawer} = useContext(DrawerContext);
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
    setDatasetInfo(selectedItem);
  };

  const onInfoClick = () => {
    console.log("INFO CLICKED");
    setShowModal(true);
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
            <Map center={center} bounds={bounds}/>
          </main>

          {isDrawerOpen && dataSetInfo && <DatasetDetails dataSetInfo={dataSetInfo} lang={lang}/>}
        </div>
      </div>
  );
}
