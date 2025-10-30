import { latLngToCell, cellToBoundary } from "h3-js";
import * as turf from "@turf/turf";

/**
 * Determines H3 resolution based on current zoom level
 * Higher zoom = higher resolution (more detailed hexagons)
 */
export const getH3ResolutionForZoom = (zoomLevel) => {
  if (zoomLevel <= 2) return 2;
  if (zoomLevel <= 3) return 3;
  if (zoomLevel <= 5) return 4;
  if (zoomLevel <= 7) return 5;
  if (zoomLevel <= 9) return 6;
  return 7;
};

/**
 * Aggregates datasets into hexagonal grid cells
 * Uses the entire spatial extent (polygon) of each dataset, not just the centroid
 * Returns GeoJSON FeatureCollection with aggregated data
 */
export const aggregateDatasetsToHexGrid = (datasets, zoomLevel) => {
  const resolution = getH3ResolutionForZoom(zoomLevel);
  const hexagons = new Map();
  const datasetToHexagons = new Map(); // Track which hexagons each dataset contributes to

  // Process each dataset
  datasets.forEach((dataset) => {
    if (!dataset.spatial) return;

    const hexagonsForDataset = new Set();

    try {
      // Extract all coordinates from the spatial geometry
      let coordinates = [];

      if (dataset.spatial.type === "Polygon") {
        // For Polygon, use all coordinates from all rings
        dataset.spatial.coordinates.forEach((ring) => {
          coordinates.push(...ring);
        });
      } else if (dataset.spatial.type === "MultiPolygon") {
        // For MultiPolygon, extract coordinates from all polygons
        dataset.spatial.coordinates.forEach((polygon) => {
          polygon.forEach((ring) => {
            coordinates.push(...ring);
          });
        });
      } else if (dataset.spatial.type === "Point") {
        // For Point, use single coordinate
        coordinates = [dataset.spatial.coordinates];
      }

      if (coordinates.length === 0) {
        return;
      }

      // For each coordinate in the polygon, add it to the corresponding hex cell
      coordinates.forEach(([lng, lat]) => {
        try {
          const cellId = latLngToCell(lat, lng, resolution);
          hexagonsForDataset.add(cellId);

          if (!hexagons.has(cellId)) {
            hexagons.set(cellId, {
              cellId,
              datasets: [],
              organizations: new Set(),
              eovs: new Set(),
            });
          }

          // Only add dataset once per cell (avoid duplicates)
          const hexData = hexagons.get(cellId);
          if (!hexData.datasets.some((d) => d.id === dataset.id)) {
            hexData.datasets.push({
              id: dataset.id,
              title: dataset.title_translated,
              organization: dataset.organization?.title_translated,
            });

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
        } catch (error) {
          // Skip individual point errors, continue with next point
        }
      });

      datasetToHexagons.set(dataset.id, hexagonsForDataset);
    } catch (error) {
      console.error(`Error processing dataset ${dataset.id}:`, error);
    }
  });

  // Convert hexagons to GeoJSON features
  const features = Array.from(hexagons.values()).map((hexData) => {
    try {
      const boundary = cellToBoundary(hexData.cellId);
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
