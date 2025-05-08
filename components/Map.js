"use client";

import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";
import { MapContainer, TileLayer, useMap, Tooltip } from "react-leaflet";
import { Marker } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import * as turf from "@turf/turf";
import { DrawerContext } from "../app/context/DrawerContext";
import { useContext, useState, useEffect, useRef, memo } from "react";
import L from "leaflet";
import config from "@/app/config";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Extract reusable function outside component
function getPrimaryColor() {
  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-gray-500")
    .trim();
  return primaryColor;
}

// Enhanced FitBounds component to display selected polygon
const FitBounds = memo(({ bounds, selectedDataset }) => {
  const map = useMap();
  const currentBoundsRef = useRef(null);
  const polygonRef = useRef(null);

  useEffect(() => {
    // Clear any existing polygons first
    if (polygonRef.current) {
      map.removeLayer(polygonRef.current);
      polygonRef.current = null;
    }

    // Check if bounds have changed or if we have a selected dataset
    if (
      (bounds &&
        JSON.stringify(bounds) !== JSON.stringify(currentBoundsRef.current)) ||
      selectedDataset
    ) {
      // Update the current bounds
      currentBoundsRef.current = bounds;

      // Clear existing polygons
      map.eachLayer((layer) => {
        if (layer instanceof L.Polygon && layer !== polygonRef.current) {
          map.removeLayer(layer);
        }
      });

      // Use the selected dataset's spatial data or the bounds
      const geoJsonData = selectedDataset?.spatial || bounds;

      if (geoJsonData) {
        // Create and style the polygon
        polygonRef.current = L.geoJSON(geoJsonData, {
          style: {
            color: getPrimaryColor(),
            weight: 3,
            opacity: 0.8,
            fillColor: getPrimaryColor(),
            fillOpacity: 0.3,
            dashArray: "5, 5",
          },
        }).addTo(map);

        // Fly to the polygon bounds
        map.flyToBounds(polygonRef.current.getBounds(), {
          animate: true,
          padding: [50, 50],
          maxZoom: 10,
          duration: 0.3,
        });
      }
    }
  }, [bounds, map, selectedDataset]);

  return null;
});
FitBounds.displayName = "FitBounds";

// Move ClearMap to a custom hook for better reuse
function useMapClear() {
  const map = useMap();
  return () => {
    map.eachLayer((layer) => {
      if (layer instanceof L.Polygon || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });
  };
}

// Create a memoized dataset marker component
const DatasetMarker = memo(
  ({ record, handleListItemClick, lang, openDrawer }) => {
    let point = turf.centerOfMass(record.spatial);
    // verify if point within the polygon
    const isPointInPolygon = turf.booleanPointInPolygon(point, record.spatial);
    if (!isPointInPolygon) {
      point = turf.pointOnFeature(record.spatial);
    }

    const markerIcon = L.icon({
      iconUrl: icon,
      shadowUrl: iconShadow,
      iconSize: [25, 41],
      shadowSize: [41, 41],
      iconAnchor: [12, 41],
      shadowAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    const handleClick = () => {
      console.log("Marker clicked:", record.id);
      handleListItemClick(record);
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

      e.target._hoverPolygon = polygon;
    };

    const handleMouseOut = (e) => {
      const map = e.target._map;
      if (e.target._hoverPolygon) {
        map.removeLayer(e.target._hoverPolygon);
        e.target._hoverPolygon = null;
      }
    };

    return (
      <Marker
        position={[
          point.geometry.coordinates[1],
          point.geometry.coordinates[0],
        ]}
        icon={markerIcon}
        eventHandlers={{
          click: handleClick,
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
  },
);
DatasetMarker.displayName = "DatasetMarker";

// Create a memoized MarkerLayer component
const MarkerLayer = memo(
  ({ filteredItems, handleListItemClick, lang, openDrawer }) => {
    return (
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
    );
  },
);
MarkerLayer.displayName = "MarkerLayer";

// Main Map component memoized
const Map = memo(function Map({
  bounds,
  filteredItems,
  handleListItemClick,
  lang,
}) {
  const { openDrawer } = useContext(DrawerContext);
  const [selectedDataset, setSelectedDataset] = useState(null);

  // Enhanced handleListItemClick to also set the selected dataset
  const handleMapItemClick = (record) => {
    setSelectedDataset(record); // Store the selected dataset
    handleListItemClick(record); // Call the original handler
  };

  return (
    <div id="container" className="h-full w-full">
      <MapContainer
        className="h-full w-full"
        center={config.map.center}
        zoom={config.map.zoom}
        scrollWheelZoom={true}
        boundsOptions={{ padding: [1, 1] }}
        // Adding key={false} to prevent re-mounting the entire map
        key={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds bounds={bounds} selectedDataset={selectedDataset} />
        <MarkerLayer
          filteredItems={filteredItems}
          handleListItemClick={handleMapItemClick}
          lang={lang}
          openDrawer={openDrawer}
        />
      </MapContainer>
    </div>
  );
});

export default Map;
