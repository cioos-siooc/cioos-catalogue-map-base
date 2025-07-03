"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import config from "./config.js";
import { DrawerProvider, DrawerContext } from "./context/DrawerContext";
import { useState, useEffect, useCallback, useRef } from "react";
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
    <div className="bg-primary-200 flex h-full w-full items-center justify-center">
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
  const [datasetSpatial, setDatasetSpatial] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const mapRef = useRef();

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

  /* useEffect(() => {
    if (allItems.length > 0) {

      const fragment = window.location.hash.replace(/^#/, "");
      manageURLParametersOnLoad(setBadges);
      if (fragment) {
        const selectedItem = allItems.find((item) => item.id === fragment);
        if (selectedItem) {  
          console.log("SELECT ::: ", selectedItem);
          handleListItemClick(selectedItem);
        }
      }
    }
  }, [allItems]);*/

  // This effect runs on initial load to manage URL parameters and set initial state
  useEffect(() => {
    if (allItems.length > 0) {
      let selectedId = null;
      if (typeof window !== "undefined") {
        manageURLParametersOnLoad(setBadges);
        selectedId = window.location.hash.replace(/^#/, "");
      }
      if (selectedId) {
        const selectedItem = allItems.find((item) => item.id === selectedId);
        if (selectedItem && selectedItem.spatial) {
          setDatasetSpatial(selectedItem.spatial);
          handleListItemClick(selectedItem);
        }
      }
    }
  }, [allItems]);

  // This effect updates the map bounds when datasetSpatial changes
  // It ensures that the map is updated only when the mapRef is ready
  useEffect(() => {
    if (mapRef.current) {
      if (datasetSpatial) {
        if (typeof mapRef.current.updateBounds === "function") {
          mapRef.current.updateBounds(datasetSpatial, setDatasetSpatial);
        }
      }
    }
  }, [mapRef.current]);

  // Import the useDrawer hook to get drawer state and methods
  const { isDrawerOpen, openDrawer, closeDrawer } = useDrawer();
  const prevBadgesLength = useRef(badges ? Object.keys(badges).length : 0);
  // This effect updates the URL only when badges change
  useEffect(() => {
    initURLUpdateProcess(badges, loading);
    const currentLength = badges ? Object.keys(badges).length : 0;
    if (currentLength < prevBadgesLength.current) {
      // Badges list decreased in size, run your logic here
      // Close the drawer each time badges change
      if (isDrawerOpen) {
        closeDrawer();
      }
    }
    prevBadgesLength.current = currentLength;
  }, [badges]);

  useEffect(() => {
    if (eovList.length > 0 && lang) {
      fetchAndFilterEovsTranslated(lang, eovList, setTranslatedEovList);
    }
  }, [lang, eovList, fetchAndFilterEovsTranslated]);

  // Memoize callbacks to prevent re-renders
  const handleListItemClick = useCallback(
    (selectedItem) => {
      setBounds(selectedItem.spatial);
      fetchDataSetInfo(selectedItem.id, setDatasetInfo, catalogueUrl);
      updateURLWithSelectedItem(selectedItem.id);
      openDrawer();
    },
    [openDrawer, catalogueUrl],
  );

  // Add this function to remove the hash fragment from the URL
  function removeURLFragment() {
    console.log("Removing URL fragment");
    if (typeof window !== "undefined" && window.location.hash) {
      history.replaceState(
        null,
        document.title,
        window.location.pathname + window.location.search,
      );
    }
  }

  const prevDrawerOpen = useRef(isDrawerOpen);

  useEffect(() => {
    if (prevDrawerOpen.current && !isDrawerOpen) {
      removeURLFragment();
      // Recenter the map to default center and zoom when drawer closes
      if (
        mapRef.current &&
        typeof mapRef.current.recenterToDefault === "function"
      ) {
        mapRef.current.recenterToDefault();
      }
    }
    // Drawer just closed, recenter map to config center when drawer closes
    if (mapRef.current && typeof mapRef.current.clearMapLayers === "function") {
      mapRef.current.clearMapLayers();
    }
    setBounds(null); // Reset bounds when drawer closes
    prevDrawerOpen.current = isDrawerOpen;
  }, [isDrawerOpen]);

  const onInfoClick = useCallback(() => {
    setShowModal(true);
  }, []);

  return (
    <>
      <div className="relative flex h-screen overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 w-90 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "w-0 -translate-x-full"} z-30`}
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
          className={`relative z-20 flex-1 transform transition-transform duration-300 ease-in-out`}
        >
          <MapComponent
            bounds={bounds}
            filteredItems={filteredItems}
            handleListItemClick={handleListItemClick}
            lang={lang}
            ref={mapRef}
          />
        </main>
        {isDrawerOpen && dataSetInfo && (
          <DatasetDetails dataSetInfo={dataSetInfo} lang={lang} />
        )}
        <div className="bg-primary-50 dark:bg-primary-800 absolute bottom-0 left-0 z-25 flex w-90 items-center justify-center rounded-tr-xl pt-2 opacity-50">
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
  const meta = config.metadata?.[lang] || {};
  const favicon = config.favicon || "/favicon.ico";

  return (
    <html lang={lang}>
      <head>
        <title>{meta.title || "OGSL Catalogue Map"}</title>
        {meta.description && (
          <meta name="description" content={meta.description} />
        )}
        <link rel="icon" href={favicon} />
      </head>
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
