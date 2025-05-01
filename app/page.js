"use client";

import { useState, useContext, useEffect, useRef } from "react";
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

  const [filteredItems, setFilteredItems] = useState([]);
  const [fetchURLFilter, setFetchURLFilter] = useState("");
  const [totalResultsCount, setTotalResultsCount] = useState(0);
  const [filteredResultsCount, setFilteredResultsCount] = useState(0);
  const [inputValue, setInputValue] = useState("");

  const catalogueUrl = config.catalogue_url;
  let urlCustomSearch = `${catalogueUrl}/api/3/action/package_search?q=`;


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


  useEffect(() => {
    const fetchData = async () => {
      // Fetch data from an API
      try {

        let url = `${urlCustomSearch}${config.base_query}`;
        console.log("FETCH :: ", fetchURLFilter);
        if (fetchURLFilter) {
          url += `%20AND%20${fetchURLFilter}`
        }
        url += `&rows=1000`;
        console.log("URL :: " + url);
        const response = await fetch(url); // Example API
        const awaitRes = await response.json();
        setFilteredItems(awaitRes.result.results);
        setInputValue(""); // Clear input value after fetching data
        if(fetchURLFilter) {
          setFilteredResultsCount(awaitRes.result.results.length);
        }else{
          setTotalResultsCount(awaitRes.result.results.length);
        }
      } catch (error) {
        setError(error.message);
      }
      console.log("filtered count :: ", filteredItems.length);
    };
    fetchData();
  }, [fetchURLFilter]);

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
        <TopBanner lang={lang} />
        </header>
        <div className="h-screen flex flex-1">
          <aside className="hidden md:block w-sm h-screen overflow-auto">
            <Sidebar
              filteredItems={filteredItems}
              onInfoClick={onInfoClick}
              onItemClick={handleListItemClick}
              lang={lang}
              setLang={setLang}
              setFetchURLFilter={setFetchURLFilter}
              filteredResultsCount ={filteredResultsCount}
              totalResultsCount ={totalResultsCount}
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
