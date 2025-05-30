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
import { useContext, useState, useEffect, useRef, memo } from "react";
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
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      clearMapLayers(map);
      const polygon = L.geoJSON(bounds, { color: getPrimaryColor() }).addTo(
        map,
      );

      map.flyToBounds(polygon.getBounds(), {
        animate: true,
        padding: [50, 50],
        maxZoom: 10,
        duration: 0.3,
      });
    }
  }, [bounds, map]); // Run effect when bounds or map changes

  return null;
};

// Dataset marker component
const DatasetMarker = ({ record, handleListItemClick, lang, openDrawer }) => {
  let point = turf.centerOfMass(record.spatial);
  // Verify if point within the polygon
  const isPointInPolygon = turf.booleanPointInPolygon(point, record.spatial);
  if (!isPointInPolygon) {
    point = turf.pointOnFeature(record.spatial);
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
function Map({ bounds, filteredItems, handleListItemClick, lang }) {
  const { openDrawer } = useContext(DrawerContext);
  const t = getLocale(lang);

  return (
    <MapContainer
      className="h-full w-full"
      center={config.map.center}
      zoom={config.map.zoom}
      zoomControl={false}
      scrollWheelZoom={true}
      boundsOptions={{ padding: [1, 1] }}
      // Adding key={false} to prevent re-mounting the entire map
      key={false}
    >
      <ZoomControl position="topright" />
      <LayersControl position="bottomright">
        <BaseLayers basemaps={config.basemaps} lang={lang} />
        {bounds && <FitBounds bounds={bounds} />}
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
}

export default Map;
