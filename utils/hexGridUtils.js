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
 * Returns GeoJSON FeatureCollection with aggregated data
 */
export const aggregateDatasetsToHexGrid = (datasets, zoomLevel) => {
  const resolution = getH3ResolutionForZoom(zoomLevel);
  const hexagons = new Map();

  // Process each dataset
  datasets.forEach((dataset) => {
    if (!dataset.spatial) return;

    // Get a point from the spatial extent
    let point;
    try {
      // Try to get center of mass first
      const centerOfMass = turf.centerOfMass(dataset.spatial);
      const isInside = turf.booleanPointInPolygon(
        centerOfMass,
        dataset.spatial,
      );

      if (isInside) {
        point = centerOfMass;
      } else {
        // If not inside, get a point guaranteed to be inside the polygon
        point = turf.pointOnFeature(dataset.spatial);
      }
    } catch (error) {
      console.error(`Error getting point for dataset ${dataset.id}:`, error);
      return;
    }

    if (!point || !point.geometry || !point.geometry.coordinates) {
      return;
    }

    const [lng, lat] = point.geometry.coordinates;

    // Convert lat/lng to H3 cell
    try {
      const cellId = latLngToCell(lat, lng, resolution);

      if (!hexagons.has(cellId)) {
        hexagons.set(cellId, {
          cellId,
          datasets: [],
          organizations: new Set(),
          eovs: new Set(),
        });
      }

      const hexData = hexagons.get(cellId);
      hexData.datasets.push({
        id: dataset.id,
        title: dataset.title_translated,
        organization: dataset.organization?.title_translated,
      });

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
