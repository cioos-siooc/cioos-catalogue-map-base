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

const clearMapLayers = (map) => {
  map.eachLayer((layer) => {
    if (layer instanceof L.Polygon || layer instanceof L.Marker) {
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
      </BaseLayer>
    ))}
  </>
);

// Main Map component
const Map = forwardRef(function Map(
  { bounds, filteredItems, handleListItemClick, lang },
  ref,
) {
  const { openDrawer } = useContext(DrawerContext);
  const t = getLocale(lang);

  const mapRef = useRef();
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
        {bounds && <FitBounds key={bounds} bounds={bounds} />}
        <Overlay checked name={t.dataset_markers}>
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
      </LayersControl>
    </MapContainer>
  );
});

export default Map;
