// Helper function to load hex grid data and get datasets for a cell
async function getDatasetIdsForHexCell(cellId) {
  try {
    const response = await fetch("/hex-grid-default.json");
    if (response.ok) {
      const data = await response.json();
      // The hex grid data structure is {cells: [...]}
      // Each cell has id and d (dataset IDs)
      if (data.cells) {
        const cell = data.cells.find((c) => c.id === cellId);
        if (cell && cell.d) {
          return cell.d;
        }
      }
    }
  } catch (error) {
    console.error("Error loading hex grid data:", error);
  }
  return [];
}

// Manage URL parameters on initial load
export async function manageURLParametersOnLoad(
  setBadges,
  setVisualizationMode,
) {
  // Check if the URL has parameters and update the state accordingly
  const urlParams = new URLSearchParams(window.location.search);

  // Handle visualization mode parameter
  const vizMode = urlParams.get("visualizationMode");
  if (vizMode && ["markers", "hexgrid"].includes(vizMode)) {
    if (setVisualizationMode) {
      setVisualizationMode(vizMode);
    }
  }

  // Loop through all entries and set badges for each
  for (const [key, value] of urlParams.entries()) {
    // Skip visualization mode as it's handled separately
    if (key === "visualizationMode") continue;

    // Handle hexCell filter specially
    if (key === "hexCell") {
      // cellId is now stored directly in the URL
      const cellId = value;
      if (cellId) {
        // Load dataset IDs from prerendered hex grid
        const datasetIds = await getDatasetIdsForHexCell(cellId);
        if (datasetIds.length > 0) {
          setBadges((prevBadges) => ({
            ...prevBadges,
            hexCell: {
              cellId,
              count: datasetIds.length,
              datasetIds,
            },
          }));
        }
      }
      continue;
    }

    // For multi-value params (like organization, projects, eov), get all values as array of [value, value]
    let badgeValue;
    if (["organization", "projects", "eov"].includes(key)) {
      const allValues = urlParams.getAll(key);
      badgeValue = allValues.map((v) => [v, v]);
    } else {
      badgeValue = value;
    }
    setBadges((prevBadges) => ({
      ...prevBadges,
      [key]: badgeValue,
    }));
  }
}

export function updateURLWithSelectedItem(selectedItemId) {
  if (typeof window !== "undefined" && selectedItemId) {
    // Keep current search params, just update the fragment/hash
    const { pathname, search } = window.location;
    window.history.replaceState(
      null,
      "",
      `${pathname}${search}#${selectedItemId}`,
    );
  }
}

export function updateURLWithVisualizationMode(mode) {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  if (mode && mode !== "markers") {
    // Set visualization mode if it's not the default
    url.searchParams.set("visualizationMode", mode);
  } else {
    // Remove visualization mode if it's markers (default)
    url.searchParams.delete("visualizationMode");
  }

  window.history.replaceState({}, "", url.toString());
}

export function initURLUpdateProcess(badges, loading) {
  if (hasHashInURL()) return; // If there's a hash in the URL, don't update the search params
  const url = new URL(window.location.href);

  // IMPORTANT: Always preserve visualization mode - it's never part of badges
  const currentVisualizationMode = url.searchParams.get("visualizationMode");

  // Rebuild the URL from current URL
  const urlParams = new URLSearchParams(window.location.search);

  // Start fresh - remove all filter params that will be rebuilt from badges
  if (!loading) {
    urlParams.delete("eov");
    urlParams.delete("projects");
    urlParams.delete("organization");
    urlParams.delete("search");
    urlParams.delete("filter_date");
    urlParams.delete("filter_date_field");
    urlParams.delete("hexCell"); // Will be re-added from badges if present
  }

  // Add all badges to URL
  Object.entries(badges).forEach(([filter_type, filter_value]) => {
    if (!filter_value || filter_value.length === 0) {
      urlParams.delete(filter_type);
      return;
    }

    // Handle hexCell filter specially
    if (filter_type === "hexCell") {
      if (filter_value.cellId) {
        urlParams.set(filter_type, filter_value.cellId);
      }
      return;
    }

    // For array values (like organization, projects, eov)
    if (Array.isArray(filter_value)) {
      if (Array.isArray(filter_value[0])) {
        filter_value.forEach((v) => {
          urlParams.append(filter_type, v[0]);
        });
      } else {
        urlParams.set(filter_type, filter_value.join(","));
      }
    } else {
      urlParams.set(filter_type, filter_value);
    }
  });

  // CRITICAL: Always re-apply visualization mode last so it's never lost
  if (currentVisualizationMode) {
    urlParams.set("visualizationMode", currentVisualizationMode);
  }

  // Update the URL without reloading the page
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}?${urlParams.toString()}`,
  );
}

function hasHashInURL() {
  return typeof window !== "undefined" && window.location.hash !== "";
}

export function updateURLWithBadges(badges) {
  if (!badges || Object.keys(badges).length === 0) return;
  const url = new URL(window.location.href);
  url.search = ""; // Clear all search params
  Object.entries(badges).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        // For array of arrays (e.g. [["a","A"],["b","B"]]), use v[0]
        url.searchParams.append(key, Array.isArray(v) ? v[0] : v);
      });
    } else {
      url.searchParams.set(key, value);
    }
  });
  window.history.replaceState({}, "", url.toString());
}
