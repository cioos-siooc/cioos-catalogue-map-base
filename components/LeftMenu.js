'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ItemsList from "@/components/ItemsList";



export default function LeftMenu({ onItemClick }) {
    const [filteredItems, setFilteredItems] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [error, setError] = useState(null);
    const [isFilterClicked, setIsFilterClicked] = useState(false);
    const [isFetchDone, setIsFetchDone] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [badges, setBadges] = useState([]);
    const [selectedValue, setSelectedValue] = useState('');
    const [fetchURLFilter, setFetchURLFilter] = useState("projects=*baseline*&rows=50");

    //TODO: move to config file
    const catalogueUrl = 'https://catalogue.ogsl.ca';
    const baseQuery = 'projects=*baseline*';
    let urlBaseSearch = `${catalogueUrl}/api/3/action/package_search?q=${baseQuery}`;
    let urlCustomSearch = `${catalogueUrl}/api/3/action/package_search?q=`;


    const ProgressBar = dynamic(() => import('./ProgressBar'), { ssr: false })
    const Badge = dynamic(() => import('./Badge'),  { ssr: false })

    const AddBadge = (label)=> {
        let id = badges.length + 1;
        console.log('id :: ' + id);
        console.log('label :: ' + label);
        setBadges([...badges, {id: id, nom : label}]);
    }
    const handleSelectChange = (event) => {
        // Handle the change event for the select input
        console.log("ON Selected value :: " + event.target.value);
        if (event.target.value === 'eov') {
            setSelectedValue("eov");
        }else if (event.target.value === 'organisation') {
            setSelectedValue("dataset");
        } else if (event.target.value === 'project') {
            setSelectedValue("projects");
        } else {
            setSelectedValue("");
        }

      };

    const toggleSidebar = () => {
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
        constructFilterUrl(badges,inputValue,selectedValue); // Construct filter URL
    };


    const constructFilterUrl = (badges,inputValue,selectedValue) => {

        console.log("Badges :: " + JSON.stringify(badges));
        let filterString = '';
        for(let i = 0; i < badges.length; i++) {
            console.log("NOM :: " + badges[i].nom);
            if (badges[i].nom) {
                filterString += `${i > 0 ? '%20AND%20' : ''}${badges[i].nom}`;
            }
        }
        console.log("Filter String 1 :: " + filterString);
        console.log("Filter selected value :: " + selectedValue);

        if (selectedValue && inputValue) {
            filterString += `${badges.length > 0 ? '%20AND%20' : ''}${selectedValue}=${inputValue}`;
        } else if (inputValue) {
            filterString += `${badges.length > 0 ? '%20AND%20' : ''}${inputValue}`;
        }
        filterString += "&rows=50";
        AddBadge(inputValue);
        // Construct the filter URL based on the selected value and input value
        console.log("Filter String 2 :: " + filterString);
        setFetchURLFilter(filterString);
    }


    useEffect(() => {

        const fetchData = async () => {
            // Fetch data from an API
            try {
                console.log('Default :: ');
                let url = `${urlCustomSearch}${fetchURLFilter}`;
                console.log('URL:: ' + url);
                const response = await fetch(url); // Example API
                const awaitRes = await response.json();

                setFilteredItems(awaitRes.result.results);
                setInputValue(''); // Clear input value after fetching data 
            } catch (error) {
                console.log('Error :: ' + error.message);
                setError(error.message);
            }
            console.log('filtered :: ' + filteredItems.length);
            
        };
        fetchData();
    }, [fetchURLFilter]);


    return (
        <div id="sidebar">
            <button id="sidebar-toggle" data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" type="button" onClick={toggleSidebar} className="flex justify-between w-screen items-center p-2 mt-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                <span className="sr-only">Open sidebar</span>
                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                </svg>
                <span className="p-3 self-center text-xl font-semibold whitespace-nowrap dark:text-white">Carte de l'OGSL</span>
                <a href="https://ogsl.ca" className="">
                    <img src="/Images/OGSL_NoTag_White.png" className="h-6 me-3 sm:h-7" alt="Flowbite Logo" />
                </a>
            </button>
            <aside id="logo-sidebar" className={`fixed top-0 left-0 z-40 w-sm h-screen transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`} aria-label="Sidebar">
                <div className="h-full px-3 py-4 bg-gray-50 dark:bg-gray-800 flex flex-col">
                    <a href="https://ogsl.ca" className="flex items-center ps-2.5 mb-5">
                        <img src="/Images/OGSL_NoTag_White.png" className="h-6 me-3 sm:h-7" alt="Flowbite Logo" />
                        <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Carte de l'OGSL</span>
                    </a>
                    <ul className="space-y-2 font-medium">
                        <li>

                            <form className="max-w-lg mx-auto">
                                <label>Filtrer par</label>
                                <div className="flex">
                                    <select
                                        className="py-2 pl-3 text-sm text-gray-700 dark:text-gray-200 bg-gray-50 border border-gray-300 rounded-l-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                            
                            <Badge key={badge.id} label={badge.nom} />

                        ))}
                    </div>  


                    <span className="pt-4 border-t border-t-gray-200 dark:border-t-gray-700">Jeux de données</span>
                    <ul className="flex-grow overflow-y-auto pt-1 mt-1 space-y-2 rounded-md">
                        <ItemsList itemsList={filteredItems} onItemClick={onLeftMenuItemClick} onItemDoubleClick={onLeftMenuItemDoubleClick} 
                        className="flex-grow overflow-y-auto" />
                    </ul>
                    <div className="pt-3 text-sm font-medium text-gray-900 dark:text-white">
                        <ProgressBar count={40} total={60} />
                    </div>
                    <ul className="pt-4 m-3 space-y-2 font-medium border-t border-gray-200 dark:border-gray-700">
                        <li>
                            <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <svg className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 16">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3" />
                                </svg>
                                <span className="flex-1 ms-3 whitespace-nowrap">À propos</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </aside>
        </div>

    );
}