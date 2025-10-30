import { latLngToCell, cellToBoundary } from "h3-js";
import * as turf from "@turf/turf";

/**
 * Determines H3 resolution based on current zoom level
 * Higher zoom = higher resolution (more detailed hexagons)
 * Lower H3 resolution = larger hexagons
 */
export const getH3ResolutionForZoom = (zoomLevel) => {
  if (zoomLevel <= 2) return 2;
  if (zoomLevel <= 3) return 3;
  if (zoomLevel <= 5) return 3;
  if (zoomLevel <= 7) return 4;
  if (zoomLevel <= 9) return 5;
  return 6;
};

/**
 * Checks if a hex cell crosses the ±180 longitude boundary (date line)
 */
const isCellOnDateLine = (cellId) => {
  try {
    const boundary = cellToBoundary(cellId);
    const lngs = boundary.map(([, lng]) => lng);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Skip hexes that are near or cross the ±180 longitude boundary
    return maxLng > 170 || minLng < -170 || maxLng - minLng > 180;
  } catch (error) {
    return false;
  }
};

/**
 * Checks if a hex cell center point is inside a polygon
 */
const isCellInPolygon = (cellId, polygon) => {
  try {
    const boundary = cellToBoundary(cellId);
    // Get the center of the hex cell by averaging boundary points
    const centerLat =
      boundary.reduce((sum, [lat]) => sum + lat, 0) / boundary.length;
    const centerLng =
      boundary.reduce((sum, [, lng]) => sum + lng, 0) / boundary.length;

    const point = turf.point([centerLng, centerLat]);
    return turf.booleanPointInPolygon(point, polygon);
  } catch (error) {
    return false;
  }
};

/**
 * Aggregates datasets into hexagonal grid cells
 * Uses the entire spatial extent (polygon) of each dataset, including all interior hexagons
 * Returns GeoJSON FeatureCollection with aggregated data
 * @param {Array} datasets - Array of datasets to aggregate
 * @param {number} zoomLevel - Current zoom level
 * @param {Object} config - Configuration object with minDatasetsPerCell and bounds
 */
export const aggregateDatasetsToHexGrid = (
  datasets,
  zoomLevel,
  config = {},
) => {
  const resolution = getH3ResolutionForZoom(zoomLevel);
  const hexagons = new Map();

  // Get filtering configuration
  const bounds = config.bounds || [-180, -90, 180, 90]; // [minLng, minLat, maxLng, maxLat]
  const [boundsMinLng, boundsMinLat, boundsMaxLng, boundsMaxLat] = bounds;

  // Process each dataset
  datasets.forEach((dataset) => {
    if (!dataset.spatial) return;

    try {
      // Get bounding box to limit hex search space
      const bbox = turf.bbox(dataset.spatial);
      const [minLng, minLat, maxLng, maxLat] = bbox;

      // Generate a grid of points across the bounding box
      // Using a smaller step to ensure we catch all hexagons
      const step = 0.5; // degrees - adjust for resolution

      // Collect all hexagons that intersect with the polygon
      const hexagonsForDataset = new Set();

      for (let lat = minLat; lat <= maxLat; lat += step) {
        for (let lng = minLng; lng <= maxLng; lng += step) {
          try {
            const cellId = latLngToCell(lat, lng, resolution);

            // Check if this cell is inside the polygon
            if (isCellInPolygon(cellId, dataset.spatial)) {
              hexagonsForDataset.add(cellId);

              if (!hexagons.has(cellId)) {
                hexagons.set(cellId, {
                  cellId,
                  datasets: [],
                  organizations: new Set(),
                  eovs: new Set(),
                });
              }

              // Add dataset if not already present
              const hexData = hexagons.get(cellId);
              if (!hexData.datasets.includes(dataset.id)) {
                hexData.datasets.push(dataset.id);

                // Add organization and EOVs only once per dataset per cell
                if (dataset.organization?.title_translated) {
                  const orgTitle =
                    dataset.organization.title_translated.en ||
                    dataset.organization.title_translated.fr ||
                    "Unknown";
                  hexData.organizations.add(orgTitle);
                }

                if (dataset.eov && Array.isArray(dataset.eov)) {
                  dataset.eov.forEach((eov) => hexData.eovs.add(eov));
                }
              }
            }
          } catch (error) {
            // Skip individual cell errors
          }
        }
      }
    } catch (error) {
      console.error(`Error processing dataset ${dataset.id}:`, error);
    }
  });

  // Convert hexagons to GeoJSON features and apply filters
  const features = Array.from(hexagons.values()).map((hexData) => {
    try {
      // Skip hexes on date line
      if (isCellOnDateLine(hexData.cellId)) {
        return null;
      }

      const boundary = cellToBoundary(hexData.cellId);
      const lngs = boundary.map(([, lng]) => lng);
      const lats = boundary.map(([lat]) => lat);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);

      // Skip hexes outside the configured bounding box
      if (
        minLng < boundsMinLng ||
        maxLng > boundsMaxLng ||
        minLat < boundsMinLat ||
        maxLat > boundsMaxLat
      ) {
        return null;
      }

      // Convert H3 boundary (array of [lat, lng]) to GeoJSON format [lng, lat]
      const coordinates = [boundary.map(([lat, lng]) => [lng, lat])];

      return {
        type: "Feature",
        id: hexData.cellId,
        geometry: {
          type: "Polygon",
          coordinates,
        },
        properties: {
          cellId: hexData.cellId,
          count: hexData.datasets.length,
          datasets: hexData.datasets,
          organizations: Array.from(hexData.organizations),
          eovs: Array.from(hexData.eovs),
        },
      };
    } catch (error) {
      console.error(`Error converting hex to GeoJSON:`, error);
      return null;
    }
  });

  return {
    type: "FeatureCollection",
    features: features.filter((f) => f !== null),
  };
};

/**
 * Get the maximum count for color scale normalization
 */
export const getMaxCount = (features) => {
  return features.reduce((max, feature) => {
    return Math.max(max, feature.properties.count);
  }, 0);
};
