"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

/**
 * HexGridLayer Component
 * Wrapper that creates a Leaflet FeatureGroup for the hex grid
 * This allows it to be properly recognized by LayersControl
 */
const HexGridLayer = ({ children }) => {
  const map = useMap();
  const featureGroupRef = useRef(null);

  useEffect(() => {
    // Create a feature group to hold the hex grid
    if (!featureGroupRef.current) {
      featureGroupRef.current = L.featureGroup();
      featureGroupRef.current.addTo(map);
    }

    return () => {
      if (featureGroupRef.current) {
        map.removeLayer(featureGroupRef.current);
        featureGroupRef.current = null;
      }
    };
  }, [map]);

  // Render children as a dummy element (they're rendered imperatively by HexGrid)
  return null;
};

export default HexGridLayer;
