# Discover Tri-State

## Phase 3: Agent Workflow + Observability

This phase extends the AI concierge with a deterministic multi-agent flow:

- **Intent agent** parses user prompts into group, budget, and constraints.
- **Retrieval agent** fetches candidates with relevance scoring.
- **Planner agent** generates constrained itinerary stops with explanations and citations.
- **Verifier agent** validates generated stops and reports verification status.

The UI now includes a workflow trace panel with:

- per-agent actions and execution durations
- quality score (0–100)
- verified-stop counts

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Test

```bash
npm test
```
