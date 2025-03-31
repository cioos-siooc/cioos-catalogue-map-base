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


   return (
      <div className="bg-gray-100 dark:bg-gray-900">


         <div id="drawer-navigation" className="h-screen overflow-y-auto overflow-x-auto
           bg-white dark:bg-gray-800" aria-labelledby="drawer-navigation-label">

            <div className="overflow-y-auto overflow-x-auto">
                  <ul id="sidebar" className="space-y-2 font-medium p-5 text-gray-900 dark:text-gray-300">
                     {
                     
                        items.map((item) => 

                              <li className="hover:text-blue-500 font-bold ml-5" onClick={() => onItemClick(item)} 
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
