"use client";

import "@maptiler/sdk/dist/maptiler-sdk.css";
import { Map as MaptilerMap } from "@maptiler/sdk";
import * as turf from "@turf/turf";
import { useEffect, useRef } from "react";

const CARTO_SOURCE_ID = "carto-light";
const CARTO_LAYER_ID = "carto-light";
const SPATIAL_SOURCE_ID = "minimap-spatial";
const SPATIAL_LINE_LAYER_ID = "minimap-spatial-line";
const SPATIAL_FILL_LAYER_ID = "minimap-spatial-fill";

function getPrimaryColor() {
  if (typeof document === "undefined") return "#0891b2";
  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-primary-500")
    .trim();
  return primaryColor || "#0891b2";
}

export function MiniMap({ spatial, className = "" }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  // Mount a small, fully non-interactive MapLibre instance once.
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new MaptilerMap({
      container: containerRef.current,
      interactive: false,
      attributionControl: false,
      style: {
        version: 8,
        sources: {
          [CARTO_SOURCE_ID]: {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
              "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
              "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
              "https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          },
        },
        layers: [
          { id: CARTO_LAYER_ID, type: "raster", source: CARTO_SOURCE_ID },
        ],
      },
      center: [0, 0],
      zoom: 1,
    });
    mapRef.current = map;

    map.on("load", () => {
      map.addSource(SPATIAL_SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: SPATIAL_FILL_LAYER_ID,
        type: "fill",
        source: SPATIAL_SOURCE_ID,
        paint: { "fill-color": getPrimaryColor(), "fill-opacity": 0.3 },
      });
      map.addLayer({
        id: SPATIAL_LINE_LAYER_ID,
        type: "line",
        source: SPATIAL_SOURCE_ID,
        paint: { "line-color": getPrimaryColor(), "line-width": 2 },
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Keep the outline + viewport in sync whenever the spatial coverage changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !spatial) return;

    const applySpatial = () => {
      map.getSource(SPATIAL_SOURCE_ID)?.setData(spatial);
      try {
        const [west, south, east, north] = turf.bbox(spatial);
        map.fitBounds(
          [
            [west, south],
            [east, north],
          ],
          { padding: 20, maxZoom: 10, animate: false },
        );
      } catch (error) {
        console.warn("Error fitting bounds to spatial data:", error);
      }
    };

    if (map.isStyleLoaded()) {
      applySpatial();
    } else {
      map.once("load", applySpatial);
    }
  }, [spatial]);

  if (!spatial) return null;

  return (
    <div className={`relative overflow-hidden rounded-md ${className}`}>
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ minHeight: "200px" }}
      />
    </div>
  );
}
