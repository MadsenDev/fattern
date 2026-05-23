# TASK 07 — Build, Packaging & Release

## Context
Fattern is a local-first Electron + React + SQLite invoicing app for Norwegian freelancers.
This task sets up electron-builder for producing installable releases for Windows and Linux,
and creates a GitHub Actions workflow for automated builds.

---

## Part 1 — Install electron-builder

```bash
npm install electron-builder --save-dev
```

---

## Part 2 — Configure electron-builder

Add a `build` section to `package.json`:

```json
{
  "build": {
    "appId": "no.fattern.app",
    "productName": "Fattern",
    "copyright": "Copyright © 2025 Fattern",
    "directories": {
      "output": "release",
      "buildResources": "build-resources"
    },
    "files": [
      "dist/ui/**/*",
      "src/electron/**/*",
      "src/db/**/*",
      "node_modules/**/*",
      "package.json"
    ],
    "extraResources": [],
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        },
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ],
      "icon": "build-resources/icon.ico",
      "artifactName": "Fattern-Setup-${version}.${ext}"
    },
    "linux": {
      "target": [
        {
          "target": "AppImage",
          "arch": ["x64"]
        },
        {
          "target": "deb",
          "arch": ["x64"]
        }
      ],
      "icon": "build-resources/icon.png",
      "category": "Office",
      "artifactName": "Fattern-${version}.${ext}"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "installerIcon": "build-resources/icon.ico",
      "uninstallerIcon": "build-resources/icon.ico",
      "installerHeader": "build-resources/installer-header.bmp",
      "installerHeaderBackground": "#0d3e51",
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "Fattern",
      "license": "LICENSE",
      "language": "1044"
    },
    "publish": null
  }
}
```

Add build scripts to `package.json`:

```json
{
  "scripts": {
    "build:win": "npm run ui:build && electron-builder --win",
    "build:linux": "npm run ui:build && electron-builder --linux",
    "build:all": "npm run ui:build && electron-builder --win --linux"
  }
}
```

---

## Part 3 — Build Resources

Create the `build-resources/` directory and add these files:

### Icon preparation

The app already has a monogram SVG at `src/ui/public/fattern-monogram.svg`.

Convert it to the required formats using sharp or a similar tool.
Create `scripts/generate-icons.js`:

```js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const svgPath = path.join(__dirname, '../src/ui/public/fattern-monogram.svg');
const outputDir = path.join(__dirname, '../build-resources');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [16, 32, 48, 64, 128, 256, 512];

async function generateIcons() {
  // Generate PNGs
  for (const size of sizes) {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon-${size}.png`));
    console.log(`Generated ${size}x${size} PNG`);
  }

  // Main icon.png (512x512)
  await sharp(svgPath)
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'icon.png'));

  console.log('Icons generated successfully');
  console.log('NOTE: For Windows .ico, use a tool like png-to-ico or an online converter');
  console.log('to combine the PNG sizes into build-resources/icon.ico');
}

generateIcons().catch(console.error);
```

Add to package.json scripts:
```json
"generate-icons": "node scripts/generate-icons.js"
```

Install sharp:
```bash
npm install sharp --save-dev
```

For Windows `.ico`: After running `generate-icons`, use `png-to-ico` or `electron-icon-maker`:
```bash
npm install electron-icon-maker --save-dev
npx electron-icon-maker --input=build-resources/icon.png --output=build-resources
```

### installer-header.bmp

The NSIS installer header should be 150x57 pixels BMP format.
Create a simple branded header using sharp or a similar tool.
For v1, a solid color with the Fattern name is sufficient.

Create `scripts/generate-installer-assets.js`:
```js
const sharp = require('sharp');
const path = require('path');

// Create a simple 150x57 BMP for the NSIS header
// Use brand color #0d3e51 as background
sharp({
  create: {
    width: 150,
    height: 57,
    channels: 3,
    background: { r: 13, g: 62, b: 81 },
  },
})
  .bmp()
  .toFile(path.join(__dirname, '../build-resources/installer-header.bmp'))
  .then(() => console.log('Installer header created'))
  .catch(console.error);
```

---

## Part 4 — Fix Main Process for Packaged App

The packaged app has a different directory structure than development.
Update paths in `src/electron/main.js`:

```js
const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
const isPacked = app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Fattern',
    icon: getIconPath(),
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // In packaged app, dist/ui is in resources
    const indexPath = isPacked
      ? path.join(process.resourcesPath, 'dist', 'ui', 'index.html')
      : path.join(__dirname, '..', '..', 'dist', 'ui', 'index.html');
    win.loadFile(indexPath);
  }
}

function getIconPath() {
  if (isPacked) {
    return path.join(process.resourcesPath, 'build-resources', 'icon.png');
  }
  const localIcon = path.join(__dirname, '..', '..', 'build-resources', 'icon.png');
  return fs.existsSync(localIcon) ? localIcon : null;
}
```

Also ensure the database path uses `app.getPath('userData')` in packaged mode:

File: `src/db/paths.js`

```js
const os = require('os');
const path = require('path');

// In packaged app, use the system userData directory
// In dev, use ~/Fattern as before
function getDataRoot() {
  try {
    const { app } = require('electron');
    if (app && app.isPackaged) {
      return path.join(app.getPath('userData'), 'data');
    }
  } catch (e) {
    // Not in Electron context (e.g. tests)
  }
  return process.env.FATTERN_ROOT
    ? path.join(process.env.FATTERN_ROOT, 'data')
    : path.join(os.homedir(), 'Fattern', 'data');
}

const DATA_ROOT = getDataRoot();
const FATTERN_ROOT = path.dirname(DATA_ROOT);
const EXPORT_ROOT = path.join(FATTERN_ROOT, 'exports');
const LOG_ROOT = path.join(FATTERN_ROOT, 'logs');

module.exports = {
  FATTERN_ROOT,
  DATA_ROOT,
  EXPORT_ROOT,
  LOG_ROOT,
};
```

---

## Part 5 — GitHub Actions Workflow

Create `.github/workflows/build.yml`:

```yaml
name: Build Fattern

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate icons
        run: npm run generate-icons

      - name: Build
        run: npm run build:win

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: fattern-windows
          path: release/*.exe

  build-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci
          sudo apt-get install -y libx11-dev libxkbfile-dev

      - name: Generate icons
        run: npm run generate-icons

      - name: Build
        run: npm run build:linux

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: fattern-linux
          path: |
            release/*.AppImage
            release/*.deb

  release:
    needs: [build-windows, build-linux]
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/')
    steps:
      - name: Download Windows artifacts
        uses: actions/download-artifact@v4
        with:
          name: fattern-windows
          path: artifacts/windows

      - name: Download Linux artifacts
        uses: actions/download-artifact@v4
        with:
          name: fattern-linux
          path: artifacts/linux

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            artifacts/windows/*.exe
            artifacts/linux/*.AppImage
            artifacts/linux/*.deb
          draft: true
          generate_release_notes: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Part 6 — Version Management

Update `src/ui/src/utils/version.js` to read from `package.json`:

```js
// This is replaced at build time by Vite
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '0.6.0';
```

Add to `vite.config.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const pkg = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf-8'));

export default defineConfig({
  root: 'src/ui',
  plugins: [react()],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
  },
  server: { port: 4173 },
  preview: { port: 4173 },
  build: {
    outDir: '../../dist/ui',
    emptyOutDir: true,
  },
});
```

Update `package.json` version to `0.6.0` for the first release.

---

## Part 7 — Landing Page (GitHub Pages)

Create `docs/index.html` — a simple landing page served via GitHub Pages.

Enable GitHub Pages in repo settings: Source → Deploy from branch → `main` → `/docs`

The landing page should include:
- Fattern name and tagline: "Enklere fakturering. Mer privatliv. Full kontroll."
- Brief description (3-4 sentences) in Norwegian
- Key features list (local-first, gratis, no accounts, PDF generation)
- Download buttons linking to GitHub Releases for Windows (.exe) and Linux (.AppImage)
- A screenshot or mockup of the app
- Link to GitHub repository
- Simple, clean design — use inline CSS, no framework dependencies

The page should be entirely in Norwegian.

Example structure:
```html
<!DOCTYPE html>
<html lang="nb">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fattern — Lokal-først fakturering for norske freelancere</title>
  <meta name="description" content="Gratis faktureringsapp for norske freelancere. Alt lagres lokalt — ingen sky, ingen abonnement, ingen innlogging.">
  <style>
    /* Minimal CSS using Fattern brand colors */
    :root {
      --brand: #0d3e51;
      --accent: #2f8981;
      --light: #f0f8f5;
    }
    /* ... */
  </style>
</head>
<body>
  <!-- Hero, features, download, footer -->
</body>
</html>
```

---

## Acceptance Criteria
- `npm run build:win` produces a working `.exe` installer and portable `.exe`
- `npm run build:linux` produces a working `.AppImage` and `.deb`
- Packaged app launches and connects to the correct database location
- Database survives app updates (data is in `userData`, not in the app bundle)
- GitHub Actions workflow triggers on version tag push
- GitHub Actions creates a draft release with all artifacts attached
- Landing page is live at `https://[username].github.io/[repo]` or custom domain
- Landing page has working download links to the latest release
- App version in About page matches `package.json` version
