'use client';   
import {useState,useEffect } from 'react';

export default function DrawerExample({ onItemClick, onItemDoubleClick }) {
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
        <div className='top-0 z-70 h-screen py-4 overflow-y-auto scrollbar-hide'>
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
                    <li>
                        <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                        <svg className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                            <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z"/>
                            <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z"/>
                        </svg>
                        <span className="ms-3">Dashboard</span>
                        </a>
                    </li>
                    {
                        items.map((item) => 
                              <li className="hover:text-blue-500, cursor-pointer bg-white font-bold ml-5 mr-5 p-5" 
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