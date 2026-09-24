# peskas.timor.portal.v2

Public Timor-Leste fisheries portal (React + Vite + TypeScript, Tabler UI via `@tabler/core`, deployed on Vercel). It replaces the Shiny `peskas.timor.portal` and shows the aggregates that `peskas.timor.data.pipeline` publishes to the `public-timor` GCS bucket.
Ecosystem context (other repos, data flow, cross-repo contracts): see PESKAS.md, loaded via CLAUDE.local.md.

## Commands

- `npm install`, `npm run dev`, `npm run build` (runs `tsc -b` then `vite build`), `npm run lint`.
- `npm run fetch-data` refreshes `public/data/`. It needs `GCP_SERVICE_ACCOUNT_KEY` (see `.env.example`), or else `GOOGLE_APPLICATION_CREDENTIALS` or gcloud default credentials.

## Architecture

- The app never reads GCS at runtime. `scripts/fetchData.js` lists `portal-*` objects in `public-timor`, keeps the newest version of each, strips the `portal-` prefix and the version suffix, and writes `public/data/<name>.json`. The app loads those static files through `src/utils/dataLoader.ts` (the file names are typed as `DataFileName` in `src/types/data.ts`).
- `.github/workflows/sync-data.yml` runs the fetch on a schedule and on push to main, then commits changed `public/data/*.json` with `[skip ci]`.
- i18n: languages are `en`, `tet` and `pt` (`src/i18n.tsx`), with dictionaries in `src/locales/{en,tet,pt}.ts`. In dev mode, `src/utils/verifyTranslations.ts` runs at startup (`src/main.tsx`) and logs missing keys.
- `scripts/ralph/` is the finished Shiny-to-React conversion agent. It is historical, so do not run or extend it.

## Rules

- Leave `public/data/` alone: the sync workflow overwrites it. Fix data upstream in `peskas.timor.data.pipeline`.
- Add every new UI string to all three locale files.
- Build UI with Tabler components and classes before writing custom CSS.

## Gotchas

- If `peskas.timor.data.pipeline` renames a `portal-*` file in `public-timor`, the local file name changes too, and `dataLoader.ts` fails to load it at runtime. Update `DataFileName` and the `EXCLUDED_FILES` list in `fetchData.js` in the same change.
- Updating the pipeline's coasts portal export (`export_portal`) does not change this portal. Only `public-timor` feeds it.
