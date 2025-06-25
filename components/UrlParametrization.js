// Manage URL parameters on initial load
export function manageURLParametersOnLoad(
  setBadges,
  initialized,
  setInitialized,
) {
  // Check if the URL has parameters and update the state accordingly
  if (initialized) return; // Prevent re-initialization

  const urlParams = new URLSearchParams(window.location.search);
  // Loop through all entries and set badges for each
  // Collect all values for organization, projects, and eov as arrays
  const multiValueKeys = ["organization", "projects", "eov"];
  const badgesToSet = {};

  multiValueKeys.forEach((key) => {
    const values = urlParams.getAll(key);
    if (values.length > 0) {
      badgesToSet[key] = values.map((v) => [v, v]);
    }
  });

  // Handle all other keys as single values
  urlParams.forEach((value, key) => {
    if (!multiValueKeys.includes(key)) {
      badgesToSet[key] = value;
    }
  });

  setBadges((prevBadges) => ({
    ...prevBadges,
    ...badgesToSet,
  }));

  setInitialized(true);
}

export function manageURLParameters({
  badges,
  selectedItemId,
  isDrawerOpen,
  initialized,
}) {
  if (typeof window === "undefined") return;
  if (!initialized) return; // Prevent re-initialization

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

  // Add a parameter to indicate if the drawer is open
  console.log("isDrawerOpen:", isDrawerOpen, "selectedItemId:", selectedItemId);
  if (selectedItemId && isDrawerOpen) {
    url.hash = selectedItemId;
  } else {
    url.hash = "";
  }

  // Update the URL without reloading the page
  url.search = params.toString();
  window.history.replaceState({}, "", url.toString());
}
