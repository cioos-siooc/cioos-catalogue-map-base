// components/Sidebar.js
import Link from "next/link";
import '../../app/globals.css';

const fetchData = () => {

    const catalogueUrl = 'https://catalogue.ogsl.ca';
    const baseQuery = 'projects=*baseline*';
    let url = `${catalogueUrl}/api/3/action/package_search?q=${baseQuery}`;
        
      try {
        const response = fetch(url);
        const data = response.json(); // List of datasets
        return data.result.results;
      } catch (error) {
        console.error('Error fetching data:', error);
      }
  
  };

  const getBeerData = async () => { 
    const catalogueUrl = 'https://catalogue.ogsl.ca';
    const baseQuery = 'projects=*baseline*';
    var url = `${catalogueUrl}/api/3/action/package_search?q=${baseQuery}`;
    const data = await fetch(url);
    console.log("DATA :: " + data);
    if (data) {
        return data.json()
    } else {
        throw "Error";
    }
};

const Sidebar = () => {
  return (
    <div id="sidebar">
      <ul>
        {
            getBeerData().then(data => {
                console.log("HELLO :: " + data.result.count);
                    let index = 1
                    data.result.results.forEach( item => {
                
                        <li key={index}>
                            {item.title}
                        </li>
                        index++;
                    });
            })
        }
      </ul>
    </div>
  )
};

export default Sidebar;
