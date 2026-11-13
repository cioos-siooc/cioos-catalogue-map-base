"use client";

import "@maptiler/sdk/dist/maptiler-sdk.css";
import {
  Map as MaptilerMap,
  config as maptilerConfig,
  Language,
  MapStyle,
  Popup,
} from "@maptiler/sdk";
import * as turf from "@turf/turf";
import { DrawerContext } from "../app/context/DrawerContext";
import {
  useContext,
  useEffect,
  forwardRef,
  useRef,
  useImperativeHandle,
  useState,
} from "react";
import config from "@/app/config";
import { getLocale } from "@/app/get-locale";

maptilerConfig.apiKey = process.env.MAPTILER_KEY || "";

// Layer/source ids used by the dataset markers + highlight layers we add on top of the basemap.
const CLUSTER_SOURCE_ID = "dataset-points";
const CLUSTERS_LAYER_ID = "dataset-clusters";
const CLUSTER_COUNT_LAYER_ID = "dataset-cluster-count";
const UNCLUSTERED_LAYER_ID = "dataset-unclustered";
const HOVER_HIGHLIGHT_SOURCE_ID = "dataset-hover-highlight";
const HOVER_HIGHLIGHT_LAYER_ID = "dataset-hover-highlight-line";
const SELECTION_HIGHLIGHT_SOURCE_ID = "dataset-selection-highlight";
const SELECTION_HIGHLIGHT_LAYER_ID = "dataset-selection-highlight-line";
const PLACE_LABELS_LAYER_ID = "place-labels";
// The Ocean style's own "maptiler_planet" source has the city/town/village data we
// want, but @maptiler/sdk auto-scans every symbol layer reading from a maptiler.com
// source to apply its own language rewriting, and chokes on our custom expression.
// Cloning the resolved tile URLs into our own source keeps the data but keeps our
// layer off that auto-scan (its source is no longer flagged as a MapTiler source).
const PLANET_SOURCE_ID = "maptiler_planet";
const PLACE_LABELS_SOURCE_ID = "place-labels-source";
const EMPTY_FEATURE_COLLECTION = { type: "FeatureCollection", features: [] };

// Utility functions
function getCssVar(name, fallback) {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

const getPrimaryColor = () => getCssVar("--color-primary-500", "#0891b2");

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

// Falls back to a guaranteed-inside point for concave/multi-part geometries, and
// unwraps longitude relative to the map center so markers don't jump across the antimeridian.
function getMarkerLngLat(record, centerLng) {
  let point = turf.centerOfMass(record.spatial);
  if (!turf.booleanPointInPolygon(point, record.spatial)) {
    point = turf.pointOnFeature(record.spatial);
  }
  let [lng, lat] = point.geometry.coordinates;
  while (lng - centerLng > 180) lng -= 360;
  while (lng - centerLng < -180) lng += 360;
  return [lng, lat];
}

function buildPointsFeatureCollection(items, centerLng) {
  return {
    type: "FeatureCollection",
    features: items.map((item) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: getMarkerLngLat(item, centerLng),
      },
      properties: { id: item.id },
    })),
  };
}

function flyToBounds(map, newBounds) {
  if (!map || !newBounds) return;
  map.getSource(SELECTION_HIGHLIGHT_SOURCE_ID)?.setData(newBounds);

  const [west, south, east, north] = turf.bbox(newBounds);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  map.fitBounds(
    [
      [west, south],
      [east, north],
    ],
    {
      padding: isMobile
        ? { top: 50, bottom: 50, left: 50, right: 50 }
        : { top: 250, bottom: 250, left: 150, right: 150 },
      maxZoom: isMobile ? 13 : 10,
      duration: 300,
    },
  );
}

// Recomputes small/medium/large percentile thresholds from the clusters currently
// rendered on screen, then applies them as `step` paint expressions on the cluster layers.
function recomputeClusterColors(map) {
  if (!map.getLayer(CLUSTERS_LAYER_ID)) return;

  const counts = map
    .querySourceFeatures(CLUSTER_SOURCE_ID, { filter: ["has", "point_count"] })
    .map((f) => f.properties.point_count)
    .sort((a, b) => a - b);
  if (!counts.length) return;

  const p33 = counts[Math.floor(counts.length * 0.33)] ?? counts[0];
  const p66raw =
    counts[Math.floor(counts.length * 0.66)] ?? counts[counts.length - 1];
  const p66 = p66raw > p33 ? p66raw : p33 + 1;

  const small = getCssVar("--color-primary-200", "#bae6fd");
  const medium = getCssVar("--color-primary-500", "#0891b2");
  const large = getCssVar("--color-primary-700", "#155e75");
  const textDark = getCssVar("--color-black", "#000000");
  const textLight = getCssVar("--color-white", "#ffffff");

  map.setPaintProperty(CLUSTERS_LAYER_ID, "circle-color", [
    "step",
    ["get", "point_count"],
    small,
    p33,
    medium,
    p66,
    large,
  ]);
  map.setPaintProperty(CLUSTERS_LAYER_ID, "circle-radius", [
    "step",
    ["get", "point_count"],
    16,
    p33,
    20,
    p66,
    24,
  ]);
  map.setPaintProperty(CLUSTER_COUNT_LAYER_ID, "text-color", [
    "step",
    ["get", "point_count"],
    textDark,
    p33,
    textLight,
  ]);
}

function applyBasemap(
  map,
  key,
  { terrainLayerIds, rasterBasemapKeys, styleBasemapKey },
) {
  const showStyleTerrain = key === styleBasemapKey;
  terrainLayerIds.forEach((id) => {
    if (map.getLayer(id)) {
      map.setLayoutProperty(
        id,
        "visibility",
        showStyleTerrain ? "visible" : "none",
      );
    }
  });
  rasterBasemapKeys.forEach((k) => {
    const layerId = `basemap-${k}`;
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(
        layerId,
        "visibility",
        k === key ? "visible" : "none",
      );
    }
  });
}

// Basemap radio group plus a dataset-markers checkbox, driven entirely by our own
// React state (no control rebuild on language/data change, so the basemap selection
// never resets).
function LayersMenu({
  basemaps,
  basemapKey,
  setBasemapKey,
  markersVisible,
  setMarkersVisible,
  lang,
  t,
  open,
  setOpen,
}) {
  return (
    <div className="absolute right-[10px] bottom-[20px] z-[600]">
      {open && (
        <div className="text-ui-text-light dark:text-ui-text-dark bg-background-light dark:bg-background-dark mb-2 w-52 rounded-md p-3 text-sm shadow-md">
          <div className="mb-2 font-semibold">{t.basemap}</div>
          {basemaps.map((b) => (
            <label key={b.key} className="mb-1 flex items-center gap-2">
              <input
                type="radio"
                name="basemap"
                checked={basemapKey === b.key}
                onChange={() => setBasemapKey(b.key)}
              />
              {b.name?.[lang] || b.key}
            </label>
          ))}
          <div className="mt-2 border-t pt-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={markersVisible}
                onChange={(e) => setMarkersVisible(e.target.checked)}
              />
              {t.dataset_markers}
            </label>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="bg-primary-500 flex h-9 w-9 items-center justify-center rounded-md text-lg text-white shadow"
        aria-label={t.layers}
        aria-expanded={open}
      >
        ▤
      </button>
    </div>
  );
}

// Attribution popover for whichever raster basemap is currently active (the vector
// Ocean style shows MapTiler's own required attribution itself, via the SDK default).
function AttributionToggle({ basemaps, basemapKey }) {
  const [hovered, setHovered] = useState(false);
  const active = basemaps.find((b) => b.key === basemapKey);

  if (!active?.attribution) return null;
  return (
    <div
      className="pointer-events-none absolute right-[64px] bottom-[20px] z-[600] flex flex-col items-end gap-2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div className="pointer-events-auto max-h-40 w-64 overflow-y-auto rounded-md bg-black/40 p-2 text-[10px] leading-relaxed shadow-md backdrop-blur">
          <div dangerouslySetInnerHTML={{ __html: active.attribution }} />
        </div>
      )}
      <div className="bg-primary-500 dark:bg-background-dark pointer-events-auto rounded-xl px-2 py-1 text-[11px] font-medium text-white shadow">
        ?
      </div>
    </div>
  );
}

// Main Map component
const Map = forwardRef(function Map(
  { bounds, filteredItems, handleListItemClick, lang },
  ref,
) {
  const { openDrawer } = useContext(DrawerContext);
  const t = getLocale(lang);

  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const mapReadyRef = useRef(false);
  const popupRef = useRef(null);
  const terrainLayerIdsRef = useRef([]);
  const rasterBasemapKeysRef = useRef([]);
  const styleBasemapKeyRef = useRef(null);
  const initialBasemapKeyRef = useRef(null);

  // Always-fresh refs so imperative MapLibre event handlers (registered once on
  // "load") never see stale props/closures.
  const langRef = useRef(lang);
  langRef.current = lang;
  const itemsRef = useRef(filteredItems);
  itemsRef.current = filteredItems;
  const handleListItemClickRef = useRef(handleListItemClick);
  handleListItemClickRef.current = handleListItemClick;
  const openDrawerRef = useRef(openDrawer);
  openDrawerRef.current = openDrawer;

  const [basemapKey, setBasemapKey] = useState(
    () =>
      config.basemaps.find((b) => b.checked)?.key || config.basemaps[0]?.key,
  );
  const [markersVisible, setMarkersVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Mount the MapLibre/MapTiler map once.
  useEffect(() => {
    if (!containerRef.current) return;

    // Only treat a basemap as the underlying MapLibre "style" when it explicitly opts
    // in with `style:` - falling back to a MapTiler-hosted style here would silently
    // replace an all-raster config's intended look with an unrelated vector basemap.
    const styleBasemap = config.basemaps.find((b) => b.style) || null;
    styleBasemapKeyRef.current = styleBasemap?.key ?? null;
    initialBasemapKeyRef.current =
      config.basemaps.find((b) => b.checked)?.key ||
      styleBasemap?.key ||
      config.basemaps[0]?.key;

    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
    const centerLngLat = [config.map.center[1], config.map.center[0]];
    const boundsLngLat = config.map.default_bounds
      ? [
          [config.map.default_bounds[0][1], config.map.default_bounds[0][0]],
          [config.map.default_bounds[1][1], config.map.default_bounds[1][0]],
        ]
      : undefined;

    const map = new MaptilerMap({
      container: containerRef.current,
      style: styleBasemap
        ? MapStyle[styleBasemap.style]
        : {
            version: 8,
            sources: {},
            layers: [],
            glyphs: `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${maptilerConfig.apiKey}`,
          },
      center: boundsLngLat ? undefined : centerLngLat,
      zoom: boundsLngLat
        ? undefined
        : isMobile
          ? config.map.zoom_mobile
          : config.map.zoom,
      bounds: boundsLngLat,
      language: langRef.current === "fr" ? Language.FRENCH : Language.ENGLISH,
    });
    mapInstanceRef.current = map;

    map.on("load", () => {
      // Terrain layers belonging to the vector style (everything except "Background"
      // and label layers), toggled off when a raster basemap like satellite is active.
      const initialLayerIds = map.getStyle().layers.map((l) => l.id);
      const isLabelLayer = (id) => /label/i.test(id);
      terrainLayerIdsRef.current = initialLayerIds.filter(
        (id) => id !== "Background" && !isLabelLayer(id),
      );
      const firstLabelLayerId = initialLayerIds.find(isLabelLayer);

      const rasterBasemaps = config.basemaps.filter((b) => !b.style);
      rasterBasemapKeysRef.current = rasterBasemaps.map((b) => b.key);
      rasterBasemaps.forEach((basemap) => {
        const sourceId = `basemap-${basemap.key}`;
        map.addSource(sourceId, {
          type: "raster",
          tiles: [basemap.url],
          tileSize: 256,
          attribution: basemap.attribution,
          minzoom: basemap.minZoom || 0,
          maxzoom: basemap.maxZoom || 19,
        });
        map.addLayer(
          {
            id: sourceId,
            type: "raster",
            source: sourceId,
            layout: { visibility: "none" },
          },
          firstLabelLayerId,
        );
      });

      const planetSource = map.getSource(PLANET_SOURCE_ID);
      if (planetSource?.tiles?.length) {
        map.addSource(PLACE_LABELS_SOURCE_ID, {
          type: "vector",
          tiles: planetSource.tiles,
          minzoom: planetSource.minzoom ?? 0,
          maxzoom: planetSource.maxzoom ?? 14,
        });
        map.addLayer({
          id: PLACE_LABELS_LAYER_ID,
          type: "symbol",
          source: PLACE_LABELS_SOURCE_ID,
          "source-layer": "place",
          filter: [
            "in",
            ["get", "class"],
            ["literal", ["city", "town", "village"]],
          ],
          layout: {
            "text-field": [
              "coalesce",
              ["get", `name:${langRef.current}`],
              ["get", "name"],
            ],
            "text-font": ["Noto Sans Regular"],
            "text-size": 12,
          },
          paint: {
            "text-color": "#333333",
            "text-halo-color": "#ffffff",
            "text-halo-width": 1.2,
          },
        });
      } else {
        console.warn(
          `MapTiler style has no "${PLANET_SOURCE_ID}" source; skipping city labels.`,
        );
      }

      map.addSource(HOVER_HIGHLIGHT_SOURCE_ID, {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
      });
      map.addLayer({
        id: HOVER_HIGHLIGHT_LAYER_ID,
        type: "line",
        source: HOVER_HIGHLIGHT_SOURCE_ID,
        paint: { "line-color": getPrimaryColor(), "line-width": 2 },
      });

      map.addSource(SELECTION_HIGHLIGHT_SOURCE_ID, {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
      });
      map.addLayer({
        id: SELECTION_HIGHLIGHT_LAYER_ID,
        type: "line",
        source: SELECTION_HIGHLIGHT_SOURCE_ID,
        paint: { "line-color": getPrimaryColor(), "line-width": 2 },
      });

      map.addSource(CLUSTER_SOURCE_ID, {
        type: "geojson",
        data: buildPointsFeatureCollection(
          itemsRef.current,
          config.map.center[1],
        ),
        cluster: true,
        clusterRadius: 60,
        clusterMaxZoom: 14,
      });
      map.addLayer({
        id: CLUSTERS_LAYER_ID,
        type: "circle",
        source: CLUSTER_SOURCE_ID,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": getCssVar("--color-primary-200", "#bae6fd"),
          "circle-radius": 16,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
        },
      });
      map.addLayer({
        id: CLUSTER_COUNT_LAYER_ID,
        type: "symbol",
        source: CLUSTER_SOURCE_ID,
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Noto Sans Bold"],
          "text-size": 12,
        },
        paint: { "text-color": "#000000" },
      });
      map.addLayer({
        id: UNCLUSTERED_LAYER_ID,
        type: "circle",
        source: CLUSTER_SOURCE_ID,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": getPrimaryColor(),
          "circle-radius": 7,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Cluster click: zoom/expand.
      map.on("click", CLUSTERS_LAYER_ID, (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        map
          .getSource(CLUSTER_SOURCE_ID)
          .getClusterExpansionZoom(
            feature.properties.cluster_id,
            (err, zoom) => {
              if (err) return;
              map.easeTo({
                center: feature.geometry.coordinates,
                zoom,
                duration: 500,
              });
            },
          );
      });
      map.on("mouseenter", CLUSTERS_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", CLUSTERS_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });

      // Individual marker: click opens drawer, hover shows popup + highlight outline.
      map.on("click", UNCLUSTERED_LAYER_ID, (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const record = itemsRef.current.find(
          (item) => String(item.id) === String(feature.properties.id),
        );
        if (!record) return;
        handleListItemClickRef.current(record);
        openDrawerRef.current();
      });
      map.on("mouseenter", UNCLUSTERED_LAYER_ID, (e) => {
        map.getCanvas().style.cursor = "pointer";
        const feature = e.features?.[0];
        if (!feature) return;
        const record = itemsRef.current.find(
          (item) => String(item.id) === String(feature.properties.id),
        );
        if (!record) return;

        if (record.spatial?.type !== "Point") {
          map.getSource(HOVER_HIGHLIGHT_SOURCE_ID)?.setData(record.spatial);
        }

        const currentLang = langRef.current;
        const html = `<div style="width:200px">
          <strong>${escapeHtml(record.title_translated?.[currentLang])}</strong>
          <div style="font-size:11px">${escapeHtml(record.organization?.title_translated?.[currentLang])}</div>
        </div>`;
        if (!popupRef.current) {
          popupRef.current = new Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 12,
          });
        }
        popupRef.current
          .setLngLat(feature.geometry.coordinates)
          .setHTML(html)
          .addTo(map);
      });
      map.on("mouseleave", UNCLUSTERED_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
        map
          .getSource(HOVER_HIGHLIGHT_SOURCE_ID)
          ?.setData(EMPTY_FEATURE_COLLECTION);
        popupRef.current?.remove();
      });

      applyBasemap(map, initialBasemapKeyRef.current, {
        terrainLayerIds: terrainLayerIdsRef.current,
        rasterBasemapKeys: rasterBasemapKeysRef.current,
        styleBasemapKey: styleBasemapKeyRef.current,
      });
      setBasemapKey(initialBasemapKeyRef.current);

      recomputeClusterColors(map);
      map.on("moveend", () => recomputeClusterColors(map));
      map.on("zoomend", () => recomputeClusterColors(map));

      mapReadyRef.current = true;
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Language changes: swap built-in Ocean labels + our own place-labels layer, without
  // touching the basemap/terrain layers at all.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReadyRef.current) return;
    map.setLanguage(lang === "fr" ? Language.FRENCH : Language.ENGLISH);
    if (map.getLayer(PLACE_LABELS_LAYER_ID)) {
      map.setLayoutProperty(PLACE_LABELS_LAYER_ID, "text-field", [
        "coalesce",
        ["get", `name:${lang}`],
        ["get", "name"],
      ]);
    }
  }, [lang]);

  // Filtered dataset list changed: just update the GeoJSON source data in place.
  useEffect(() => {
    const map = mapInstanceRef.current;
    const source = map?.getSource(CLUSTER_SOURCE_ID);
    if (!source) return;
    source.setData(
      buildPointsFeatureCollection(filteredItems, config.map.center[1]),
    );
    setTimeout(() => recomputeClusterColors(map), 150);
  }, [filteredItems]);

  // Basemap selection changed via the LayersMenu.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReadyRef.current) return;
    applyBasemap(map, basemapKey, {
      terrainLayerIds: terrainLayerIdsRef.current,
      rasterBasemapKeys: rasterBasemapKeysRef.current,
      styleBasemapKey: styleBasemapKeyRef.current,
    });
  }, [basemapKey]);

  // Dataset-markers visibility toggle.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const visibility = markersVisible ? "visible" : "none";
    [CLUSTERS_LAYER_ID, CLUSTER_COUNT_LAYER_ID, UNCLUSTERED_LAYER_ID].forEach(
      (id) => {
        if (map.getLayer(id))
          map.setLayoutProperty(id, "visibility", visibility);
      },
    );
  }, [markersVisible]);

  // `bounds` prop changes (e.g. sidebar item click) fly the map there, same as the
  // imperative `updateBounds` ref method used for URL deep-links.
  useEffect(() => {
    if (bounds) flyToBounds(mapInstanceRef.current, bounds);
  }, [bounds]);

  useImperativeHandle(
    ref,
    () => ({
      clearMapLayers: () => {
        mapInstanceRef.current
          ?.getSource(SELECTION_HIGHLIGHT_SOURCE_ID)
          ?.setData(EMPTY_FEATURE_COLLECTION);
      },
      recenterToDefault: () => {
        const map = mapInstanceRef.current;
        if (!map) return;
        if (config.map.default_bounds) {
          const b = config.map.default_bounds;
          map.fitBounds([
            [b[0][1], b[0][0]],
            [b[1][1], b[1][0]],
          ]);
        } else {
          map.jumpTo({
            center: [config.map.center[1], config.map.center[0]],
            zoom: config.map.zoom,
          });
        }
      },
      updateBounds: (newBounds, setDatasetSpatial) => {
        flyToBounds(mapInstanceRef.current, newBounds);
        if (setDatasetSpatial) setDatasetSpatial(null);
      },
    }),
    [],
  );

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <LayersMenu
        basemaps={config.basemaps}
        basemapKey={basemapKey}
        setBasemapKey={setBasemapKey}
        markersVisible={markersVisible}
        setMarkersVisible={setMarkersVisible}
        lang={lang}
        t={t}
        open={menuOpen}
        setOpen={setMenuOpen}
      />
      <AttributionToggle basemaps={config.basemaps} basemapKey={basemapKey} />
    </div>
  );
});

export default Map;
