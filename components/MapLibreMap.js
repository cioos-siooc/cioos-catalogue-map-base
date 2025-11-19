"use client";

import React, {
  useContext,
  useEffect,
  forwardRef,
  useRef,
  memo,
  useImperativeHandle,
  useMemo,
  useState,
  useCallback,
} from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Map as MapGL, NavigationControl, ScaleControl } from "react-map-gl";
import * as turf from "@turf/turf";
import Supercluster from "supercluster";
import { DrawerContext } from "../app/context/DrawerContext";
import config from "@/app/config";
import { getLocale } from "@/app/get-locale";

const getPrimaryColor = () => {
  if (typeof document === "undefined") return "#52a79b";
  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-primary-500")
    .trim();
  return primaryColor || "#52a79b";
};

// Build map style from config (without basemap layers - they're added dynamically)
const buildMapStyle = () => {
  const sources = {};
  const layers = [];

  // Add basemap sources (not layers - layers will be added dynamically)
  if (config.basemaps && Array.isArray(config.basemaps)) {
    config.basemaps.forEach((basemap) => {
      sources[basemap.key] = {
        type: "raster",
        tiles: [basemap.url],
        tileSize: 256,
      };
      if (basemap.attribution) {
        sources[basemap.key].attribution = basemap.attribution;
      }
    });
  }

  // Add overlay sources (not layers - they'll be added dynamically)
  if (config.overlays && Array.isArray(config.overlays)) {
    config.overlays.forEach((overlay) => {
      sources[overlay.key] = {
        type: "raster",
        tiles: [overlay.url],
        tileSize: 256,
      };
      if (overlay.attribution) {
        sources[overlay.key].attribution = overlay.attribution;
      }
    });
  }

  // Create the base map style
  const mapStyle = {
    version: 8,
    sources,
    layers,
    // Use OpenMapTiles glyph server instead
    glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
  };

  // Add projection if configured
  if (config.map.projection && config.map.projection !== "mercator") {
    const projName =
      typeof config.map.projection === "string"
        ? config.map.projection
        : config.map.projection.name || config.map.projection;

    if (projName && typeof projName === "string") {
      mapStyle.projection = projName;
    }
  }

  return mapStyle;
};

// Marker popup component
const MarkerPopup = ({ record, handleListItemClick, openDrawer }) => {
  const handleClick = () => {
    handleListItemClick(record);
    openDrawer();
  };

  return (
    <div
      className="cursor-pointer rounded bg-white p-2 shadow-md"
      onClick={handleClick}
    >
      <p className="font-semibold">{record.name || record.title}</p>
      <p className="text-sm text-gray-600">{record.organization}</p>
    </div>
  );
};

// Main MapLibre component
const MapLibreMap = forwardRef(function MapLibreMap(
  { bounds, filteredItems, handleListItemClick, lang },
  ref,
) {
  const { openDrawer } = useContext(DrawerContext);
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [viewport, setViewport] = useState({
    longitude: config.map.center[1],
    latitude: config.map.center[0],
    zoom: config.map.zoom,
  });
  const [hoveredClusterId, setHoveredClusterId] = useState(null);
  // Find the first basemap marked as checked, or use the first one
  const defaultBasemap =
    config.basemaps?.find((b) => b.checked)?.key ||
    config.basemaps?.[0]?.key ||
    "osm";
  const [activeBasemap, setActiveBasemap] = useState(defaultBasemap);
  const [showBasemap, setShowBasemap] = useState(true);
  const [showOverlays, setShowOverlays] = useState(true);

  // Initialize supercluster for marker clustering
  const cluster = useMemo(() => {
    const supercluster = new Supercluster({
      radius: 75,
      maxZoom: 16,
    });

    // Extract points for clustering
    const points = filteredItems
      .map((item) => {
        let point;

        // Handle different spatial geometry types
        if (item.spatial && item.spatial.type === "Point") {
          // For Point geometries, use coordinates directly
          point = {
            geometry: {
              coordinates: item.spatial.coordinates,
            },
          };
        } else if (item.spatial) {
          // For Polygon, MultiPolygon, or other geometries, calculate center
          let centerPoint = turf.centerOfMass(item.spatial);
          const isPointInPolygon = turf.booleanPointInPolygon(
            centerPoint,
            item.spatial,
          );
          if (!isPointInPolygon) {
            centerPoint = turf.pointOnFeature(item.spatial);
          }
          point = centerPoint;
        } else {
          // Skip items without spatial data
          return null;
        }

        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [
              point.geometry.coordinates[0],
              point.geometry.coordinates[1],
            ],
          },
          properties: { ...item, id: item.id },
        };
      })
      .filter(Boolean); // Filter out null entries

    if (typeof window !== "undefined") {
      console.log(
        "Supercluster initialized with",
        points.length,
        "points from",
        filteredItems.length,
        "filtered items",
      );
    }
    supercluster.load(points);
    return supercluster;
  }, [filteredItems]);

  // Get clusters and points for current viewport
  const clusters = useMemo(() => {
    if (!mapInstance || !cluster) {
      if (typeof window !== "undefined") {
        console.log(
          "Clusters useMemo early return: mapInstance?",
          !!mapInstance,
          "cluster?",
          !!cluster,
        );
      }
      return { clusters: [], points: [] };
    }

    try {
      const currentZoom = Math.floor(mapInstance.getZoom());
      const bounds = mapInstance.getBounds();

      const bbox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ];

      const clusterFeatures = cluster.getClusters(bbox, currentZoom);
      if (typeof window !== "undefined") {
        console.log(
          `Getting clusters at zoom ${currentZoom}, bbox:`,
          bbox,
          "Features found:",
          clusterFeatures.length,
        );
        if (clusterFeatures.length > 0) {
          console.log("First cluster feature:", clusterFeatures[0]);
        }
      }
      return { clusters: clusterFeatures, points: [] };
    } catch (e) {
      if (typeof window !== "undefined") {
        console.log("Error in clusters useMemo:", e.message);
      }
      return { clusters: [], points: [] };
    }
  }, [cluster, mapInstance, viewport]);

  // GeoJSON source for clusters
  const clusterGeoJSON = useMemo(() => {
    const geojson = {
      type: "FeatureCollection",
      features: clusters.clusters,
    };
    if (typeof window !== "undefined" && clusters.clusters.length > 0) {
      console.log(
        "ClusterGeoJSON created with",
        clusters.clusters.length,
        "features",
      );
      console.log("First feature:", clusters.clusters[0]);
      console.log("First feature properties:", clusters.clusters[0].properties);
      // Check if features have the cluster property
      const clusterFeatures = clusters.clusters.filter(
        (f) => f.properties?.cluster,
      );
      const nonClusterFeatures = clusters.clusters.filter(
        (f) => !f.properties?.cluster,
      );
      console.log(
        `Cluster features: ${clusterFeatures.length}, Non-cluster features: ${nonClusterFeatures.length}`,
      );
    }
    return geojson;
  }, [clusters.clusters]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    clearMapLayers: () => {
      if (mapInstance) {
        // MapLibre handles this differently, layers are managed by React state
      }
    },
    recenterToDefault: () => {
      if (mapInstance && config.map.default_bounds) {
        const bounds = config.map.default_bounds;
        mapInstance.fitBounds(
          [
            [bounds[0][1], bounds[0][0]], // [lng, lat] for southwest
            [bounds[1][1], bounds[1][0]], // [lng, lat] for northeast
          ],
          { padding: 50 },
        );
      } else if (mapInstance) {
        mapInstance.flyTo({
          center: [config.map.center[1], config.map.center[0]],
          zoom: config.map.zoom,
        });
      }
    },
    updateBounds: (newBounds, setDatasetSpatial) => {
      if (mapInstance && newBounds) {
        const bbox = newBounds.bbox || turf.bbox(newBounds);
        mapInstance.fitBounds(
          [
            [bbox[0], bbox[1]], // southwest
            [bbox[2], bbox[3]], // northeast
          ],
          { padding: 50, animate: true },
        );
        if (setDatasetSpatial) {
          setDatasetSpatial(null);
        }
      }
    },
  }));

  // Initialize with default bounds
  useEffect(() => {
    if (mapInstance && config.map.default_bounds) {
      const bounds = config.map.default_bounds;
      mapInstance.fitBounds(
        [
          [bounds[0][1], bounds[0][0]], // [lng, lat]
          [bounds[1][1], bounds[1][0]], // [lng, lat]
        ],
        { padding: 50, animate: false },
      );
    }
  }, [mapInstance]);

  // Debug: Log cluster GeoJSON changes
  useEffect(() => {
    if (typeof window !== "undefined" && clusterGeoJSON.features.length > 0) {
      console.log(
        "Cluster GeoJSON updated with features:",
        clusterGeoJSON.features.length,
      );
      console.log("First feature:", clusterGeoJSON.features[0]);
    }
  }, [clusterGeoJSON]);

  // Manage basemap layer visibility and add cluster layers dynamically
  useEffect(() => {
    if (!mapInstance || !config.basemaps) return;

    // Add basemap layers if they don't exist
    config.basemaps.forEach((basemap) => {
      try {
        // Check if layer already exists
        const layer = mapInstance.getLayer(basemap.key);
        const isVisible = showBasemap && basemap.key === activeBasemap;
        if (!layer) {
          // Add the layer - we'll reorder it later if needed
          mapInstance.addLayer({
            id: basemap.key,
            type: "raster",
            source: basemap.key,
            minzoom: 0,
            maxzoom: Math.min(basemap.maxZoom || 24, 24),
            layout: {
              visibility: isVisible ? "visible" : "none",
            },
          });
          if (typeof window !== "undefined") {
            console.log("Added basemap layer:", basemap.key);
          }
        } else {
          // Update visibility of existing layer
          mapInstance.setLayoutProperty(
            basemap.key,
            "visibility",
            isVisible ? "visible" : "none",
          );
        }
      } catch (e) {
        if (typeof window !== "undefined") {
          console.log("Error adding basemap layer:", basemap.key, e.message);
        }
      }
    });

    // Add overlay layers if they don't exist
    if (config.overlays && Array.isArray(config.overlays)) {
      config.overlays.forEach((overlay) => {
        try {
          const layer = mapInstance.getLayer(overlay.key);
          const isVisible = showOverlays;
          if (!layer) {
            mapInstance.addLayer({
              id: overlay.key,
              type: "raster",
              source: overlay.key,
              minzoom: 0,
              maxzoom: Math.min(overlay.maxZoom || 24, 24),
              layout: {
                visibility: isVisible ? "visible" : "none",
              },
            });
            if (typeof window !== "undefined") {
              console.log("Added overlay layer:", overlay.key);
            }
          } else {
            // Update visibility of existing layer
            mapInstance.setLayoutProperty(
              overlay.key,
              "visibility",
              isVisible ? "visible" : "none",
            );
          }
        } catch (e) {
          if (typeof window !== "undefined") {
            console.log("Error adding overlay layer:", overlay.key, e.message);
          }
        }
      });
    }

    // Add or update cluster layers dynamically
    try {
      // Check if clusters source exists, if not add it
      const clustersSource = mapInstance.getSource("clusters");
      if (!clustersSource && clusterGeoJSON.features.length > 0) {
        mapInstance.addSource("clusters", {
          type: "geojson",
          data: clusterGeoJSON,
        });
        if (typeof window !== "undefined") {
          console.log("Added clusters source");
        }
      } else if (clustersSource) {
        // Update the source data
        clustersSource.setData(clusterGeoJSON);
        if (typeof window !== "undefined") {
          console.log(
            "Updated clusters source data with",
            clusterGeoJSON.features.length,
            "features",
          );
        }
      }

      // Add clusters circle layer if it doesn't exist
      const clustersLayer = mapInstance.getLayer("clusters");
      if (typeof window !== "undefined") {
        console.log(
          "Checking clusters layer: exists?",
          !!clustersLayer,
          "features in GeoJSON:",
          clusterGeoJSON.features.length,
        );
      }
      if (!clustersLayer) {
        if (clusterGeoJSON.features.length > 0) {
          if (typeof window !== "undefined") {
            console.log(
              "Adding clusters circle layer with",
              clusterGeoJSON.features.length,
              "features",
            );
            console.log(
              "Clusters source exists?",
              !!mapInstance.getSource("clusters"),
            );
            // Log feature details for debugging
            clusterGeoJSON.features.slice(0, 3).forEach((feature, idx) => {
              console.log(`Feature ${idx}:`, {
                type: feature.type,
                geometry: feature.geometry,
                hasCoordinates: !!feature.geometry?.coordinates,
                coordinates: feature.geometry?.coordinates,
                properties: feature.properties,
              });
            });
          }
          try {
            mapInstance.addLayer({
              id: "clusters",
              type: "circle",
              source: "clusters",
              paint: {
                "circle-color": "#ff0000",
                "circle-radius": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  0,
                  5,
                  6,
                  10,
                  12,
                  20,
                  16,
                  30,
                ],
                "circle-opacity": 0.8,
                "circle-stroke-width": 2,
                "circle-stroke-color": "#ffffff",
              },
            });
            if (typeof window !== "undefined") {
              console.log(
                "Added clusters circle layer successfully with zoom-based radius",
              );
              const layer = mapInstance.getLayer("clusters");
              console.log("Layer added successfully, layer object:", layer);
            }
          } catch (e) {
            if (typeof window !== "undefined") {
              console.log("Error adding clusters layer:", e.message, e);
            }
          }
        }
      }

      // Add cluster count layer if it doesn't exist
      const clusterCountLayer = mapInstance.getLayer("cluster-count");
      if (!clusterCountLayer && clusterGeoJSON.features.length > 0) {
        try {
          mapInstance.addLayer({
            id: "cluster-count",
            type: "symbol",
            source: "clusters",
            layout: {
              "text-field": ["get", "point_count"],
              "text-font": ["Arial Unicode MS Bold"],
              "text-size": 12,
            },
            paint: {
              "text-color": "#ffffff",
            },
          });
          if (typeof window !== "undefined") {
            console.log("Added cluster-count layer");
          }
        } catch (e) {
          if (typeof window !== "undefined") {
            console.log("Error adding cluster-count layer:", e.message);
          }
        }
      }

      // Ensure cluster layers are on top - move after all other layers
      try {
        if (mapInstance.getLayer("clusters")) {
          // Move clusters to before the last layer (or don't specify to put at end)
          mapInstance.moveLayer("clusters");
          if (typeof window !== "undefined") {
            console.log("Moved clusters layer to top");
          }
        }
        if (mapInstance.getLayer("cluster-count")) {
          // Move cluster count on top of clusters
          mapInstance.moveLayer("cluster-count");
          if (typeof window !== "undefined") {
            console.log("Moved cluster-count layer to top");
          }
        }
      } catch (e) {
        if (typeof window !== "undefined") {
          console.log("Error moving cluster layers:", e.message);
        }
      }
    } catch (e) {
      if (typeof window !== "undefined") {
        console.log("Error managing cluster layers:", e.message);
      }
    }
  }, [mapInstance, activeBasemap, showBasemap, showOverlays, clusterGeoJSON]);

  // Add click and hover handlers for cluster layer
  useEffect(() => {
    if (!mapRef.current || !cluster) return;

    const map = mapRef.current;

    const handleClusterClick = () => {
      const features = map.queryRenderedFeatures({ layers: ["clusters"] });
      if (features.length === 0) return;

      const feature = features[0];
      if (feature.properties?.cluster) {
        const clusterId = feature.properties.cluster_id;
        const zoom = cluster.getClusterExpansionZoom(clusterId);
        map.easeTo({
          center: feature.geometry.coordinates,
          zoom,
          duration: 500,
        });
      } else if (feature.properties?.id) {
        // Individual point clicked
        handleListItemClick(feature.properties);
      }
    };

    const handleClusterMouseEnter = () => {
      if (map.getCanvas()) {
        map.getCanvas().style.cursor = "pointer";
      }
    };

    const handleClusterMouseLeave = () => {
      if (map.getCanvas()) {
        map.getCanvas().style.cursor = "";
      }
    };

    // Try to add listeners when cluster layer exists
    try {
      if (map.getLayer("clusters")) {
        map.on("click", "clusters", handleClusterClick);
        map.on("mouseenter", "clusters", handleClusterMouseEnter);
        map.on("mouseleave", "clusters", handleClusterMouseLeave);

        if (typeof window !== "undefined") {
          console.log("Added click and hover handlers to cluster layer");
        }
      }
    } catch (e) {
      if (typeof window !== "undefined") {
        console.log("Error adding handlers:", e.message);
      }
    }

    return () => {
      try {
        if (map.getLayer("clusters")) {
          map.off("click", "clusters", handleClusterClick);
          map.off("mouseenter", "clusters", handleClusterMouseEnter);
          map.off("mouseleave", "clusters", handleClusterMouseLeave);
        }
      } catch (e) {
        // Layer might not exist
      }
    };
  }, [mapRef, cluster, handleListItemClick]);

  const handleMapLoad = useCallback((e) => {
    const map = e.target;
    setMapInstance(map);
    if (typeof window !== "undefined") {
      console.log("Map loaded, map instance:", map);
      // Check if layers exist after load
      setTimeout(() => {
        try {
          const clustersLayer = map.getLayer("clusters");
          const clusterCountLayer = map.getLayer("cluster-count");
          console.log("Clusters layer exists:", !!clustersLayer, clustersLayer);
          console.log(
            "Cluster-count layer exists:",
            !!clusterCountLayer,
            clusterCountLayer,
          );
        } catch (e) {
          console.log("Error checking layers:", e.message);
        }
      }, 500);
    }
  }, []);

  const handleMove = useCallback(
    (e) => {
      setViewport(e.viewState);
      // Force clusters recalculation on viewport change
      if (mapRef.current && cluster && typeof window !== "undefined") {
        console.log("Map moved to:", e.viewState);
      }
    },
    [cluster],
  );

  const mapStyle = useMemo(() => buildMapStyle(), []);
  const initialZoom =
    typeof window !== "undefined" && window.innerWidth < 1024
      ? config.map.zoom_mobile
      : config.map.zoom;

  return (
    <div className="relative h-full w-full">
      <MapGL
        ref={mapRef}
        longitude={viewport.longitude}
        latitude={viewport.latitude}
        zoom={viewport.zoom || initialZoom}
        onMove={handleMove}
        onLoad={handleMapLoad}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        preserveDrawingBuffer={true}
        reuseMaps={true}
      >
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-right" unit="metric" />
      </MapGL>

      {/* Basemap legend - positioned outside the map */}
      {config.basemaps && config.basemaps.length > 0 && (
        <div className="absolute right-2 bottom-25 z-10 rounded-lg bg-white p-2 shadow-md dark:bg-gray-800">
          <div className="mb-2 flex flex-col gap-2">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={showBasemap}
                onChange={(e) => setShowBasemap(e.target.checked)}
                className="cursor-pointer"
              />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {lang === "fr" ? "Fonds de carte" : "Basemap"}
              </span>
            </label>
            {config.overlays && config.overlays.length > 0 && (
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={showOverlays}
                  onChange={(e) => setShowOverlays(e.target.checked)}
                  className="cursor-pointer"
                />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {lang === "fr" ? "Couches" : "Overlays"}
                </span>
              </label>
            )}
          </div>
          {showBasemap && config.basemaps.length > 1 && (
            <div className="flex flex-col gap-1">
              {config.basemaps.map((basemap) => (
                <label
                  key={basemap.key}
                  className="flex cursor-pointer items-center gap-2 pl-4"
                >
                  <input
                    type="radio"
                    name="basemap"
                    value={basemap.key}
                    checked={activeBasemap === basemap.key}
                    onChange={(e) => setActiveBasemap(e.target.value)}
                    className="cursor-pointer"
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    {basemap.name[lang] || basemap.name.en}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

MapLibreMap.displayName = "MapLibreMap";

export default memo(MapLibreMap);
