"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import config from "./config.js";
import { DrawerProvider, DrawerContext } from "./context/DrawerContext";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Sidebar, TopBanner } from "@/components/LeftMenu";
import { DatasetDetails } from "@/components/DatasetDetails";
import Logo from "@/components/Logo";
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

// Import map with dynamic import (no ssr) and memoization
const MapComponent = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-200">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

// Create a component that uses the drawer context
function AppContent() {
  // State management with stable references
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

  const catalogueUrl = config.catalogue_url;
  let urlCustomSearch = `${catalogueUrl}/api/3/action/package_search?q=`;

  // Memoize the fetch URL to avoid recalculation
  const fetchURL = useMemo(() => {
    let url = `${urlCustomSearch}${config.base_query}`;
    if (fetchURLFilter) {
      url += `%20AND%20${fetchURLFilter}`;
    }
    return url + `&rows=1000`;
  }, [urlCustomSearch, fetchURLFilter]);

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

  // Use callback for fetching data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(fetchURL);
      if (!response.ok) {
        throw new Error("There was an error fetching the data from CKAN API");
      }
      const awaitRes = await response.json();

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
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [fetchURL, fetchURLFilter, badgeCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Import the useDrawer hook to get drawer state and methods
  const { isDrawerOpen, openDrawer } = useDrawer();

  // Memoize callbacks to prevent re-renders
  const handleListItemClick = useCallback(
    (selectedItem) => {
      setBounds(selectedItem.spatial);
      setDatasetInfo(selectedItem);
      openDrawer();
    },
    [openDrawer],
  );

  const onInfoClick = useCallback(() => {
    setShowModal(true);
  }, []);

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
          <MapComponent
            bounds={bounds}
            filteredItems={filteredItems}
            handleListItemClick={handleListItemClick}
            lang={lang}
          />
        </main>
        {isDrawerOpen && dataSetInfo && (
          <DatasetDetails dataSetInfo={dataSetInfo} lang={lang} />
        )}
        <div className="absolute bottom-0 right-0 z-60 flex items-center justify-center pb-10 pr-4 md:hidden">
          <Logo logos={config.bottom_logo} lang={lang} default_width={220} />
        </div>
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

function RootLayout({ children }) {
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

export default RootLayout;
