"use client";
import dynamic from "next/dynamic";
import ItemsList from "@/components/ItemsList";
import ModalPages from "@/components/ModalPages";
import config from "@/app/config.js";
import { getLocale } from "@/app/get-locale.js";
import FilterSection from "./FilterSection";
import Logo from "./Logo";
import { BsDatabase } from "react-icons/bs";
import {
  MdLanguage,
  MdInfoOutline,
  MdFilterList,
  MdClose,
  MdMenu,
} from "react-icons/md";

export const TopBanner = ({ lang, toggleSidebar, isSidebarOpen }) => {
  return (
    <div className="flex flex-row items-center justify-between gap-1 p-2">
      <div className="flex flex-wrap items-center gap-2">
        <Logo logos={config.main_logo} lang={lang} default_width={120} />
        <span className="text-center text-xl font-semibold">
          {config.title[lang]}
        </span>
      </div>
      <div className="group relative">
        <button
          className="hover:bg-primary-500 flex cursor-pointer items-center justify-center rounded-md p-1 text-3xl transition-colors duration-200 hover:text-white"
          onClick={toggleSidebar}
        >
          <div
            className={`transition-transform duration-300 ${isSidebarOpen ? "rotate-90" : "rotate-0"}`}
          >
            {isSidebarOpen ? <MdClose /> : <MdMenu />}
          </div>
        </button>
      </div>
    </div>
  );
};

export function Sidebar({
  filteredItems,
  onInfoClick,
  onItemClick,
  lang,
  setLang,
  filteredResultsCount,
  totalResultsCount,
  setBadgeCount,
  loading,
  organizationList,
  projectList,
  eovList,
  badges, // new prop
  setBadges, // new prop
  setSelectedDateFilterOption,
  toggleSidebar,
  isSidebarOpen,
  filterOpen,
  setFilterOpen,
  aboutPageIndex,
  setAboutPageIndex,
}) {
  const t = getLocale(lang);

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    if (badges?.search) count++;
    if (badges?.filter_date) count++;
    if (badges?.organization && badges.organization.length > 0)
      count += badges.organization.length;
    if (badges?.projects && badges.projects.length > 0)
      count += badges.projects.length;
    if (badges?.eov && badges.eov.length > 0) count += badges.eov.length;
    return count;
  };

  const activeFilterCount = countActiveFilters();

  const onLeftMenuItemClick = (selectedItem) => {
    onItemClick(selectedItem);
  };
  const onLeftMenuItemDoubleClick = (selectedItem) => {
    window.open(`${catalogueUrl}/dataset/${selectedItem.name}`);
  };

  const generateDatasetsLabel = (count, total, noResultsText, resultsText) => {
    var content = null;
    if (count === 0) {
      return noResultsText;
    } else if (count === total) {
      content = total;
    } else {
      content = `${count} / ${total}`;
    }
    return (
      <div className="bg-primary-500 rounded-full px-1.5 py-0.5 text-xs font-extralight text-white">
        {content}
      </div>
    );
  };

  return (
    <div className="bg-primary-50 dark:bg-primary-800 flex h-screen flex-col overflow-visible">
      <TopBanner
        lang={lang}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      <ModalPages
        lang={lang}
        openKey={aboutPageIndex}
        setOpenKey={setAboutPageIndex}
      />

      <div className="bg-primary-100 dark:bg-primary-700 mx-2 mt-2 mb-3 rounded-md py-1">
        <div className="flex flex-row items-center justify-center gap-2 overflow-visible">
          <div className="group relative">
            <button
              className="hover:bg-primary-500 flex w-16 cursor-pointer flex-col items-center justify-center rounded-md p-2 transition-colors duration-200 hover:text-white"
              onClick={() => setLang(lang === "en" ? "fr" : "en")}
            >
              <MdLanguage className="text-2xl" />
              <span className="text-sm">{lang === "en" ? "FR" : "EN"}</span>
            </button>
          </div>
          <div className="group relative">
            <button
              className="hover:bg-primary-500 flex w-16 cursor-pointer flex-col items-center justify-center rounded-md p-2 transition-colors duration-200 hover:text-white"
              onClick={() => setAboutPageIndex(0)}
            >
              <MdInfoOutline className="text-2xl" />
              <span className="text-sm">{t.about}</span>
            </button>
          </div>
          <div className="group relative">
            <button
              className="hover:bg-primary-500 flex w-16 cursor-pointer flex-col items-center justify-center rounded-md p-2 transition-colors duration-200 hover:text-white"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <div className="relative">
                <MdFilterList className="text-2xl" />
                {activeFilterCount > 0 && (
                  <span className="bg-accent-500 absolute -top-1 -right-3 rounded-full px-1 text-xs text-black">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <span className="text-sm">{t.filters}</span>
            </button>
          </div>
        </div>
        <FilterSection
          lang={lang}
          badges={badges}
          setBadges={setBadges}
          orgList={organizationList}
          projList={projectList}
          eovList={eovList}
          setSelectedOption={setSelectedDateFilterOption}
          isOpen={filterOpen}
          setIsOpen={setFilterOpen}
        />
      </div>

      <div className="bg-primary-200 dark:bg-primary-700 mx-2 flex items-center gap-2 rounded-t-md p-2 px-2">
        <BsDatabase className="text-xl" />
        {t.datasets}
        {generateDatasetsLabel(
          filteredResultsCount,
          totalResultsCount,
          t.no_results,
          t.results,
        )}
      </div>
      <ul className="custom-scrollbar bg-primary-200 dark:bg-primary-700 mx-2 flex-grow overflow-y-auto rounded-b-md">
        <ItemsList
          itemsList={filteredItems}
          onItemClick={onLeftMenuItemClick}
          onItemDoubleClick={onLeftMenuItemDoubleClick}
          lang={lang}
          loading={loading}
        />
      </ul>
      <div className="mt-2 flex items-center justify-center">
        <Logo logos={config.bottom_logo} lang={lang} default_width={220} />
      </div>
    </div>
  );
}
