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
  useCallback,
} from "react";
import L from "leaflet";
import config from "@/app/config";
import { getLocale } from "@/app/get-locale";
import { updateURLWithVisualizationMode } from "@/components/UrlParametrization";
import dynamic from "next/dynamic";

// Dynamically import components to avoid SSR issues
const HexGrid = dynamic(() => import("./HexGrid"), { ssr: false });
const HexGridLegend = dynamic(() => import("./HexGridLegend"), { ssr: false });
const VisualizationModeControl = dynamic(
  () => import("./VisualizationModeControl"),
  { ssr: false },
);

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
  {
    bounds,
    filteredItems,
    allItems,
    handleListItemClick,
    lang,
    onHexCellFiltered,
  },
  ref,
) {
  const { openDrawer } = useContext(DrawerContext);
  const t = getLocale(lang);

  // Initialize visualization mode from URL parameter if available
  const getInitialVisualizationMode = () => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const vizMode = urlParams.get("visualizationMode");
      if (vizMode && ["markers", "hexgrid"].includes(vizMode)) {
        return vizMode;
      }
    }
    return "markers";
  };

  const [visualizationMode, setVisualizationMode] = useState(
    getInitialVisualizationMode(),
  ); // "markers" or "hexgrid"
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

  // Handle hex cell click to filter datasets
  const handleHexCellClick = useCallback(
    (feature) => {
      if (onHexCellFiltered) {
        const cellId = feature.id;
        const datasetsInCell = feature.properties.datasets;
        onHexCellFiltered(cellId, datasetsInCell);
      }
    },
    [onHexCellFiltered],
  );

  // Update URL when visualization mode changes
  useEffect(() => {
    updateURLWithVisualizationMode(visualizationMode);
  }, [visualizationMode]);

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
    setVisualizationMode: (mode) => {
      setVisualizationMode(mode);
    },
  }));

  return (
    <>
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
        attributionControl={true}
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
        {/* Visualization mode toggle control */}
        <VisualizationModeControl
          visualizationMode={visualizationMode}
          onModeChange={setVisualizationMode}
          markerLabel={t.dataset_markers}
          hexGridLabel={t.hex_grid_layer}
        />
        <LayersControl position="bottomright">
          <BaseLayers basemaps={config.basemaps} lang={lang} />
          <Overlays overlays={config.overlays} lang={lang} />
          {bounds && <FitBounds key={bounds} bounds={bounds} />}
        </LayersControl>
        {/* Render markers only in markers mode */}
        {visualizationMode === "markers" && (
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
        )}
        {/* Render hex grid only in hexgrid mode */}
        {visualizationMode === "hexgrid" && (
          <HexGrid
            filteredItems={allItems}
            isActive={true}
            onHexClick={handleHexCellClick}
            colorScale={config.hex_grid_color_scale || "viridis"}
          />
        )}
      </MapContainer>
      {/* Legend for hex grid layer - rendered outside MapContainer */}
      <HexGridLegend
        isVisible={visualizationMode === "hexgrid"}
        filteredItems={allItems}
      />
    </>
  );
});

export default Map;
