import { WORKFLOW_CONFIG } from '../config/workflowConfig.js'
import { generateItinerary } from './aiPlanner.js'
import { parseIntent } from './intentService.js'
import { fetchListings } from './listingService.js'

const nowMs = () => Date.now()

const summarizeQuality = ({ intent, itinerary, retrievedCount }) => {
  const { scoring } = WORKFLOW_CONFIG
  let score = 0

  if (intent.groupType) score += scoring.intentGroupType
  if (intent.budget) score += scoring.intentBudget
  if (intent.constraints.length) score += scoring.intentConstraints
  if (itinerary.stops.length >= 3) score += scoring.itineraryCoverage
  if (retrievedCount >= 3) score += scoring.retrievalCoverage

  return Math.min(100, score)
}

const verifyStops = (stops, region) =>
  stops.map((stop) => {
    const checks = []

    if (region !== 'All Areas') {
      checks.push(stop.region === region)
    }

    checks.push(Boolean(stop.citations?.length))

    return {
      ...stop,
      verified: checks.every(Boolean),
    }
  })

export async function runConciergeWorkflow({ prompt, region = 'All Areas', category = 'all' }) {
  const startedAt = nowMs()
  const trace = []

  const intentStart = nowMs()
  const intent = parseIntent(prompt)
  trace.push({
    agent: 'intent-agent',
    action: 'Parsed prompt into planner controls',
    durationMs: nowMs() - intentStart,
  })

  const retrievalStart = nowMs()
  const retrieved = await fetchListings({ query: prompt, region, category })
  trace.push({
    agent: 'retrieval-agent',
    action: `Retrieved ${retrieved.length} candidate listings`,
    durationMs: nowMs() - retrievalStart,
  })

  const plannerStart = nowMs()
  const itinerary = generateItinerary({
    budget: intent.budget ?? 'low',
    groupType: intent.groupType ?? 'families',
    region,
    constraints: intent.constraints,
  })
  trace.push({
    agent: 'planner-agent',
    action: `Built itinerary with ${itinerary.stops.length} stops`,
    durationMs: nowMs() - plannerStart,
  })

  const verifierStart = nowMs()
  const verifiedStops = verifyStops(itinerary.stops, region)
  const verifiedCount = verifiedStops.filter((stop) => stop.verified).length
  trace.push({
    agent: 'verifier-agent',
    action: `Verified ${verifiedCount}/${verifiedStops.length} stops`,
    durationMs: nowMs() - verifierStart,
  })

  const qualityScore = summarizeQuality({
    intent,
    itinerary: { ...itinerary, stops: verifiedStops },
    retrievedCount: retrieved.length,
  })

  return {
    intent,
    itinerary: {
      ...itinerary,
      stops: verifiedStops,
    },
    retrieval: {
      count: retrieved.length,
      topResults: retrieved.slice(0, WORKFLOW_CONFIG.limits.topRetrievalResults).map((item) => item.name),
    },
    metrics: {
      qualityScore,
      totalDurationMs: nowMs() - startedAt,
    },
    trace,
  }
}
