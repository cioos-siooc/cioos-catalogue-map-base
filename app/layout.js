"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import config from "./config.js";
import { DrawerProvider, DrawerContext } from "./context/DrawerContext";
import { useState, useEffect, useCallback } from "react";
import { Sidebar, TopBanner } from "@/components/LeftMenu";
import { DatasetDetails } from "@/components/DatasetDetails";
import Logo from "@/components/Logo";
import dynamic from "next/dynamic";
import React from "react";
import {
  manageURLParametersOnLoad,
  updateURLWithSelectedItem,
  initURLUpdateProcess,
} from "@/components/UrlParametrization";
import {
  filterItemsByBadges,
  fetchAndFilterEovsTranslated,
} from "@/components/FilterManagement";
import {
  fillOrganizationAndProjectLists,
  fetchDataSetInfo,
} from "@/components/FetchItemsListManagement";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const basePath = process.env.BASE_PATH || "";

// Import map with dynamic import (no ssr) and memoization
const MapComponent = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-primary-200">
      <p className="text-primary-500">Loading map...</p>
    </div>
  ),
});

// Create a component that uses the drawer context
function AppContent({ lang, setLang }) {
  // State management with stable references
  const [bounds, setBounds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataSetInfo, setDatasetInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [organizationList, setOrganizationList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [eovList, setEovList] = useState([]);
  const [totalResultsCount, setTotalResultsCount] = useState(0);
  const [filteredResultsCount, setFilteredResultsCount] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  const [allItems, setAllItems] = useState([]); // Store the full list
  const [badges, setBadges] = useState({}); // Store current filters
  const [selectedDateFilterOption, setSelectedDateFilterOption] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [translatedEovList, setTranslatedEovList] = useState([]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // if window is greater than 600px, set isSidebarOpen to true
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth > 600) {
      setIsSidebarOpen(true);
    }
  }, []);

  const catalogueUrl = config.catalogue_url;

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
    if (allItems.length > 0) {
      fillOrganizationAndProjectLists(
        allItems,
        setOrganizationList,
        setProjectList,
        setEovList,
        lang,
      );
    }
  }, [lang]);

  // Use callback for fetching data
  const fetchData = useCallback(async () => {
    setLoading(true);
    fetch(basePath + "/packages.json")
      .then((res) => res.json())
      .then((data) => {
        setAllItems(data);
        setTotalResultsCount(data.length);
        fillOrganizationAndProjectLists(
          data,
          setOrganizationList,
          setProjectList,
          setEovList,
          lang,
        );
        // Filtering will be handled in badges effect
      })
      .then(() => setLoading(false))
      .catch((error) => console.error("Error loading packages:", error));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // When badges or allItems change, update filteredItems
  useEffect(() => {
    const filtered = filterItemsByBadges(
      allItems,
      badges,
      selectedDateFilterOption,
    );

    setFilteredItems(filtered);
    setFilteredResultsCount(filtered.length);

    //reset selectedDateFilterOption to empty string after filtering
    if (selectedDateFilterOption) {
      setSelectedDateFilterOption("");
    }
  }, [allItems, badges]);

  // Fonction pour charger et filtrer les EOVs traduits
  const fetchAndFilterEovsTranslated = useCallback(async (lang, eovList) => {
    const res = await fetch(basePath + "/eovs.json");
    const data = await res.json();
    const eovs = data.eovs;

    const labelkey = `label_${lang}`;
    const filtered = eovs
      .filter((eov) => eovList.includes(eov.value)) // comparez par value qui correspond à l'identifiant de l'EOV
      .map((eov) => [eov.value, eov[labelkey]]);

    setTranslatedEovList(filtered);
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      Array.isArray(allItems) &&
      allItems.length > 0
    ) {
      const fragment = window.location.hash.replace(/^#/, "");
      manageURLParametersOnLoad(setBadges);
      if (fragment) {
        const selectedItem = allItems.find((item) => item.id === fragment);
        if (selectedItem) {
          setBounds(selectedItem.spatial);
          fetchDataSetInfo(selectedItem.id, setDatasetInfo, catalogueUrl);
          updateURLWithSelectedItem(selectedItem.id);
          openDrawer();
        }
      }
    }
  }, [allItems]);

  // This effect updates the URL only when badges change
  useEffect(() => {
    initURLUpdateProcess(badges);
  }, [badges]);

  useEffect(() => {
    if (eovList.length > 0 && lang) {
      fetchAndFilterEovsTranslated(lang, eovList, setTranslatedEovList);
    }
  }, [lang, eovList, fetchAndFilterEovsTranslated]);

  // Import the useDrawer hook to get drawer state and methods
  const { isDrawerOpen, openDrawer } = useDrawer();

  // Memoize callbacks to prevent re-renders
  const handleListItemClick = useCallback(
    (selectedItem) => {
      setBounds(selectedItem.spatial);
      fetchDataSetInfo(selectedItem.id, setDatasetInfo, catalogueUrl);
      updateURLWithSelectedItem(selectedItem.id);
      openDrawer();

      console.log("URL UPDATED HASH : ", window.location.hash);
    },
    [openDrawer],
  );

  const onInfoClick = useCallback(() => {
    setShowModal(true);
  }, []);

  return (
    <>
      <div className="flex h-screen relative overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 w-90 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full w-0"} z-30`}
        >
          <Sidebar
            filteredItems={filteredItems}
            onInfoClick={onInfoClick}
            onItemClick={handleListItemClick}
            lang={lang}
            setLang={setLang}
            filteredResultsCount={filteredResultsCount}
            totalResultsCount={totalResultsCount}
            setBadgeCount={setBadgeCount}
            loading={loading}
            organizationList={organizationList}
            projectList={projectList}
            eovList={translatedEovList}
            badges={badges}
            setBadges={setBadges}
            setSelectedDateFilterOption={setSelectedDateFilterOption}
            toggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
          />
        </div>
        <div className="absolute top-0 left-0 z-35">
          <TopBanner
            lang={lang}
            setLang={setLang}
            toggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
          />
        </div>
        <main
          className={`flex-1 relative transform transition-transform duration-300 ease-in-out z-20`}
        >
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
        <div className="max-sm:mb-8 absolute bottom-0 left-0 z-25 flex items-center w-90 bg-primary-50 dark:bg-primary-800 pt-2 justify-center rounded-tr-xl opacity-50">
          <Logo logos={config.bottom_logo} lang={lang} default_width={220} />
        </div>
      </div>
    </>
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
  const [lang, setLang] = useState(config.default_language);

  return (
    <html lang={lang}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DrawerProvider>
          <AppContent lang={lang} setLang={setLang} />
          {children}
        </DrawerProvider>
      </body>
    </html>
  );
}

export default RootLayout;
