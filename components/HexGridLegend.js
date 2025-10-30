"use client";

import { useState, useMemo } from "react";
import chroma from "chroma-js";
import config from "@/app/config";

/**
 * HexGridLegend Component
 * Displays a color scale legend for the hex grid aggregation
 */
const HexGridLegend = ({ isVisible, maxCount = 100 }) => {
  // Get color scale
  const getColorScale = () => {
    const scaleName = config.hex_grid_color_scale || "viridis";

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

  if (!isVisible) {
    return null;
  }

  return (
    <div className="absolute bottom-20 left-4 z-20 max-w-xs rounded-lg bg-white p-4 shadow-lg">
      <h3 className="mb-3 text-sm font-semibold text-gray-800">
        Dataset Density
      </h3>

      {/* Color scale gradient */}
      <div className="mb-4">
        <div
          className="h-6 rounded"
          style={{
            backgroundImage: `linear-gradient(to right, ${colorPalette.join(
              ",",
            )})`,
          }}
        />
        <div className="mt-1 flex justify-between text-xs text-gray-600">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Legend info */}
      <div className="space-y-2 border-t border-gray-200 pt-3 text-xs text-gray-700">
        <p>
          <strong>Max datasets per cell:</strong> {maxCount}
        </p>
        <p className="text-gray-600">
          Hover over hexagons to see dataset details. Click to filter by cell.
        </p>
      </div>
    </div>
  );
};

export default HexGridLegend;
