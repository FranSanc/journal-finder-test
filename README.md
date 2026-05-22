# Frontiers Journal Finder

[![CI](https://github.com/FranSanc/journal-finder-test/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/FranSanc/journal-finder-test/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/FranSanc/journal-finder-test/branch/main/graph/badge.svg)](https://codecov.io/gh/FranSanc/journal-finder-test)
[![Node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)](#prerequisites)
[![Built with Vite](https://img.shields.io/badge/built%20with-Vite%206-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)

An AI-powered web app that helps researchers find the most suitable **Frontiers** journal for their work. Authors paste in an abstract (or a set of keywords, aims, and scope) and the app returns a ranked list of journals with a matching score and a short explanation of *why* each journal is a good fit.

The app also includes a searchable, filterable browser of the full Frontiers journal catalog.

---

## Table of Contents

- [Features](#features)
- [How it Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Deployment](#deployment)
- [Continuous Integration](#continuous-integration)
- [Security Notes](#security-notes)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **AI-driven journal matching** — paste an abstract and get the top 5 Frontiers journals ranked by relevance, each with a 0–100 score, a tailored explanation, and key matching points.
- **Two search modes**:
  1. *Match my abstract* — best-in-class matching from a full research abstract.
  2. *Keywords, aims & scope* — useful when an abstract isn't ready yet.
- **Browse Journals** — search, filter by field, and sort the full Frontiers catalog (loaded from a CSV catalog file).
- **Saved searches** — name and persist any search (with its results) to `localStorage` for later re-runs.
- **Modern, accessible UI** — Tailwind CSS + shadcn/ui (Radix primitives), with motion provided by Framer Motion.
- **Single-process deployment** — one Node/Express process serves the built SPA in production; no separate API service to operate.

---

## How it Works

1. **Journal catalog** — On load, the SPA fetches `public/JournalList.csv` and parses it with PapaParse into a normalized list of journals (title, field, scope, keywords, impact factor, etc.).
2. **User input** — The user provides either a full abstract or a combination of keywords, aims, and scope via `SearchForm`.
3. **LLM call** — `InvokeLLM` in `src/integrations/Core.js` posts an OpenAI-compatible chat completion request to the **Vercel AI Gateway**, asking the model to score each journal against the submission and return a structured JSON object (enforced via `response_format: json_schema`).
4. **Enrichment & rendering** — Each AI match is merged with the full journal record from the CSV and rendered as a `JournalCard` with score, explanation, key matches, ISSN, impact factor, and a link to the journal website.
5. **Persistence** — The user can save the entire search (inputs + results) to `localStorage` via `SavedSearchesService`, and re-run or delete saved searches from the *Saved* tab.

```
 ┌─────────────┐  CSV    ┌──────────────────┐  prompt+schema   ┌─────────────────────┐
 │  Browser    │ ──────► │   Journal entity │ ───────────────► │ Vercel AI Gateway   │
 │  (React SPA)│         │  (PapaParse)     │ ◄─────────────── │ (OpenAI-compatible) │
 └─────┬───────┘                                  JSON match    └─────────────────────┘
       │
       │ localStorage (saved searches)
       ▼
 ┌─────────────┐
 │  Saved tab  │
 └─────────────┘
```

---

## Tech Stack

**Frontend**

- [React 18](https://react.dev/) + [Vite 6](https://vitejs.dev/) (JSX, ES modules, `@` alias → `src/`)
- [React Router 6](https://reactrouter.com/) for client-side routing
- [Tailwind CSS 3](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- [Framer Motion](https://www.framer.com/motion/) for transitions
- [Lucide](https://lucide.dev/) icons
- [TanStack Query](https://tanstack.com/query) (provider wired in `App.jsx`)
- [PapaParse](https://www.papaparse.com/) for CSV parsing
- [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/) for typed forms (where used)

**AI integration**

- [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) — OpenAI-compatible chat completions endpoint, default model `openai/gpt-4o-mini`. Called directly from the browser via `fetch`.

**Serving (production)**

- [Express 5](https://expressjs.com/) — minimal static host for the Vite-built `dist/` folder with SPA fallback.

**Tooling**

- [Vitest 4](https://vitest.dev/) + [Testing Library](https://testing-library.com/) (`jsdom`) — unit / component tests with a 70 % coverage threshold.
- [ESLint 9](https://eslint.org/) (flat config) with React, React Hooks, and unused-imports plugins.
- [TypeScript 5](https://www.typescriptlang.org/) — used for `typecheck` only, via `jsconfig.json` (`.ts` allowed alongside `.jsx`).
- [PostCSS](https://postcss.org/) + [Autoprefixer](https://github.com/postcss/autoprefixer).

---

## Project Structure

```
journal-finder-test/
├── public/                       # Static assets served as-is
│   ├── JournalList.csv           # Source of truth for the journal catalog
│   └── *.png, favicon.ico
├── src/
│   ├── App.jsx                   # Router + providers
│   ├── Layout.jsx                # Sidebar + shell (currently unused by routes)
│   ├── main.jsx                  # React entrypoint
│   ├── pages/
│   │   ├── JournalFinder.jsx     # Search / Results / Saved tabs
│   │   └── BrowseJournals.jsx    # Full catalog browser
│   ├── components/
│   │   ├── finder/               # SearchForm, ResultsGrid, JournalCard, SaveSearchDialog, SavedSearchesList
│   │   ├── browse/               # BrowseFilters
│   │   └── ui/                   # shadcn/ui components (Radix wrappers)
│   ├── entities/
│   │   └── Journal.js            # CSV loader → normalized journal objects
│   ├── integrations/
│   │   └── Core.js               # InvokeLLM → Vercel AI Gateway
│   ├── utils/
│   │   ├── index.ts              # createPageUrl helper
│   │   └── savedSearches.js      # localStorage-backed saved searches service
│   ├── hooks/                    # Custom React hooks
│   └── lib/                      # Shared utilities (query client, helpers, 404 page)
├── tests/                        # Vitest specs mirroring src/ layout
├── server.js                     # Express static server for production
├── vite.config.js                # Vite + Vitest config
├── eslint.config.js              # Flat-config ESLint setup
├── tailwind.config.js            # Tailwind + design tokens
├── components.json               # shadcn/ui generator config
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js 20+** (Node 22 recommended; the project targets ESM and Vite 6)
- **npm 10+** (ships with Node 20)
- A **Vercel AI Gateway** API key — create one at <https://vercel.com/dashboard> → *AI Gateway* → *API Keys*.

### Install & run

```bash
git clone <your-fork-url> journal-finder-test
cd journal-finder-test

npm install
cp .env.example .env.local
# edit .env.local and paste your VITE_AI_GATEWAY_API_KEY

npm run dev
```

The Vite dev server prints the local URL (defaults to <http://localhost:5173> unless overridden). Open it in your browser and you should see the *Frontiers Journal Finder* search form.

### Build & preview production

```bash
npm run build      # outputs to ./dist
npm run preview    # starts server.js on http://localhost:3001 serving ./dist
```

---

## Environment Variables

All variables are prefixed with `VITE_` because they are read by the browser bundle. They are **baked into `dist/` at build time** — you must rebuild after changing them.

| Variable                    | Required | Default                              | Description                                                                                       |
| --------------------------- | -------- | ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `VITE_AI_GATEWAY_API_KEY`   | yes      | —                                    | Vercel AI Gateway API key (`vck_…`).                                                              |
| `VITE_AI_GATEWAY_URL`       | no       | `https://ai-gateway.vercel.sh/v1`    | OpenAI-compatible base URL. Override if you self-host or proxy the gateway.                       |
| `VITE_AI_GATEWAY_MODEL`     | no       | `openai/gpt-4o-mini`                 | Any model the gateway supports, as `<provider>/<model>` (e.g. `anthropic/claude-3-5-sonnet`).     |

Example `.env.local`:

```env
VITE_AI_GATEWAY_API_KEY=vck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# VITE_AI_GATEWAY_URL=https://ai-gateway.vercel.sh/v1
# VITE_AI_GATEWAY_MODEL=openai/gpt-4o-mini
```

`.env.local` is gitignored — **never commit real keys**.

---

## Available Scripts

| Script                   | What it does                                                              |
| ------------------------ | ------------------------------------------------------------------------- |
| `npm run dev`            | Start the Vite dev server with HMR.                                       |
| `npm run build`          | Type-check-free production build to `dist/`.                              |
| `npm run preview`        | Run `server.js` (Express) to serve the built `dist/` on port `3001`.      |
| `npm run lint`           | Run ESLint quietly across `src/components`, `src/pages`, and `Layout.jsx`.|
| `npm run lint:fix`       | Same as above with `--fix`.                                               |
| `npm run typecheck`      | Run `tsc -p ./jsconfig.json` (type-only checking; no emit).               |
| `npm run test`           | Run the Vitest suite once.                                                |
| `npm run test:watch`     | Run Vitest in watch mode.                                                 |
| `npm run test:ui`        | Open the interactive Vitest UI.                                           |
| `npm run test:coverage`  | Run tests and produce a coverage report (`./coverage`).                   |

---

## Testing

Unit and component tests live in `tests/` and mirror the `src/` layout one-to-one. The stack is:

- **Vitest 4** running in `jsdom`
- **@testing-library/react** + **@testing-library/jest-dom** + **@testing-library/user-event**
- **@vitest/coverage-v8** for coverage, **@vitest/ui** for the interactive runner

### What's covered

The suite exercises every layer of the app:

- **Pages** — `JournalFinder`, `BrowseJournals`
- **Feature components** — `SearchForm`, `ResultsGrid`, `JournalCard`, `SaveSearchDialog`, `SavedSearchesList`, `BrowseFilters`, `UserNotRegisteredError`
- **Entities & integrations** — `Journal` (CSV loader), `InvokeLLM` (AI Gateway client)
- **Utilities & lib** — `savedSearches` service, `createPageUrl`, `query-client`, `PageNotFound`, `cn`/utils
- **Hooks** — `use-mobile`
- **App shell** — `App.test.jsx` (router + providers)

Coverage thresholds (configured in `vite.config.js`) require **≥ 70 %** for statements, branches, functions, and lines. `src/components/ui/**` (shadcn primitives) and `src/main.jsx` are excluded from coverage.

### Running tests

```bash
npm test                # one-off run (CI-friendly)
npm run test:watch      # TDD loop, re-runs on change
npm run test:ui         # interactive Vitest UI in the browser
npm run test:coverage   # writes text + html + lcov + json-summary to ./coverage
```

The `lcov` report under `coverage/lcov.info` plugs straight into Codecov / Coveralls / SonarQube if you wire up CI.

### Test scaffolding

Two files in `tests/` are shared by the rest of the suite — read them before writing new tests:

- **`tests/setup.js`** — registered as Vitest's `setupFiles`. It:
  - Wires up `@testing-library/jest-dom` matchers (`toBeInTheDocument`, `toHaveClass`, …).
  - Calls `cleanup()` and clears `localStorage` / `sessionStorage` / mocks after each test.
  - Polyfills `matchMedia`, `ResizeObserver`, and the pointer-capture / `scrollIntoView` APIs that jsdom is missing — this is what lets Radix-based components (Select, Dialog, Tabs, …) render under test.
- **`tests/test-utils.jsx`** — small helpers used across specs:
  - `renderWithRouter(ui, { route })` — wraps a tree in `MemoryRouter` so components that use `react-router` hooks (`useLocation`, `<Link>`, …) work in isolation.
  - `makeJournal(overrides)` — returns a realistic `Journal` object matching the shape produced by `Journal.list()`.
  - `makeMatch(overrides)` — returns a realistic AI match result (the shape `JournalFinder` produces after enrichment).

### Writing a new test

1. Create a spec at the mirrored path: `src/foo/bar.jsx` → `tests/foo/bar.test.jsx`.
2. Import helpers from `tests/test-utils.jsx` instead of re-wiring routers or hand-rolling fixtures.
3. Use `userEvent` (not `fireEvent`) for interactions — it more closely matches real browser behaviour.
4. Mock the network at the boundary: stub `fetch` for `Journal.list()` / `InvokeLLM`, never reach the real AI Gateway from a test.
5. Run `npm run test:coverage` locally and make sure thresholds still pass before opening a PR.

Example:

```jsx
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter, makeMatch } from '../test-utils';
import ResultsGrid from '@/components/finder/ResultsGrid';

describe('ResultsGrid', () => {
  it('renders the back-to-search button', async () => {
    const onBackToSearch = vi.fn();
    renderWithRouter(
      <ResultsGrid
        results={[makeMatch()]}
        isSearching={false}
        onBackToSearch={onBackToSearch}
        onSaveSearch={() => {}}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(onBackToSearch).toHaveBeenCalled();
  });
});
```

---

## Deployment

The app builds to a fully static `dist/` directory plus a small Express server.

Two common options:

1. **Static host (recommended for simple deploys).** Build with `npm run build` and serve `dist/` from any static host (Vercel, Netlify, Cloudflare Pages, S3 + CloudFront, Nginx, …). Make sure to configure an SPA fallback (rewrite all unknown routes to `/index.html`).
2. **Node host.** Build with `npm run build` and run `node server.js` (or `npm run preview`) behind your reverse proxy. The server listens on `PORT` (default `3001`) and includes an SPA fallback out of the box.

Because env vars are inlined at build time, set `VITE_AI_GATEWAY_API_KEY` (and any overrides) **before** running `npm run build` in your CI/CD pipeline.

---

## Continuous Integration

A GitHub Actions workflow at [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push to `main` and on every pull request targeting `main`. It executes, in order:

1. `npm ci` (with the built-in npm cache)
2. `npm run lint`
3. `npm run typecheck`
4. `npm run test:coverage`
5. `npm run build` (a placeholder `VITE_AI_GATEWAY_API_KEY` is injected so the build doesn't fail on missing env — no real API call is made at build time)

The coverage report is uploaded as a downloadable workflow artifact (`coverage-report`) and, if a `CODECOV_TOKEN` repository secret is configured, also pushed to [Codecov](https://codecov.io). The two badges at the top of this README reflect the latest run.

### Setting up the badges

The CI badge works as soon as the workflow file lands on `main`. To make the Codecov badge go green you need to:

1. Sign in to <https://codecov.io> with GitHub and enable the `FranSanc/journal-finder-test` repository.
2. Copy the upload token Codecov generates.
3. In GitHub → *Settings* → *Secrets and variables* → *Actions*, add a secret named `CODECOV_TOKEN` with that value.

The next CI run will upload `coverage/lcov.info` and the badge will start tracking real coverage.

---

## Security Notes

> ⚠️ This app calls the Vercel AI Gateway **directly from the browser**. The `VITE_AI_GATEWAY_API_KEY` is therefore embedded in the public JavaScript bundle. Treat it as semi-public.

Recommended mitigations for a production deployment:

- Put the app behind authentication (SSO, IP allow-list, intranet-only, etc.).
- Set a **low monthly spending cap** on the API key in the Vercel dashboard.
- Rotate the key immediately if the deployment is ever exposed publicly without auth.
- If you need to keep the key fully private, move `InvokeLLM` server-side — e.g. by adding a `/api/ai/chat` route to `server.js` that forwards requests using a non-`VITE_` env var, and updating `src/integrations/Core.js` to call that proxy instead of the gateway directly.

---

## Contributing

Contributions are welcome! Please follow this workflow:

1. **Fork** the repository and create a feature branch:
   ```bash
   git checkout -b feat/short-descriptive-name
   ```
2. **Install** dependencies and make sure everything passes locally before you start:
   ```bash
   npm install
   npm run lint && npm run typecheck && npm test
   ```
3. **Write code** following the existing patterns:
   - UI primitives live in `src/components/ui/` — prefer composing them over hand-rolling new ones. New shadcn components can be added with the standard shadcn CLI (config is in `components.json`).
   - Page-level screens go in `src/pages/`, feature components in `src/components/<feature>/`.
   - Use the `@/` import alias instead of long relative paths.
   - Keep Tailwind classes readable; extract repeated patterns into components rather than `@apply`.
4. **Add or update tests** in `tests/` so coverage stays ≥ 70 %. Mirror the `src/` path (`src/foo/bar.jsx` → `tests/foo/bar.test.jsx`) and reuse the helpers in `tests/test-utils.jsx` (`renderWithRouter`, `makeJournal`, `makeMatch`) instead of re-wiring routers or hand-rolling fixtures. See [Testing](#testing) for the full conventions.
5. **Lint & format**:
   ```bash
   npm run lint:fix
   ```
6. **Commit** with a clear, conventional-style message (e.g. `feat(finder): add filter by impact factor`).
7. **Open a Pull Request** describing *what* changed and *why*, with screenshots/GIFs for UI changes.

### Updating the journal catalog

The full catalog lives in `public/JournalList.csv`. To update it:

1. Replace or edit the CSV (keep the header row intact — `Journal.list()` in `src/entities/Journal.js` reads it by column name).
2. If you add a new `Subject Area`, also add it to `mapSubjectAreaToField()` in `src/entities/Journal.js` and add a matching colour in `getFieldColor()` (in `JournalCard.jsx` and `BrowseJournals.jsx`).
3. Run the test suite — `tests/entities/Journal.test.js` covers the parser.

### Reporting bugs / requesting features

Please open an issue and include:

- What you expected to happen.
- What actually happened (with screenshots and console output if relevant).
- Steps to reproduce.
- Environment: OS, browser, Node version.

---

## License

This project is currently unlicensed (private). Add a `LICENSE` file before publishing it publicly.
