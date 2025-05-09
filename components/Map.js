"use client";

import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";
import {
  MapContainer,
  TileLayer,
  useMap,
  Tooltip,
  LayersControl,
  GeoJSON,
} from "react-leaflet";
import { Marker } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import * as turf from "@turf/turf";
import { DrawerContext } from "../app/context/DrawerContext";
import { useContext, useState, useEffect, useRef } from "react";
import L from "leaflet";
import config from "@/app/config";
import { getLocale } from "@/app/get-locale";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { get } from "citation-js";

const { BaseLayer, Overlay } = LayersControl;

// Utility functions
const getPrimaryColor = () => {
  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-gray-500")
    .trim();
  return primaryColor;
};

const clearMapLayers = (map) => {
  map.eachLayer((layer) => {
    if (layer instanceof L.Polygon || layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });
};

const defaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  shadowSize: [41, 41],
  iconAnchor: [12, 41],
  shadowAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Map components
const FitBounds = ({ bounds }) => {
  const map = useMap();

  if (bounds) {
    clearMapLayers(map);
    var polygon = L.geoJSON(bounds, { color: getPrimaryColor() }).addTo(map);

    map.flyToBounds(polygon.getBounds(), {
      animate: true,
      padding: [50, 50],
      maxZoom: 10,
      duration: 0.3,
    });
  }

  return null;
};

// Dataset marker component
const DatasetMarker = ({ record, handleListItemClick, lang, openDrawer }) => {
  // Check if spatial data exists and is valid
  if (!record.spatial || !record.spatial.type) {
    console.warn(`Invalid spatial data for record ${record.id}`);
    return null;
  }

  let point;
  try {
    point = turf.centerOfMass(record.spatial);
    // Verify if point within the polygon
    const isPointInPolygon = turf.booleanPointInPolygon(point, record.spatial);
    if (!isPointInPolygon) {
      point = turf.pointOnFeature(record.spatial);
    }
  } catch (error) {
    console.error(
      `Error processing spatial data for record ${record.id}:`,
      error,
    );
    return null;
  }

  // Ensure point has valid coordinates before rendering marker
  if (
    !point ||
    !point.geometry ||
    !point.geometry.coordinates ||
    point.geometry.coordinates.length < 2
  ) {
    console.warn(`Invalid point geometry for record ${record.id}`);
    return null;
  }

  const handleMarkerClick = () => {
    console.log("Marker clicked:", record.id);
    handleListItemClick(record);
    openDrawer();
  };

  const handleMouseOver = (e) => {
    const map = e.target._map;
    const polygon = L.geoJSON(record.spatial, {
      style: {
        color: getPrimaryColor(),
        weight: 2,
        fillColor: getPrimaryColor(),
        fillOpacity: 0.5,
      },
    }).addTo(map);

    // Store the polygon layer on the marker for later removal
    e.target._hoverPolygon = polygon;
  };

  const handleMouseOut = (e) => {
    // Remove the polygon layer when the mouse leaves the marker
    const map = e.target._map;
    if (e.target._hoverPolygon) {
      map.removeLayer(e.target._hoverPolygon);
      e.target._hoverPolygon = null;
    }
  };

  return (
    <Marker
      key={record.id}
      position={[point.geometry.coordinates[1], point.geometry.coordinates[0]]}
      icon={defaultIcon}
      eventHandlers={{
        click: handleMarkerClick,
        mouseover: handleMouseOver,
        mouseout: handleMouseOut,
      }}
    >
      <Tooltip>
        <div className="w-[200px]">
          <h2 className="font-bold text-wrap">
            {record.title_translated[lang]}
          </h2>
          <p className="text-xs text-wrap">
            {record.organization.title_translated[lang]}
          </p>
        </div>
      </Tooltip>
    </Marker>
  );
};

// Spinner component to show during hexagon generation
const LoadingSpinner = () => {
  const map = useMap();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Create a div element for the spinner
    const spinnerContainer = L.DomUtil.create("div", "hexagon-loading-spinner");
    spinnerContainer.style.position = "absolute";
    spinnerContainer.style.left = "50%";
    spinnerContainer.style.top = "50%";
    spinnerContainer.style.transform = "translate(-50%, -50%)";
    spinnerContainer.style.backgroundColor = "white";
    spinnerContainer.style.padding = "10px 15px";
    spinnerContainer.style.borderRadius = "4px";
    spinnerContainer.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
    spinnerContainer.style.zIndex = "1000";
    spinnerContainer.style.display = "flex";
    spinnerContainer.style.alignItems = "center";
    spinnerContainer.style.gap = "10px";

    // Create spinner
    const spinner = L.DomUtil.create("div", "spinner", spinnerContainer);
    spinner.style.border = "3px solid rgba(0,0,0,0.1)";
    spinner.style.borderTopColor = getPrimaryColor();
    spinner.style.borderRadius = "50%";
    spinner.style.width = "20px";
    spinner.style.height = "20px";
    spinner.style.animation = "spin 1s linear infinite";

    // Add text
    const text = L.DomUtil.create("span", "", spinnerContainer);
    text.textContent = "Generating hexagons...";

    // Add CSS animation
    if (!document.getElementById("spinner-animation")) {
      const style = document.createElement("style");
      style.id = "spinner-animation";
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    // Add to map container
    map.getContainer().appendChild(spinnerContainer);

    // Show/hide based on isVisible state
    const updateVisibility = () => {
      spinnerContainer.style.display = isVisible ? "flex" : "none";
    };

    // Set up observer to watch isVisible changes
    const observer = new MutationObserver(() => {
      updateVisibility();
    });

    // Initial visibility
    updateVisibility();

    return () => {
      // Clean up
      if (map.getContainer().contains(spinnerContainer)) {
        map.getContainer().removeChild(spinnerContainer);
      }
      if (document.getElementById("spinner-animation")) {
        document.getElementById("spinner-animation").remove();
      }
      observer.disconnect();
    };
  }, [map]);

  // Method to show/hide the spinner
  const setSpinnerVisibility = (visible) => {
    setIsVisible(visible);
  };

  return { setSpinnerVisibility };
};

// Hexagon layer component
const HexagonLayer = ({ filteredItems }) => {
  const map = useMap();
  const [hexGrid, setHexGrid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const spinnerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const isGeneratingRef = useRef(false);

  // Create spinner
  const spinner = LoadingSpinner();
  useEffect(() => {
    spinnerRef.current = spinner;
  }, [spinner]);

  // Update spinner visibility when loading state changes
  useEffect(() => {
    if (spinnerRef.current) {
      spinnerRef.current.setSpinnerVisibility(isLoading);
    }
  }, [isLoading]);

  // Generate hexagon grid only when we have items and on map moves
  useEffect(() => {
    if (!filteredItems || filteredItems.length === 0) return;

    // Function to generate the hexagon grid
    const generateHexGrid = () => {
      // If already generating, don't start another generation
      if (isGeneratingRef.current) return;

      isGeneratingRef.current = true;
      setIsLoading(true); // Show spinner
      console.log("Generating hexagon grid...");

      try {
        // Filter out items with invalid spatial data
        const allFeatures = filteredItems
          .filter((item) => {
            if (!item || !item.spatial || !item.spatial.type) return false;
            if (
              !item.spatial.coordinates ||
              !Array.isArray(item.spatial.coordinates)
            )
              return false;

            if (item.spatial.type === "Polygon") {
              return (
                Array.isArray(item.spatial.coordinates[0]) &&
                item.spatial.coordinates[0].length > 0 &&
                Array.isArray(item.spatial.coordinates[0][0])
              );
            }

            return true;
          })
          .map((item) => item.spatial);

        if (allFeatures.length === 0) {
          console.warn("No valid features found for hexagon grid");
          setHexGrid(null);
          setIsLoading(false); // Hide spinner
          isGeneratingRef.current = false;
          return;
        }

        // Create feature objects
        const featureCollection = {
          type: "FeatureCollection",
          features: allFeatures.map((spatial) => ({
            type: "Feature",
            properties: {},
            geometry: spatial,
          })),
        };

        // Use current map bounds for the hexagon grid
        const mapBounds = map.getBounds();
        const bbox = [
          mapBounds.getWest(),
          mapBounds.getSouth(),
          mapBounds.getEast(),
          mapBounds.getNorth(),
        ];

        // Calculate cell size based on zoom level with 4-level jumps
        const currentZoom = map.getZoom();
        const zoomGroup = Math.floor(currentZoom / 4); // Group by 4 zoom levels

        // Base cell sizes in km for each zoom group, starting with minimum 500km
        const zoomGroupCellSizes = {
          0: 500, // Zoom 0-3: 500km cells
          1: 200, // Zoom 4-7: 200km cells
          2: 100, // Zoom 8-11: 100km cells
          3: 50, // Zoom 12-15: 50km cells
          4: 20, // Zoom 16-19: 20km cells
          5: 5, // Zoom 20+: 5km cells
        };

        // Get cell size for current zoom group
        const cellSide = zoomGroupCellSizes[zoomGroup] || 500; // Default to 500km if not in range

        console.log(
          `Current zoom: ${currentZoom}, Zoom group: ${zoomGroup}, Cell size: ${cellSide}km`,
        );
        console.log("Current view bbox:", bbox);

        // Generate hexagon grid for current view
        const options = { units: "kilometers" };
        const newHexGrid = turf.hexGrid(bbox, cellSide, options);

        if (
          !newHexGrid ||
          !newHexGrid.features ||
          newHexGrid.features.length === 0
        ) {
          console.warn("No hexagons were generated");
          setHexGrid(null);
          setIsLoading(false); // Hide spinner
          isGeneratingRef.current = false;
          return;
        }

        console.log(
          "Hexagon grid created with",
          newHexGrid.features.length,
          "cells",
        );

        // Limit the number of hexagons to prevent performance issues
        const MAX_HEXAGONS = 1000;
        if (newHexGrid.features.length > MAX_HEXAGONS) {
          console.warn(
            `Too many hexagons (${newHexGrid.features.length}), limiting to ${MAX_HEXAGONS}`,
          );
          newHexGrid.features = newHexGrid.features.slice(0, MAX_HEXAGONS);
        }

        // Count how many polygons intersect with each hexagon
        newHexGrid.features.forEach((hexagon) => {
          let count = 0;
          allFeatures.forEach((spatial) => {
            try {
              const spatialFeature = {
                type: "Feature",
                properties: {},
                geometry: spatial,
              };

              if (turf.booleanIntersects(hexagon, spatialFeature)) {
                count++;
              }
            } catch (err) {
              // Skip this intersection check
            }
          });
          hexagon.properties.count = count;
        });

        // Filter out hexagons with no intersections
        const intersectingHexagons = newHexGrid.features.filter(
          (hex) => hex.properties.count > 0,
        );
        console.log(
          `Found ${intersectingHexagons.length} hexagons with intersections`,
        );

        if (intersectingHexagons.length === 0) {
          setHexGrid(null);
        } else {
          newHexGrid.features = intersectingHexagons;
          setHexGrid(newHexGrid);
        }

        setTimeout(() => {
          setIsLoading(false); // Hide spinner
          isGeneratingRef.current = false;
        }, 100); // Small delay to ensure UI updates
      } catch (error) {
        console.error("Error in generating hexagon grid:", error);
        setHexGrid(null);
        setIsLoading(false); // Hide spinner on error
        isGeneratingRef.current = false;
      }
    };

    // Handle events with debounce
    const handleDebounced = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        generateHexGrid();
      }, 2000); // 2 seconds debounce
    };

    // Generate initial grid
    generateHexGrid();

    // Set up event listeners for map movement
    map.on("moveend", handleDebounced);
    map.on("zoomend", handleDebounced);

    // Add window resize listener
    window.addEventListener("resize", handleDebounced);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      map.off("moveend", handleDebounced);
      map.off("zoomend", handleDebounced);
      window.removeEventListener("resize", handleDebounced);
    };
  }, [map, filteredItems]);

  // If no hexGrid, return null
  if (!hexGrid) return null;

  // Find the maximum count for color scaling
  const maxCount = Math.max(
    1,
    ...hexGrid.features.map((hex) => hex.properties.count),
  );

  // Style function for the hexagons
  const getHexagonStyle = (feature) => {
    const count = feature.properties.count;
    const primaryColor = getPrimaryColor();

    // Calculate intensity level (0-1)
    const intensity = count / maxCount;

    // Simplified color gradient calculation
    // Use CSS filter to create a gradient from black to the primary color
    // This is much simpler than RGB interpolation
    const brightness = Math.round(intensity * 100); // 0-100%

    return {
      fillColor: primaryColor,
      // Use opacity as the main visual indicator of intensity
      fillOpacity: 0.2 + intensity * 0.55, // Range from 0.2 to 0.75
      color: "white",
      weight: 1,
      opacity: 0.5,
    };
  };

  // Tooltip function for the hexagons
  const onEachHexagon = (feature, layer) => {
    const count = feature.properties.count;
    layer.bindTooltip(`${count} dataset${count > 1 ? "s" : ""}`);
  };

  return (
    <GeoJSON
      data={hexGrid}
      style={getHexagonStyle}
      onEachFeature={onEachHexagon}
    />
  );
};

// Base map layers component
const BaseLayers = ({ basemaps, lang }) => (
  <>
    {basemaps.map((layer) => (
      <BaseLayer
        key={layer.key}
        checked={layer.checked || false}
        name={layer.name[lang]}
      >
        <TileLayer url={layer.url} attribution={layer.attribution} />
      </BaseLayer>
    ))}
  </>
);

// Main Map component
function Map({ bounds, filteredItems, handleListItemClick, lang }) {
  const { openDrawer } = useContext(DrawerContext);
  const t = getLocale(lang);

  return (
    <div id="container" className="h-full w-full">
      <MapContainer
        className="h-full w-full"
        center={config.map.center}
        zoom={config.map.zoom}
        scrollWheelZoom={true}
        boundsOptions={{ padding: [1, 1] }}
      >
        <LayersControl position="bottomleft">
          <BaseLayers basemaps={config.basemaps} lang={lang} />
          {bounds && <FitBounds bounds={bounds} />}
          <Overlay checked name={t.datasets_markers}>
            <MarkerClusterGroup>
              {filteredItems.map((item) => (
                <DatasetMarker
                  key={item.id}
                  record={item}
                  handleListItemClick={handleListItemClick}
                  lang={lang}
                  openDrawer={openDrawer}
                />
              ))}
            </MarkerClusterGroup>
          </Overlay>
          <Overlay name={t.hexagon_heatmap || "Hexagon Heatmap"}>
            <HexagonLayer filteredItems={filteredItems} />
          </Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  );
}

export default Map;
