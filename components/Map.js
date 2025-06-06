"use client";

import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";
import {
  MapContainer,
  TileLayer,
  useMap,
  Tooltip,
  LayersControl,
  ZoomControl,
} from "react-leaflet";
import { Marker } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import * as turf from "@turf/turf";
import { DrawerContext } from "../app/context/DrawerContext";
import { useContext, useState, useEffect, useRef, memo } from "react";
import L from "leaflet";
import config from "@/app/config";
import { getLocale } from "@/app/get-locale";

const { BaseLayer, Overlay } = LayersControl;

// Utility functions
const getPrimaryColor = () =>
  getComputedStyle(document.documentElement)
    .getPropertyValue("--color-primary-500")
    .trim();

const clearMapLayers = (map) => {
  map.eachLayer((layer) => {
    if (layer instanceof L.Polygon || layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });
};

// FitBounds component
const FitBounds = memo(({ bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      clearMapLayers(map);
      const polygon = L.geoJSON(bounds, { color: getPrimaryColor() }).addTo(
        map,
      );

      map.flyToBounds(polygon.getBounds(), {
        animate: true,
        padding: [50, 50],
        maxZoom: 10,
        duration: 0.3,
      });
    }
  }, [bounds, map]);

  return null;
});
FitBounds.displayName = "FitBounds";

// DatasetMarker component
const DatasetMarker = memo(
  ({ record, handleListItemClick, lang, openDrawer }) => {
    let point = turf.centerOfMass(record.spatial);
    if (!turf.booleanPointInPolygon(point, record.spatial)) {
      point = turf.pointOnFeature(record.spatial);
    }

    const handleMarkerClick = () => {
      console.log("Marker clicked:", record.id);
      handleListItemClick(record);
      openDrawer();
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
        key={record.id}
        position={[
          point.geometry.coordinates[1],
          point.geometry.coordinates[0],
        ]}
        eventHandlers={{
          click: handleMarkerClick,
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

// BaseLayers component
const BaseLayers = memo(({ basemaps, lang }) => (
  <>
    {basemaps.map((layer) => (
      <BaseLayer
        key={layer.key}
        checked={layer.checked || false}
        name={layer.name[lang]}
      >
        <TileLayer
          url={layer.url}
          attribution={layer.attribution}
          minZoom={layer.minZoom || 0}
          maxZoom={layer.maxZoom || 10}
        />
      </BaseLayer>
    ))}
  </>
));
BaseLayers.displayName = "BaseLayers";

// Main Map component
function Map({ bounds, filteredItems, handleListItemClick, lang }) {
  const { openDrawer } = useContext(DrawerContext);
  const t = getLocale(lang);

  const mapRef = useRef();
  const [visibleItems, setVisibleItems] = useState(filteredItems);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateVisibleItems = () => {
      const bounds = map.getBounds();
      const visible = filteredItems.filter((item) => {
        const point = turf.centerOfMass(item.spatial);
        const lat = point.geometry.coordinates[1];
        const lng = point.geometry.coordinates[0];
        return bounds.contains([lat, lng]);
      });

      setVisibleItems(visible);
    };

    map.on("moveend", updateVisibleItems);
    updateVisibleItems();

    return () => {
      map.off("moveend", updateVisibleItems);
    };
  }, [filteredItems]);

  return (
    <MapContainer
      className="h-full w-full"
      center={config.map.center}
      zoom={config.map.zoom}
      zoomControl={false}
      scrollWheelZoom={true}
      boundsOptions={{ padding: [1, 1] }}
      whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
    >
      <ZoomControl position="topright" />
      <LayersControl position="bottomright">
        <BaseLayers basemaps={config.basemaps} lang={lang} />
        {bounds && <FitBounds bounds={bounds} />}
        <Overlay checked name={t.dataset_markers}>
          <MarkerClusterGroup>
            {visibleItems.map((item) => (
              <DatasetMarker
                key={item.id}
                record={item}
                handleListItemClick={handleListItemClick}
                lang={lang}
                openDrawer={openDrawer}
              />
            ))}
          </MarkerClusterGroup>
        </Overlay>
      </LayersControl>
    </MapContainer>
  );
}

export default memo(Map);
