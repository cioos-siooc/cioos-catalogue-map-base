// Manage URL parameters on initial load
export function manageURLParametersOnLoad(setBadges) {
  // Check if the URL has parameters and update the state accordingly
  const urlParams = new URLSearchParams(window.location.search);
  // Loop through all entries and set badges for each
  urlParams.forEach((value, key) => {
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
  });
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


export function initURLUpdateProcess(badges, loading) {
      if(hasHashInURL()) return; // If there's a hash in the URL, don't update the search params
      const urlParams = new URLSearchParams(window.location.search);


      updateURL(urlParams, badges,loading);
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

  // Function to update URL parameters based on the current state
  // This function will be called whenever eovList, projectList, or organizationList changes
function updateURL(urlParams, badges, loading) {
    
    // Remove all previous filter params
    // If loading is true, keep the eov, projects, organization, search, and filter_date params
    // If loading is false, remove them, we must update the URL with the current badges
    
    if( !loading) {
      urlParams.delete("eov");
      urlParams.delete("projects");
      urlParams.delete("organization");
      urlParams.delete("search");
      urlParams.delete("filter_date");
    }
    // For each badge, update the URL params accordingly
    Object.entries(badges).forEach(([filter_type, filter_value]) => {
      if (!filter_value || filter_value.length === 0) {
        urlParams.delete(filter_type);
        return;
      }
      // For array values (like organization, projects, eov)
      if (Array.isArray(filter_value)) {
        // If value is an array of arrays (e.g. [["val", "label"], ...])
        if (Array.isArray(filter_value[0])) {
          // Add each value as a separate param (for multi-select)
          filter_value.forEach((v) => {
            urlParams.append(filter_type, v[0]);
          });
        } else {
          // Otherwise, join as comma-separated
          urlParams.set(filter_type, filter_value.join(","));
        }
      } else {
        // For string values (like search, filter_date)
        urlParams.set(filter_type, filter_value);
      }
    });
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