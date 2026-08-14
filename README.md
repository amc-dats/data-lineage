# Product Traceability — River Diagram

A single-page React app that visualizes end-to-end product traceability as a river diagram: a
main trunk of production stages flowing left to right, with tributary branches representing the
data sources (inspections, machine telemetry, concessions, data quality checks, etc.) feeding
into each stage. Each node and connection is color-coded by data-pipeline maturity, and is
click-through to a detail panel.

Built for executive stakeholders — it needs to stay clean and self-explanatory at a glance. This
is a **mockup / prototype stage**: all data is hand-authored placeholder content in a single JSON
file, standing in for what will eventually be live data pulled from Azure DevOps (and possibly
SharePoint — see [Open items for the live build](#open-items-for-the-live-build)).

## Current deployment

- Repo: `amc-dats/data-lineage` (public — GitHub Pages requires a public repo on a Free plan)
- Live URL: **https://amc-dats.github.io/data-lineage/**
- Deploys automatically on every push to `main` via `.github/workflows/deploy-pages.yml`
  (`npm run build` → `actions/deploy-pages`)
- `vite.config.ts` sets `base: '/data-lineage/'` to match the Pages subpath. **If this project is
  moved to a different repo name or a custom domain when transferred to the Ceres tenant, this
  must be updated to match** or the built asset paths will 404.

## Tech stack

- **React 19 + TypeScript + Vite** — no backend, no database, no auth. Static build only.
- **[@xyflow/react](https://reactflow.dev/) (React Flow) v12** — node/edge diagramming library,
  chosen for custom node types, custom edge rendering, and free-form layout control.
- All diagram content lives in **`src/data/lineage.json`** — see [Data model](#data-model) below.
  This is the single hand-edit surface today, and the intended seam for swapping in live data
  later (fetch from an API and shape it into the same structure, or extend the loader to merge
  live status onto this static structure).

## Running locally

```
npm install
npm run dev       # dev server at http://localhost:5173/
npm run build      # type-check + production build to dist/
npm run lint       # oxlint
```

## Structure at a glance

```
src/
  data/lineage.json          # ALL diagram content — nodes, edges, colors, placeholder details
  types.ts                   # TypeScript shape of lineage.json + runtime-computed fields
  components/
    RiverDiagram.tsx         # loads lineage.json, computes layout/handle wiring, renders ReactFlow
    Legend.tsx                # static legend explaining the color/icon encodings
    DetailPanel.tsx           # right-side click-through panel (node or edge)
    HoverTooltip.tsx          # lightweight hover preview (no detail, just a nudge to click)
    nodes/TrunkNode.tsx        # backbone stage node (rectangle, status fill, level outline)
    nodes/TributaryNode.tsx    # branch node (chip, status fill, internal/external border style)
    edges/RiverEdge.tsx        # custom edge: bezier for trunk, smoothstep for tributaries
  index.css, App.css           # design tokens (CSS variables) + component styling
```

## Data model (`src/data/lineage.json`)

Two arrays: `nodes` and `edges`. Both trunk and tributary items are `LineageNodeData`; both
backbone and branch connections are `LineageEdgeData`. Full TypeScript shape is in `src/types.ts`.

### Nodes

```jsonc
{
  "id": "stack-test",                // stable id, referenced by edges and parentTrunk
  "kind": "trunk",                   // "trunk" | "tributary"
  "label": "Stack Test",             // display name
  "status": "green",                 // "red" | "amber" | "green" — pipeline maturity, see below
  "level": 2,                        // trunk nodes only: 1 (upper row) | 2 (stepped-down row)
  "position": { "x": 2400, "y": 540 },// absolute canvas position, hand-tuned
  "detail": {                        // placeholder for a future linked ADO epic (or other source)
    "epicTitle": "Automated Test Rig Data Feed",
    "epicStatus": "Fully built & usable",
    "quarter": "Q1 FY25"
  }
}
```

Tributary nodes additionally carry:

- `tributaryKind`: `"internal"` (solid border, ⚙ icon) or `"supplier"` (dashed border, ⛟ icon —
  used for anything externally/partner-sourced, e.g. Supplier Inspection, Partner Test Data)
- `parentTrunk`: id of the trunk node it branches off
- Which side it renders on (above or below the trunk) is **not** a stored field — it's inferred
  at load time in `RiverDiagram.tsx` from whether the tributary's `position.y` is less than or
  greater than its parent trunk's `position.y`. To move a tributary to the other side, just move
  its `y` past the trunk's `y`.

### Edges

```jsonc
{
  "id": "trib-test-internal",
  "source": "stack-test-internal-inspection",
  "target": "stack-test",
  "kind": "tributary",               // "trunk" | "tributary" — affects edge routing/curve style
  "status": "green",                 // "red" | "green" ONLY — no amber for edges, by design
  "annotation": "QC cross-check results flow automatically from the inspection station..."
}
```

Edges are deliberately binary (green = automated & connected, red = not automated/absent) even
though nodes have three states — a red *node* means the pipeline doesn't exist yet; a red *edge*
can still carry an `annotation` describing an active manual workaround, which is exactly the kind
of nuance worth keeping once this is wired to a real work-item link.

### Color/status legend (fixed meanings — see `src/index.css` and `statusColors.ts`)

| Status | Node fill means | Edge means |
|---|---|---|
| 🟢 green | Pipeline fully built & usable | Connection automated & present |
| 🟠 amber | Actively being worked on | *(not used on edges)* |
| 🔴 red | Pipeline doesn't exist | Not automated / absent (may still have a manual workaround — see its `annotation`) |

Trunk nodes also carry an **outline color keyed to `level`**, independent of status fill:
`--level-1-line` (purple) for level 1, `--level-2-line` (burnt orange) for level 2. This is purely
a layout/grouping cue (the "ladder" step), not a maturity signal.

## Current diagram content (as of last edit)

Trunk (backbone), left to right, with ladder level:

1. **Raw Materials** (level 1) — tributaries: Internal Inspection, Supplier Inspection (above); Concessions, DQ, Technical Issues (below)
2. **Materials** (level 1) — Internal Inspection, Machine Data (above); Concessions, DQ, Technical Issues (below)
3. **Cell** *(id: `cell-manufacturing`)* (level 1) — Internal Inspection, Machine Data (above); Concessions, DQ, Technical Issues (below)
4. **Stack** *(id: `stack-assembly`)* (level 1) — Internal Inspection, Machine Data (above); Concessions, DQ, Technical Issues (below)
5. **Stack Test** (level 2 — stepped down) — Internal Inspection, Internal Test Data, Machine Data (above); Concessions, DQ, Technical Issues (below)
6. **Shipped / In Field** (level 2 — stepped down) — Partner Test Data *(external)*, Machine Data (above); Concessions, DQ, Technical Issues (below)

Node ids for Cell and Stack were kept as `cell-manufacturing` / `stack-assembly` internally
(only the display `label` was shortened) to avoid cascading renames through every tributary id
and edge reference — worth knowing if you're grepping the JSON for a node by its visible name.

## Interaction model

- **Click** any node or edge → opens the right-side detail panel (label, status pill, and the
  placeholder "Azure DevOps epic" fields for nodes / the `annotation` note for edges).
- **Hover** → lightweight tooltip preview only, no detail. Hover is suppressed while the detail
  panel is open.

## Open items for the live build

This mockup is meant to be handed off (e.g. picked up in Cursor) to wire against real Ceres data.
Known open questions/decisions, not yet resolved in this codebase:

- **Most nodes/edges** are expected to link to **Azure DevOps epics/work items** — `detail`
  (epic title/status/quarter) and edge `annotation` are placeholders standing in for that.
- **DQ tributaries specifically** may instead need to link to a **SharePoint list** rather than
  ADO. The data model doesn't hard-code a single source type today — the cleanest extension is
  adding a `sourceType` field (e.g. `"ado-epic"` vs `"sharepoint-list-item"`) plus whatever id
  fields each needs, and branching the detail panel's rendering on it.
- Either integration requires **authenticated API calls** (Entra ID app registration + OAuth
  scopes for ADO REST API and/or Microsoft Graph/SharePoint REST API) — this app currently has
  no backend and no auth at all, so this is a real architectural addition, not a config change.
  Options: direct SPA calls via MSAL.js, or a small proxy/backend if direct browser calls aren't
  viable in the Ceres tenant's security posture.
- No decision yet on whether the Ceres live version stays on GitHub Pages, moves to an
  Azure-hosted static site, or something else — the original plan was Azure Static Web Apps, but
  that was blocked on this project's dev subscription by a region policy with no overlap with
  Static Web Apps' supported regions (unrelated to the Ceres tenant — worth re-checking there).
