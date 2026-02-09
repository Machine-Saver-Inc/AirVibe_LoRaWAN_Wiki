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

- `components/` — React functional components (AISearch, UplinkDecoder, DownlinkEncoder, PacketTable, MermaidDiagram, MarkdownRenderer)
- `data/` — Wiki content definitions (`wikiContent.ts` exports `wikiData`), decoder/encoder example payloads
- `services/` — Gemini API integration (`geminiService.ts`)
- `utils/` — LoRaWAN payload decoder/encoder logic, CSV export
- `types.ts` — Core TypeScript interfaces (`WikiPage`, `PacketField`, `SectionType` enum)

### AI search integration

`AISearch.tsx` → `geminiService.searchWiki()` → Google Gemini (`gemini-2.5-flash`) with structured JSON output schema. The service constructs context from all current WikiPage content, sends it with the user query, and returns an answer plus a `relevantSectionId` for smooth-scroll navigation.

The API key is injected at build time via Vite's `define` config from `VITE_GEMINI_API_KEY` env var.

### Decoder/Encoder utilities

`utils/airvibeDecoder.ts` — Hex string → JS object. Parses LoRaWAN uplink payloads (packet types 1–5) using big-endian byte order.

`utils/airvibeEncoder.ts` — JS object → hex string. Encodes downlink payloads for ports 22 (command), 30 (config), 31 (alarms).

### Styling

100% Tailwind CSS via CDN (no CSS files, no build-time Tailwind). Mermaid.js also loaded from CDN via import map in `index.html`. Mobile-responsive with `lg:` breakpoints; sidebar toggles as overlay on mobile.
