"use client";

import config from "@/app/config.js";

const catalogueUrl = config.catalogue_url;

// Function to fill organization and project lists
export const fillOrganizationAndProjectLists = (
  items,
  setOrganizationList,
  setProjectList,
  setEovList,
  lang,
) => {
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

export function fetchDataSetInfo(id, setDatasetInfo) {
  // We expect id to correspond to the dataset name used for caching.
  // Attempt to fetch the pre-cached JSON first.
  fetch(`/datasets/${id}.json`)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Static dataset not found for ${id}`);
      }
      return res.json();
    })
    .then((data) => setDatasetInfo(data))
    .catch((error) => {
      console.error("Error loading cached dataset info:", error);
      // Fallback to live fetch (optional safety net)
      fetch(`${catalogueUrl}/api/3/action/package_show?id=${id}`)
        .then((res) => res.json())
        .then((data) => setDatasetInfo(data.result))
        .catch((e) => console.error("Fallback live fetch failed:", e));
    });
}

// Use callback for fetching data
export function fetchDataSetSpatial(idDocument) {
  fetch(basePath + "/packages.json")
    .then((res) => res.json())
    .then((data) => {})
    .then(() => setLoading(false))
    .catch((error) => console.error("Error loading packages:", error));
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
  if (item.organization && Array.isArray(item.organization)) {
    item.organization.forEach((org) => {
      if (org.name && !orgList.has(org.name)) {
        orgList.add(org.name);
      }
    });
  }
};
