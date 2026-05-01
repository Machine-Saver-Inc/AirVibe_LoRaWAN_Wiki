# ROADMAP.md

## AI Search — Removed Feature

AI-powered search was removed on 2026-05-01 after the Google Cloud project was suspended
(`gen-lang-client-0504129831`) due to API key exposure. This document records how it worked
and the correct architecture for restoring it safely.

---

### How It Worked

The feature let users type a natural-language question and receive a contextual answer from
the Gemini 2.5 Flash model, with a "Go to relevant section" deep-link into the wiki.

**Data flow:**

```
User types query
  → AISearch.tsx (form submit)
    → geminiService.searchWiki(query, wikiData)
      → @google/genai SDK → Gemini 2.5 Flash API
        ← { answer: string, relevantSectionId: string }
    ← renders answer + deep-link button
      → App.tsx handleNavigate(section, id)
        → setActiveSection + pendingScrollId
          → useEffect scrolls to element & highlights it
```

**Key files (now deleted):**

| File | Role |
|---|---|
| `components/AISearch.tsx` | Search bar UI, answer display, deep-link button |
| `services/geminiService.ts` | Constructs Gemini prompt, calls API, returns structured JSON |

**Prompt design:**

`geminiService.ts` built a context string by serialising every `WikiPage` in `wikiData`
(id, title, section, content, packet table fields, extra table rows) into a block-delimited
string and passed it as the system instruction alongside the user's query. The model was
constrained to a structured JSON output schema:

```ts
{ answer: string; relevantSectionId?: string | null }
```

The `relevantSectionId` was used to look up which `WikiPage` held that `id`, then navigate
to that section and scroll to the element.

**Dependencies added for this feature:**

- `@google/genai` npm package (type resolution only — runtime loaded from CDN)
- Import map entry in `index.html` for `@google/genai` → `aistudiocdn.com`
- `GEMINI_API_KEY` repository secret
- Vite `define` block in `vite.config.ts` to inject the key at build time
- CI step to write `.env` from the repository secret before `npm run build`

---

### Why It Was Removed — The Security Flaw

Vite's `define` feature performs **compile-time string substitution**. Every occurrence of
`process.env.API_KEY` in the source is replaced with the literal key value before bundling.
The resulting JavaScript bundle, which is deployed publicly to GitHub Pages, contains the key
as a plaintext string. Any visitor — or automated bot — can extract it from the bundle in
seconds using browser DevTools or `curl | grep`.

There is no way to fix this within a purely static site deployment. The key must live
server-side.

---

### Safe Reimplementation

The correct architecture is a **thin serverless proxy** that holds the API key and forwards
validated requests to Gemini. The browser never receives the key.

```
Browser → POST /api/search { query }
            ↓
        Serverless function (Cloudflare Worker / Vercel Edge / Netlify Function)
          - reads GEMINI_API_KEY from environment variable (server-side only)
          - validates/sanitises query
          - calls Gemini API
          - returns { answer, relevantSectionId }
            ↓
Browser ← { answer, relevantSectionId }
```

**Option A — Cloudflare Workers (recommended for GitHub Pages sites)**

1. Create a Worker at `workers.machinesaver.com/airvibe-search` (or similar).
2. Store `GEMINI_API_KEY` as an encrypted Worker secret (`wrangler secret put GEMINI_API_KEY`).
3. The Worker receives `{ query }`, builds the Gemini prompt using a static copy of the wiki
   context (either bundled or fetched from a KV store), and returns the structured response.
4. Add a CORS `Access-Control-Allow-Origin: https://airvibe-wiki.machinesaver.com` header so
   only your domain can call it.
5. In `geminiService.ts`, replace the direct SDK call with `fetch('/api/search', { method: 'POST', body: JSON.stringify({ query }) })`.

**Option B — Vercel or Netlify (requires migrating from GitHub Pages)**

Both platforms support serverless functions alongside static deployments. An `api/search.ts`
Edge Function would hold the same logic as the Worker above. The `GEMINI_API_KEY` is set in
the platform dashboard as an environment variable — it is never exposed to the client.

**Rate limiting**

Whichever proxy is used, add per-IP rate limiting (Cloudflare's built-in rate limiting rules,
or a simple KV-backed token bucket in the Worker) to prevent the proxy itself from being
abused. Keep the Gemini API key restricted to your proxy's outbound IP range if Google Cloud
supports it.

**Restoring the wiki context**

`geminiService.ts` previously constructed the context string at runtime from `wikiData` —
the full in-memory wiki. In a proxy architecture, the Worker does not import the React app,
so the context must be pre-built. Options:

- **Static JSON** — run a build-time script that serialises `wikiData` to a JSON file and
  bundle it into the Worker.
- **KV store** — write the serialised context to a Cloudflare KV namespace during CI and
  read it from the Worker at request time. This keeps the Worker small and allows the context
  to be updated independently.

**Checklist before re-enabling:**

- [ ] New Gemini API key created (old one revoked)
- [ ] Key stored only in the proxy's secret environment (not in any repo or build artifact)
- [ ] HTTP referrer restriction removed from the key (it will be called server-side, not from a browser)
- [ ] Proxy enforces CORS to restrict callers to `airvibe-wiki.machinesaver.com`
- [ ] Per-IP rate limiting configured on the proxy
- [ ] `@google/genai` removed from `index.html` import map and `package.json` (already done)
- [ ] `geminiService.ts` updated to call the proxy endpoint, not the Gemini SDK directly
- [ ] `.env` confirmed in `.gitignore` (already done)
