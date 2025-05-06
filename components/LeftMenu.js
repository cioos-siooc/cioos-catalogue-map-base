"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ItemsList from "@/components/ItemsList";
import Image from "next/image";
import ModalAPropos from "@/components/ModalAPropos";
import config from "@/app/config.js";
import { getLocale } from "@/app/get-locale.js";
import FilterSection from "./FilterSection";

const basePath = process.env.BASE_PATH || "";

export function Sidebar({
  filteredItems,
  onInfoClick,
  onItemClick,
  lang,
  setLang,
  setFetchURLFilter,
  filteredResultsCount,
  totalResultsCount,
  setBadgeCount,
  loading,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [badges, setBadges] = useState([]);

  const t = getLocale(lang);

  const ProgressBar = dynamic(() => import("./ProgressBar"), { ssr: false });

  const opposite_lang = lang === "en" ? "fr" : "en";
  const toggleLanguage = () => {
    setLang(lang === "en" ? "fr" : "en");
  };

  const toggleSidebar = () => {
    console.log("Toggle Sidebar :: " + isSidebarOpen);
    setIsSidebarOpen(!isSidebarOpen);
  };

  const onLeftMenuItemClick = (selectedItem) => {
    onItemClick(selectedItem);
  };

  const onLeftMenuItemDoubleClick = (selectedItem) => {
    window.open(`${catalogueUrl}/dataset/${selectedItem.name}`);
  };

  const generateQueryString = (badges) => {
    return Object.entries(badges)
      .map(([filterType, value]) =>
        filterType === "search" ? `${value}` : `${filterType}=${value}`,
      )
      .join("%20AND%20");
  };

  // Trigger reharvest when badges change
  useEffect(() => {
    const queryString = generateQueryString(badges);
    console.log("Query Stringgggggg :: " + queryString);
    setFetchURLFilter(`${queryString}`);
    setBadgeCount(Object.keys(badges).length);
  }, [badges, setBadgeCount, setFetchURLFilter]); // Re-run whenever badges change

  return (
    <div id="sidebar">
      <aside
        id="logo-sidebar"
        className={`fixed top-0 left-0 z-40 w-sm h-screen transition-transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 bg-gray-50 dark:bg-gray-800 flex flex-col">
          <div className="flex items-center justify-between ps-2.5 mb-5">
            <div>
              <Image
                src={`${basePath}${config.logos.main_light}`}
                className="h-auto dark:hidden"
                alt="OGSL Logo"
                height={0}
                width={120}
              />
              <Image
                src={`${basePath}${config.logos.main_dark}`}
                className="h-auto hidden dark:block"
                alt="OGSL Logo"
                height={0}
                width={129}
              />
              <span className="mt-3 self-center text-xl font-semibold whitespace-nowra">
                {config.title[lang]}
              </span>
            </div>
            <button
              className="p-1 uppercase cursor-pointer"
              id="headerTranslation"
              onClick={toggleLanguage}
            >
              {opposite_lang}
            </button>
            <button
              onClick={toggleSidebar}
              className="flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="logo-sidebar"
              data-drawer-toggle="logo-sidebar"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <FilterSection lang={lang} badges={badges} setBadges={setBadges} />

          <span className="pt-4 border-t border-t-gray-200 dark:border-t-gray-700">
            {t.datasets}
          </span>
          <ul className="flex-grow overflow-y-auto pt-1 mt-1 space-y-2 rounded-md">
            <ItemsList
              itemsList={filteredItems}
              onItemClick={onLeftMenuItemClick}
              onItemDoubleClick={onLeftMenuItemDoubleClick}
              lang={lang}
              loading={loading}
            />
          </ul>
          <div className="pt-3 text-sm font-medium text-gray-900 dark:text-white">
            <ProgressBar
              count={filteredResultsCount}
              total={totalResultsCount}
            />
          </div>
          <ModalAPropos />
        </div>
      </aside>
    </div>
  );
}

export const TopBanner = ({ lang }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const t = getLocale(lang);
  return (
    <button
      id="sidebar-toggle"
      data-drawer-target="logo-sidebar"
      data-drawer-toggle="logo-sidebar"
      aria-controls="logo-sidebar"
      type="button"
      onClick={toggleSidebar}
      className="w-screen flex justify-between items-center p-2 text-sm bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
    >
      <div className="flex items-center ps-2.5">
        <a className="me-3">
          <Image
            src={`${basePath}${config.logos.main_light}`}
            className="h-auto dark:hidden"
            alt="OGSL Logo"
            height={0}
            width={120}
          />
          <Image
            src={`${basePath}${config.logos.main_dark}`}
            className="h-auto hidden dark:block"
            alt="OGSL Logo"
            height={0}
            width={129}
          />
          <span className="self-center text-xl font-semibold whitespace-nowrap">
            {config.title[lang]}
          </span>
        </a>
        <span className="sr-only">{t.open_sidebar}</span>
      </div>
      <svg
        className="w-6 h-6"
        aria-hidden="true"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clipRule="evenodd"
          fillRule="evenodd"
          d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
        ></path>
      </svg>
    </button>
  );
};
