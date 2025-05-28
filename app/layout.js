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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


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
  }, [lang]);

  // Use callback for fetching data
  const fetchData = useCallback(async () => {
    setLoading(true);
    fetch("/packages.json")
      .then((res) => res.json())
      .then((data) => {
        setAllItems(data);
        setTotalResultsCount(data.length);
        fillOrganizationAndProjectLists(data);
        // Filtering will be handled in badges effect
      })
      .then(() => setLoading(false))
      .catch((error) => console.error("Error loading packages:", error));
  }, [badgeCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // When badges or allItems change, update filteredItems
  useEffect(() => {
    console.log("Option Selected ::: " , selectedDateFilterOption);
    const filtered = filterItemsByBadges(allItems, badges,selectedDateFilterOption);
    setFilteredItems(filtered);
    setFilteredResultsCount(filtered.length);
    //reset selectedDateFilterOption to empty string after filtering
    if (selectedDateFilterOption) {
      setSelectedDateFilterOption("");
    }
  }, [allItems, badges]);

  // Function to process projects and add them to the project list
  const processProjects = (item, projList) => {

    if (item.project && Array.isArray(item.project)) {
      const isAlreadyPresent = item.project.every((project) =>
        projList.has(project),
      );
      if (isAlreadyPresent) {
        return;
      }
      item.project.forEach((project) => projList.add(project));
    }
  };

  // Function to process projects and add them to the project list
  const processEovs = (item, eovList) => {
    if (item.eov && Array.isArray(item.eov)) {
      const isAlreadyPresent = item.eov.every((eov) => eovList.has(eov));
      if (isAlreadyPresent) {
        return;
      }
      item.eov.forEach((eov) => eovList.add(eov));
    }
  };

  // Function to process organization and add it to the organization list
  const processOrganization = (item, orgList, lang) => {
    if (item.organization && item.organization.title_translated) {
      if (orgList.has(item.organization.title_translated[lang])) {
        return;
      }
      orgList.add(item.organization.title_translated[lang]);
    }
  };

  function fetchDataSetInfo(id) {
    fetch(`${catalogueUrl}/api/3/action/package_show?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        setDatasetInfo(data.result);
      })
      .catch((error) => {
        console.error("Error loading dataset info:", error);
      });
  }

  // Function to fill organization and project lists
  const fillOrganizationAndProjectLists = (items) => {
    let orgList = new Set();
    let projList = new Set();
    let eovList = new Set();
    items.forEach((item) => {
      processOrganization(item, orgList, lang);
      processProjects(item, projList);
      processEovs(item, eovList);
    });

    setOrganizationList(Array.from(orgList));
    setProjectList(Array.from(projList));
    setEovList(Array.from(eovList));
    console.log("EOVs List: ", eovList);
  };

  // Import the useDrawer hook to get drawer state and methods
  const { isDrawerOpen, openDrawer } = useDrawer();

  // Memoize callbacks to prevent re-renders
  const handleListItemClick = useCallback(
    (selectedItem) => {
      setBounds(selectedItem.spatial);
      fetchDataSetInfo(selectedItem.id);
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
            filteredResultsCount={filteredResultsCount}
            totalResultsCount={totalResultsCount}
            setBadgeCount={setBadgeCount}
            loading={loading}
            organizationList={organizationList}
            projectList={projectList}
            eovList={eovList}
            badges={badges}
            setBadges={setBadges}
            setSelectedDateFilterOption={setSelectedDateFilterOption}
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
          <Logo
            logos={config.bottom_logo}
            lang={lang}
            default_width={220}
            force_mode={"dark"}
          />
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



function filterItemsByBadges(items, badges, selectedDateFilterOption) {
  if (!items || items.length === 0) return [];
  return items.filter((item) => {
    return Object.entries(badges).every(([filterType, value]) => {
      if (!value) return true;
      if (filterType === "search") {
        const searchVal = value.toLowerCase();
        return (
          (item.title_translated && Object.values(item.title_translated).some((t) => t.toLowerCase().includes(searchVal))) ||
          (item.notes_translated && Object.values(item.notes_translated).some((n) => n.toLowerCase().includes(searchVal)))
        );
      } else if (filterType === "organization") {
        return (
          item.organization &&
          item.organization.title_translated &&
          Object.values(item.organization.title_translated).includes(value)
        );
      } else if (filterType === "projects") {
        return item.project && item.project.includes(value);
      } else if (filterType === "eov") {
        return item.eov && item.eov.includes(value);
      } else if (filterType === "filter_date") {
        return (
          manageDateFilterOptions(item, selectedDateFilterOption, value)
        );
      }
      return true;
    });
  });
}

function manageDateFilterOptions(item, selectedDateFilterOption, value) {
  // Split value on '%20TO%20' to get an array of date strings
  const dateArr = value.split('%20TO%20');

  if(selectedDateFilterOption.startsWith("metadata")) {
    return compareMetadataDates(item, dateArr, selectedDateFilterOption);
  }else if(selectedDateFilterOption.startsWith("temporal")) {
    return compareTemporalDates(item, dateArr, selectedDateFilterOption.split('-')[2]);
  }else{
    console.warn("Unknown date filter option selected:", selectedDateFilterOption);
    return true; // Default to true if no valid option is selected
  }
}

function compareTemporalDates(item, dateArr, varName) {
  // Compare two date strings in 'YYYY-MM-DD' format
  const startDate = dateArr[0] ? new Date(dateArr[0]) : null;
  const endDate = dateArr[1] ? new Date(dateArr[1]) : null;
  if (!item.temporal_extent || !item.temporal_extent[`${varName}`]) return true;
  const itemDate = new Date(item.temporal_extent[`${varName}`]);
  if (startDate && endDate) {
    return itemDate >= startDate && itemDate <= endDate;
  }
  return true;
}
//
function compareMetadataDates(item, dateArr, varName) {

  // Compare two date strings in 'YYYY-MM-DD' format
  const startDate = dateArr[0] ? new Date(dateArr[0]) : null;
  const endDate = dateArr[1] ? new Date(dateArr[1]) : null;
  if (!item[`${varName}`]) return true;
  const itemDate = new Date(item[`${varName}`]);
  if (startDate && endDate) {
    
    let compare = itemDate >= startDate && itemDate <= endDate;
    console.log("COMPARE ::  ", compare);
    console.log("Start date : : ", startDate, " Item date :: ", item[`${varName}`]," End date : : " , endDate);
    return compare;
    
  }
  return true;
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
