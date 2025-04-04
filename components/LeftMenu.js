'use client';   
import {useState,useEffect } from 'react';
import dynamic from 'next/dynamic';


export default function LeftMenu({ onItemClick }) {
    const [filteredItems, setFilteredItems] = useState([]);
    const [error, setError] = useState(null);
    const [isFilterClicked, setIsFilterClicked] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const catalogueUrl = 'https://catalogue.ogsl.ca';
    const baseQuery = 'projects=*baseline*';
    let urlBaseSearch = `${catalogueUrl}/api/3/action/package_search?q=${baseQuery}`;
    
    let urlCustomSearch = `${catalogueUrl}/api/3/action/package_search?q=`;

    const ProgressBar = dynamic(() => import('./ProgressBar'), {ssr: false})


    const onLeftMenuItemClick = (selectedItem) => {
        onItemClick(selectedItem);
    };

    const onLeftMenuItemDoubleClick = (selectedItem) => {
        window.open(`${catalogueUrl}/dataset/${selectedItem.name}`);
    };

    const handleChange = (event) => {
        setInputValue(event.target.value); // Update state with input value
      };

      useEffect(() => {
  
        const fetchData = async () => {
            console.log('isFilterClicked :: ' + isFilterClicked);
            console.log('inputValue :: ' + inputValue);
        // Fetch data from an API
        if(isFilterClicked){
            let url ='';
            console.log('inputValue :: ' + inputValue);
            try {
                if(inputValue === '') {
                    url = urlBaseSearch;
                }else{
                    url = `${urlCustomSearch}${inputValue}`;
                }
                console.log('url :: ' + url);    
                const response = await fetch(url); // Example API
                console.log('Responseeee :: ' + response);

                const awaitRes = await response.json();

                setFilteredItems(awaitRes.result.results);
                }catch (error) {
                    console.log('Error :: ' + error.message);
                    setError(error.message);
                    setIsFilterClicked(false);
                }
                setIsFilterClicked(false);
                console.log('filtered :: ' + filteredItems); 
            }

        };
        fetchData();
    }, [isFilterClicked]);
  


  return (

    <div>

        <div id="drawer-form" className="fixed top-0 left-0 z-900 h-screen p-4 overflow-y-auto 
            transition-transform bg-white w-1/5 dark:bg-gray-800" tabIndex="-1" aria-labelledby="drawer-form-label">
            <div className="inline-flex rounded-t dark:border-gray-600">
                <a className="inline-flex w-3/12 h-3/12 ml-0" id="headerImg_OGSL">
                    <img className="" id="headerimgsrc_OGSL" src="Images/OGSL_NoTag.jpg"/>
                </a>
                

            </div>
            <form className="mb-6">
                <div className="mb-6">
                    <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                    <input type="text" id="filter" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                     focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600
                      dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                      placeholder="Rechercher" required  onChange={handleChange} />
                
                    <button id="btnFilter" onClick={() => setIsFilterClicked(true)} type="button" aria-controls="drawer-navigation" className="text-gray-400 bg-transparent 
                    hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-15 h-8 top-5 mt-2.5 end-2.5 items-center 
                    justify-center dark:hover:bg-gray-600 dark:hover:text-white" >

                        <span className="">Filtrer</span>
                    </button>
                
                </div>
                <div className="mb-6 border-t-1">
                    <label htmlFor="description" className="mt-3 block mb-2 text-sm font-medium text-gray-900 dark:text-white">Jeux de données</label>
                
                </div>
                <div className="relative mb-6 bg-[#e8eef1]">
                    <div className="inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <ul className="space-y-2 font-medium">
                        {
                            filteredItems.map((item) => 
                                <li className="hover:text-blue-500, cursor-pointer bg-white mt-5 ml-5 mr-5 p-5" 
                                    onClick={() => onLeftMenuItemClick(item)} 
                                    onDoubleClick={() => onLeftMenuItemDoubleClick(item)} 
                                    key={item.id}>{item.title}
                            
                                </li> // Dynamically create <li> items
                            )
                            
                        }

                        </ul>
                    </div>
                    
                </div>

                <div className="mb-6 border-t-1">

                    <div className="mt-3 block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre de jeux de données

                      <div className="p-4">
                            <ProgressBar progress={70} />
                      </div>
                    </div>

                    <div className="inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9.408-5.5a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01ZM10 10a1 1 0 1 0 0 2h1v3h-1a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-1v-4a1 1 0 0 0-1-1h-2Z" clipRule="evenodd"/>
                        </svg>

                        <label htmlFor="description" className="ml-3 mt-3 block mb-2 text-sm font-medium text-gray-900 dark:text-white">À propos</label>
                    </div>      
                </div>
            </form>
        </div>
    </div>

    );
}