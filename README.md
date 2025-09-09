# Survivor Tier List

Survivor Tier List is a modern React + TypeScript app for building and refining Survivor tier rankings. It's designed for speed, accessibility, and offline-capable usage as a progressive web app.

This README has been updated to reflect the current codebase: React 18 + Vite, Vitest for tests, dnd-kit for drag/sort interactions, framer-motion for animation affordances, and a set of small, focused hooks in `src/hooks/` implementing behavior.

Quick start
-----------

Install dependencies and start the dev server:

```sh
npm ci
npm run dev
```

Open http://localhost:5173/

What changed in the recent update
---------------------------------
- Head-to-head (H2H) vote finalization now applies rankings into tiers (ranking -> round-robin placement).
- Quick Rank mode preserves click/selection behavior so tier-row click works as a secondary placement path.
- Long-press (500ms) opens contestant stats on touch/mobile.
- Export text builder is shared so clipboard export and native sharing use identical output.
- Image sharing now uses `html2canvas` via dynamic import (optional dependency) and falls back to download when unavailable.

Core capabilities
-----------------
- Drag & drop ranking (dnd-kit)
- Quick Rank (keyboard + mobile overlay)
- Side quick-drop menu for direct tier placement
- Undo/Redo, Reset, Randomize
- Head-to-Head voting and compare modes
- Autosave to localStorage + manual Save/Load
- Export formatted text (clipboard-first) and Export/Import JSON
- Optional native sharing and image sharing features (when supported)
- Accessibility: ARIA labels, keyboard shortcuts, focus outlines

Architecture notes
------------------
- `src/SurvivorTierListUnifiedApp.tsx` — root app wiring, top-level state, and composition of major subsystems.
- `src/components/` — UI components (toolbar, tier grid, rows, unranked panel, modals).
- `src/hooks/` — focused hooks implementing behaviors and small state machines (`useHeadToHead`, `useTierOperations`, `useExportImport`, `useModalManagement`, etc.).
- `src/tiers/` & `src/utils/` — tier manipulation utilities, H2H helper, export helpers, and analysis generators.
- `public/` — static assets (service worker, manifest, sample data loader `survivor-data.js`).

Developer workflow
------------------
- Start dev: `npm run dev`
- Run tests: `npm test` (Vitest)
- Build: `npm run build`

Testing & quality
-----------------
- Unit/UI tests use Vitest + Testing Library. Recent tests cover H2H finalization, long-press interactions, quick-rank behavior, and compare flows.
- CI should run `npm ci` then `npm test`.

Platform integrations & editor diagnostics
------------------------------------------
- Capacitor and Electron scaffolding are present for native packaging. Some editor diagnostics may flag missing platform types (e.g., `@capacitor/splash-screen`) if native SDKs/types are not installed locally. Those imports are runtime-guarded and the web build is unaffected.

Image sharing note
------------------
- Image sharing depends on `html2canvas` to capture the DOM as a canvas. The app dynamically imports `html2canvas` when the feature is used. To enable image sharing locally, install the package:

```sh
npm install html2canvas
```

Then restart the dev server.

Contributing
------------
- Keep changes small and unit-tested. Add Vitest tests for new UX flows where practical.
- Use the feature tokens in code or automation for stable capability checks (e.g., QUICK_RANK, HEAD_TO_HEAD).

Contact / License
-----------------
See project root for author/license details.
# Survivor Tier List

Modern React + TypeScript app for building and refining Survivor tier lists. Fast, installable, offline-capable, mobile friendly.

## Quick start

```sh
npm install
npm run dev
```

Open <http://localhost:5173/>

---

## Feature Index (machine-friendly summary)

Each bullet starts with an uppercase token that can be used by tooling / LLMs for quick reference.

* DRAG_DROP: Native HTML5 drag and drop tier placement
* QUICK_RANK: Keyboard (Q + 1-6) and mobile tap overlay ranking
* SIDE_MENU: Side quick-drop S-F tier target menu (left/right configurable)
* HISTORY: Undo/Redo stack + Reset + Randomize utilities
* ANALYZE_TIER: Generated textual summary per tier
* COMPARE_MODE: Two-contestant comparison with analysis modal
* HEAD_TO_HEAD: Pairwise vote mode computing live win percentages
* CARD_STATS: Optional per-card strategy/social stats display
* SEARCH_FILTER: Real-time name search on unranked pool
* TAG_FILTER: Multi-tag AND filtering with clear-all
* CLEAR_TIER: Single-tier flush back to Unranked
* COLLAPSIBLE_UNRANKED: Toggle visibility of unranked pool
* TOASTS: Ephemeral action feedback system
* EVENT_NOTIFICATIONS: Decoupled modules dispatch CustomEvent (tierlist:notify) for toasts
* CONFIRM_MODAL: Non-blocking promise-based confirm dialog (replaces native alert/confirm)
* PROGRESS_BAR: Ranked / total count with animated bar
* HIGHLIGHT_LAST_MOVE: Temporary pulse on last moved card
* S_TIER_CELEBRATION: One-time glow + confetti on first S-tier placement
* SNAPSHOT: Ephemeral in-session snapshot / restore / clear
* CONSIDERED_BADGE: Marks contestants returned to Unranked this session
* PERSIST_FILTERS: Persists search & tag filters across reloads
* AUTOSAVE: Automatic localStorage save of state/theme/config
* EXPORT_TEXT: Clipboard-first formatted ranking output
* EXPORT_JSON / IMPORT_JSON: Full state portability
* PWA: Installable, offline cache-first shell
* ACCESSIBILITY: Keyboard, ARIA labels, focus rings, 44px targets
* THEMING: Multiple color themes + customizable tier labels/colors/descriptions

---

## Features (human-friendly)

### Core ranking & interaction

* Drag-and-drop tier ranking with precise hit zones
* Quick Rank mode (Q) – keyboard 1–6 (S→F) or tap overlay on mobile
* Side Quick-Drop Menu (toggle side) for instant placement S–F
* Undo / Redo history, Reset, Randomize
* Per-tier Analyze summaries

### Advanced modes

* Comparison mode: pick two, view generated analysis
* Head-to-Head (A/B) voting with live win% ordering overlay

### Data visibility & customization

* Stats toggle on cards (strategy / social) + Achievements & Stats modal
* Tier config & theming customization (names, colors, descriptions, theme palettes)

### Discovery & filtering

* Live search on unranked pool
* Multi-tag AND filtering (click to add/remove; clear all)
* Persistent search & tag filters (restored across sessions)

### Quality of life

* Clear Tier (⊘) returns that tier's contestants to Unranked
* Collapsible Unranked tray with remaining count
* Toast notifications for major actions
* Progress indicator (count + animated bar)
* Last action highlight pulse
* One-time S-tier celebration (glow + lightweight confetti)
* Session Snapshot / Restore / Clear Snapshot (sandbox experimentation)
* "Considered" badge on contestants returned to Unranked (session only)

### Persistence & export

* Autosave (rankings, theme, tier config) to localStorage
* Manual Save / Load
* Export formatted text (clipboard-first fallback to file)
* Export / Import JSON full state

### PWA & performance

* Installable (manifest + service worker)
* Offline (cache-first core assets)

### Accessibility & responsiveness

* Keyboard navigation & ARIA labels
* Visible focus states
* 44px minimum hit targets
* Zoom / pinch not disabled

## How to use

1. Select a contestant group from the dropdown.
2. Drag cards into tiers OR:
	* Press Q, then 1-6 to assign (S=1 ... F=6).
	* Use Side Quick-Drop: drag a card over a tier label.
3. Click "Analyze" on any tier for a summary.
4. Comparison: enable Compare, select two cards, open analysis.
5. Head-to-Head: enter H2H mode, vote pairs; ordering updates via win rates.
6. Save / Export or take a Snapshot for experimentation.

## Keyboard shortcuts

* Q – Toggle Quick Rank
* 1-6 – Rank highlighted/overlay card in Quick Rank
* R – Reset tiers
* Esc – Clear selection / exit Quick Rank
* Ctrl/Cmd+Z – Undo
* Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z – Redo
* ? – (Reserved for future help modal)

## Persistence & import/export

Autosave runs on every meaningful change. Manual controls supplement it.

### Manual operations

* Save – Persist current state to localStorage key
* Load – Restore last saved state
* Export – Formatted text summary (clipboard-first, file fallback)
* Export JSON – Download portable state
* Import JSON – Load exported snapshot (resets history)
* Snapshot – Ephemeral in-session state (does NOT overwrite autosave)
	* Restore – Reapply snapshot state (added to history for undo)
	* Clear Snap – Remove stored snapshot

## PWA

* Service Worker: `public/sw.js` (cache-first shell)
* Manifest: `public/manifest.json`
	* Replace placeholder icons with real assets:
		* `public/icon-192.png`, `public/icon-512.png`
		* `public/screenshot-mobile.png`, `public/screenshot-desktop.png`

## Development

* Dev server: `npm run dev`
* Lint: `npm run lint`
* Tests: `npm test`
* Build: `npm run build`
* Preview: `npm run preview`

### tvOS (Experimental)

Capacitor does not officially generate a tvOS target. To experiment on Apple TV:

1. Create a new tvOS App target in Xcode inside the existing iOS workspace.
2. Add a build phase that copies the `dist` contents into the tvOS bundle (e.g. `cp -R ../dist/* "$TARGET_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH"`).
3. Embed a `WKWebView` (SwiftUI: `UIViewRepresentable`) and load `index.html` via `loadFileURL`.
4. Remove iOS-only splash/launch storyboards from the tvOS target.
5. Remote navigation: ensure interactive elements get `tabIndex={0}` (React) or `data-focusable="true"`; focus ring styling is applied when `body.tvos` class is present.
6. Optional: add logic to inject `document.body.classList.add('tvos')` when the user agent contains `AppleTV`.

Limitations: Native Capacitor plugins (Keyboard, SplashScreen) are skipped; dynamic import guards remain. Some gestures (drag) may feel awkward on the remote; consider adding a simplified list navigation mode for tvOS if adoption grows.

## Project structure

* `index.html` – Entry + SW registration (Tailwind via CDN)
* `public/` – Static assets (manifest, survivor-data.js, service worker)
* `src/`
	* `SurvivorTierListUnifiedApp.tsx` – Root app
	* `components/` – UI building blocks
	* `hooks/` – Encapsulated behaviors & state machines
	* `config/` – Themes & default tier config
	* `tiers/` – Consolidated tier manipulation utilities (move, reorder, clear, randomize)
	* Utility modules – analysis, history manager, export/import utils
* `test/` – Vitest suites (utilities & history)

## Notes

* Data injected via `public/survivor-data.js` consumed by `useDataProcessing`.
* Tailwind via CDN keeps build lean; no PostCSS pipeline required.
* React 18 automatic JSX runtime enabled.
* Native `structuredClone` used for history & snapshots (removed custom deepClone util).
* Promise-based modal confirm replaces blocking `alert` / `confirm` dialogs.
* Toast system listens to `tierlist:notify` CustomEvents for loosely-coupled feedback.

## Data Shapes (reference)

### Contestant (simplified)

```ts
interface Contestant {
	id: string;
	name: string;
	season: number | string;
	imageUrl?: string;
	strategy?: number | string;
	social?: number | string;
	tags?: string[];
	// additional fields may exist in source data
}
```

### Tiers structure

```ts
type Tiers = Record<string, Contestant[]> & { unranked: Contestant[] };
```

### Export JSON example

```json
{
	"group": "All Contestants",
	"theme": "survivor",
	"tierConfig": {
		"S": { "label": "S", "color": "#ef4444", "description": "Elite" },
		"A": { "label": "A", "color": "#f97316" }
	},
	"tiers": {
		"S": [ { "id": "c_001", "name": "Player 1", "season": 1 } ],
		"A": [],
		"B": [],
		"C": [],
		"D": [],
		"F": [],
		"unranked": [ { "id": "c_002", "name": "Player 2", "season": 1 } ]
	}
}
```

### Snapshot vs Save

| Aspect | Snapshot | Autosave/Save |
|--------|----------|---------------|
| Persistence | Memory only (session) | localStorage |
| Overwrites previous? | Yes (single slot) | Yes (same key) |
| Listed in exports | No | Yes (JSON/Text) |
| Undo integration | Restore adds history entry | State already tracked |

---

If you script against this project, prefer the Feature Index tokens for stable capability detection.

## Considered badge note

The "Considered" badge is session-only: clearing a snapshot or reloading (without re-triggering a return) removes prior considered state. It is not persisted or exported.

## Deferred enhancements (tracked but intentionally postponed)

* Multi-select moves / bulk rank
* Tier locking (prevent accidental drops)
* Context menu (right-click) quick actions
* Drag ghost preview customization
* In-tier manual reorder affordance
* Enhanced celebration variants (multi-tier milestones)

## Debug helpers (local dev)

Two small helper scripts were added to make dev-server testing reliable across environments where localhost may resolve differently (IPv4 vs IPv6) or where running the server in-foreground interferes with terminal commands.

- `tools/dev-detach.sh` — starts the Vite dev server detached and writes logs to `/tmp/vite.log`. It binds to `127.0.0.1` by default (you can override with `DEV_HOST`). Use this when you want the server to keep running while you run other commands.

	Example:

	```sh
	npm run dev:detached
	# or
	DEV_HOST=127.0.0.1 npm run dev:detached
	```

- `tools/dev-curl.sh` — safely curls the dev server URL found in `/tmp/vite.log`. It prefers IPv4 and falls back to IPv6 and uses a short timeout to avoid hanging.

	Example:

	```sh
	npm run dev:curl
	```

These helpers are intended to be safe to call from CI or when running multiple terminal tasks; they avoid the common curl hang conditions by reading the actual bound URL from the dev-server log and forcing a short curl timeout.


