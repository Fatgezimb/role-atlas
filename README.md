# Role Atlas

Role Atlas is a map-first job intelligence app for scraping, normalizing, ranking, and exploring roles across the United States. It is designed around the accepted product concepts in `docs/design/` and uses a React/Vite frontend with a Python FastAPI backend and local worker/ML modules.

## What is Included

- `apps/web`: React + Vite + TypeScript frontend with a map-first results workspace, analytics, filters, and Zillow-style job detail modal.
- `services/api`: FastAPI service with SQLite persistence, search, scrape-run, job detail, status update, and analytics endpoints.
- `services/worker`: Python worker package with safe scraper adapter abstractions, normalization, local vector ranking, deduplication, and fixture-backed ingestion.
- `docs/design`: accepted design references used for visual QA.

## Local Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
npm install
```

## Run

Start the API:

```bash
npm run dev:api
```

Start the web app in another terminal:

```bash
npm run dev:web
```

The frontend defaults to `http://localhost:5173` and expects the API at `http://127.0.0.1:8000`. Set `VITE_API_URL` in `apps/web/.env.local` to override it.

## Test

```bash
npm run test
```

This runs Python unit/API tests and frontend unit tests.

For a frontend product QA pass, run the static checks and browser viewport sweep:

```bash
npm run qa:links
npm run qa:visual
```

`qa:visual` expects the web app to be running, or accepts a URL argument such as `npm run qa:visual -- http://127.0.0.1:4173`.

## GitHub Pages

For the no-surprise-cost deployment path, publish the static site from the repository's `docs/` folder instead of using GitHub Actions:

1. Run the static build locally.
2. Commit the generated `docs/index.html`, `docs/assets/`, and `docs/favicon.svg` files.
3. In GitHub, open **Settings > Pages**.
4. Set **Source** to **Deploy from a branch**.
5. Set the branch to `main` and the folder to `/docs`.

```bash
npm run build:pages
npm run preview:pages
```

The Pages build uses `VITE_STATIC_MODE=true`, so the hosted site runs as a polished static app with seeded job intelligence and no failed localhost API calls. It does not use paid map tiles, API keys, cloud functions, GitHub Actions runners, package publishing, or scraping jobs. The FastAPI backend remains available for local development and future cloud hosting.

## Map And Cost Policy

The default frontend map is a local static interaction layer: it uses bundled `us-atlas` Census-derived state geometry, in-repo job coordinates, SVG/CSS rendering, and no metered map tile provider. The GitHub Pages build does not require API keys, billing accounts, serverless functions, paid runners, or scheduled scraping jobs.

If you later replace the static map with a live tile provider, review that provider's pricing and usage policy before deployment.
