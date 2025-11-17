# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CIOOS Catalogue Map base project—a Next.js application for visualizing and exploring ocean data catalogues via an interactive map interface. It fetches datasets from a CKAN-based catalogue API, displays them on a map with filtering capabilities, and provides detailed dataset information.

## Common Development Commands

```bash
# Install dependencies
npm install

# Development mode with Turbopack (uses --turbopack flag for faster reloads)
npm run dev

# Build for production (static export)
npm run build

# Run in production mode (after build)
npm start

# Lint code (ESLint)
npm lint

# Fetch/update data from CKAN catalogue
npm run load_data

# Static export (builds and exports as static files to 'out' directory)
npm run export

# Pre-commit setup (Husky + lint-staged)
npm run prepare
```

## Key Architecture

### Data Flow

1. **Data Loading Pipeline:**
   - `scripts/fetchCkanPackages.js` runs during build (`npm run build`)
   - Fetches datasets from `config.catalogue_url` (CKAN API) with retries and fallback support
   - Downloads full dataset records and organization logos to `public/datasets/` and `public/organizations/`
   - Generates `public/packages.json` (summaries) and dataset-specific JSON files
   - Also generates `public/eovs.json` with Essential Ocean Variables

2. **Frontend Data Loading:**
   - `app/layout.js` loads `packages.json` on client-side mount via `fetchData()`
   - Passes data through components via props and React Context (DrawerContext for drawer state)
   - URL parameters (hash fragments) are managed to support deep-linking to specific datasets

### Component Structure

- **Layout & Context:**
  - `app/layout.js`: Root layout with state management, data fetching, and drawer integration
  - `app/context/DrawerContext.js`: React Context for managing details drawer (dataset info panel) open/close state
  - `app/page.js`: Empty client component (actual content in layout.js)

- **Core Components:**
  - `components/Map.js`: Leaflet map with markers, clustering, layer controls (basemaps/overlays), and spatial filtering
  - `components/LeftMenu.js`: Sidebar with filters (Sidebar) and top banner (TopBanner) for language switching
  - `components/DatasetDetails.js`: Right drawer showing dataset details when selected
  - `components/FilterSection.js`: Date range and badge filters, manages filtering logic
  - `components/FilterManagement.js`: Functions for filtering items by badges and translating EOVs

- **Utilities:**
  - `components/UrlParametrization.js`: Manages URL parameters for filtering and deep-linking
  - `components/FetchItemsListManagement.js`: Fetches organization/project lists and dataset details
  - `components/Citation.js`: Citation formatting for datasets
  - `components/SelectReact.js`, `components/SidebarButton.js`, `components/ProgressBar.js`: Reusable UI components

### Configuration

- **config.yaml:** Central configuration file controlling:
  - Catalogue URL and fallback URL
  - Map center, zoom, and basemaps/overlays
  - Theme colors (generated into `app/theme.css` via `next.config.js`)
  - Page content (pages array with markdown file paths)
  - Logo configurations (main and bottom logos with language/mode variants)
  - Metadata (title, description per language)

- **next.config.js:**
  - Generates theme CSS from color palette in config.yaml
  - Copies favicon from config-specified path
  - Validates markdown pages exist before build (via `checkMarkdownPages.js`)
  - Sets base path based on GitHub repository (for GitHub Pages deployment)
  - Enables static export output

### Styling

- **Tailwind CSS** with custom color palette (primary/accent) generated in `app/theme.css`
- `app/globals.css` for global styles
- Flowbite React components for UI
- Prettier with Tailwind plugin for CSS class sorting

### Data Fetching & Caching

- Full dataset details are cached in `public/datasets/{dataset-name}.json` (generated at build time)
- Client fetches summary data from `public/packages.json` on initial load
- Dataset details fetched client-side when a dataset is selected (from pre-cached files)
- URL hash is used to reference selected datasets for deep-linking

### Build & Deployment

- Static export via Next.js (`output: "export"` in next.config.js)
- Build process:
  1. Runs `fetchCkanPackages.js` to populate `public/` with dataset data
  2. Validates markdown pages exist
  3. Generates theme CSS from config
  4. Builds Next.js app and exports to `out/` directory
- Can be deployed to any static host (GitHub Pages, S3, etc.)

## Code Standards

- **Languages:** JavaScript (ES6+), React 19, Next.js 15
- **Styling:** Tailwind CSS with custom theme
- **Code Formatting:** Prettier with ESLint
- **Pre-commit Hooks:** Husky + lint-staged auto-format staged changes
- **Client Components:** Uses `"use client"` directive for client-side rendering where needed (maps, interactivity)

## Important Notes

- **URL Parameter Management:** Deep-linking relies on URL hash fragments (e.g., `#dataset-id`). Clearing the hash when drawer closes prevents navigation history pollution.
- **Map Initialization:** Map component uses dynamic import with `ssr: false` (no server-side rendering) because Leaflet requires browser APIs.
- **Language Support:** App auto-detects browser language or uses saved preference from localStorage. All UI text and content pages support language switching.
- **Configuration-Driven:** Most customization happens through `config.yaml`—logos, theme colors, pages, catalogue URLs are all configurable without code changes.
