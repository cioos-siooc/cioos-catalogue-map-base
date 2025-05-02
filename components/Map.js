"use client";

import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import * as turf from "@turf/turf";
import { DrawerContext } from "../app/context/DrawerContext";
import { useContext } from "react";
import L from "leaflet";
import { Drawer } from "flowbite-react";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const FitBounds = ({ bounds }) => {
  const { openDrawer } = useContext(DrawerContext);
  const map = useMap();
  if (bounds) {
    ClearMap({ map });
    var polygon = L.geoJSON(bounds, { color: "red" }).addTo(map);

    polygon.on("click", () => {
      openDrawer();
    });

    map.flyToBounds(polygon.getBounds(), {
      animate: true,
      padding: [50, 50],
      maxZoom: 10,
      duration: 1,
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

function Map({ center, bounds, filteredItems }) {
  // get the centroid of each filteredItem.spatial which is a geojson and add as a marker and add makers as a cluster on the map
  const markers = filteredItems.map((item) => {
    const centroid = turf.centroid(item.spatial);
    return (
      <Marker
        key={item.id}
        position={[
          centroid.geometry.coordinates[1],
          centroid.geometry.coordinates[0],
        ]}
        icon={L.icon({
          iconUrl: icon,
          shadowUrl: iconShadow,
          iconSize: [25, 41],
          shadowSize: [41, 41],
          iconAnchor: [12, 41],
          shadowAnchor: [12, 41],
          popupAnchor: [1, -34],
        })}
      />
    );
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
