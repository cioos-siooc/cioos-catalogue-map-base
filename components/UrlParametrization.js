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

export function manageURLParameters({ badges, selectedItemId, isDrawerOpen }) {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  // Clear existing filter-related parameters
  ["eov", "projects", "organization", "search", "filter_date"].forEach(
    (key) => {
      params.delete(key);
    },
  );

  // Add badges to the URL parameters
  Object.entries(badges).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        params.append(key, Array.isArray(v) ? v[0] : v);
      });
    } else {
      params.set(key, value);
    }
  });

  // Update the hash if a selected item exists
  if (selectedItemId) {
    url.hash = selectedItemId;
  } else {
    url.hash = "";
  }

  // Add a parameter to indicate if the drawer is open
  if (isDrawerOpen) {
    params.set("drawer", "open");
  } else {
    params.delete("drawer");
  }

  // Update the URL without reloading the page
  url.search = params.toString();
  window.history.replaceState({}, "", url.toString());
}
