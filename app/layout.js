"use client";

import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  const [translatedEovList, setTranslatedEovList] = useState([]);
  const [datasetSpatial, setDatasetSpatial] = useState(null);
  const [hexCellFilter, setHexCellFilter] = useState(null); // Store current hex cell filter
  const [hexCellDatasets, setHexCellDatasets] = useState([]); // Store datasets in selected hex cell
  const [filterOpen, setFilterOpen] = useState(false);
  const [aboutPageIndex, setAboutPageIndex] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const mapRef = useRef();
  const { isDrawerOpen, openDrawer, closeDrawer } = useDrawer();
  const hasSidebarInitialized = useRef(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage");
    const browserLanguage = navigator.language?.split("-")[0];
    const initialLanguage =
      savedLanguage || browserLanguage || config.default_language;
    setLang(initialLanguage);
  }, [setLang]);

  // Open sidebar on large screens on initial load
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        const isLargeScreen = window.innerWidth >= 1024; // lg breakpoint
        setIsSidebarOpen(isLargeScreen);
      }
    };

    // Set initial state on mount
    handleResize();

    // Add resize listener to handle window resize
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
  }, [allItems, lang]);

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
  }, [lang]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open sidebar on large screens immediately after mount
  useEffect(() => {
    if (!hasSidebarInitialized.current) {
      hasSidebarInitialized.current = true;
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    }
  }, []);

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
  }, [allItems, badges, selectedDateFilterOption]);

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

  // Memoize callbacks to prevent re-renders
  const handleListItemClick = useCallback(
    (selectedItem) => {
      setBounds(selectedItem.spatial);
      // Use dataset name for static cache lookup
      fetchDataSetInfo(selectedItem.name || selectedItem.id, setDatasetInfo);
      updateURLWithSelectedItem(selectedItem.id);
      openDrawer();
    },
    [openDrawer],
  );

  // Handle hex cell click to filter datasets
  const handleHexCellFiltered = useCallback((cellId, datasetsInCell) => {
    // Store hex cell filter and datasets in state
    setHexCellFilter(cellId);
    setHexCellDatasets(datasetsInCell);

    // Add hex cell filter to badges
    // This will trigger the badge filtering logic
    // datasetsInCell is already an array of dataset IDs (strings)
    setBadges((prevBadges) => ({
      ...prevBadges,
      hexCell: {
        cellId,
        count: datasetsInCell.length,
        datasetIds: datasetsInCell, // Already an array of IDs
      },
    }));
  }, []);

  // Clear hex cell filter when hexCell badge is removed
  useEffect(() => {
    if (!badges?.hexCell) {
      setHexCellFilter(null);
      setHexCellDatasets([]);
    }
  }, [badges]);

  // This effect runs on initial load to manage URL parameters and set initial state
  useEffect(() => {
    if (allItems.length > 0) {
      const loadURLParameters = async () => {
        let selectedId = null;
        if (typeof window !== "undefined") {
          // Pass both setBadges and setVisualizationMode to handle URL parameters
          const setVisualizationMode = mapRef.current?.setVisualizationMode;
          await manageURLParametersOnLoad(setBadges, setVisualizationMode);
          selectedId = window.location.hash.replace(/^#/, "");
        }
        console.log(
          "All items loaded, managing URL parameters NON ::: ",
          selectedId,
        );
        if (selectedId) {
          const selectedItem = allItems.find((item) => item.id === selectedId);
          if (selectedItem && selectedItem.spatial) {
            setDatasetSpatial(selectedItem.spatial);
            handleListItemClick(selectedItem);
          }
        }
      };
      loadURLParameters();
    }
  }, [allItems, handleListItemClick]);

  // This effect updates the map bounds when datasetSpatial changes
  // It ensures that the map is updated only when the mapRef is ready
  useEffect(() => {
    if (mapRef.current) {
      console.log("Updating map bounds with datasetSpatial:", datasetSpatial);
      // Check if datasetSpatial is defined and has valid bounds
      if (datasetSpatial) {
        if (typeof mapRef.current.updateBounds === "function") {
          mapRef.current.updateBounds(datasetSpatial, setDatasetSpatial);
        }
      }
    }
  }, [datasetSpatial]);

  // Import the useDrawer hook to get drawer state and methods

  const prevBadgesLength = useRef(badges ? Object.keys(badges).length : 0);
  // This effect updates the URL only when badges change
  useEffect(() => {
    console.log("Badges changed, updating URL and checking drawer state");
    initURLUpdateProcess(badges, loading);
    const currentLength = badges ? Object.keys(badges).length : 0;
    if (currentLength < prevBadgesLength.current) {
      // Badges list decreased in size, run your logic here
      // Close the drawer each time badges change
      console.log("Badges list decreased, closing drawer if open");
      if (isDrawerOpen) {
        closeDrawer();
      }
    }
    prevBadgesLength.current = currentLength;
  }, [badges, loading, isDrawerOpen, closeDrawer]);

  useEffect(() => {
    if (eovList.length > 0 && lang) {
      fetchAndFilterEovsTranslated(lang, eovList, setTranslatedEovList);
    }
  }, [lang, eovList, fetchAndFilterEovsTranslated]);

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
    console.log("Drawer state changed:", isDrawerOpen);
    // We only want to perform cleanup when transitioning from open -> closed
    if (prevDrawerOpen.current && !isDrawerOpen) {
      // Remove the hash fragment so deep-link is cleared when user dismisses details
      removeURLFragment();

      // Clear any polygon / geojson highlight layers we drew, but DO NOT recenter the map
      if (
        mapRef.current &&
        typeof mapRef.current.clearMapLayers === "function"
      ) {
        mapRef.current.clearMapLayers();
      }

      // Reset bounds so that selecting the same dataset again will still trigger FitBounds
      setBounds(null);
    }
    // Update previous state ref AFTER handling logic
    prevDrawerOpen.current = isDrawerOpen;
  }, [isDrawerOpen]);

  const onInfoClick = useCallback(() => {
    setShowModal(true);
  }, []);

  return (
    <>
      <div className="relative flex h-dvh flex-col overflow-hidden lg:flex-row">
        {/* Top Banner - Above map on mobile, inside sidebar on desktop */}
        <div className="bg-primary-50 dark:bg-primary-800 z-35 order-1 w-full lg:hidden">
          <TopBanner
            lang={lang}
            setLang={setLang}
            toggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
            onFilterClick={() => setFilterOpen(!filterOpen)}
            onAboutClick={() => setAboutPageIndex(0)}
          />
        </div>

        {/* Sidebar */}
        <div
          className={`absolute inset-y-0 left-0 overflow-hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-full translate-x-0 lg:w-90" : "w-full -translate-x-full lg:w-90 lg:-translate-x-90"} z-30`}
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
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            aboutPageIndex={aboutPageIndex}
            setAboutPageIndex={setAboutPageIndex}
          />
        </div>

        {/* Top Banner - Desktop only - shown when sidebar is closed */}
        <div className="bg-primary-50 dark:bg-primary-800 absolute top-0 left-0 z-40 mt-2 hidden w-90 rounded-r-3xl lg:block">
          <TopBanner
            lang={lang}
            setLang={setLang}
            toggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
            onFilterClick={() => setFilterOpen(!filterOpen)}
            onAboutClick={() => setAboutPageIndex(0)}
          />
        </div>

        {/* Main content area */}
        <main className={`relative z-20 order-2 w-full flex-1 lg:order-3`}>
          <MapComponent
            bounds={bounds}
            filteredItems={filteredItems}
            allItems={allItems}
            handleListItemClick={handleListItemClick}
            onHexCellFiltered={handleHexCellFiltered}
            selectedHexCellId={hexCellFilter}
            lang={lang}
            ref={mapRef}
          />
        </main>
        {isDrawerOpen && dataSetInfo && (
          <DatasetDetails dataSetInfo={dataSetInfo} lang={lang} />
        )}
        <div className="justify-left absolute bottom-0 left-0 z-25 ml-2 flex w-90 items-center pt-2">
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

  return (
    <html lang={lang}>
      <head>
        <title>{meta.title || "OGSL Catalogue Map"}</title>
        {meta.description && (
          <meta name="description" content={meta.description} />
        )}
        {/* Plausible Analytics */}
        <Script
          strategy="lazyOnload"
          defer
          data-domain="cioos-catalogue-map.cioos.ca"
          src="https://plausible.cioos.ca/js/script.hash.outbound-links.js"
        />
        <Script id="plausible-init" strategy="lazyOnload">
          {`window.plausible = window.plausible || function(){ (window.plausible.q = window.plausible.q || []).push(arguments) }`}
        </Script>
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
