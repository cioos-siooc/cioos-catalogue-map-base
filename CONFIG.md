# Configuration Guide

This document explains all the configuration options available in [config.yaml](config.yaml) for the CIOOS Catalogue Map application.

## Quick Reference Table

| Property                                                  | Type                | Required | Default        | Description                                   |
| --------------------------------------------------------- | ------------------- | -------- | -------------- | --------------------------------------------- |
| **[Basic Settings](#basic-settings)**                     |
| [`catalogue_url`](#catalogue_url)                         | String              | Yes      | -              | URL of the CIOOS catalogue                    |
| [`base_query`](#base_query)                               | String              | No       | `""`           | Base query string to filter catalogue results |
| **[Map Configuration](#map-configuration)**               |
| [`map.center`](#center)                                   | Array [lat, lng]    | Yes\*    | -              | Initial map center coordinates                |
| [`map.zoom`](#zoom)                                       | Number              | Yes\*    | -              | Initial zoom level (desktop)                  |
| [`map.zoom_mobile`](#zoom_mobile)                         | Number              | No       | Same as `zoom` | Zoom level for mobile devices (<1024px)       |
| [`map.default_bounds`](#default_bounds)                   | Array [[S,W],[N,E]] | No       | -              | Bounding box (overrides center/zoom)          |
| **[Language Settings](#language-settings)**               |
| [`default_language`](#default_language)                   | String              | Yes      | -              | Default language (`en` or `fr`)               |
| **[Title Configuration](#title-configuration)**           |
| [`title.{lang}`](#title)                                  | String              | No       | -              | Custom title below main logo                  |
| **[Temporary Banner](#temporary-banner)**                 |
| [`banner.enabled`](#bannerenabled)                        | Boolean             | No       | `false`        | Show/hide banner                              |
| [`banner.message.{lang}`](#bannermessage)                 | String              | Yes\*\*  | -              | Banner message (supports markdown)            |
| [`banner.expires`](#bannerexpires)                        | String (YYYY-MM-DD) | No       | -              | Banner expiration date                        |
| [`banner.className`](#bannerclassname)                    | String              | No       | -              | Tailwind CSS classes for styling              |
| **[Metadata](#metadata)**                                 |
| [`metadata.{lang}.title`](#metadatalangtitle)             | String              | Yes      | -              | Page title for browser/SEO                    |
| [`metadata.{lang}.description`](#metadatalangdescription) | String              | Yes      | -              | Page description for SEO                      |
| **[Theme](#theme)**                                       |
| [`theme.light`](#themelight)                              | String (Hex)        | Yes      | -              | Light mode background color                   |
| [`theme.dark`](#themedark)                                | String (Hex)        | Yes      | -              | Dark mode background color                    |
| [`theme.primary_color`](#themeprimary_color)              | String (Hex)        | Yes      | -              | Primary brand color                           |
| [`theme.accent_color`](#themeaccent_color)                | String (Hex)        | Yes      | -              | Accent color for highlights                   |
| **[Favicon](#favicon)**                                   |
| [`favicon`](#favicon-1)                                   | String              | Yes      | -              | Path to favicon file                          |
| **[Logo Configuration](#logo-configuration)**             |
| [`main_logo[].url`](#url)                                 | String              | Yes      | -              | Path or URL to logo image                     |
| [`main_logo[].lang`](#lang)                               | String              | Yes      | -              | Language (`en` or `fr`)                       |
| [`main_logo[].mode`](#mode)                               | String              | Yes      | -              | Theme mode (`light` or `dark`)                |
| [`main_logo[].alt`](#alt)                                 | String              | Yes      | -              | Alt text for accessibility                    |
| [`main_logo[].className`](#classname)                     | String              | No       | `"h-auto"`     | Tailwind CSS classes                          |
| [`main_logo[].width`](#width)                             | String/Number       | No       | -              | Logo width                                    |
| [`main_logo[].link`](#link)                               | String              | No       | -              | Click destination URL                         |
| [`bottom_logo[].*`](#bottom_logo)                         | Same as above       | No       | -              | Footer/secondary logos                        |
| **[Basemaps](#basemaps) / [Overlays](#overlays)**         |
| [`basemaps[].name.{lang}`](#name)                         | String              | Yes      | -              | Display name                                  |
| [`basemaps[].key`](#key)                                  | String              | Yes      | -              | Unique identifier                             |
| [`basemaps[].url`](#url-1)                                | String              | Yes      | -              | Tile server URL template                      |
| [`basemaps[].attribution`](#attribution)                  | String              | Yes      | -              | Attribution text                              |
| [`basemaps[].checked`](#checked)                          | Boolean             | No       | `false`        | Default selected                              |
| [`basemaps[].maxZoom`](#maxzoom)                          | Number              | No       | -              | Maximum zoom level                            |
| [`overlays[].*`](#overlays)                               | Same as above       | -        | -              | Transparent layers                            |
| **[Pages](#pages)**                                       |
| [`pages[].label.{lang}`](#label)                          | String              | Yes      | -              | Page link label                               |
| [`pages[].icon`](#icon)                                   | String              | No       | -              | Icon identifier                               |
| [`pages[].markdown_content.{lang}`](#markdown_content)    | String              | No†      | -              | Path to markdown file                         |
| [`pages[].content.{lang}`](#content)                      | String              | No†      | -              | Direct text content                           |

**Notes:**

- \* `map.center` and `map.zoom` are required unless `map.default_bounds` is set
- \*\* `banner.message` is required if `banner.enabled` is `true`
- \*\*\* Logo arrays require at least one entry for `main_logo`
- \*\*\*\* Same properties apply to both `basemaps` and `overlays` arrays
- \*\*\*\*\* Either `markdown_content` or `content` is required (markdown_content takes precedence)
- † At least one content field required per page

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

#### `url`

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
