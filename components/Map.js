"use client";

import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";
import {
  MapContainer,
  TileLayer,
  useMap,
  Tooltip,
  LayersControl,
} from "react-leaflet";
import { Marker } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import * as turf from "@turf/turf";
import { DrawerContext } from "../app/context/DrawerContext";
import { useContext } from "react";
import L from "leaflet";
import config from "@/app/config";
import { getLocale } from "@/app/get-locale";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

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
        </LayersControl>
      </MapContainer>
    </div>
  );
}

export default Map;
