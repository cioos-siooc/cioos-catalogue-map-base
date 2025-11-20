"use client";

import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Component to handle fitting bounds when spatial data changes
function FitBoundsToGeoJSON({ spatial }) {
  const map = useMap();

  useEffect(() => {
    if (!spatial || !map) return;

    try {
      // Create a temporary GeoJSON layer to get bounds
      const geoJsonLayer = L.geoJSON(spatial);
      const bounds = geoJsonLayer.getBounds();

      // Check if bounds are valid
      if (bounds.isValid()) {
        // Use a timeout to ensure map is fully initialized
        setTimeout(() => {
          map.fitBounds(bounds, {
            padding: [20, 20],
            maxZoom: 10,
            animate: false,
          });
        }, 100);
      }
    } catch (error) {
      console.warn("Error fitting bounds to spatial data:", error);
    }
  }, [spatial, map]);

  return null;
}

export function MiniMap({ spatial, className = "" }) {
  // Calculate initial center from spatial data
  const initialBounds = useMemo(() => {
    if (!spatial) return null;

    try {
      const geoJsonLayer = L.geoJSON(spatial);
      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        return bounds;
      }
    } catch (error) {
      console.warn("Error calculating initial bounds:", error);
    }
    return null;
  }, [spatial]);

  // Validate spatial data and bounds - early returns after all hooks
  if (!spatial || !initialBounds) return null;

  // Only render on client side to avoid SSR issues
  if (typeof window === "undefined") return null;

  const center = initialBounds.getCenter();

  // Get primary color from CSS variables
  const getPrimaryColor = () => {
    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-primary-500")
      .trim();
    return primaryColor || "#0891b2";
  };

  return (
    <div className={`relative overflow-hidden rounded-md ${className}`}>
      <MapContainer
        className="h-full w-full"
        center={[center.lat, center.lng]}
        zoom={2}
        zoomControl={false}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        boxZoom={false}
        keyboard={false}
        attributionControl={false}
        style={{ minHeight: "200px" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <GeoJSON
          key={JSON.stringify(spatial)}
          data={spatial}
          style={{
            color: getPrimaryColor(),
            weight: 2,
            fillColor: getPrimaryColor(),
            fillOpacity: 0.3,
          }}
        />
        <FitBoundsToGeoJSON spatial={spatial} />
      </MapContainer>
    </div>
  );
}
