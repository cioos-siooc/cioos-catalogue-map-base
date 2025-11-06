"use client";

import { useEffect, useMemo, useCallback, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import chroma from "chroma-js";
import { cellToBoundary } from "h3-js";
import { getMaxCount } from "@/utils/hexGridUtils";
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
  const [prerenderedHexGrid, setPrerenderedHexGrid] = useState(null);

  // Load prerendered hex grid on mount
  useEffect(() => {
    const loadPrerenderedHexGrid = async () => {
      try {
        const response = await fetch("/hex-grid-default.json");
        if (response.ok) {
          const data = await response.json();
          setPrerenderedHexGrid(data);
          console.log(
            `Loaded prerendered hex grid with ${data.features.length} cells`,
          );
        }
      } catch (error) {
        console.log(
          "Prerendered hex grid not available, will compute on demand",
        );
      }
    };

    loadPrerenderedHexGrid();
  }, []);

  // No need to track zoom changes - always use the prerendered hex grid

  // Memoize GeoJSON data generation - only use prerendered hex grid
  // Do not recompute based on zoom level - use the prerendered layer only
  const geoJsonData = useMemo(() => {
    if (
      !isActive ||
      !filteredItems ||
      filteredItems.length === 0 ||
      !prerenderedHexGrid
    ) {
      return null;
    }

    // Only use the prerendered hex grid - no on-demand computation
    // Filter the prerendered data to only include datasets that match current filter
    const datasetIds = new Set(filteredItems.map((d) => d.id));
    const filteredCells = prerenderedHexGrid.cells
      .filter((cell) => {
        // d = datasets (array of IDs), filter directly
        return cell.d.some((id) => datasetIds.has(id));
      })
      .map((cell) => {
        const filteredDatasets = cell.d.filter((id) => datasetIds.has(id));
        return {
          cellId: cell.id,
          count: filteredDatasets.length,
          datasets: filteredDatasets,
          organizations: cell.o, // o = organizations
          eovs: cell.e, // e = eovs
        };
      });

    // Only generate geometries if we have cells to render
    if (filteredCells.length === 0) {
      return null;
    }

    // Convert cells to GeoJSON features
    const features = filteredCells
      .map((cell) => {
        try {
          const boundary = cellToBoundary(cell.cellId);
          const coordinates = [boundary.map(([lat, lng]) => [lng, lat])];
          return {
            type: "Feature",
            id: cell.cellId,
            geometry: {
              type: "Polygon",
              coordinates,
            },
            properties: {
              cellId: cell.cellId,
              count: cell.count,
              datasets: cell.datasets,
              organizations: cell.organizations,
              eovs: cell.eovs,
            },
          };
        } catch (error) {
          return null;
        }
      })
      .filter((f) => f !== null);

    return {
      type: "FeatureCollection",
      features,
    };
  }, [filteredItems, isActive, prerenderedHexGrid]);

  // Create color scale
  const getColorScale = useCallback(() => {
    // Get color scale from config or use default
    const hexGridConfig = config.hex_grid || {};
    const scaleName = hexGridConfig.color_scale || colorScale;

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

  // Get color based on count using logarithmic scaling
  const getHexColor = useCallback(
    (count, maxCount) => {
      const colorPalette = getColorScale();
      // Use logarithmic scaling: log(count+1) normalized to 0-1 range
      const logCount = Math.log(count + 1);
      const logMax = Math.log(maxCount + 1);
      const normalizedValue = logMax > 0 ? logCount / logMax : 0;
      const index = Math.floor(normalizedValue * (colorPalette.length - 1));
      return colorPalette[index];
    },
    [getColorScale],
  );

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

    // Get opacity settings from config
    const hexGridConfig = config.hex_grid || {};
    const minOpacity =
      hexGridConfig.min_opacity !== undefined
        ? hexGridConfig.min_opacity
        : 0.05;
    const maxOpacity =
      hexGridConfig.max_opacity !== undefined
        ? hexGridConfig.max_opacity
        : 0.75;
    const opacityRange = maxOpacity - minOpacity;

    // Create GeoJSON layer with styling
    const geoJsonLayer = L.geoJSON(geoJsonData, {
      style: (feature) => {
        const color = getHexColor(feature.properties.count, maxCount);
        // Use logarithmic scaling for transparency based on config min/max values
        const logCount = Math.log(feature.properties.count + 1);
        const logMax = Math.log(maxCount + 1);
        const normalizedLogValue = logMax > 0 ? logCount / logMax : 0;
        const scaledOpacity = minOpacity + normalizedLogValue * opacityRange;
        return {
          fillColor: color,
          color: "transparent",
          weight: 0,
          opacity: 0,
          fillOpacity: scaledOpacity,
        };
      },
      onEachFeature: (feature, layer) => {
        // Calculate and store original opacity based on feature count
        const logCount = Math.log(feature.properties.count + 1);
        const logMax = Math.log(maxCount + 1);
        const normalizedLogValue = logMax > 0 ? logCount / logMax : 0;
        const originalOpacity = minOpacity + normalizedLogValue * opacityRange;

        // Create tooltip with hex info
        const props = feature.properties;
        const tooltipContent = `
          <div style="max-width: 200px;">
            <strong>Datasets: ${props.count}</strong><br/>
            <small>Organizations: ${props.organizations.length}</small><br/>
            <small>Essential Ocean Variables: ${props.eovs.length}</small>
          </div>
        `;

        // Bind tooltip to layer (opens only on click, not hover)
        layer.bindTooltip(tooltipContent, {
          className: "hex-tooltip",
          sticky: true,
          permanent: false,
          interactive: true,
          closeButton: false,
        });

        // Disable automatic tooltip on hover
        layer.off("mouseover");
        layer.off("mouseout");

        // Add click handler to show tooltip and filter datasets
        layer.on("click", (e) => {
          // Prevent event from propagating to map
          L.DomEvent.stopPropagation(e);

          // Close all other tooltips first
          geoJsonLayer.eachLayer((l) => {
            if (l !== layer && l.getTooltip && l.getTooltip()) {
              l.closeTooltip();
            }
          });

          // Open this tooltip
          layer.openTooltip(e.latlng);
          onHexClick(feature);
        });
      },
    });

    // Add layer to map
    geoJsonLayer.addTo(map);
    hexGridLayerRef.current = geoJsonLayer;

    return () => {
      if (hexGridLayerRef.current && map) {
        try {
          // Close all tooltips before removing layer
          hexGridLayerRef.current.eachLayer((layer) => {
            if (layer.closeTooltip) {
              layer.closeTooltip();
            }
          });
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
