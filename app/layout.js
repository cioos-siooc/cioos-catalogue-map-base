"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import config from "./config.js";
import { DrawerProvider, DrawerContext } from "./context/DrawerContext";
import { useState, useEffect } from "react";
import { Sidebar, TopBanner } from "@/components/LeftMenu";
import { DatasetDetails } from "@/components/DatasetDetails";
import dynamic from "next/dynamic";
import React from "react";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadata = config.metadata.fr;

// Create a component that uses the drawer context
function AppContent() {
  const [bounds, setBounds] = useState(null);
  const [lang, setLang] = useState(config.default_language);
  const [loading, setLoading] = useState(true);
  const [dataSetInfo, setDatasetInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [fetchURLFilter, setFetchURLFilter] = useState("");
  const [totalResultsCount, setTotalResultsCount] = useState(0);
  const [filteredResultsCount, setFilteredResultsCount] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  const [inputValue, setInputValue] = useState("");

  const Map = dynamic(() => import("@/components/Map"), { ssr: false });

  const catalogueUrl = config.catalogue_url;
  let urlCustomSearch = `${catalogueUrl}/api/3/action/package_search?q=`;

  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage");
    const browserLanguage = navigator.language?.split("-")[0];
    const initialLanguage =
      savedLanguage || browserLanguage || config.default_language;
    setLang(initialLanguage);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("preferredLanguage", lang);
    }
  }, [lang]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(initFetchURL());
        if (!response.ok) {
          throw new Error("There was an error fetching the data from CKAN API");
        }
        const awaitRes = await response.json();
        initFetchResults(awaitRes);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fetchURLFilter]);

  function initFetchResults(awaitRes) {
    setFilteredItems(awaitRes.result.results);
    setInputValue("");
    if (fetchURLFilter) {
      setFilteredResultsCount(awaitRes.result.results.length);
    } else {
      setTotalResultsCount(awaitRes.result.results.length);
    }
    if (badgeCount === 0) {
      setFilteredResultsCount(0);
    }
  }

  function initFetchURL() {
    let url = `${urlCustomSearch}${config.base_query}`;
    if (fetchURLFilter) {
      url += `%20AND%20${fetchURLFilter}`;
    }
    return url + `&rows=1000`;
  }

  // Import the useDrawer hook to get drawer state and methods
  const { isDrawerOpen, openDrawer } = useDrawer();

  const handleListItemClick = (selectedItem) => {
    setBounds(selectedItem.spatial);
    setDatasetInfo(selectedItem);
    openDrawer();
  };

  const onInfoClick = () => {
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
            filteredResultsCount={filteredResultsCount}
            totalResultsCount={totalResultsCount}
            setBadgeCount={setBadgeCount}
            loading={loading}
          />
        </aside>
        <main className="z-20 flex-1 h-full w-full">
          <Map
            bounds={bounds}
            filteredItems={filteredItems}
            handleListItemClick={handleListItemClick}
            lang={lang}
          />
        </main>
        {isDrawerOpen && dataSetInfo && (
          <DatasetDetails dataSetInfo={dataSetInfo} lang={lang} />
        )}
      </div>
    </div>
  );
}

// Add the missing useDrawer hook
function useDrawer() {
  const context = React.useContext(DrawerContext);
  if (context === undefined) {
    throw new Error("useDrawer must be used within a DrawerProvider");
  }
  return context;
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DrawerProvider>
          <AppContent />
          {children}
        </DrawerProvider>
      </body>
    </html>
  );
}
