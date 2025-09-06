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

## Project structure

* `index.html` – Entry + SW registration (Tailwind via CDN)
* `public/` – Static assets (manifest, survivor-data.js, service worker)
* `src/`
	* `SurvivorTierListUnifiedApp.tsx` – Root app
	* `components/` – UI building blocks
	* `hooks/` – Encapsulated behaviors & state machines
	* `config/` – Themes & default tier config
	* Utility modules – analysis, history manager, tier & export utils
* `test/` – Vitest suites (utilities & history)

## Notes

* Data injected via `public/survivor-data.js` consumed by `useDataProcessing`.
* Tailwind via CDN keeps build lean; no PostCSS pipeline required.
* React 18 automatic JSX runtime enabled.

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

