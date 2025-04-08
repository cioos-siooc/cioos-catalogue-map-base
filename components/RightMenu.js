'use client';   
import {useState,useEffect } from 'react';

export default function RightMenu({ onItemClick, onItemDoubleClick }) {
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(true);
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


    <div>
        <div className='grid grid-flow-row z-70'>
            <div id="drawer-navigation" className="bg-gray-200 dark:bg-gray-700 w-full transition-transform duration-300 ease-in-out rounded-md">
                <ul className="space-y-2 font-medium">
                    {
                        items.map((item) => 
                              <li className="hover:text-blue-500 cursor-pointer bg-gray-100 dark:bg-gray-900 m-2 p-4 text-sm rounded-md" 
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