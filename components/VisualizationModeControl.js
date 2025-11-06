"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "./VisualizationModeControl.css";

/**
 * VisualizationModeControl Component
 * Custom Leaflet control to toggle between markers and hex grid visualization
 */
const VisualizationModeControl = ({
  visualizationMode,
  onModeChange,
  markerLabel = "Markers",
  hexGridLabel = "Hex Grid",
}) => {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Create custom control
    const VisualizationControl = L.Control.extend({
      onAdd: (map) => {
        const container = L.DomUtil.create(
          "div",
          "visualization-mode-control leaflet-bar",
        );

        const markersBtn = L.DomUtil.create(
          "a",
          `visualization-btn markers-btn ${visualizationMode === "markers" ? "active" : ""}`,
          container,
        );
        markersBtn.href = "#";
        markersBtn.title = markerLabel;
        markersBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/></svg>`;

        const hexGridBtn = L.DomUtil.create(
          "a",
          `visualization-btn hexgrid-btn ${visualizationMode === "hexgrid" ? "active" : ""}`,
          container,
        );
        hexGridBtn.href = "#";
        hexGridBtn.title = hexGridLabel;
        // LuHexagon SVG from lucide-react icon set
        hexGridBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`;

        L.DomEvent.on(markersBtn, "click", (e) => {
          L.DomEvent.preventDefault(e);
          L.DomEvent.stopPropagation(e);
          onModeChange("markers");
          markersBtn.classList.add("active");
          hexGridBtn.classList.remove("active");
        });

        L.DomEvent.on(hexGridBtn, "click", (e) => {
          L.DomEvent.preventDefault(e);
          L.DomEvent.stopPropagation(e);
          onModeChange("hexgrid");
          hexGridBtn.classList.add("active");
          markersBtn.classList.remove("active");
        });

        return container;
      },
    });

    // Add control to map (positioned at top-right)
    const control = new VisualizationControl({ position: "topright" });
    control.addTo(map);
    controlRef.current = control;

    return () => {
      if (controlRef.current) {
        controlRef.current.remove();
      }
    };
  }, [map, onModeChange, markerLabel, hexGridLabel, visualizationMode]);

  return null;
};

export default VisualizationModeControl;
