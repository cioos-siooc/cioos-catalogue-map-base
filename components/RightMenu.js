'use client';   
import {useState,useEffect } from 'react';

export default function Drawer({ onItemClick, onItemDoubleClick }) {
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(true);
    const catalogueUrl = 'https://catalogue.ogsl.ca';
    const baseQuery = 'projects=*baseline*';
    let url = `${catalogueUrl}/api/3/action/package_search?q=${baseQuery}`;
  
  
    let done = false;
    const toggleDrawer = () => {

        const chevronDown = document.getElementById('chevronDown');
        const chevronUp = document.getElementById('chevronUp');
        const imgDown = document.getElementById('imgDown');
        const imgUp = document.getElementById('imgUp');
        if(isOpen){
            chevronDown.classList.add('hidden');
            imgDown.classList.add('hidden');
            chevronUp.classList.remove('hidden');
            imgUp.classList.remove('hidden');

        }else{
            chevronUp.classList.add('hidden');
            imgUp.classList.add('hidden');
            chevronDown.classList.remove('hidden');
            imgDown.classList.remove('hidden');
        }
        setIsOpen(!isOpen);
    }
  
    useEffect(() => {
      // Fetch data from an API
      fetch(url) // Example API
        .then((response) => response.json())
        .then(async (data)  => {
          const awaitRes = await data;
          if(!done){
            done = true;
            setItems(awaitRes.result.results);
          }
        })
        .catch((err) => setError(err.message));
      }, []);
  
      if (error) return <p>Error: {error}</p>;
      if (!items.length) return <p>Loading...</p>;




  return (


    <div>
        <div className='grid grid-flow-row top-0 z-70 h-screen pt-5 overflow-y-auto scrollbar-hide'>
            <div className="">
                <h5 id="drawer-navigation-label" className="pl-5 pb-5 pt-5 bg-white w-100 dark:bg-gray-800 text-base font-semibold text-gray-500 uppercase dark:text-gray-400">Liste de jeux de données</h5>
                <button id="chevronDown" onClick={toggleDrawer} type="button" data-drawer-hide="drawer-navigation" aria-controls="drawer-navigation" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-5 mt-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white" >
                    <svg  id="imgDown" className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
						<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                    </svg>   
                    <span className="sr-only">Close menu</span>
                </button>
                <button id="chevronUp" onClick={toggleDrawer} type="button" data-drawer-hide="drawer-navigation" aria-controls="drawer-navigation" className="hidden text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-5 mt-2.5 end-2.5 items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white" >
                    <svg id="imgUp" className="hidden ml-3 w-3 h-3 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7 7.674 1.3a.91.91 0 0 0-1.348 0L1 7"/>
                    </svg>
                    <span className="sr-only">Close menu</span>
                </button>
            </div>
            <div id="drawer-navigation" className={`bg-[#e8eef1] w-100 dark:bg-gray-800" ${
                                isOpen ? "translate-x-0" : "translate-x-full"
                              } transition-transform duration-300 ease-in-out`}
                               tabIndex="-1" aria-labelledby="drawer-navigation-label">
                <ul className="space-y-2 font-medium">
                    {
                        items.map((item) => 
                              <li className="hover:text-blue-500, cursor-pointer bg-white mt-5 ml-5 mr-5 p-5" 
                                 onClick={() => onItemClick(item)} 
                                 onDoubleClick={() => onItemDoubleClick(item)} 
                                 key={item.id}>{item.title}
                        
                              </li> // Dynamically create <li> items
                           )
                        
                     }

                </ul>
            </div>
        </div>
    
    </div>

  );
}