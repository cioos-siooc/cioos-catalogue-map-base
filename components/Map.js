"use client";

import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";
import { MapContainer, TileLayer, useMap, Tooltip } from "react-leaflet";
import { Marker } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import * as turf from "@turf/turf";
import { DrawerContext } from "../app/context/DrawerContext";
import { useContext } from "react";
import L from "leaflet";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

function getPrimaryColor() {
  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-gray-500")
    .trim();
  return primaryColor;
}

const FitBounds = ({ bounds }) => {
  const { openDrawer } = useContext(DrawerContext);
  const map = useMap();
  if (bounds) {
    ClearMap({ map });
    var polygon = L.geoJSON(bounds, { color: getPrimaryColor() }).addTo(map);

    polygon.on("click", () => {
      openDrawer();
    });

    map.flyToBounds(polygon.getBounds(), {
      animate: true,
      padding: [50, 50],
      maxZoom: 10,
      duration: 0.3,
    });
  }

  return null;
};

const ClearMap = ({ map }) => {
  map.eachLayer((layer) => {
    if (layer instanceof L.Polygon) {
      map.removeLayer(layer);
    }
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  return null;
};

function getDatasetMarker(record, handleListItemClick, lang) {
  var point = turf.centerOfMass(record.spatial);
  // verify if point within the polygon
  const isPointInPolygon = turf.booleanPointInPolygon(point, record.spatial);
  if (!isPointInPolygon) {
    point = turf.pointOnFeature(record.spatial);
  }

  return (
    <Marker
      key={record.id}
      position={[point.geometry.coordinates[1], point.geometry.coordinates[0]]}
      icon={L.icon({
        iconUrl: icon,
        shadowUrl: iconShadow,
        iconSize: [25, 41],
        shadowSize: [41, 41],
        iconAnchor: [12, 41],
        shadowAnchor: [12, 41],
        popupAnchor: [1, -34],
      })}
      eventHandlers={{
        click: (e) => {
          console.log("Marker clicked:", record.id);
          handleListItemClick(record);
        },
        mouseover: (e) => {
          const map = e.target._map; // Access the map instance
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
        },
        mouseout: (e) => {
          // Remove the polygon layer when the mouse leaves the marker
          const map = e.target._map;
          if (e.target._hoverPolygon) {
            map.removeLayer(e.target._hoverPolygon);
            e.target._hoverPolygon = null;
          }
        },
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
}

function Map({ center, bounds, filteredItems, handleListItemClick, lang }) {
  // get the centroid of each filteredItem.spatial which is a geojson and add as a marker and add makers as a cluster on the map
  const markers = filteredItems.map((item) => {
    return getDatasetMarker(item, handleListItemClick, lang);
  });

  return (
    <div id="container" className="h-full w-full">
      {center && (
        <MapContainer
          className="h-full w-full"
          center={center}
          zoom={6}
          scrollWheelZoom={true}
          boundsOptions={{ padding: [1, 1] }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {bounds && <FitBounds bounds={bounds} />}
          <MarkerClusterGroup>{markers}</MarkerClusterGroup>
        </MapContainer>
      )}
    </div>
  );
}

export default Map;
