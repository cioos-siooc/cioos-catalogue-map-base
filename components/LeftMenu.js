"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import ItemsList from "@/components/ItemsList";
import Image from "next/image";
import ModalAPropos from "@/components/ModalAPropos";
import config from "@/app/config.js";
import { getLocale } from "@/app/get-locale.js";
import FilterSection from './FilterSection';
import { HR } from 'flowbite-react'

export function Sidebar({ onInfoClick, onItemClick, lang, setLang }) {
  const [filteredItems, setFilteredItems] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState(null);
  const [totalResultsCount, setTotalResultsCount] = useState(0);
  const [filteredResultsCount, setFilteredResultsCount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [badges, setBadges] = useState([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [fetchURLFilter, setFetchURLFilter] = useState(config.base_query);

  const t = getLocale(lang);

  const basePath = process.env.BASE_PATH || "";

  const catalogueUrl = config.catalogue_url;
  let urlCustomSearch = `${catalogueUrl}/api/3/action/package_search?q=`;

  const ProgressBar = dynamic(() => import("./ProgressBar"), { ssr: false });
  const Badge = dynamic(() => import("./Badge"), { ssr: false });
  //const ModalAPropos = dynamic(() => import('./ModalAPropos'),  { ssr: false })
  let ref = useRef(0);

  const AddBadge = (label) => {
    let id = badges.length + 1;
    setBadges([...badges, { index: id, nom: label }]);
  };
  const handleSelectChange = (event) => {
    // Handle the change event for the select input
    console.log("ON Selected value :: " + event.target.value);
    if (event.target.value === "eov") {
      setSelectedValue("eov");
    } else if (event.target.value === "organisation") {
      setSelectedValue("dataset");
    } else if (event.target.value === "project") {
      setSelectedValue("projects");
    } else {
      setSelectedValue("");
    }
  };

  const toggleLanguage = () => {
    const opposite_langue = lang;
    setLang(lang === "en" ? "fr" : "en");
    return opposite_langue;
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

  const handleChange = (event) => {
    setInputValue(event.target.value); // Update state with input value
  };

  const handleFilterClick = () => {
    constructFilterUrl(); // Construct filter URL
    ref.current = ref.current + 1; //detect when we use the filter button to check the total results count
  };

  const resetSelectedValue = () => {
    const selectElement = document.getElementById("selectCategory");
    selectElement.selectedIndex = 0; // Reset to the first option
  };

  const onRemoveClick = (id) => {
    resetSelectedValue(); // Reset the selected value in the dropdown
    const filteredListAfterRemove = badges.filter((item) => item.index !== id);
    console.log("Badges after remove :: " + filteredListAfterRemove.length);

    setBadges(filteredListAfterRemove); // Remove badge by ID

    updateFilterUrlAfterRemove(filteredListAfterRemove); // Reapply filter after removing badge
  };
  const constructFilterUrl = () => {
    let filterString = "";
    for (let i = 0; i < badges.length; i++) {
      if (badges[i].nom) {
        filterString += `${i > 0 ? "%20AND%20" : ""}${badges[i].nom}`;
      }
    }

    if (selectedValue && inputValue) {
      filterString += `${badges.length > 0 ? "%20AND%20" : ""}${selectedValue}=${inputValue}`;
    } else if (inputValue) {
      filterString += `${badges.length > 0 ? "%20AND%20" : ""}${inputValue}`;
    }
    filterString += `%20AND%20${config.base_query}`;
    AddBadge(inputValue);
    setFetchURLFilter(filterString);
  };

  const updateFilterUrlAfterRemove = (badgeList) => {
    let filterString = "";
    for (let i = 0; i < badgeList.length; i++) {
      if (badgeList[i].nom) {
        filterString += `${i > 0 ? "%20AND%20" : ""}${badgeList[i].nom}`;
      }
    }
    console.log("SELECT :: " + selectedValue);
    if (selectedValue && inputValue) {
      filterString += `${badgeList.length > 0 ? "%20AND%20" : ""}${selectedValue}=${inputValue}`;
    } else if (inputValue) {
      filterString += `${badgeList.length > 0 ? "%20AND%20" : ""}${inputValue}`;
    }
    filterString += `${badgeList.length > 0 ? "%20AND%20projects=*baseline*&rows=50" : "projects=*baseline*&rows=50"}`;
    // Construct the filter URL based on the selected value and input value
    console.log("Update filter string remove :: " + filterString);
    setFetchURLFilter(filterString);
  };

  useEffect(() => {
    const fetchData = async () => {
      // Fetch data from an API
      try {
        let url = `${urlCustomSearch}${fetchURLFilter}`;
        console.log("URL :: " + url);
        const response = await fetch(url); // Example API
        const awaitRes = await response.json();
        setFilteredItems(awaitRes.result.results);
        setInputValue(""); // Clear input value after fetching data
        console.log("FETCH :: ");
        if (ref.current === 0) {
          setTotalResultsCount(awaitRes.result.results.length);
        } else {
          setFilteredResultsCount(awaitRes.result.results.length);
        }
      } catch (error) {
        setError(error.message);
      }
      console.log("filtered count :: " + filteredItems.length);
    };
    fetchData();
  }, [fetchURLFilter]);

    return (
        <div id="sidebar">
            <button id="sidebar-toggle" data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" type="button" onClick={toggleSidebar} className="flex justify-between w-screen items-center p-2 text-sm md:hidden bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                <div className="flex items-center ps-2.5">
                    <a className="me-3">
                        <Image src={`${basePath}${config.logos.main_light}`} className="h-auto dark:hidden" alt="OGSL Logo" height={0}  width={120} />
                        <Image src={`${basePath}${config.logos.main_dark }`} className="h-auto hidden dark:block" alt="OGSL Logo" height={0} width={129} />
                        <span className="self-center text-xl font-semibold whitespace-nowrap">{config.title.fr}</span>
                    </a>
                    <span className="sr-only">Open sidebar</span>
                </div>
                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                </svg>
            </button>
            <aside id="logo-sidebar" className={`fixed top-0 left-0 z-40 w-sm h-screen transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`} aria-label="Sidebar">
                <div className="h-full px-3 py-4 bg-gray-50 dark:bg-gray-800 flex flex-col">
                    <div className="flex items-center justify-between ps-2.5 mb-5">
                        <div>
                            <Image src={`${basePath}${config.logos.main_light}`} className="h-auto dark:hidden" alt="OGSL Logo" height={0}  width={120} />
                            <Image src={`${basePath}${config.logos.main_dark}`} className="h-auto hidden dark:block" alt="OGSL Logo" height={0} width={129} />
                            <span className="mt-3 self-center text-xl font-semibold whitespace-nowra">{ config.title.fr }</span>
                        </div>
                        <a className="mr-10" id="headerTranslation" href="">EN</a>
                        <button onClick={toggleSidebar} className="flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="logo-sidebar" data-drawer-toggle="logo-sidebar">
                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    
                    <ul className="space-y-2 font-medium">
                        <li>

                            <form className="max-w-lg mx-auto">
                                <label>Filtrer par</label>
                                <div className="flex">
                                    <select
                                        id="selectCategory"
                                        className="py-2 pl-3 text-sm text-gray-700 dark:text-gray-200 bg-gray-50 border 
                                        border-gray-300 rounded-l-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        aria-labelledby="dropdown-button"
                                        onChange={handleSelectChange} >
                                        <option value="search">Recherche</option>
                                        <option value="organisation">Organisation</option>
                                        <option value="project">Projet</option>
                                        <option value="eov">EOV</option>
                                    </select>
                                    <div className="relative w-full">
                                        <input
                                            type="search"
                                            id="search-dropdown"
                                            className="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-gray-50 border-s-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-s-gray-700  dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500"
                                            placeholder="Appliquer filtre"
                                            required
                                            onChange= {handleChange}
                                            value={inputValue}
                                        />
                                        <button
                                            type="button"
                                            className="absolute top-0 end-0 p-2.5 text-sm font-medium h-full text-white bg-blue-700 rounded-e-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                            onClick={handleFilterClick}
                                        >
                                            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span className="sr-only">Add filter item</span>
                                        </button>
                                    </div>
                                </div>
                            </form>

                        </li>
                    </ul>
                    <div id="badgesSection" className="mt-3 mb-3 relative w-full" >
                        {badges.map(badge => (
                            
                            <Badge key={badge.index} index={badge.index} label={badge.nom} onRemoveClick={onRemoveClick} />

                        ))}
                    </div>  


                    <span className="pt-4 border-t border-t-gray-200 dark:border-t-gray-700">Jeux de données</span>
                    <ul className="flex-grow overflow-y-auto pt-1 mt-1 space-y-2 rounded-md">
                        <ItemsList itemsList={filteredItems} onItemClick={onLeftMenuItemClick} onItemDoubleClick={onLeftMenuItemDoubleClick} 
                        className="flex-grow overflow-y-auto" />
                    </ul>
                    <div className="pt-3 text-sm font-medium text-gray-900 dark:text-white">
                        <ProgressBar count={filteredResultsCount} total={totalResultsCount} />
                    </div>
                    <ModalAPropos />
                </div>
            </aside>
        </div>
    );
}

export const TopBanner = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
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
            src="/Images/OGSL_NoTag.png"
            className="h-auto dark:hidden"
            alt="OGSL Logo"
            height={0}
            width={120}
          />
          <Image
            src="/Images/OGSL_NoTag_White.png"
            className="h-auto hidden dark:block"
            alt="OGSL Logo"
            height={0}
            width={129}
          />
          <span className="self-center text-xl font-semibold whitespace-nowrap">
            Carte de l&apos;OGSL
          </span>
        </a>
        <span className="sr-only">Open sidebar</span>
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
