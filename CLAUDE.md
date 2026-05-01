# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AirVibe LoRaWAN Wiki — a React + TypeScript SPA (Vite) serving as an internal documentation platform for the AirVibe LoRaWAN Condition Monitoring Sensor. Deployed to GitHub Pages at airvibe-wiki.machinesaver.com.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build to dist/
npm run preview      # Preview production build locally
```

No test runner or linter is configured.

Deployment is automated via GitHub Actions on push to `main`. Requires `GEMINI_API_KEY` repository secret for AI search.

## Architecture

**Single-page app with no router library.** Navigation is state-driven in `App.tsx` using a `SectionType` enum and `activeSection` state. No React Router, no global state management (Redux/Context/Zustand) — all state is colocated in `App.tsx` and passed via props.

### Key directories

- `components/` — React functional components: `AISearch`, `UplinkDecoder`, `DownlinkEncoder`, `ExamplesSidebar`, `PacketTable`, `MermaidDiagram`, `MarkdownRenderer`, `AlarmBitmaskCalculator`, `WaveformTracker`, `FuotaHelper`, `ErrorBoundary`. Note: `DownlinkEncoder` and `ExamplesSidebar` are sub-components rendered inside `UplinkDecoder`, not directly by `App.tsx`.
- `data/` — Wiki content split across `data/sections/` (one file per section; `data/sections/index.ts` aggregates them into `wikiData`), plus `decoderExamples.ts` and `encoderExamples.ts`
- `services/` — Gemini API integration (`geminiService.ts`)
- `utils/` — LoRaWAN payload codec (`airvibeCodec.js`, with thin TS wrappers `airvibeDecoder.ts` / `airvibeEncoder.ts`), CSV export (`csvExporter.ts`), waveform processing (`waveformTracker.ts`), FUOTA payload helpers (`fuotaPayloads.ts`)
- `constants.ts` — Shared constants (e.g. `COPY_FEEDBACK_MS`)
- `types.ts` — Core TypeScript interfaces (`WikiPage`, `PacketField`, `TableData`, `SectionType` enum)

### Codec ground truth

`utils/airvibeCodec.js` (19.6 KB) is the actual encode/decode implementation. `airvibeDecoder.ts` and `airvibeEncoder.ts` are thin TypeScript adapters around it — edits to parsing or encoding logic go in `airvibeCodec.js`, not the wrappers.

### WikiPage data structure

```typescript
interface WikiPage {
  id: string;           // used for smooth-scroll anchors and sub-component triggers
  title: string;
  section: SectionType;
  content: string;      // Markdown rendered by MarkdownRenderer
  packetTable?: { port?: number; packetType?: number; fields: PacketField[] };
  mermaidDiagram?: string;
  extraTable?: TableData;
}
```

Pages are defined in `data/sections/*.ts` and aggregated in `data/sections/index.ts` into `wikiData`.

### ID-triggered sub-component rendering

`App.tsx` checks each page's `id` and injects interactive components inline — this is a non-obvious coupling between data and UI:

| Page `id` | Injected component |
|---|---|
| `alarm-logic` | `<AlarmBitmaskCalculator />` |
| `process-twf` | `<WaveformTracker />` |
| `process-ota` | `<FuotaHelper />` |

Adding a new interactive tool requires both a new component and a matching `id` in the relevant `data/sections/*.ts` page.

### Smooth-scroll navigation

`App.tsx` maintains a `pendingScrollId` state. When `AISearch` returns a `relevantSectionId`, `App.tsx` sets `activeSection` and `pendingScrollId` together. A `useEffect` watching `pendingScrollId` fires `document.getElementById(id)?.scrollIntoView()` after the section renders, then clears `pendingScrollId`.

### Sidebar section ordering

The sidebar renders from an explicit `sections` array defined in `App.tsx` — order is not auto-derived from the `SectionType` enum. To reorder or add a section, update both the enum and the `sections` array.

### AI search integration

`AISearch.tsx` → `geminiService.searchWiki()` → Google Gemini (`gemini-2.5-flash`) with structured JSON output schema. The service constructs context from all current WikiPage content, sends it with the user query, and returns an answer plus a `relevantSectionId` for smooth-scroll navigation.

The API key is injected at build time via Vite's `define` config. `vite.config.ts` reads the `GEMINI_API_KEY` env var (set by CI from the `GEMINI_API_KEY` repository secret) and exposes it as `process.env.API_KEY`. `geminiService.ts` reads it via `process.env.API_KEY`.

### Dependencies and import map

Most runtime dependencies (React, lucide-react, `@google/genai`) are loaded from CDN via an import map in `index.html` — they are **not** bundled by Vite. `package.json` lists them for TypeScript type resolution only. Adding a new package that needs to be available at runtime requires an entry in the `index.html` import map in addition to `npm install`.

### Styling

100% Tailwind CSS via CDN (no CSS files, no build-time Tailwind). Mermaid.js also loaded from CDN via import map in `index.html`. Mobile-responsive with `lg:` breakpoints; sidebar toggles as overlay on mobile. Markdown content is styled via `.markdown-content` CSS rules defined directly in `index.html`.
