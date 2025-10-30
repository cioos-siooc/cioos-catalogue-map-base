"use client";

import { useEffect, useMemo, useCallback, useRef } from "react";
import { useMap, Pane } from "react-leaflet";
import L from "leaflet";
import chroma from "chroma-js";
import { aggregateDatasetsToHexGrid, getMaxCount } from "@/utils/hexGridUtils";
import config from "@/app/config";

/**
 * HexGrid Component
 * Renders aggregated hexagonal grid layer on the map
 * Shows spatial distribution of datasets with color-coded density
 */
const HexGrid = ({
  filteredItems,
  isActive,
  onHexClick,
  colorScale = "viridis",
}) => {
  const map = useMap();
  const hexGridLayerRef = useRef(null);
  const mapZoomRef = useRef(map.getZoom());

  // Memoize GeoJSON data generation - recalculate when zoom changes
  const geoJsonData = useMemo(() => {
    if (!isActive || !filteredItems || filteredItems.length === 0) {
      return null;
    }

    const currentZoom = mapZoomRef.current;
    return aggregateDatasetsToHexGrid(filteredItems, currentZoom);
  }, [filteredItems, isActive]);

  // Create color scale
  const getColorScale = useCallback(() => {
    // Get color scale from config or use default
    const scaleName = config.hex_grid_color_scale || colorScale;

    try {
      // Create chroma scale with 10 colors
      if (Array.isArray(scaleName)) {
        // If it's an array of colors, use as custom scale
        return chroma.scale(scaleName).colors(10);
      } else {
        // Use named chroma scale
        return chroma.scale(scaleName).colors(10);
      }
    } catch (error) {
      console.error(`Error creating color scale '${scaleName}':`, error);
      // Fallback to viridis
      return chroma.scale("viridis").colors(10);
    }
  }, [colorScale]);

  // Get color based on count
  const getHexColor = useCallback(
    (count, maxCount) => {
      const colorPalette = getColorScale();
      const index = Math.floor((count / maxCount) * (colorPalette.length - 1));
      return colorPalette[index];
    },
    [getColorScale],
  );

  // Track zoom changes to recalculate hex grid resolution
  useEffect(() => {
    if (!map) return;

    const handleZoomChange = () => {
      mapZoomRef.current = map.getZoom();
    };

    map.on("zoom", handleZoomChange);
    return () => {
      map.off("zoom", handleZoomChange);
    };
  }, [map]);

  // Render hex grid layer
  useEffect(() => {
    if (!isActive || !geoJsonData || !map) {
      // Remove layer if not active
      if (hexGridLayerRef.current) {
        map.removeLayer(hexGridLayerRef.current);
        hexGridLayerRef.current = null;
      }
      return;
    }

    // Remove existing layer
    if (hexGridLayerRef.current) {
      map.removeLayer(hexGridLayerRef.current);
    }

    const maxCount = getMaxCount(geoJsonData.features);

    // Create GeoJSON layer with styling
    const geoJsonLayer = L.geoJSON(geoJsonData, {
      style: (feature) => {
        const color = getHexColor(feature.properties.count, maxCount);
        return {
          fillColor: color,
          color: color,
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.7,
        };
      },
      onEachFeature: (feature, layer) => {
        // Add hover effects
        layer.on("mouseover", () => {
          layer.setStyle({
            weight: 2,
            fillOpacity: 0.9,
          });
          layer.bringToFront();
        });

        layer.on("mouseout", () => {
          layer.setStyle({
            weight: 1,
            fillOpacity: 0.7,
          });
        });

        // Add click handler to filter datasets
        layer.on("click", () => {
          onHexClick(feature);
        });

        // Create tooltip with hex info
        const props = feature.properties;
        const tooltipContent = `
          <div style="max-width: 200px;">
            <strong>Datasets: ${props.count}</strong><br/>
            <small>Organizations: ${props.organizations.length}</small><br/>
            <small>Essential Ocean Variables: ${props.eovs.length}</small>
          </div>
        `;

        layer.bindTooltip(tooltipContent, {
          className: "hex-tooltip",
          sticky: false,
        });
      },
    });

    // Add layer to map
    geoJsonLayer.addTo(map);
    hexGridLayerRef.current = geoJsonLayer;

    return () => {
      if (hexGridLayerRef.current && map) {
        try {
          map.removeLayer(hexGridLayerRef.current);
        } catch (error) {
          // Layer might already be removed
        }
        hexGridLayerRef.current = null;
      }
    };
  }, [geoJsonData, isActive, map, getHexColor, onHexClick]);

  return null;
};

export default HexGrid;
