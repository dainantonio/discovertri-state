import test from 'node:test'
import assert from 'node:assert/strict'

import { generateItinerary } from '../src/services/aiPlanner.js'
import { runConciergeWorkflow } from '../src/services/agentOrchestrator.js'
import { parseIntent } from '../src/services/intentService.js'
import { fetchListings } from '../src/services/listingService.js'

test('parseIntent extracts group, budget, and constraints', () => {
  const result = parseIntent('Need a cheap family outdoor day with food')
  assert.equal(result.groupType, 'families')
  assert.equal(result.budget, 'low')
  assert.ok(result.constraints.includes('outdoor'))
  assert.ok(result.constraints.includes('food'))
})

test('generateItinerary returns explainable stops', () => {
  const result = generateItinerary({
    budget: 'low',
    groupType: 'families',
    region: 'All Areas',
    constraints: ['outdoor'],
  })

  assert.ok(result.stops.length > 0)
  assert.ok(['high', 'medium', 'low'].includes(result.confidence))
  assert.ok(result.stops[0].citations[0].startsWith('listing:'))
})

test('fetchListings returns ranked results', async () => {
  const results = await fetchListings({ query: 'museum', category: 'culture' })
  assert.ok(results.length > 0)
  assert.ok(results.every((item) => item.relevanceScore > 0))
})

test('runConciergeWorkflow returns agent trace and metrics', async () => {
  const result = await runConciergeWorkflow({
    prompt: 'Need a budget family outdoor day with food',
    region: 'Huntington (WV)',
    category: 'all',
  })

  assert.equal(result.trace.length, 4)
  assert.ok(result.metrics.qualityScore >= 0)
  assert.ok(result.metrics.qualityScore <= 100)
  assert.ok(result.itinerary.stops.every((stop) => typeof stop.verified === 'boolean'))
})
