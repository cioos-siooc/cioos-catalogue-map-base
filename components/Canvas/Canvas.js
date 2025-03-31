'use client';   
import {useState,useEffect } from 'react';


const Canvas = ({ onItemClick, onItemDoubleClick }) => {
   const [items, setItems] = useState([]);
   const [error, setError] = useState(null);
   const catalogueUrl = 'https://catalogue.ogsl.ca';
   const baseQuery = 'projects=*baseline*';
   let url = `${catalogueUrl}/api/3/action/package_search?q=${baseQuery}`;
 
 
   let done = false;
 
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

     const onMenuDownClick = () => {
         const menu = document.getElementById('sidemenu');
         const chevronDown = document.getElementById('chevronDown');
         const chevronUp = document.getElementById('chevronUp');

         menu.classList.add('hidden');
         chevronDown.classList.add('hidden');
         chevronUp.classList.remove('hidden');

      }

      const onMenuUpClick = () => {
         const menu = document.getElementById('sidemenu');
         const chevronDown = document.getElementById('chevronDown');
         const chevronUp = document.getElementById('chevronUp');

         menu.classList.remove('hidden');
         chevronDown.classList.remove('hidden');
         chevronUp.classList.add('hidden');
      }

   return (
      <div className="bg-gray-100 dark:bg-gray-900">


         <div id="drawer-navigation" className="h-screen overflow-y-auto overflow-x-auto
           bg-white dark:bg-gray-800" aria-labelledby="drawer-navigation-label">
            <div className='grid grid-cols-4'>
               <div className="col-span-1 col-start-1 pb-5">
                  <svg id="chevronDown" onClick={() => onMenuDownClick()} className="ml-5 mt-5 w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                           <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1"/>
                  </svg>
                  <svg id="chevronUp" onClick={() => onMenuUpClick()} className="hidden ml-5 mt-5 w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                           <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 15 7-7 7 7"/>
                  </svg>
               </div>
               <div className="col-span-3 col-start-2 pt-5">
                  <span className="mt-5 mr-5 mb-5 text-gray-800 dark:text-white font-bold text-[20px]">Liste de jeux de données</span>
               </div>
            </div>
            <div id="sidemenu" className="overflow-y-auto overflow-x-auto">

                  <ul className="bg-gray-200 space-y-2 font-medium p-5 text-gray-900 dark:text-gray-300">
                     {
                        items.map((item) => 
                              <li className="hover:text-blue-500 bg-white font-bold ml-5 p-5" onClick={() => onItemClick(item)} 
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
};

export default Canvas;
