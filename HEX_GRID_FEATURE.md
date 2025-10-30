# Hexagonal Grid Spatial Aggregation Feature

## Overview

This feature enables users to visualize the spatial distribution of datasets using a hexagonal grid aggregation layer. Instead of showing individual dataset markers, the map displays aggregated hexagonal cells where the color intensity represents the density of datasets in that area.

## Key Features

✅ **Dynamic Resolution**: Hexagon grid resolution automatically adapts based on map zoom level
✅ **Configurable Color Scale**: Choose from multiple color schemes via `config.yaml`
✅ **Click-to-Filter**: Click on a hex cell to filter the sidebar to show only datasets in that cell
✅ **Hover Tooltips**: Hover over hexagons to see dataset count and organization information
✅ **Mutually Exclusive Display**: Hex grid and marker layers cannot be shown simultaneously
✅ **Performance Optimized**: Uses H3 spatial indexing for efficient calculation
✅ **Multi-language Support**: Hex grid label and legend text are localized

## How It Works

### 1. Architecture

The feature consists of four main components:

#### **utils/hexGridUtils.js** - Spatial Aggregation Logic

- Converts dataset spatial extents to points (center of mass)
- Bins points into H3 hexagonal cells
- Calculates aggregated statistics per cell (count, organizations, EOVs)
- Returns GeoJSON FeatureCollection for rendering

**Key Functions:**

- `getH3ResolutionForZoom(zoomLevel)` - Determines hex resolution based on zoom
- `aggregateDatasetsToHexGrid(datasets, zoomLevel)` - Main aggregation function
- `getMaxCount(features)` - Normalizes color scale based on max dataset count

#### **components/HexGrid.js** - Layer Renderer

- React component that renders the hex grid on the Leaflet map
- Listens for zoom changes to recalculate aggregation
- Handles styling, hover effects, and click events
- Uses chroma-js for color mapping

#### **components/HexGridLegend.js** - Visual Legend

- Displays color scale gradient
- Shows dataset density information
- Provides usage instructions

#### **components/Map.js** - Integration & Mode Switching

- Manages visualization mode state (markers vs hexgrid)
- Listens to layer control events to switch modes
- Ensures only one visualization mode is active at a time
- Passes hex cell click callback to layout.js for filtering

### 2. Zoom-Based Resolution

H3 hexagonal cells have different resolutions (0-15). The feature automatically selects resolution based on zoom level:

| Zoom Level | H3 Resolution | Cell Size |
| ---------- | ------------- | --------- |
| 0-2        | 2             | ~0.6M km² |
| 3-5        | 4             | ~600K km² |
| 6-8        | 5             | ~10K km²  |
| 9+         | 6-7           | ~2K km²   |

This ensures the map always shows an appropriate level of detail without becoming cluttered.

### 3. Color Scale Configuration

Edit `config.yaml` to customize the color scale:

```yaml
# Hexagon grid color scale configuration
# Supports named color schemes: "viridis", "plasma", "inferno", "magma", "cividis", "Blues", "Greens", "Greys", "Oranges", "Reds", "Purples"
# Or specify custom colors as an array of hex values
hex_grid_color_scale: "viridis"
```

**Available Named Scales:**

- Sequential: `Blues`, `Greens`, `Greys`, `Oranges`, `Reds`, `Purples`
- Perceptual: `viridis`, `plasma`, `inferno`, `magma`, `cividis`
- Custom: `["#fff5f0", "#fee0d2", "#fcbba1", ..., "#67000d"]`

## User Workflow

### 1. Switching Visualization Modes

In the layer control panel (bottom-right):

- **Default**: "Dataset markers" is checked (centroid markers visible)
- **Switch to Hex Grid**: Uncheck "Dataset markers", check "Hex Grid Aggregation"
- **Switch back**: Uncheck "Hex Grid Aggregation", check "Dataset markers"

### 2. Using Hex Grid View

1. **See Dataset Density**: Color of each hex cell indicates how many datasets are in that area (darker/warmer = more datasets)
2. **Hover for Details**: Hover over a hex cell to see:
   - Number of datasets
   - Number of unique organizations
   - Number of Essential Ocean Variables
3. **Filter by Area**: Click a hex cell to show only datasets from that cell in the sidebar
4. **Check Legend**: Bottom-left legend shows the color scale and max dataset count

### 3. Hex Cell Filtering

When you click a hex cell:

- The sidebar updates to show only datasets within that cell
- The result count updates accordingly
- You can still apply additional filters (organization, project, EOV, date)
- Click another hex cell to update the filter, or uncheck "Hex Grid Aggregation" to reset

## Technical Details

### Spatial Aggregation Process

```javascript
// 1. Extract dataset point
const point = turf.centerOfMass(dataset.spatial) || turf.pointOnFeature(dataset.spatial)

// 2. Convert to H3 cell
const cellId = latLngToCell(lat, lng, resolution)

// 3. Aggregate data per cell
hexagons.get(cellId).datasets.push({
  id, title, organization, eov, ...
})

// 4. Create GeoJSON for rendering
const feature = {
  type: "Feature",
  id: cellId,
  geometry: { type: "Polygon", coordinates: [...] },
  properties: {
    count: 42,
    datasets: [...],
    organizations: [...],
    eovs: [...]
  }
}
```

### Performance Considerations

- **H3 Indexing**: Efficient O(1) cell lookup using Uber's H3 library
- **Memoization**: GeoJSON aggregation is memoized and only recalculates on filter/zoom changes
- **Lazy Rendering**: HexGrid component uses dynamic import to avoid SSR
- **Layer Management**: Only active visualization mode is rendered to avoid memory bloat

### State Management

- **Visualization Mode**: Stored in Map component state (`visualizationMode`)
- **Hex Cell Filter**: Stored in AppContent state (`hexCellFilter`)
- **Filtered Items**: Updated when hex cell is clicked via `handleHexCellFiltered` callback

## Dependencies

- **h3-js** - Uber's H3 hexagonal indexing library
- **chroma-js** - Color scale and gradient generation
- **@turf/turf** - Already used for spatial operations
- **react-leaflet** - Existing map integration
- **leaflet** - Underlying map library

## Files Modified/Created

### Created:

- `utils/hexGridUtils.js` - Aggregation logic
- `components/HexGrid.js` - Layer renderer
- `components/HexGridLegend.js` - Legend component

### Modified:

- `components/Map.js` - Integration and mode switching
- `app/layout.js` - Hex cell filtering callback
- `config.yaml` - Color scale configuration
- `app/locales/en.json` - English text
- `app/locales/fr.json` - French text
- `package.json` - Added h3-js and chroma-js dependencies

## Configuration Examples

### Custom Color Palette

```yaml
# In config.yaml
hex_grid_color_scale:
  [
    "#f7fbff",
    "#deebf7",
    "#c6dbef",
    "#9ecae1",
    "#6baed6",
    "#4292c6",
    "#2171b5",
    "#084594",
  ]
```

### Different Named Scale

```yaml
# Warm colors
hex_grid_color_scale: "Reds"

# Cool colors
hex_grid_color_scale: "Blues"

# High contrast perceptual
hex_grid_color_scale: "viridis"
```

## Browser Compatibility

Works on all modern browsers that support:

- ES6+ JavaScript
- WebGL (for better canvas rendering)
- Leaflet.js layers and events

## Future Enhancements

Potential improvements for future versions:

1. **Statistics Panel**: Show aggregated statistics when hex grid is active
2. **Time Animation**: Animate hex grid through time ranges
3. **Custom H3 Resolution**: Allow users to manually adjust resolution
4. **Export Aggregated Data**: Download aggregated dataset information as CSV/GeoJSON
5. **Heat Map Mode**: Alternative visualization using heatmap library
6. **Clustering Toggle**: Show/hide hex grid on top of marker clustering

## Troubleshooting

### Hex grid not appearing

- Ensure "Hex Grid Aggregation" is checked in the layer control
- Verify at least some datasets are visible (check other filters)
- Check browser console for errors related to h3-js

### Colors look wrong

- Verify `hex_grid_color_scale` in config.yaml is a valid chroma scale name
- Check that custom color arrays have valid hex values
- Clear browser cache and reload

### Performance issues

- Reduce zoom level (fewer, larger hexagons = faster)
- Increase `maxCount` threshold in HexGridLegend for better color differentiation
- Check browser developer tools for long-running calculations

## References

- [H3 Documentation](https://h3geo.org/)
- [Chroma.js Color Scales](https://chroma.js.org/)
- [Leaflet Layers Control](https://leafletjs.com/reference.html#control-layers)
