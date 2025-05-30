"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ItemsList from "@/components/ItemsList";
import ModalAPropos from "@/components/ModalAPropos";
import config from "@/app/config.js";
import { getLocale } from "@/app/get-locale.js";
import FilterSection from "./FilterSection";
import Logo from "./Logo";
import { TfiMenu } from "react-icons/tfi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

const basePath = process.env.BASE_PATH || "";

const Title = ({ lang, setLang }) => {
  const opposite_lang = lang === "en" ? "fr" : "en";
  const toggleLanguage = () => {
    setLang(lang === "en" ? "fr" : "en");
  };

  return (
    <div className="flex flex-row w-full justify-between">
      <div className="flex-col">
        <Logo logos={config.main_logo} lang={lang} default_width={120} />
        <span className="pt-3 text-xl font-semibold">{config.title[lang]}</span>
      </div>

      <button
        className="p-1 uppercase cursor-pointer"
        id="headerTranslation"
        onClick={toggleLanguage}
      >
        {opposite_lang}
      </button>
    </div>
  );
};

export const TopBanner = ({ lang, setLang, toggleSidebar, isSidebarOpen }) => {
  const t = getLocale(lang);
  return (
    <div className="w-90 my-1 pt-1  bg-primary-50 dark:bg-primary-800 rounded-r-3xl">
      <div className="flex items-center px-2 py-1">
        <Title lang={lang} setLang={setLang} />
      </div>
      <button
        type="button"
        onClick={toggleSidebar}
        className="flex w-full pt-1 pb-2 items-center justify-center text-lg hover:bg-primary-100  dark:hover:bg-primary-700 gap-2 hover:rounded-br-3xl"
      >
        <span className="sr-only">{t.open_sidebar}</span>
        <TfiMenu />
        <div>Menu</div>
        {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
      </button>
    </div>
  );
};

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
  organizationList,
  projectList,
  eovList,
  toggleSidebar,
  isSidebarOpen,
}) {
  const [badges, setBadges] = useState([]);
  const [selectedDateFilterOption, setSelectedDateFilterOption] = useState("");

  const t = getLocale(lang);

  const ProgressBar = dynamic(() => import("./ProgressBar"), { ssr: false });

  const onLeftMenuItemClick = (selectedItem) => {
    onItemClick(selectedItem);
  };

  const onLeftMenuItemDoubleClick = (selectedItem) => {
    window.open(`${catalogueUrl}/dataset/${selectedItem.name}`);
  };

  const generateQueryString = (badges) => {
    let queryString = "";
    console.log("Query first badges :: ", Object.keys(badges).length);
    queryString += Object.entries(badges)
      .map(([filterType, value]) => buildFilterString(filterType, value))
      .join("");
    console.log("Query second :: ", queryString);
    if (Object.keys(badges).length > 1) {
      queryString += "%20AND%20";
    }

    // check if there is a Date filter
    if (selectedDateFilterOption) {
      let dateFilters = buildDateFiltersString(
        badges,
        selectedDateFilterOption,
      );
      console.log("Date Filters :: ", dateFilters);
      queryString += dateFilters;
    }
    console.log("Query Final Filters :: ", queryString);
    return queryString;
  };

  //TODO rethink this function will be complicated with many searches terms involved
  function buildFilterString(filterType, value) {
    if (!value) return;
    // Check if the filterType is a date filter, because we need to format it differently
    if (filterType !== "filter_date") {
      if (filterType === "search") {
        return `${value}`;
      } else if (filterType === "organization") {
        return `responsible_organizations=${value}`;
      } else if (filterType === "projects") {
        return `projects=${value}`;
      } else {
        return `${filterType}=${value}`;
      }
    } else {
      // If it's a date filter, we need to format it differently
      return "";
    }
  }

  // Builds a string for date filters using filterTypes: filter_date_type, start_date, end_date
  function buildDateFiltersString(badges, selectedOption) {
    const dateFilterStr = `${selectedOption}:[${badges["filter_date"]}]`;

    return dateFilterStr;
  }

  // Trigger reharvest when badges change
  useEffect(() => {
    const queryString = generateQueryString(badges);
    console.log("Query String :: " + queryString);
    setFetchURLFilter(`${queryString}`);
    setBadgeCount(Object.keys(badges).length);
  }, [badges, setBadgeCount, setFetchURLFilter]); // Re-run whenever badges change

  return (
    <div className="h-screen bg-primary-50 dark:bg-primary-800 flex flex-col">
      <TopBanner
        lang={lang}
        setLang={setLang}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      <FilterSection
        lang={lang}
        badges={badges}
        setBadges={setBadges}
        orgList={organizationList}
        projList={projectList}
        eovList={eovList}
        setSelectedOption={setSelectedDateFilterOption}
      />

      <span className="w-full p-1 border-t border-t-gray-200 dark:border-t-gray-700 flex flex-row justify-between items-bottom">
        <div>{t.datasets}</div>
        <div className="text-sm">
          <ProgressBar count={filteredResultsCount} total={totalResultsCount} />
        </div>
      </span>
      <ul className="flex-grow overflow-y-auto p-2 space-y-2 rounded-md">
        <ItemsList
          itemsList={filteredItems}
          onItemClick={onLeftMenuItemClick}
          onItemDoubleClick={onLeftMenuItemDoubleClick}
          lang={lang}
          loading={loading}
        />
      </ul>
      <ModalAPropos lang={lang} />
      <div className="flex items-center justify-center mt-1">
        <Logo logos={config.bottom_logo} lang={lang} default_width={220} />
      </div>
    </div>
  );
}
