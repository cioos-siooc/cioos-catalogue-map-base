"use client";

import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";
import {
  MapContainer,
  TileLayer,
  useMap,
  Tooltip,
  LayersControl,
  ZoomControl,
} from "react-leaflet";
import { Marker } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import * as turf from "@turf/turf";
import { DrawerContext } from "../app/context/DrawerContext";
import {
  useContext,
  useLayoutEffect,
  useEffect,
  forwardRef,
  useRef,
  memo,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import L from "leaflet";
import config from "@/app/config";
import { getLocale } from "@/app/get-locale";

const { BaseLayer, Overlay } = LayersControl;

// Utility functions
const getPrimaryColor = () => {
  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-primary-500")
    .trim();
  return primaryColor;
};

// Only clear polygon/geojson overlays we add imperatively; DO NOT remove markers managed by React
const clearMapLayers = (map) => {
  map.eachLayer((layer) => {
    if (layer instanceof L.Polygon || layer instanceof L.GeoJSON) {
      map.removeLayer(layer);
    }
  });
};

// Map components
const FitBounds = ({ bounds }) => {
  console.log("Before bounds:", bounds);
  const map = useMap();

  useLayoutEffect(() => {
    fitBounds(bounds, map);
  }, [bounds, map]); // Run effect when bounds or map changes

  return null;
};

function fitBounds(newBounds, map) {
  console.log("FitBounds effect triggered with bounds:", newBounds);
  if (newBounds) {
    clearMapLayers(map);
    const polygon = L.geoJSON(newBounds, { color: getPrimaryColor() }).addTo(
      map,
    );

    // Check if screen is mobile (768px breakpoint)
    const isMobile = window.innerWidth < 768;

    map.flyToBounds(polygon.getBounds(), {
      animate: true,
      // Less padding on mobile for closer view
      padding: isMobile ? [50, 50] : [150, 250],
      // Higher max zoom on mobile for closer view
      maxZoom: isMobile ? 13 : 10,
      duration: 0.3,
    });
  }
}

// Dataset marker component
const DatasetMarker = ({ record, handleListItemClick, lang, openDrawer }) => {
  let point = turf.centerOfMass(record.spatial);
  // Verify if point within the polygon
  const isPointInPolygon = turf.booleanPointInPolygon(point, record.spatial);
  if (!isPointInPolygon) {
    point = turf.pointOnFeature(record.spatial);
  }

  // Wrap longitude based on map center
  let [lng, lat] = point.geometry.coordinates;
  const centerLng = config.map.center[1];
  while (lng - centerLng > 180) lng -= 360;
  while (lng - centerLng < -180) lng += 360;

  // Function to remove the polygon layer
  function removeLayer(e) {
    const map = e.target._map;
    if (e.target._hoverPolygon) {
      map.removeLayer(e.target._hoverPolygon);
      e.target._hoverPolygon = null;
    }
  }

  const handleMouseOver = (e) => {
    // Only add polygon if it doesn't already exist
    if (e.target._hoverPolygon) return;

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
    removeLayer(e);
  };

  const handleMarkerClick = (e) => {
    removeLayer(e);
    handleListItemClick(record);
    openDrawer();
  };

  return (
    <Marker
      key={record.id}
      position={[lat, lng]}
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

// Base map layers component
const BaseLayers = ({ basemaps, lang }) => (
  <>
    {basemaps.map((layer) => (
      <BaseLayer
        key={layer.key}
        checked={layer.checked || false}
        name={layer.name[lang]}
      >
        <TileLayer
          url={layer.url}
          attribution={layer.attribution}
          minZoom={layer.minZoom || 0}
          maxZoom={layer.maxZoom || 10}
        />
        {/* Optional label overlay (cities, place names) rendered on top of base tiles */}
      </BaseLayer>
    ))}
  </>
);

// Render overlays defined in config.overlays inside LayersControl as Overlay entries
const Overlays = ({ overlays, lang }) => {
  const map = useMap();

  useEffect(() => {
    // No-op for now; vector overlays mount/unmount are handled per-overlay via child components
  }, [map]);

  return (
    <>
      {overlays && overlays.length
        ? overlays.map((ov) => (
            <Overlay
              key={ov.key}
              name={ov.name && ov.name[lang] ? ov.name[lang] : ov.key}
              checked={ov.checked || false}
            >
              {
                <TileLayer
                  url={ov.url}
                  attribution={ov.attribution}
                  minZoom={ov.minZoom || 0}
                  maxZoom={ov.maxZoom || 10}
                />
              }
            </Overlay>
          ))
        : null}
    </>
  );
};

// Main Map component
const Map = forwardRef(function Map(
  { bounds, filteredItems, handleListItemClick, lang },
  ref,
) {
  const { openDrawer } = useContext(DrawerContext);
  const t = getLocale(lang);

  const mapRef = useRef();
  // Remount key for cluster group to force updates on filter change
  const clusterKey = useMemo(() => {
    try {
      let hash = 0;
      for (const item of filteredItems) {
        const id = String(item.id);
        for (let i = 0; i < id.length; i++) {
          hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
        }
      }
      return `cluster-${filteredItems.length}-${hash}`;
    } catch {
      return `cluster-${filteredItems.length}`;
    }
  }, [filteredItems]);

  // Calculate percentile thresholds for cluster coloring
  const [clusterThresholds, setClusterThresholds] = useState({
    p33: 10,
    p66: 50,
  });

  // Update cluster thresholds when map or filteredItems change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const calculateThresholds = () => {
      if (!map || !map._layers) return;

      const clusterCounts = [];

      // Find the MarkerClusterGroup layer and get all cluster counts
      Object.values(map._layers).forEach((layer) => {
        if (
          layer.getAllChildMarkers &&
          typeof layer.getAllChildMarkers === "function"
        ) {
          // This is the cluster group layer
          // Get visible clusters at current zoom
          if (layer._featureGroup && layer._featureGroup._layers) {
            Object.values(layer._featureGroup._layers).forEach(
              (clusterOrMarker) => {
                if (
                  clusterOrMarker.getChildCount &&
                  typeof clusterOrMarker.getChildCount === "function"
                ) {
                  clusterCounts.push(clusterOrMarker.getChildCount());
                }
              },
            );
          }
        }
      });

      if (clusterCounts.length > 0) {
        // Sort counts and calculate percentiles
        clusterCounts.sort((a, b) => a - b);
        const p33Index = Math.floor(clusterCounts.length * 0.33);
        const p66Index = Math.floor(clusterCounts.length * 0.66);

        setClusterThresholds({
          p33: clusterCounts[p33Index] || clusterCounts[0],
          p66:
            clusterCounts[p66Index] || clusterCounts[clusterCounts.length - 1],
        });
      }
    };

    // Calculate thresholds on map events
    map.on("zoomend moveend", calculateThresholds);

    // Initial calculation
    setTimeout(calculateThresholds, 100);

    return () => {
      map.off("zoomend moveend", calculateThresholds);
    };
  }, [filteredItems]);

  // Custom icon creation function with percentile-based colors
  const iconCreateFunction = useMemo(() => {
    return (cluster) => {
      const childCount = cluster.getChildCount();

      // Assign class based on percentile thresholds
      let className = "marker-cluster-small";
      if (childCount >= clusterThresholds.p66) {
        className = "marker-cluster-large";
      } else if (childCount >= clusterThresholds.p33) {
        className = "marker-cluster-medium";
      }

      return L.divIcon({
        html: `<div><span>${childCount}</span></div>`,
        className: `marker-cluster ${className}`,
        iconSize: L.point(40, 40),
      });
    };
  }, [clusterThresholds]);
  // Expose clearMapLayers to parent via ref
  useImperativeHandle(ref, () => ({
    clearMapLayers: () => {
      if (mapRef.current) {
        clearMapLayers(mapRef.current);
      }
    },
    recenterToDefault: () => {
      if (mapRef.current) {
        if (config.map.default_bounds) {
          mapRef.current.fitBounds(config.map.default_bounds);
        } else {
          mapRef.current.setView(config.map.center, config.map.zoom);
        }
      }
    },
    updateBounds: (newBounds, setDatasetSpatial) => {
      console.log("UPDATE BOUND : ", newBounds);
      if (mapRef.current) {
        fitBounds(newBounds, mapRef.current);
        // Clear previous dataset spatial if any
        if (setDatasetSpatial) {
          setDatasetSpatial(null);
        }
      }
    },
  }));

  return (
    <MapContainer
      className="h-full w-full"
      center={config.map.default_bounds ? undefined : config.map.center}
      zoom={
        config.map.default_bounds
          ? undefined
          : typeof window !== "undefined" && window.innerWidth < 1024
            ? config.map.zoom_mobile
            : config.map.zoom
      }
      bounds={config.map.default_bounds}
      zoomControl={false}
      scrollWheelZoom={true}
      boundsOptions={{ padding: [1, 1] }}
      attributionControl={false}
      ref={mapRef}
      whenReady={(mapInstance) => {
        mapRef.current = mapInstance;
        console.log(
          "This function will fire once the map is created",
          mapRef.current,
        );
      }}
      whenCreated={(map) => {
        console.log("The underlying leaflet map instance:", map);
      }}
    >
      <ZoomControl position="topright" />
      <LayersControl position="bottomright">
        <BaseLayers basemaps={config.basemaps} lang={lang} />
        <Overlays overlays={config.overlays} lang={lang} />
        {bounds && <FitBounds key={bounds} bounds={bounds} />}
        <Overlay checked name={t.dataset_markers}>
          <MarkerClusterGroup
            key={clusterKey}
            iconCreateFunction={iconCreateFunction}
          >
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
      </LayersControl>
      {/* Custom attribution toggle positioned near LayersControl (bottom-right) */}
      <AttributionToggle />
    </MapContainer>
  );
});

// Attribution toggle component (no SSR dependencies beyond config)
function AttributionToggle() {
  const [hovered, setHovered] = useState(false);
  const [attributions, setAttributions] = useState([]);
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const updateAttributions = () => {
      const list = [];
      try {
        // Get active base layer attribution
        for (const b of config.basemaps || []) {
          const layer =
            map._layers[
              Object.keys(map._layers).find((key) => {
                const l = map._layers[key];
                return l.options && l.options.attribution === b.attribution;
              })
            ];
          if (layer && map.hasLayer(layer) && b.attribution) {
            list.push(b.attribution);
            break; // Only one base layer should be active
          }
        }
        // Get active overlay attributions
        for (const o of config.overlays || []) {
          const layer =
            map._layers[
              Object.keys(map._layers).find((key) => {
                const l = map._layers[key];
                return l.options && l.options.attribution === o.attribution;
              })
            ];
          if (layer && map.hasLayer(layer) && o.attribution) {
            list.push(o.attribution);
          }
        }
      } catch {}
      setAttributions([...new Set(list)]);
    };

    updateAttributions();

    // Listen for layer add/remove events
    map.on("layeradd layerremove", updateAttributions);

    return () => {
      map.off("layeradd layerremove", updateAttributions);
    };
  }, [map]);

  if (!attributions.length) return null;
  return (
    <div
      className="pointer-events-none absolute right-[64px] bottom-[20px] z-[600] flex flex-col items-end gap-2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div className="pointer-events-auto max-h-40 w-64 overflow-y-auto rounded-md bg-black/40 p-2 text-[10px] leading-relaxed shadow-md backdrop-blur">
          {attributions.map((a, i) => (
            <div
              key={i}
              className="mb-1 last:mb-0"
              dangerouslySetInnerHTML={{ __html: a }}
            />
          ))}
        </div>
      )}
      <div className="bg-primary-500 dark:bg-primary-600 pointer-events-auto rounded-xl px-2 py-1 text-[11px] font-medium text-white shadow">
        ?
      </div>
    </div>
  );
}

export default Map;
