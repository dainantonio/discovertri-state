# Discover Tri-State

## Phase 4: Deployment + Reliability Foundation

This phase keeps the deterministic multi-agent concierge flow and adds production-hardening:

- safer workflow execution with retry-friendly UI error messaging
- explicit reset and empty/loading states in the app
- configurable orchestration weights (`src/config/workflowConfig.js`)
- eval harness (`evals/prompts.json`, `npm run eval`)
- GitHub Actions CI for test/eval/build and GitHub Pages deployment

## Run locally

```bash
npm install
npm run dev
```

## Build / Preview production bundle

```bash
npm run build
npm run preview
```

## Test and evals

```bash
npm test
npm run eval
```

## Deployment

- CI workflow: `.github/workflows/ci.yml`
- Pages deployment workflow: `.github/workflows/pages.yml`
- Pages build uses `VITE_BASE_PATH=/discovertri-state/` in workflow.
