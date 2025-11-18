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
    map.flyToBounds(polygon.getBounds(), {
      animate: true,
      padding: [150, 250],
      maxZoom: 10,
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

  const handleMarkerClick = (e) => {
    removeLayer(e);
    handleListItemClick(record);
    openDrawer();
  };

  const handleMouseOver = (e) => {
    removeLayer(e);
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
  // Function to remove the polygon layer when the marker is removed
  function removeLayer(e) {
    const map = e.target._map;
    if (e.target._hoverPolygon) {
      map.removeLayer(e.target._hoverPolygon);
      e.target._hoverPolygon = null;
    }
  }

  return (
    <Marker
      key={record.id}
      position={[point.geometry.coordinates[1], point.geometry.coordinates[0]]}
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
            {record.organization && record.organization.length > 0
              ? record.organization.map((org) => org.name).join(", ")
              : ""}
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
  // Expose clearMapLayers to parent via ref
  useImperativeHandle(ref, () => ({
    clearMapLayers: () => {
      if (mapRef.current) {
        clearMapLayers(mapRef.current);
      }
    },
    recenterToDefault: () => {
      if (mapRef.current) {
        mapRef.current.setView(config.map.center, config.map.zoom);
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
      center={config.map.center}
      zoom={
        typeof window !== "undefined" && window.innerWidth < 600
          ? config.map.zoom_mobile
          : config.map.zoom
      }
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
          <MarkerClusterGroup key={clusterKey}>
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
