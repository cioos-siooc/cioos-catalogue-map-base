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
        // Map marker/pin icon
        markersBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
          <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
        </svg>`;

        const hexGridBtn = L.DomUtil.create(
          "a",
          `visualization-btn hexgrid-btn ${visualizationMode === "hexgrid" ? "active" : ""}`,
          container,
        );
        hexGridBtn.href = "#";
        hexGridBtn.title = hexGridLabel;
        // Hex grid pattern icon - simplified with 7 hexagons in honeycomb pattern
        hexGridBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="bi bi-hexagon-fill" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M8.5.134a1 1 0 0 0-1 0l-6 3.577a1 1 0 0 0-.5.866v6.846a1 1 0 0 0 .5.866l6 3.577a1 1 0 0 0 1 0l6-3.577a1 1 0 0 0 .5-.866V4.577a1 1 0 0 0-.5-.866z"/>
        </svg>`;

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
