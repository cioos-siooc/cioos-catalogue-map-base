"use client";
import dynamic from "next/dynamic";
import ItemsList from "@/components/ItemsList";
import ModalAPropos from "@/app/Pages";
import config from "@/app/config.js";
import { getLocale } from "@/app/get-locale.js";
import FilterSection from "./FilterSection";
import Logo from "./Logo";
import { TfiMenu } from "react-icons/tfi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { BsDatabase } from "react-icons/bs";
import SidebarButton from "./SidebarButton";

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
    <div
      className={`w-90 mt-1 pt-1 bg-primary-50 dark:bg-primary-800 ${
        !isSidebarOpen ? "rounded-r-3xl overflow-hidden" : ""
      }`}
    >
      <div className="flex items-center px-2 py-1">
        <Title lang={lang} setLang={setLang} />
      </div>
      <SidebarButton
        logo={<TfiMenu />}
        label={
          <div className="flex flex-row gap-4 items-center">
            <div>Menu</div>
            <div>{isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}</div>
          </div>
        }
        onClick={toggleSidebar}
      />
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
}) {
  const t = getLocale(lang);
  const ProgressBar = dynamic(() => import("./ProgressBar"), { ssr: false });

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
      <div className="text-xs font-extralight text-white bg-primary-500 px-1.5 py-0.5 rounded-full">
        {content}
      </div>
    );
  };

  return (
    <div className="h-screen bg-primary-50 dark:bg-primary-800 flex flex-col">
      <TopBanner
        lang={lang}
        setLang={setLang}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      <ModalAPropos lang={lang} />
      <FilterSection
        lang={lang}
        badges={badges}
        setBadges={setBadges}
        orgList={organizationList}
        projList={projectList}
        eovList={eovList}
        setSelectedOption={setSelectedDateFilterOption}
      />

      <SidebarButton
        logo={<BsDatabase />}
        label={
          <div className="flex items-center gap-2">
            <span>{t.datasets}</span>
            {generateDatasetsLabel(
              filteredResultsCount,
              totalResultsCount,
              t.no_results,
              t.results,
            )}
          </div>
        }
      />
      <ul className="flex-grow overflow-y-auto p-2 space-y-2 rounded-md">
        <ItemsList
          itemsList={filteredItems}
          onItemClick={onLeftMenuItemClick}
          onItemDoubleClick={onLeftMenuItemDoubleClick}
          lang={lang}
          loading={loading}
        />
      </ul>
      <div className="flex items-center justify-center mt-2">
        <Logo logos={config.bottom_logo} lang={lang} default_width={220} />
      </div>
    </div>
  );
}
