'use client';   
export default function ItemsList({ itemsList, onItemClick, onItemDoubleClick }) {
  

  return (


    <div>
        <div className='grid grid-flow-row z-50'>
            <div id="drawer-navigation" className="bg-gray-200 dark:bg-gray-700 w-full transition-transform duration-300 ease-in-out rounded-md">
                <ul className="space-y-2 font-medium">
                    {
                        itemsList.map((item) => 
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