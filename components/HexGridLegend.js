"use client";

import { useState, useMemo, useEffect } from "react";
import chroma from "chroma-js";
import config from "@/app/config";

/**
 * HexGridLegend Component
 * Displays a color scale legend for the hex grid aggregation
 * Updates dynamically based on filtered datasets
 */
const HexGridLegend = ({ isVisible, filteredItems = [] }) => {
  const [maxCount, setMaxCount] = useState(0);
  const [prerenderedHexGrid, setPrerenderedHexGrid] = useState(null);

  // Get color scale
  const getColorScale = () => {
    const hexGridConfig = config.hex_grid || {};
    const scaleName = hexGridConfig.color_scale || "viridis";

    try {
      if (Array.isArray(scaleName)) {
        return chroma.scale(scaleName).colors(10);
      } else {
        return chroma.scale(scaleName).colors(10);
      }
    } catch (error) {
      console.error(`Error creating color scale '${scaleName}':`, error);
      return chroma.scale("viridis").colors(10);
    }
  };

  const colorPalette = useMemo(() => getColorScale(), []);

  // Load prerendered hex grid once on mount
  useEffect(() => {
    const loadPrerenderedHexGrid = async () => {
      try {
        const response = await fetch("/hex-grid-default.json");
        if (response.ok) {
          const hexGridData = await response.json();
          setPrerenderedHexGrid(hexGridData);
        }
      } catch (error) {
        console.warn("Could not load hex grid data for legend:", error);
      }
    };

    loadPrerenderedHexGrid();
  }, []);

  // Calculate maxCount based on filtered items - updates when filteredItems or prerenderedHexGrid changes
  useEffect(() => {
    if (!isVisible || !prerenderedHexGrid || filteredItems.length === 0) {
      setMaxCount(0);
      return;
    }

    // Create a set of filtered dataset IDs for quick lookup
    const datasetIds = new Set(filteredItems.map((item) => item.id));

    // Calculate max count from filtered data
    const filteredMaxCount = Math.max(
      ...prerenderedHexGrid.cells
        .filter((cell) => {
          // Filter cells that contain at least one dataset from filteredItems
          return cell.d.some((id) => datasetIds.has(id));
        })
        .map((cell) => {
          // Count only the datasets that are in the filtered set
          return cell.d.filter((id) => datasetIds.has(id)).length;
        }),
      1, // Ensure minimum of 1 to avoid edge cases
    );

    setMaxCount(filteredMaxCount);
  }, [isVisible, filteredItems, prerenderedHexGrid]);

  // Calculate log scale labels
  const getLogScaleLabels = () => {
    if (maxCount <= 0) return ["1", maxCount.toString()];

    const logMin = Math.log(1 + 1);
    const logMax = Math.log(maxCount + 1);
    const logRange = logMax - logMin;

    const labels = [];
    for (let i = 0; i <= 10; i++) {
      const normalizedValue = i / 10;
      const logValue = logMin + normalizedValue * logRange;
      const actualValue = Math.round(Math.exp(logValue) - 1);
      if (i === 0 || i === 10 || i === 5) {
        labels.push(actualValue.toString());
      }
    }
    return labels;
  };

  const logLabels = useMemo(() => getLogScaleLabels(), [maxCount]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="leaflet-control leaflet-bar right-[12px] bottom-[86px] flex flex-col items-center bg-white p-0.5"
      style={{
        position: "fixed",
        zIndex: 999,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          fontWeight: 600,
          color: "#333",
          padding: "4px 0",
          textAlign: "center",
          lineHeight: "1.1",
        }}
      >
        <div>Datasets</div>
        <div>Count</div>
      </div>

      {/* Vertical color scale gradient with overlaid labels */}
      <div
        style={{
          position: "relative",
          width: "36px",
          height: "220px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Color gradient bar */}
        <div
          style={{
            position: "absolute",
            width: "32px",
            height: "180px",
            borderRadius: "8px",
            backgroundImage: `linear-gradient(to top, ${colorPalette
              .reverse()
              .join(",")})`,
          }}
        />

        {/* Top label - above color scale */}
        <div
          style={{
            position: "absolute",
            top: "0px",
            fontSize: "12px",
            color: "#333",
            fontWeight: 600,
            textShadow: "0 1px 2px rgba(255,255,255,0.8)",
            pointerEvents: "none",
          }}
        >
          {logLabels[2]}
        </div>

        {/* Middle label - in the middle of color scale */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "12px",
            color: "white",
            fontWeight: 600,
            textShadow: "0 1px 3px rgba(0,0,0,0.7)",
            pointerEvents: "none",
          }}
        >
          {logLabels[1]}
        </div>

        {/* Bottom label - below color scale */}
        <div
          style={{
            position: "absolute",
            bottom: "0px",
            fontSize: "12px",
            color: "#333",
            fontWeight: 600,
            textShadow: "0 1px 2px rgba(255,255,255,0.8)",
            pointerEvents: "none",
          }}
        >
          {logLabels[0]}
        </div>
      </div>
    </div>
  );
};

export default HexGridLegend;
