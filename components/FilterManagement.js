export function filterItemsByBadges(items, badges, selectedDateFilterOption) {
  if (!items || items.length === 0) return [];
  // If no badges, return all items
  if (!badges || Object.keys(badges).length === 0) return items;
  return items.filter((item) => {
    return Object.entries(badges).every(([filterType, value]) => {
      if (value.length === 0) {
        return true; // If no value, skip this filter
      }
      if (filterType === "search") {
        const searchVal = value.toLowerCase();
        return (
          (item.title_translated &&
            Object.values(item.title_translated).some((t) =>
              t.toLowerCase().includes(searchVal),
            )) ||
          (item.notes_translated &&
            Object.values(item.notes_translated).some((n) =>
              n.toLowerCase().includes(searchVal),
            ))
        );
      } else if (
        filterType === "organization" ||
        filterType === "projects" ||
        filterType === "eov"
      ) {
        return filterByOrganizationProjectsEov(item, filterType, value);
      } else if (filterType === "filter_date") {
        const field =
          selectedDateFilterOption || badges.filter_date_field || "";
        return manageDateFilterOptions(item, field, value);
      }
      return true;
    });
  });
}

// Function to filter items by organization, projects, or eov
function filterByOrganizationProjectsEov(item, filterType, selected_values) {
  const selectedValues = selected_values.map((arr) => arr[0]);
  if (filterType === "organization") {
    if (!Array.isArray(selected_values) || !Array.isArray(item.organization))
      return false;

    return item.organization.some((org) => selectedValues.includes(org.name));
  } else if (filterType === "projects") {
    if (!Array.isArray(selected_values) || !Array.isArray(item.project))
      return false;
    // Return true if at least one eov of the item is in the selection
    return item.project.some((project) => selectedValues.includes(project));
  } else if (filterType === "eov") {
    if (!Array.isArray(selected_values) || !Array.isArray(item.eov))
      return false;

    // Return true if at least one eov of the item is in the selection
    return item.eov.some((eov) => selectedValues.includes(eov));
  }
  return true;
}

function manageDateFilterOptions(item, selectedDateFilterOption, value) {
  // Expect value like 'YYYY-MM-DD%20TO%20YYYY-MM-DD'
  const dateArr = (value || "").split("%20TO%20");
  const startDate = dateArr[0] ? new Date(dateArr[0]) : null;
  const endDate = dateArr[1] ? new Date(dateArr[1]) : null;

  if (!selectedDateFilterOption) return true;

  if (selectedDateFilterOption.startsWith("metadata")) {
    return compareMetadataDates(
      item,
      [dateArr[0], dateArr[1]],
      selectedDateFilterOption,
    );
  }

  if (selectedDateFilterOption.startsWith("temporal")) {
    if (selectedDateFilterOption === "temporal-extent-overlaps") {
      return compareTemporalOverlaps(item, startDate, endDate);
    }
    const varName = selectedDateFilterOption.split("-")[2];
    return compareTemporalDates(item, [dateArr[0], dateArr[1]], varName);
  }

  console.warn(
    "Unknown date filter option selected:",
    selectedDateFilterOption,
  );
  return true;
}

// Fonction pour charger et filtrer les EOVs traduits
export const fetchAndFilterEovsTranslated = (
  lang,
  eovList,
  setTranslatedEovList,
) => {
  fetch("/eovs.json")
    .then((res) => res.json())
    .then((data) => {
      const eovs = data.eovs;
      const labelkey = `label_${lang}`;
      const filtered = eovs
        .filter((eov) => eovList.includes(eov.value))
        .map((eov) => [eov.value, eov[labelkey]]);
      setTranslatedEovList(filtered);
    })
    .catch((error) => {
      console.error("Error fetching EOVs:", error);
      setTranslatedEovList([]);
    });
};

function compareTemporalDates(item, dateArr, varName) {
  // Compare two date strings in 'YYYY-MM-DD' format
  const startDate = dateArr[0] ? new Date(dateArr[0]) : null;
  const endDate = dateArr[1] ? new Date(dateArr[1]) : null;
  if (!item.temporal_extent || !item.temporal_extent[`${varName}`]) return true;
  const itemDate = new Date(item.temporal_extent[`${varName}`]);
  if (startDate && endDate) {
    return itemDate >= startDate && itemDate <= endDate;
  }
  return true;
}

// Overlap if dataset [begin,end] intersects with selected [startDate,endDate]
function compareTemporalOverlaps(item, startDate, endDate) {
  if (!item.temporal_extent) return true;
  const dsBegin =
    item.temporal_extent["begin"] ||
    item.temporal_extent["temporal-extent-begin"]; // try both naming schemes
  const dsEnd =
    item.temporal_extent["end"] || item.temporal_extent["temporal-extent-end"];
  if (!dsBegin && !dsEnd) return true;

  const dBegin = dsBegin ? new Date(dsBegin) : null;
  const dEnd = dsEnd ? new Date(dsEnd) : null;

  if (!startDate || !endDate) return true;

  // Handle open-ended dataset ranges defensively
  const itemStart = dBegin || new Date(-8640000000000000); // min date
  const itemEnd = dEnd || new Date(); // assume ongoing if no end

  // Overlap condition: start <= itemEnd && end >= itemStart
  return startDate <= itemEnd && endDate >= itemStart;
}
//
function compareMetadataDates(item, dateArr, varName) {
  // Compare two date strings in 'YYYY-MM-DD' format
  const startDate = dateArr[0] ? new Date(dateArr[0]) : null;
  const endDate = dateArr[1] ? new Date(dateArr[1]) : null;
  if (!item[`${varName}`]) return true;
  const itemDate = new Date(item[`${varName}`]);
  if (startDate && endDate) {
    let compare = itemDate >= startDate && itemDate <= endDate;
    return compare;
  }
  return true;
}
