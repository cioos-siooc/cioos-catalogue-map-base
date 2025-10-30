const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

// Load config
const config = yaml.load(fs.readFileSync("config.yaml", "utf8"));

// Import hex grid utilities - we need to convert them to CommonJS since this is a Node script
// We'll use dynamic imports for ES modules
async function generateHexGrid() {
  try {
    // Read packages.json to get all datasets
    const packagesPath = path.join("public", "packages.json");
    if (!fs.existsSync(packagesPath)) {
      console.log("packages.json not found, skipping hex grid prerendering");
      return;
    }

    const datasets = JSON.parse(fs.readFileSync(packagesPath, "utf8"));
    console.log(`Prerendering hex grid for ${datasets.length} datasets...`);

    // Get default zoom level from config
    const defaultZoom = config.map?.zoom || 4;
    console.log(`Using default zoom level: ${defaultZoom}`);

    // Import h3-js dynamically
    const h3 = await import("h3-js");
    const turf = await import("@turf/turf");

    // Get H3 resolution for default zoom
    const getH3ResolutionForZoom = (zoomLevel) => {
      if (zoomLevel <= 2) return 2;
      if (zoomLevel <= 3) return 3;
      if (zoomLevel <= 5) return 3;
      if (zoomLevel <= 7) return 4;
      if (zoomLevel <= 9) return 5;
      return 6;
    };

    const resolution = getH3ResolutionForZoom(defaultZoom);
    console.log(`H3 resolution for zoom ${defaultZoom}: ${resolution}`);

    // Calculate map bounds from center and zoom level
    const [centerLat, centerLng] = config.map?.center || [0, 0];
    const calculateMapBounds = (lat, lng, zoom) => {
      // Simplified bounds calculation: larger zoom = smaller area
      // At zoom 4, typical visible area is roughly 90 degrees on each side
      const baseDegrees = 360 / Math.pow(2, zoom);
      const rangeInDegrees = baseDegrees;

      return {
        minLat: Math.max(-90, lat - rangeInDegrees),
        maxLat: Math.min(90, lat + rangeInDegrees),
        minLng: lng - rangeInDegrees,
        maxLng: lng + rangeInDegrees,
      };
    };

    const mapBounds = calculateMapBounds(centerLat, centerLng, defaultZoom);
    console.log(
      `Map bounds: lat ${mapBounds.minLat.toFixed(2)}-${mapBounds.maxLat.toFixed(2)}, lng ${mapBounds.minLng.toFixed(2)}-${mapBounds.maxLng.toFixed(2)}`,
    );

    // Check if dataset polygon exceeds map bounds (too global)
    const doesDatasetExceedBounds = (bbox) => {
      const [minLng, minLat, maxLng, maxLat] = bbox;
      // Dataset exceeds bounds if it extends beyond the map bounds
      return (
        minLat <= mapBounds.minLat - 10 || // 10 degrees tolerance
        maxLat >= mapBounds.maxLat + 10 ||
        minLng <= mapBounds.minLng - 10 ||
        maxLng >= mapBounds.maxLng + 10
      );
    };

    // Check if point is inside polygon
    const isCellInPolygon = (cellId, polygon) => {
      try {
        const boundary = h3.cellToBoundary(cellId);
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

    // Aggregate datasets into hex grid
    const hexagons = new Map();
    let skippedDatasets = 0;

    for (const dataset of datasets) {
      if (!dataset.spatial) continue;

      try {
        // Get bounding box
        const bbox = turf.bbox(dataset.spatial);

        // Skip datasets that exceed map bounds (too global)
        if (doesDatasetExceedBounds(bbox)) {
          skippedDatasets++;
          continue;
        }

        const [minLng, minLat, maxLng, maxLat] = bbox;

        // Sample points across the bounding box
        const step = 0.5;
        for (let lat = minLat; lat <= maxLat; lat += step) {
          for (let lng = minLng; lng <= maxLng; lng += step) {
            try {
              const cellId = h3.latLngToCell(lat, lng, resolution);

              // Check if cell is inside polygon
              if (isCellInPolygon(cellId, dataset.spatial)) {
                if (!hexagons.has(cellId)) {
                  hexagons.set(cellId, {
                    cellId,
                    datasets: [],
                    organizations: new Set(),
                    eovs: new Set(),
                  });
                }

                const hexData = hexagons.get(cellId);
                if (!hexData.datasets.includes(dataset.id)) {
                  hexData.datasets.push(dataset.id);

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
              // Skip individual point errors
            }
          }
        }
      } catch (error) {
        console.warn(
          `Error processing dataset ${dataset.id}: ${error.message}`,
        );
      }
    }

    // Get hex grid configuration
    const hexGridConfig = config.hex_grid || {};
    const bounds = hexGridConfig.bounds || [-180, -90, 180, 90]; // [minLng, minLat, maxLng, maxLat]
    const [boundsMinLng, boundsMinLat, boundsMaxLng, boundsMaxLat] = bounds;

    console.log(
      `Hex grid config: bounds=[${boundsMinLng},${boundsMinLat},${boundsMaxLng},${boundsMaxLat}]`,
    );

    // Convert to minimal format - store only essential data
    // cellId can be used to generate geometry with cellToBoundary() on the fly
    // Also filter out hexes near the ±180 longitude boundary (International Date Line)
    const cells = [];
    let dateLineHexes = 0;
    let outOfBoundsHexes = 0;

    for (const hexData of hexagons.values()) {
      try {
        // Get the bounding box of the hex cell
        const boundary = h3.cellToBoundary(hexData.cellId);
        const lngs = boundary.map(([, lng]) => lng);
        const lats = boundary.map(([lat]) => lat);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);

        // Skip hexes that are near or cross the ±180 longitude boundary
        if (maxLng > 170 || minLng < -170 || maxLng - minLng > 180) {
          dateLineHexes++;
          continue;
        }

        // Skip hexes outside the configured bounding box
        if (
          minLng < boundsMinLng ||
          maxLng > boundsMaxLng ||
          minLat < boundsMinLat ||
          maxLat > boundsMaxLat
        ) {
          outOfBoundsHexes++;
          continue;
        }

        cells.push({
          id: hexData.cellId,
          c: hexData.datasets.length, // count
          d: hexData.datasets, // datasets
          o: Array.from(hexData.organizations), // organizations
          e: Array.from(hexData.eovs), // eovs
        });
      } catch (error) {
        // Skip cells with errors
        continue;
      }
    }

    // Save to public directory - compact format without geometries
    const hexGridData = {
      cells,
      zoomLevel: defaultZoom,
      h3Resolution: resolution,
      generatedAt: new Date().toISOString(),
    };

    const outPath = path.join("public", "hex-grid-default.json");
    fs.writeFileSync(outPath, JSON.stringify(hexGridData), "utf8");

    console.log(
      `✓ Prerendered hex grid with ${cells.length} cells to ${outPath}`,
    );
    console.log(
      `  - Filtered out: ${outOfBoundsHexes} out-of-bounds hexes, ${dateLineHexes} date line hexes`,
    );
    console.log(`  - Skipped: ${skippedDatasets} global datasets`);
  } catch (error) {
    console.error("Error prerendering hex grid:", error);
    // Don't exit with error - this is a non-critical step
  }
}

// Run the function
generateHexGrid();
