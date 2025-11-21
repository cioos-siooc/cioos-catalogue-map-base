# Configuration Guide

This document explains all the configuration options available in [config.yaml](config.yaml) for the CIOOS Catalogue Map application.

## Quick Reference (Grouped)

### Basic Settings

| Property                 | Type                | Required | Default | Description                                                    |
| ------------------------ | ------------------- | -------- | ------- | -------------------------------------------------------------- |
| `catalogue_url`          | String              | Yes      | -       | Base CKAN catalogue URL.                                       |
| `fallback_catalogue_url` | String              | No       | -       | Secondary CKAN used if primary fails (harvest + API fallback). |
| `base_query`             | String              | No       | `""`    | Solr query segment to pre-filter datasets.                     |
| `default_language`       | String (`en`\|`fr`) | Yes      | -       | Initial UI language.                                           |
| `title.{lang}`           | String              | No       | -       | Optional short title displayed below main logo.                |

### Map

| Property             | Type          | Required | Default    | Description                                       |
| -------------------- | ------------- | -------- | ---------- | ------------------------------------------------- |
| `map.center`         | [lat, lng]    | Yes\*    | -          | Initial center (ignored if `map.default_bounds`). |
| `map.zoom`           | Number        | Yes\*    | -          | Initial zoom (desktop).                           |
| `map.zoom_mobile`    | Number        | No       | `map.zoom` | Alternate zoom on narrow screens (<1024px).       |
| `map.default_bounds` | [[S,W],[N,E]] | No       | -          | Fit bounds instead of center/zoom.                |

### Banner

| Property                | Type                 | Required | Default                    | Description                            |
| ----------------------- | -------------------- | -------- | -------------------------- | -------------------------------------- |
| `banner.enabled`        | Boolean              | No       | `false`                    | Show/hide the temporary banner.        |
| `banner.message.{lang}` | String (markdown)    | Yes\*\*  | -                          | Banner text per locale.                |
| `banner.expires`        | Date `YYYY-MM-DD`    | No       | -                          | Date after which banner is suppressed. |
| `banner.className`      | String (CSS classes) | No       | `bg-accent-500 text-black` | Styling override.                      |

### Metadata

| Property                      | Type   | Required | Default | Description             |
| ----------------------------- | ------ | -------- | ------- | ----------------------- |
| `metadata.{lang}.title`       | String | Yes      | -       | Page `<title>` text.    |
| `metadata.{lang}.description` | String | Yes      | -       | SEO/social description. |

### Theme

| Property                  | Type           | Required | Default | Description                       |
| ------------------------- | -------------- | -------- | ------- | --------------------------------- |
| `theme.light`             | String (color) | Yes      | -       | Base light background color.      |
| `theme.dark`              | String (color) | Yes      | -       | Base dark background color.       |
| `theme.primary_color`     | String (color) | Yes      | -       | Primary brand color.              |
| `theme.accent_color`      | String (color) | Yes      | -       | Accent / emphasis color.          |
| `theme.accent_text_color` | String (color) | No       | `black` | Text color on accent backgrounds. |
| `theme.background.light`  | String         | No       | -       | Surface background (light).       |
| `theme.background.dark`   | String         | No       | -       | Surface background (dark).        |
| `theme.ui.light`          | String         | No       | -       | Panels / navigation (light mode). |
| `theme.ui.dark`           | String         | No       | -       | Panels / navigation (dark mode).  |
| `theme.ui.text_light`     | String         | No       | -       | Text color for light UI panels.   |
| `theme.ui.text_dark`      | String         | No       | -       | Text color for dark UI panels.    |

### Favicon

| Property  | Type          | Required | Default | Description                            |
| --------- | ------------- | -------- | ------- | -------------------------------------- |
| `favicon` | String (path) | Yes      | -       | Path under `/public` to favicon asset. |

### Logos

| Property                | Type            | Required | Default  | Description                                  |
| ----------------------- | --------------- | -------- | -------- | -------------------------------------------- |
| `main_logo[].url`       | String          | Yes      | -        | Path/URL to logo image.                      |
| `main_logo[].lang`      | `en`\|`fr`      | Yes      | -        | Language variant.                            |
| `main_logo[].mode`      | `light`\|`dark` | Yes      | -        | Theme mode applicability.                    |
| `main_logo[].alt`       | String          | Yes      | -        | Alt text for accessibility.                  |
| `main_logo[].className` | String          | No       | `h-auto` | Tailwind classes override.                   |
| `main_logo[].width`     | String/Number   | No       | -        | Explicit width (optional).                   |
| `main_logo[].link`      | String (URL)    | No       | -        | Click destination (external opens new tab).  |
| `bottom_logo[].*`       | —               | No       | -        | Same fields as `main_logo` for footer logos. |

### Basemaps & Overlays

| Property                 | Type    | Required | Default | Description                                   |
| ------------------------ | ------- | -------- | ------- | --------------------------------------------- |
| `basemaps[].name.{lang}` | String  | Yes      | -       | Display name per locale.                      |
| `basemaps[].key`         | String  | Yes      | -       | Unique identifier key.                        |
| `basemaps[].url`         | String  | Yes      | -       | Tile URL template.                            |
| `basemaps[].attribution` | String  | Yes      | -       | Required provider attribution.                |
| `basemaps[].checked`     | Boolean | No       | `false` | Pre-selected basemap.                         |
| `basemaps[].maxZoom`     | Number  | No       | -       | Max zoom extent.                              |
| `basemaps[].minZoom`     | Number  | No       | `0`     | Min zoom extent.                              |
| `overlays[].*`           | —       | No       | -       | Same structure as basemaps; stackable layers. |

### Pages

| Property                          | Type          | Required | Default | Description                            |
| --------------------------------- | ------------- | -------- | ------- | -------------------------------------- |
| `pages[].label.{lang}`            | String        | Yes      | -       | Menu/modal label.                      |
| `pages[].icon`                    | String        | No       | -       | Icon key.                              |
| `pages[].markdown_content.{lang}` | String (path) | No†      | -       | Markdown file path (takes precedence). |
| `pages[].content.{lang}`          | String        | No†      | -       | Inline content fallback.               |

**Notes:**

- `map.center` and `map.zoom` required unless `map.default_bounds` is set.
- `banner.message` required if `banner.enabled` is true.
- Logo arrays require at least one entry for `main_logo`.
- Basemap properties also apply to overlays unless otherwise noted.
- † For each page, supply at least one of `markdown_content` or `content` per locale; markdown takes precedence.

## Table of Contents

- [Quick Reference Table](#quick-reference-table)
- [Basic Settings](#basic-settings)
- [Map Configuration](#map-configuration)
- [Language Settings](#language-settings)
- [Title Configuration](#title-configuration)
- [Temporary Banner](#temporary-banner)
- [Metadata](#metadata)
- [Theme](#theme)
- [Favicon](#favicon)
- [Logo Configuration](#logo-configuration)
- [Basemaps](#basemaps)
- [Overlays](#overlays)
- [Pages](#pages)

---

## Basic Settings

### `catalogue_url`

### `fallback_catalogue_url`

**Type:** String (URL)
**Required:** No
**Example:** `https://backup.catalogue.cioos.ca`

Secondary CKAN catalogue root used only by harvesting scripts (`scripts/fetchCkanPackages.js`) and data requests when the primary `catalogue_url` fails. If unset, the application will not attempt a fallback.

**Type:** String
**Required:** Yes
**Example:** `https://catalogue.cioos.ca`

The URL of the CIOOS catalogue that the map application will connect to and retrieve data from.

### `base_query`

**Type:** String
**Required:** No
**Default:** `""`

Base query string to filter catalogue results. Leave empty to show all records.

---

## Map Configuration

The `map` section controls the initial map view and behavior.

### `center`

**Type:** Array [latitude, longitude]
**Required:** Yes (unless using `default_bounds`)
**Example:** `[65, -110]`

The geographic coordinates where the map will initially center. First value is latitude, second is longitude.

### `zoom`

**Type:** Number
**Required:** Yes (unless using `default_bounds`)
**Example:** `4`

The initial zoom level for the map on desktop devices. Higher numbers zoom in closer.

### `zoom_mobile`

**Type:** Number
**Required:** No
**Example:** `2`

Optional zoom level specifically for mobile devices (screens less than 1024px wide). If not specified, uses the main `zoom` value.

### `default_bounds`

**Type:** Array [[south, west], [north, east]]
**Required:** No
**Example:** `[[48, -133], [70, -55]]`

Optional bounding box that defines the initial visible area. Format is `[[south, west], [north, east]]` using latitude and longitude coordinates.

**Important:** If `default_bounds` is set, it will override the `center` and `zoom` settings. The map will automatically fit this area into the view on initial load. Comment out or remove this setting to use `center` and `zoom` instead.

---

## Language Settings

### `default_language`

**Type:** String
**Required:** Yes
**Values:** `en` or `fr`
**Example:** `en`

The default language for the application interface. Users can still switch languages, but this determines what they see initially.

---

## Title Configuration

### `title`

**Type:** Object with language keys
**Required:** No
**Example:**

```yaml
title:
  en: "My Custom Map Title"
  fr: "Mon titre de carte personnalisé"
```

Custom title text displayed on the navigation bar below the main logo. Leave empty for no title.

---

## Temporary Banner

The `banner` section allows you to display a dismissible notification banner at the top of the page.

### `banner.enabled`

**Type:** Boolean
**Required:** No
**Example:** `true`

Set to `true` to show the banner, `false` to hide it.

### `banner.message`

**Type:** Object with language keys
**Required:** Yes (if banner enabled)
**Supports:** Markdown formatting
**Example:**

```yaml
message:
  en: "**Important:** This site will undergo maintenance on Dec 31. [Learn more](https://example.com)"
  fr: "**Important :** Ce site sera en maintenance le 31 déc. [En savoir plus](https://example.com)"
```

The banner message content for each language. Supports markdown formatting including links, bold, italic, etc.

### `banner.expires`

**Type:** String (YYYY-MM-DD)
**Required:** No
**Example:** `"2025-12-31"`

Optional expiration date. After this date, the banner will automatically stop displaying even if `enabled` is `true`.

### `banner.className`

**Type:** String
**Required:** No
**Example:** `"bg-accent-500 text-black"`

Optional Tailwind CSS classes to customize the banner's appearance. Use this to change colors, spacing, etc.

---

## Metadata

The `metadata` section defines SEO-related information for the application.

### `metadata.{lang}.title`

**Type:** String
**Required:** Yes
**Example:**

```yaml
en:
  title: "CIOOS Catalogue Map"
fr:
  title: "Carte Catalogue du SIOOC"
```

The page title that appears in browser tabs and search results.

### `metadata.{lang}.description`

**Type:** String
**Required:** Yes
**Example:**

```yaml
en:
  description: "CIOOS Catalogue Map is a web application that allows users to visualize and explore the catalogue of CIOOS."
```

The page description used by search engines and when sharing links on social media.

---

## Theme

The `theme` section controls the application's color scheme.

### `theme.light`

**Type:** String (Hex color)
**Required:** Yes
**Example:** `"#ffffff"`

Background color for light mode.

### `theme.dark`

**Type:** String (Hex color)
**Required:** Yes
**Example:** `"#000000"`

Background color for dark mode.

### `theme.primary_color`

**Type:** String (Hex color)
**Required:** Yes
**Example:** `"#52a79b"`

Primary brand color used throughout the application for main interactive elements.

### `theme.accent_color`

### `theme.accent_text_color`

**Type:** String (CSS color)
**Required:** No
**Default:** `"black"`
Text color chosen to ensure sufficient contrast when rendered atop `theme.accent_color` backgrounds (used in banners/buttons).

### `theme.background.light` / `theme.background.dark`

**Type:** String (CSS color or variable)
**Required:** No
Optional surface background colors for light/dark modes. If omitted, primary/light & dark colors are used.

### `theme.ui.light` / `theme.ui.dark`

**Type:** String (CSS color or variable)
**Required:** No
Panel / navigation UI background colors distinct from overall page background.

### `theme.ui.text_light` / `theme.ui.text_dark`

**Type:** String (CSS color)
**Required:** No
Explicit text colors for UI panels to guarantee readability independent of global theme.

**Type:** String (Hex color)
**Required:** Yes
**Example:** `"#fa7268"`

Accent color used for highlights, important elements, and calls-to-action.

---

## Favicon

### `favicon`

**Type:** String
**Required:** Yes
**Example:** `"./favicon.ico"`

Path to the favicon file, relative to the public directory. The favicon appears in browser tabs and bookmarks.

---

## Logo Configuration

Logos can be configured for different languages and theme modes (light/dark). Each logo entry is an object with the following properties:

### Logo Properties

#### Tile layer `url`

**Type:** String
**Required:** Yes
**Example:** `"/Images/cioos-national_EN-01.png"`

File path (relative to public directory) or full URL to the logo image.

#### `lang`

**Type:** String
**Required:** Yes
**Values:** `en` or `fr`

Language for which this logo variant should be displayed.

#### `mode`

**Type:** String
**Required:** Yes
**Values:** `light` or `dark`

Theme mode in which this logo should be displayed.

#### `alt`

**Type:** String
**Required:** Yes
**Example:** `"CIOOS National"`

Alternative text for accessibility and when the image cannot be displayed.

#### `className`

**Type:** String
**Required:** No
**Default:** `"h-auto"`
**Example:** `"h-[6vh] max-h-[65px] w-auto m-2"`

Custom Tailwind CSS class to control logo sizing and spacing. Replaces the default class when specified.

#### `width`

**Type:** String or Number
**Required:** No
**Example:** `"200px"` or `200`

Width of the logo in pixels or percentage.

#### `link`

**Type:** String
**Required:** No
**Example:** `"https://cioos.ca"`

URL or relative path to open when the logo is clicked. External links open in a new tab.

### `main_logo`

**Type:** Array of logo objects
**Required:** Yes

Primary branding logo displayed in the main navigation bar. Define variants for different language and theme combinations.

**Example:**

```yaml
main_logo:
  - url: "/Images/cioos-national_EN-01.png"
    lang: en
    mode: light
    alt: "CIOOS National"
    link: "https://cioos.ca"
  - url: "/Images/cioos-national_FR-01.png"
    lang: fr
    mode: light
    alt: "CIOOS National"
    link: "https://siooc.ca/fr"
```

### `bottom_logo`

**Type:** Array of logo objects
**Required:** No

Secondary or footer logo, often used for partner logos or additional branding. Follows the same structure as `main_logo`.

---

## Basemaps

The `basemaps` section defines the background map layers users can choose from.

### Basemap Properties

#### `name`

**Type:** Object with language keys
**Required:** Yes
**Example:**

```yaml
name:
  en: "Bathymetry"
  fr: "Bathymétrie"
```

Display name for the basemap in each language.

#### `key`

**Type:** String
**Required:** Yes
**Example:** `"bathymetry"`

Unique identifier for the basemap.

#### `url`

**Type:** String
**Required:** Yes
**Example:** `"https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"`

Tile server URL template. Use `{z}`, `{y}`, `{x}` placeholders for zoom and tile coordinates.

#### `attribution`

**Type:** String
**Required:** Yes
**Example:** `"Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS"`

Attribution text to display for this basemap layer, crediting data sources.

#### `checked`

**Type:** Boolean
**Required:** No
**Default:** `false`

Set to `true` to make this the default selected basemap on initial load.

#### `maxZoom`

**Type:** Number
**Required:** No
**Example:** `10`

Maximum zoom level available for this basemap. Prevents zooming beyond the available tile resolution.

**Example:**

```yaml
basemaps:
  - name:
      fr: "Bathymétrie"
      en: "Bathymetry"
    key: "bathymetry"
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
    attribution: "Tiles &copy; Esri"
    checked: true
    maxZoom: 10
```

---

## Overlays

The `overlays` section defines transparent map layers that can be toggled on/off over the basemap.

### Overlay Properties

Overlays use the same properties as basemaps (see above), with the same structure and options.

**Example:**

```yaml
overlays:
  - name:
      fr: "Noms géographiques"
      en: "Geographic Names"
    key: "geographic_names"
    url: "https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}"
    attribution: "Data &copy; Esri, HERE, Garmin"
    checked: true
```

---

## Pages

The `pages` section defines custom information pages accessible from the application.

### Page Properties

#### `label`

**Type:** Object with language keys
**Required:** Yes
**Example:**

```yaml
label:
  en: "About"
  fr: "À propos"
```

Display label for the page link in each language.

#### `icon`

**Type:** String
**Required:** No
**Example:** `"info"`

Icon identifier for the page (icon system depends on your application's icon library).

#### `markdown_content`

**Type:** Object with language keys
**Required:** No (but either this or `content` required)
**Example:**

```yaml
markdown_content:
  en: "/about.md"
  fr: "/a-propos.md"
```

Path to markdown files containing page content, relative to the public directory. **Takes precedence over `content` if both are specified.**

#### `content`

**Type:** Object with language keys
**Required:** No (but either this or `markdown_content` required)
**Example:**

```yaml
content:
  en: "This is the about page content."
  fr: "Ceci est le contenu de la page à propos."
```

Direct text content for the page in each language. Use `markdown_content` for longer content or when you want to maintain content in separate files.

**Example:**

```yaml
pages:
  - label:
      en: "About"
      fr: "À propos"
    icon: "info"
    markdown_content:
      en: "/about.md"
      fr: "/a-propos.md"
```

---

## Quick Start Example

Here's a minimal configuration to get started:

```yaml
---
catalogue_url: https://catalogue.cioos.ca
base_query: ""

map:
  center: [65, -110]
  zoom: 4

default_language: en

metadata:
  en:
    title: My Map Application
    description: A map-based catalogue viewer

theme:
  light: "#ffffff"
  dark: "#000000"
  primary_color: "#52a79b"
  accent_color: "#fa7268"

favicon: "./favicon.ico"

main_logo:
  - url: "/logo.png"
    lang: en
    mode: light
    alt: "Logo"

basemaps:
  - name:
      en: "Bathymetry"
    key: "bathymetry"
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
    attribution: "Tiles &copy; Esri"
    checked: true

pages:
  - label:
      en: "About"
    icon: "info"
    content:
      en: "Welcome to the map application."
```

---

## Tips and Best Practices

1. **Logos**: Always provide variants for all combinations of language (en/fr) and theme (light/dark) to ensure proper display in all scenarios.

2. **Map Bounds**: Use `default_bounds` instead of `center`/`zoom` when you want to ensure a specific geographic area is always visible, regardless of screen size.

3. **Mobile Optimization**: Set a lower `zoom_mobile` value to show more area on smaller screens.

4. **Attribution**: Always include proper attribution for basemap and overlay tile sources to comply with usage terms.

5. **Content Organization**: Use `markdown_content` for pages with substantial content to keep the config file clean and make content easier to edit.

6. **Banner Expiration**: Set an `expires` date on temporary banners to avoid having to remember to manually disable them later.

7. **Theme Colors**: Choose `primary_color` and `accent_color` values that provide sufficient contrast against both light and dark backgrounds for accessibility.
