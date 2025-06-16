  // Function to fill organization and project lists
 export const fillOrganizationAndProjectLists = (items,setOrganizationList,setProjectList,setEovList,lang) => {
    let orgList = new Set();
    let projList = new Set();
    let eovList = new Set();
    items.forEach((item) => {
      processOrganization(item, orgList, lang);
      processProjects(item, projList);
      processEovs(item, eovList);
    });

    setOrganizationList(Array.from(orgList));
    setProjectList(Array.from(projList));
    setEovList(Array.from(eovList));
  };  

export function fetchDataSetInfo(id,setDatasetInfo, catalogueUrl) {
    fetch(`${catalogueUrl}/api/3/action/package_show?id=${id}`)
       .then((res) => res.json())
       .then((data) => {
        setDatasetInfo(data.result);
        })
        .catch((error) => {
          console.error("Error loading dataset info:", error);
        });
    }
  
  
  // Function to process projects and add them to the project list
  const processProjects = (item, projList) => {
    if (item.project && Array.isArray(item.project)) {
      const isAlreadyPresent = item.project.every((project) =>
        projList.has(project),
      );
      if (isAlreadyPresent) {
        return;
      }
      item.project.forEach((project) => projList.add(project));
    }
  };

  // Function to process projects and add them to the project list
  const processEovs = (item, eovList) => {
    if (item.eov && Array.isArray(item.eov)) {
      const isAlreadyPresent = item.eov.every((eov) => eovList.has(eov));
      if (isAlreadyPresent) {
        return;
      }
      item.eov.forEach((eov) => eovList.add(eov));
    }
  };

  // Function to process organization and add it to the organization list
  const processOrganization = (item, orgList, lang) => {
    if (item.organization && item.organization.title_translated) {
      if (orgList.has(item.organization.title_translated[lang])) {
        return;
      }
      orgList.add(item.organization.title_translated[lang]);
    }
  };